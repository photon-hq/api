from __future__ import annotations

import asyncio
import email.utils
import inspect
import math
import random
import time
from collections.abc import Awaitable, Callable, Mapping
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, Generic, TypeVar
from urllib.parse import quote

import httpx
from pydantic import TypeAdapter, ValidationError

from .errors import ApiError, ResponseValidationError, TransportError

T = TypeVar("T")
HeaderMap = Mapping[str, str]
SyncHeaderProvider = HeaderMap | Callable[[], HeaderMap]
AsyncHeaderProvider = HeaderMap | Callable[[], HeaderMap | Awaitable[HeaderMap]]

RETRYABLE_STATUSES = frozenset({408, 429, 502, 503, 504})
DEFAULT_MAX_RETRY_AFTER = 60.0


@dataclass(frozen=True, slots=True)
class OperationSpec:
    operation_id: str
    method: str
    path: str
    safe: bool
    idempotency_key_required: bool
    success_responses: Mapping[str, TypeAdapter[Any] | type[bytes] | None]
    request_media_type: str | None = None
    raw_request: bool = False
    accept_media_types: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class RawResponse(Generic[T]):
    data: T
    status: int
    headers: dict[str, str]
    request_id: str | None


def _render_path(template: str, values: Mapping[str, Any]) -> str:
    result = template
    for name, value in values.items():
        result = result.replace(f"{{{name}}}", quote(str(value), safe=""))
    if "{" in result or "}" in result:
        raise ValueError(f"Missing path parameter for {template}")
    return result


def _retry_after(response: httpx.Response | None) -> float | None:
    """Return the server-requested delay in seconds, or None when absent or malformed."""
    if response is None:
        return None
    retry_after = response.headers.get("retry-after")
    if not retry_after:
        return None
    try:
        seconds = float(retry_after)
    except ValueError:
        try:
            parsed = email.utils.parsedate_to_datetime(retry_after)
        except (TypeError, ValueError):
            return None
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=UTC)
        return max(0.0, (parsed - datetime.now(UTC)).total_seconds())
    if not math.isfinite(seconds) or seconds < 0:
        return None
    return seconds


def _retry_delay(
    response: httpx.Response | None,
    attempt: int,
    max_retry_after: float = DEFAULT_MAX_RETRY_AFTER,
) -> float | None:
    """Delay before the next attempt, or None when Retry-After exceeds the cap.

    A server-requested delay longer than ``max_retry_after`` is never shortened;
    the caller stops retrying and surfaces that response instead.
    """
    retry_after = _retry_after(response)
    if retry_after is not None:
        return retry_after if retry_after <= max_retry_after else None
    ceiling = min(2.0, 0.25 * (2 ** (attempt - 1)))
    return random.uniform(0.0, ceiling)


def _retryable(operation: OperationSpec, headers: Mapping[str, str]) -> bool:
    return operation.safe or any(
        name.lower() == "idempotency-key" and value for name, value in headers.items()
    )


def _response_data(
    response: httpx.Response,
    operation: OperationSpec,
) -> Any:
    request_id = response.headers.get("x-request-id")
    status_key = str(response.status_code)
    # A documented status that is not 2XX but not an error either (304 Not
    # Modified, answering a conditional request) is decoded like a success.
    if not response.is_success and status_key not in operation.success_responses:
        raw_body = response.text
        try:
            body = response.json() if raw_body else None
        except ValueError:
            body = None
        detail = (
            body.get("detail")
            if isinstance(body, dict) and isinstance(body.get("detail"), str)
            else f"Photon API returned HTTP {response.status_code}"
        )
        raise ApiError(
            detail,
            status=response.status_code,
            headers=dict(response.headers),
            body=body,
            raw_body=raw_body,
            operation_id=operation.operation_id,
            request_id=request_id,
        )

    if status_key in operation.success_responses:
        output_adapter = operation.success_responses[status_key]
    elif "2XX" in operation.success_responses:
        output_adapter = operation.success_responses["2XX"]
    else:
        raise ResponseValidationError(
            f"Undocumented successful status {response.status_code} for {operation.operation_id}",
            status=response.status_code,
            raw_body=response.text,
            operation_id=operation.operation_id,
            request_id=request_id,
        )

    if output_adapter is bytes:
        return response.content

    if output_adapter is None:
        if response.content:
            raise ResponseValidationError(
                f"Expected an empty response for {operation.operation_id}",
                status=response.status_code,
                raw_body=response.text,
                operation_id=operation.operation_id,
                request_id=request_id,
            )
        return None
    try:
        return output_adapter.validate_json(response.content)
    except ValidationError as error:
        raise ResponseValidationError(
            f"Invalid response for {operation.operation_id}",
            status=response.status_code,
            raw_body=response.text,
            operation_id=operation.operation_id,
            request_id=request_id,
        ) from error


