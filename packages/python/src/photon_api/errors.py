from __future__ import annotations

from typing import Any


class PhotonError(Exception):
    def __init__(
        self,
        message: str,
        *,
        operation_id: str | None = None,
        request_id: str | None = None,
    ) -> None:
        super().__init__(message)
        self.operation_id = operation_id
        self.request_id = request_id


class ResponseValidationError(PhotonError):
    def __init__(
        self,
        message: str,
        *,
        status: int,
        raw_body: str,
        operation_id: str,
        request_id: str | None,
    ) -> None:
        super().__init__(
            message,
            operation_id=operation_id,
            request_id=request_id,
        )
        self.status = status
        self.raw_body = raw_body


class TransportError(PhotonError):
    pass


class ApiError(PhotonError):
    def __init__(
        self,
        message: str,
        *,
        status: int,
        headers: dict[str, str],
        body: Any,
        raw_body: str,
        operation_id: str,
        request_id: str | None,
    ) -> None:
        super().__init__(
            message,
            operation_id=operation_id,
            request_id=request_id,
        )
        self.status = status
        self.headers = headers
        self.body = body
        self.raw_body = raw_body