def _request_parts(
    operation: OperationSpec,
    payload: Mapping[str, Any],
    configured_headers: HeaderMap,
) -> tuple[str, dict[str, Any], Any, dict[str, str]]:
    path = _render_path(operation.path, payload.get("path") or {})
    query = dict(payload.get("query") or {})
    body = payload.get("body")
    headers = httpx.Headers({str(key): str(value) for key, value in configured_headers.items()})
    declared_headers = payload.get("headers") or {}
    headers.update({str(key): str(value) for key, value in declared_headers.items()})
    if operation.request_media_type:
        headers["Content-Type"] = operation.request_media_type
    if operation.accept_media_types:
        headers["Accept"] = ", ".join(operation.accept_media_types)
    return path, query, body, dict(headers)


class SyncTransport:
    def __init__(
        self,
        *,
        base_url: str,
        headers: SyncHeaderProvider | None,
        timeout: float,
        max_attempts: int,
        client: httpx.Client | None = None,
        max_retry_after: float = DEFAULT_MAX_RETRY_AFTER,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._headers = headers
        self._timeout = timeout
        self._max_attempts = max(1, min(3, max_attempts))
        self._max_retry_after = max_retry_after
        self._owns_client = client is None
        self._client = client or httpx.Client(timeout=timeout)

    def close(self) -> None:
        if self._owns_client:
            self._client.close()

    def request(
        self,
        operation: OperationSpec,
        payload: Mapping[str, Any],
    ) -> RawResponse[Any]:
        attempts = 1
        last_error: Exception | None = None
        attempt = 0

        while attempt < attempts:
            attempt += 1
            configured = self._headers() if callable(self._headers) else self._headers or {}
            if inspect.isawaitable(configured):
                raise TypeError("Photon sync header providers cannot be async")
            path, query, body, headers = _request_parts(operation, payload, configured)
            if attempt == 1:
                # Decided once the configured headers are merged, so an
                # Idempotency-Key from the client-wide headers enables retries too.
                attempts = self._max_attempts if _retryable(operation, headers) else 1
            response: httpx.Response | None = None
            try:
                response = self._client.request(
                    operation.method,
                    f"{self._base_url}{path}",
                    params=query,
                    **({"content": body} if operation.raw_request else {"json": body}),
                    headers=headers,
                    timeout=self._timeout,
                )
                delay = (
                    _retry_delay(response, attempt, self._max_retry_after)
                    if response.status_code in RETRYABLE_STATUSES and attempt < attempts
                    else None
                )
                if delay is not None:
                    time.sleep(delay)
                    continue
                data = _response_data(response, operation)
                return RawResponse(
                    data=data,
                    status=response.status_code,
                    headers=dict(response.headers),
                    request_id=response.headers.get("x-request-id"),
                )
            except httpx.HTTPError as error:
                last_error = error
                if attempt >= attempts:
                    break
                time.sleep(_retry_delay(None, attempt) or 0.0)

        raise TransportError(
            "Photon request failed",
            operation_id=operation.operation_id,
        ) from last_error


class AsyncTransport:
    def __init__(
        self,
        *,
        base_url: str,
        headers: AsyncHeaderProvider | None,
        timeout: float,
        max_attempts: int,
        client: httpx.AsyncClient | None = None,
        max_retry_after: float = DEFAULT_MAX_RETRY_AFTER,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._headers = headers
        self._timeout = timeout
        self._max_attempts = max(1, min(3, max_attempts))
        self._max_retry_after = max_retry_after
        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(timeout=timeout)

    async def close(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def request(
        self,
        operation: OperationSpec,
        payload: Mapping[str, Any],
    ) -> RawResponse[Any]:
        attempts = 1
        last_error: Exception | None = None
        attempt = 0

        while attempt < attempts:
            attempt += 1
            configured = self._headers() if callable(self._headers) else self._headers or {}
            if inspect.isawaitable(configured):
                configured = await configured
            path, query, body, headers = _request_parts(operation, payload, configured)
            if attempt == 1:
                # Decided once the configured headers are merged, so an
                # Idempotency-Key from the client-wide headers enables retries too.
                attempts = self._max_attempts if _retryable(operation, headers) else 1
            response: httpx.Response | None = None
            try:
                response = await self._client.request(
                    operation.method,
                    f"{self._base_url}{path}",
                    params=query,
                    **({"content": body} if operation.raw_request else {"json": body}),
                    headers=headers,
                    timeout=self._timeout,
                )
                delay = (
                    _retry_delay(response, attempt, self._max_retry_after)
                    if response.status_code in RETRYABLE_STATUSES and attempt < attempts
                    else None
                )
                if delay is not None:
                    await asyncio.sleep(delay)
                    continue
                data = _response_data(response, operation)
                return RawResponse(
                    data=data,
                    status=response.status_code,
                    headers=dict(response.headers),
                    request_id=response.headers.get("x-request-id"),
                )
            except httpx.HTTPError as error:
                last_error = error
                if attempt >= attempts:
                    break
                await asyncio.sleep(_retry_delay(None, attempt) or 0.0)

        raise TransportError(
            "Photon request failed",
            operation_id=operation.operation_id,
        ) from last_error
