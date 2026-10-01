from __future__ import annotations

import asyncio
import json
import re

import httpx
import pytest
from pydantic import BaseModel, TypeAdapter

from photon_api import ApiError, AsyncPhoton, Photon, ResponseValidationError, rpc_generated
from photon_api.config_generated import DEFAULT_BASE_URL
from photon_api.rpc_generated import (
    CancelSubscriptionHeader,
    CountProjectsInput,
    DeviceTokenInput,
    DownloadAttachmentInput,
    ReplaceVoiceProfileInboundInput,
    UpdateVoiceProfileInboundInput,
    UploadAttachmentInput,
)
from photon_api.transport import AsyncTransport, OperationSpec, SyncTransport

PROJECT_ID = "pho_prj_00000000000000000000000000"
ATTACHMENT_ID = "pho_att_00000000000000000000000000"


def invoke_client(asynchronous, handler, call):
    if asynchronous:

        async def run():
            async with (
                httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http,
                AsyncPhoton(client=http) as photon,
            ):
                return await call(photon)

        return asyncio.run(run())
    with (
        httpx.Client(transport=httpx.MockTransport(handler)) as http,
        Photon(client=http) as photon,
    ):
        return call(photon)


@pytest.mark.parametrize("asynchronous", [False, True])
def test_attachment_upload_preserves_raw_bytes_and_headers_on_retry(asynchronous):
    body = b"\x00\xffattachment\x80"
    project_id = "pho_prj_" + "0" * 26
    attempts = 0
    payload = UploadAttachmentInput.model_validate(
        {
            "path": {"id": project_id},
            "body": body,
            "headers": {
                "content-type": "multipart/related; boundary=test",
                "content-length": str(len(body)),
                "idempotency-key": "upload-key",
            },
        }
    )

    def handler(request):
        nonlocal attempts
        attempts += 1
        assert request.content == body
        assert request.headers["content-type"] == "multipart/related; boundary=test"
        assert request.headers["content-length"] == str(len(body))
        assert request.headers["idempotency-key"] == "upload-key"
        if attempts == 1:
            return httpx.Response(503, json={"detail": "busy"}, headers={"Retry-After": "0"})
        return httpx.Response(
            201,
            json={
                "id": "pho_att_" + "0" * 26,
                "projectId": project_id,
                "contentType": "application/octet-stream",
                "sizeBytes": len(body),
                "createdAt": "2026-09-19T00:00:00.000Z",
                "updatedAt": "2026-09-19T00:00:00.000Z",
            },
        )

    result = invoke_client(
        asynchronous, handler, lambda photon: photon.projects.upload_attachment(payload)
    )
    assert result.sizeBytes == len(body)
    assert attempts == 2


@pytest.mark.parametrize("asynchronous", [False, True])
@pytest.mark.parametrize("raw", [False, True])
@pytest.mark.parametrize("body", [b"\x00\xffattachment\x80", b""])
def test_attachment_download_preserves_exact_bytes(asynchronous, raw, body):
    payload = DownloadAttachmentInput.model_validate(
        {
            "path": {"id": PROJECT_ID, "attachmentId": ATTACHMENT_ID},
        }
    )

    def handler(request):
        assert request.method == "GET"
        assert request.url.path == f"/v1/projects/{PROJECT_ID}/attachments/{ATTACHMENT_ID}/content"
        return httpx.Response(
            200,
            content=body,
            headers={
                "Content-Type": "image/png",
                "X-Request-ID": "download-request",
                "Content-Disposition": 'attachment; filename="image.png"',
            },
        )

    result = invoke_client(
        asynchronous,
        handler,
        lambda photon: (photon.raw if raw else photon).projects.download_attachment(payload),
    )
    if raw:
        assert result.data == body
        assert result.status == 200
        assert result.request_id == "download-request"
        assert result.headers["content-disposition"] == 'attachment; filename="image.png"'
    else:
        assert result == body


@pytest.mark.parametrize("asynchronous", [False, True])
@pytest.mark.parametrize("retry_after", ["unknown", "Wed, 99 Sep 2026 25:99:99 GMT"])
def test_malformed_retry_after_falls_back_and_retries(asynchronous, retry_after):
    attempts = 0

    def handler(request):
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            return httpx.Response(
                503, headers={"Retry-After": retry_after}, json={"detail": "busy"}
            )
        return httpx.Response(200, json={"count": 2})

    result = invoke_client(
        asynchronous,
        handler,
        lambda photon: photon.organizations.projects.count(
            CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
        ),
    )
    assert result.count == 2
    assert attempts == 2


@pytest.mark.parametrize(("model", "field"), [(CancelSubscriptionHeader, "idempotency_key")])
def test_optional_parameters_reject_null_and_omit_unset_values(model, field):
    # No contract parameter permits null; None must fail instead of being sent as text.
    with pytest.raises(ValueError):
        model.model_validate({field: None})
    assert model().model_dump(mode="json", by_alias=True, exclude_unset=True) == {}


@pytest.mark.parametrize("asynchronous", [False, True])
@pytest.mark.parametrize("mode", ["replace", "update-null", "update-omitted"])
def test_nullable_requests_distinguish_explicit_null_from_omission(asynchronous, mode):
    body = {"expectedVersion": 1}
    if mode != "update-omitted":
        body["credentials"] = None
    if mode == "replace":
        body["destinationUri"] = "sip:fixture@example.com"
    cls = ReplaceVoiceProfileInboundInput if mode == "replace" else UpdateVoiceProfileInboundInput
    payload = cls.model_validate({"path": {"id": "project", "profileId": "profile"}, "body": body})

    def handler(request):
        assert json.loads(request.content) == body
        return httpx.Response(409, json={"detail": "fixture version conflict"})

    name = "replace_voice_profile_inbound" if mode == "replace" else "update_voice_profile_inbound"
    with pytest.raises(ApiError, match="fixture version conflict"):
        invoke_client(
            asynchronous, handler, lambda photon: getattr(photon.projects.platforms, name)(payload)
        )


@pytest.mark.parametrize("asynchronous", [False, True])
def test_clients_expose_every_generated_namespace(asynchronous: bool) -> None:
    def check(photon: Photon | AsyncPhoton) -> None:
        for name, raw_resource in vars(photon.raw).items():
            if name.startswith("_"):
                continue
            resource = getattr(photon, name)
            # The client's resource returns decoded results through its raw
            # counterpart, which returns whole responses (photon.raw).
            assert type(resource._raw_resource) is type(raw_resource)
            assert type(resource) is not type(raw_resource)

    if asynchronous:

        async def run() -> None:
            async with AsyncPhoton() as photon:
                check(photon)

        asyncio.run(run())
    else:
        with Photon() as photon:
            check(photon)


def test_namespaces_and_methods_are_snake_case() -> None:
    names: list[str] = []

    def walk(resource: object) -> None:
        for name, value in vars(resource).items():
            if not name.startswith("_"):
                names.append(name)
                walk(value)
        names.extend(
            name
            for name, value in vars(type(resource)).items()
            if callable(value) and not name.startswith("_")
        )

    with Photon() as photon:
        walk(photon.raw)
    assert names
    assert [name for name in names if not re.fullmatch(r"[a-z][a-z0-9_]*", name)] == []


@pytest.mark.parametrize("asynchronous", [False, True])
def test_mixed_format_operation_uses_json_models_and_headers(asynchronous: bool) -> None:
    body = {"grant_type": "refresh_token", "refresh_token": "refresh"}
    payload = DeviceTokenInput.model_validate({"body": body})

    def handler(request: httpx.Request) -> httpx.Response:
        assert str(request.url).startswith(f"{DEFAULT_BASE_URL}/")
        assert request.headers["content-type"] == "application/json"
        # The contract's declared media, not the caller's protobuf Accept.
        accept = rpc_generated._OP_DEVICE_TOKEN.accept_media_types
        assert accept[0] == "application/json"
        assert request.headers["accept"] == ", ".join(accept)
        assert json.loads(request.content) == body
        return httpx.Response(
            200,
            json={
                "access_token": "access",
                "refresh_token": "next",
                "expires_in": 3600,
                "user": {
                    "id": "user",
                    "email": "user@example.com",
                    "first_name": None,
                    "last_name": None,
                },
                "futureField": True,
            },
        )

    headers = {"Content-Type": "application/x-protobuf", "accept": "application/x-protobuf"}
    if asynchronous:

        async def run() -> None:
            async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
                photon = AsyncPhoton(client=client, headers=headers)
                result = await photon.auth.device.token(payload)
                assert result.access_token == "access"
                assert result.futureField is True

        asyncio.run(run())
    else:
        with httpx.Client(transport=httpx.MockTransport(handler)) as client:
            photon = Photon(client=client, headers=headers)
            result = photon.auth.device.token(payload)
            assert result.access_token == "access"
            assert result.futureField is True


class CompletedFixture(BaseModel):
    value: str


class PendingFixture(BaseModel):
    value: str


def multi_success_operation(
    success_responses: dict[str, TypeAdapter[object] | None] | None = None,
) -> OperationSpec:
    return OperationSpec(
        operation_id="multiSuccessFixture",
        method="GET",
        path="/fixture",
        safe=True,
        idempotency_key_required=False,
        success_responses=(
            success_responses
            if success_responses is not None
            else {
                "201": TypeAdapter(CompletedFixture),
                "202": TypeAdapter(PendingFixture),
            }
        ),
    )


def test_sync_client_retries_with_dynamic_headers() -> None:
    attempts = 0
    observed_authorization: list[str | None] = []

    def headers() -> dict[str, str]:
        return {"authorization": f"Bearer attempt-{attempts + 1}"}

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal attempts
        attempts += 1
        observed_authorization.append(request.headers.get("authorization"))
        if attempts < 3:
            return httpx.Response(503, headers={"retry-after": "0"}, json={"detail": "busy"})
        return httpx.Response(
            200,
            headers={"x-request-id": "req_sync"},
            json={"count": 2},
        )

    client = httpx.Client(
        base_url="https://isolated.example",
        transport=httpx.MockTransport(handler),
    )
    photon = Photon(client=client, headers=headers)

    result = photon.organizations.projects.count(
        CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
    )

    assert attempts == 3
    assert observed_authorization == [
        "Bearer attempt-1",
        "Bearer attempt-2",
        "Bearer attempt-3",
    ]
    assert result.count == 2


def test_sync_raw_client_preserves_metadata() -> None:
    client = httpx.Client(
        base_url="https://isolated.example",
        transport=httpx.MockTransport(
            lambda _: httpx.Response(
                200,
                headers={"x-request-id": "req_raw"},
                json={"count": 2},
            )
        ),
    )
    photon = Photon(client=client)

    result = photon.raw.organizations.projects.count(
        CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
    )

    assert result.status == 200
    assert result.request_id == "req_raw"
    assert result.data.count == 2


def test_custom_client_still_uses_photon_base_url_and_attempt_timeout() -> None:
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(
            200,
            json={"count": 2},
        )

    client = httpx.Client(
        base_url="https://wrong.example",
        timeout=1,
        transport=httpx.MockTransport(handler),
    )
    photon = Photon(
        base_url="https://right.example/root",
        timeout=7.5,
        client=client,
    )

    photon.organizations.projects.count(
        CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
    )

    assert (
        str(requests[0].url)
        == "https://right.example/root/v1/organizations/organization/projects/count"
    )
    assert requests[0].extensions["timeout"]["read"] == 7.5


def test_response_validation_errors_are_wrapped() -> None:
    client = httpx.Client(
        base_url="https://isolated.example",
        transport=httpx.MockTransport(
            lambda _: httpx.Response(
                200,
                json={"count": "invalid"},
            )
        ),
    )
    photon = Photon(client=client)

    with pytest.raises(ResponseValidationError) as error:
        photon.organizations.projects.count(
            CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
        )

    assert error.value.operation_id == "countProjects"
    assert error.value.status == 200
    assert error.value.raw_body


def test_sync_transport_selects_success_model_by_status() -> None:
    client = httpx.Client(
        base_url="https://isolated.example",
        transport=httpx.MockTransport(
            lambda _: httpx.Response(
                202,
                headers={"x-request-id": "req_pending"},
                json={"value": "pending"},
            )
        ),
    )
    transport = SyncTransport(
        base_url="https://isolated.example",
        headers=None,
        timeout=5,
        max_attempts=1,
        client=client,
    )

    response = transport.request(multi_success_operation(), {})

    assert isinstance(response.data, PendingFixture)
    assert response.status == 202
    assert response.request_id == "req_pending"


def test_async_transport_selects_success_model_by_status() -> None:
    async def run() -> None:
        client = httpx.AsyncClient(
            base_url="https://isolated.example",
            transport=httpx.MockTransport(
                lambda _: httpx.Response(201, json={"value": "completed"})
            ),
        )
        transport = AsyncTransport(
            base_url="https://isolated.example",
            headers=None,
            timeout=5,
            max_attempts=1,
            client=client,
        )

        response = await transport.request(multi_success_operation(), {})

        assert isinstance(response.data, CompletedFixture)
        await client.aclose()

    asyncio.run(run())


def test_async_transport_handles_bodyless_and_invalid_success_responses() -> None:
    async def run() -> None:
        responses = iter(
            [
                httpx.Response(
                    202,
                    headers={"x-request-id": "req_pending", "x-fixture": "yes"},
                    json={"value": "pending"},
                ),
                httpx.Response(204, headers={"x-request-id": "req_empty"}),
                httpx.Response(
                    203,
                    headers={"x-request-id": "req_undocumented"},
                    json={"value": "unknown"},
                ),
                httpx.Response(
                    201,
                    headers={"x-request-id": "req_invalid"},
                    content=b"not-json",
                ),
            ]
        )
        client = httpx.AsyncClient(
            base_url="https://isolated.example",
            transport=httpx.MockTransport(lambda _: next(responses)),
        )
        transport = AsyncTransport(
            base_url="https://isolated.example",
            headers=None,
            timeout=5,
            max_attempts=1,
            client=client,
        )
        operation = multi_success_operation(
            {
                "201": TypeAdapter(CompletedFixture),
                "202": TypeAdapter(PendingFixture),
                "204": None,
            }
        )

        pending = await transport.request(operation, {})
        assert isinstance(pending.data, PendingFixture)
        assert pending.status == 202
        assert pending.headers["x-fixture"] == "yes"
        assert pending.request_id == "req_pending"

        empty = await transport.request(operation, {})
        assert empty.data is None
        assert empty.status == 204
        assert empty.request_id == "req_empty"

        with pytest.raises(ResponseValidationError) as undocumented:
            await transport.request(operation, {})
        assert undocumented.value.status == 203
        assert undocumented.value.request_id == "req_undocumented"
        assert undocumented.value.raw_body

        with pytest.raises(ResponseValidationError) as invalid:
            await transport.request(operation, {})
        assert invalid.value.status == 201
        assert invalid.value.request_id == "req_invalid"
        assert invalid.value.raw_body == "not-json"

        await client.aclose()

    asyncio.run(run())


def test_success_range_and_empty_responses_are_supported() -> None:
    statuses = iter([206, 207])
    range_client = httpx.Client(
        base_url="https://isolated.example",
        transport=httpx.MockTransport(
            lambda _: httpx.Response(next(statuses), json={"value": "fallback"})
        ),
    )
    range_transport = SyncTransport(
        base_url="https://isolated.example",
        headers=None,
        timeout=5,
        max_attempts=1,
        client=range_client,
    )
    range_operation = multi_success_operation(
        {
            "206": TypeAdapter(CompletedFixture),
            "2XX": TypeAdapter(PendingFixture),
        }
    )
    exact_response = range_transport.request(range_operation, {})
    fallback_response = range_transport.request(range_operation, {})
    assert isinstance(exact_response.data, CompletedFixture)
    assert isinstance(fallback_response.data, PendingFixture)

    empty_client = httpx.Client(
        base_url="https://isolated.example",
        transport=httpx.MockTransport(lambda _: httpx.Response(204)),
    )
    empty_transport = SyncTransport(
        base_url="https://isolated.example",
        headers=None,
        timeout=5,
        max_attempts=1,
        client=empty_client,
    )
    empty_response = empty_transport.request(multi_success_operation({"204": None}), {})
    assert empty_response.data is None


def test_undocumented_or_invalid_success_response_raises_validation_error() -> None:
    for status, body in [(203, {"value": "unknown"}), (202, {})]:
        client = httpx.Client(
            base_url="https://isolated.example",
            transport=httpx.MockTransport(
                lambda _, status=status, body=body: httpx.Response(status, json=body)
            ),
        )
        transport = SyncTransport(
            base_url="https://isolated.example",
            headers=None,
            timeout=5,
            max_attempts=1,
            client=client,
        )

        with pytest.raises(ResponseValidationError) as error:
            transport.request(multi_success_operation(), {})

        assert error.value.status == status
        assert error.value.raw_body


def test_api_errors_preserve_problem_details() -> None:
    client = httpx.Client(
        base_url="https://isolated.example",
        transport=httpx.MockTransport(
            lambda _: httpx.Response(
                401,
                headers={"x-request-id": "req_denied"},
                json={"detail": "denied", "type": "urn:photon:problem:unauthorized"},
            )
        ),
    )
    photon = Photon(client=client)

    with pytest.raises(ApiError) as error:
        photon.organizations.projects.count(
            CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
        )

    assert error.value.status == 401
    assert error.value.request_id == "req_denied"
    assert error.value.body["detail"] == "denied"


def test_async_client_uses_the_same_rpc_surface() -> None:
    async def run() -> None:
        client = httpx.AsyncClient(
            base_url="https://isolated.example",
            transport=httpx.MockTransport(
                lambda _: httpx.Response(
                    200,
                    json={"count": 2},
                )
            ),
        )
        photon = AsyncPhoton(client=client)
        result = await photon.organizations.projects.count(
            CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
        )
        assert result.count == 2
        await client.aclose()

    asyncio.run(run())


@pytest.mark.parametrize("asynchronous", [False, True])
@pytest.mark.parametrize(
    "content_type,body",
    [
        ("image/png", b"\x00\xff\x80\n"),
        ("application/json", b'{ "file": true }\n'),
        ("text/plain", b"raw text"),
        ("application/octet-stream", b""),
    ],
)
def test_attachment_download_preserves_file_bytes(
    asynchronous: bool, content_type: str, body: bytes
) -> None:
    from photon_api.rpc_generated import DownloadAttachmentInput

    payload = DownloadAttachmentInput.model_validate(
        {
            "path": {
                "id": "pho_prj_00000000000000000000000000",
                "attachmentId": "pho_att_00000000000000000000000000",
            }
        }
    )

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["accept"] == "*/*, application/problem+json"
        return httpx.Response(
            200,
            content=body,
            headers={"content-type": content_type, "x-request-id": "binary-request"},
        )

    if asynchronous:

        async def run() -> None:
            async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
                photon = AsyncPhoton(client=client)
                assert await photon.projects.download_attachment(payload) == body
                result = await photon.raw.projects.download_attachment(payload)
                assert result.data == body
                assert result.request_id == "binary-request"

        asyncio.run(run())
    else:
        with httpx.Client(transport=httpx.MockTransport(handler)) as client:
            photon = Photon(client=client)
            assert photon.projects.download_attachment(payload) == body
            result = photon.raw.projects.download_attachment(payload)
            assert result.data == body
            assert result.request_id == "binary-request"


@pytest.mark.parametrize("asynchronous", [False, True])
@pytest.mark.parametrize("status", [404, 201])
def test_attachment_download_keeps_error_and_status_validation(
    asynchronous: bool, status: int
) -> None:
    from photon_api.rpc_generated import DownloadAttachmentInput

    payload = DownloadAttachmentInput.model_validate(
        {
            "path": {
                "id": "pho_prj_00000000000000000000000000",
                "attachmentId": "pho_att_00000000000000000000000000",
            }
        }
    )
    problem = {"code": "ATTACHMENT_NOT_FOUND", "detail": "No file", "status": status}

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(status, json=problem)

    expected = ApiError if status == 404 else ResponseValidationError
    if asynchronous:

        async def run() -> None:
            async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
                with pytest.raises(expected) as exc:
                    await AsyncPhoton(client=client).projects.download_attachment(payload)
                assert exc.value.status == status

        asyncio.run(run())
    else:
        with httpx.Client(transport=httpx.MockTransport(handler)) as client:
            with pytest.raises(expected) as exc:
                Photon(client=client).projects.download_attachment(payload)
            assert exc.value.status == status


@pytest.mark.parametrize("asynchronous", [False, True])
@pytest.mark.parametrize(("retry_after", "max_retry_after"), [("3600", None), ("2", 1.0)])
def test_retry_after_beyond_the_cap_returns_the_response(
    asynchronous, retry_after, max_retry_after, monkeypatch
):
    attempts = 0
    slept: list[float] = []
    monkeypatch.setattr("photon_api.transport.time.sleep", slept.append)

    async def fake_async_sleep(delay):
        slept.append(delay)

    monkeypatch.setattr("photon_api.transport.asyncio.sleep", fake_async_sleep)

    def handler(request):
        nonlocal attempts
        attempts += 1
        return httpx.Response(503, headers={"Retry-After": retry_after}, json={"detail": "busy"})

    options = {} if max_retry_after is None else {"max_retry_after": max_retry_after}
    call = lambda photon: photon.organizations.projects.count(  # noqa: E731
        CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
    )
    with pytest.raises(ApiError) as error:
        if asynchronous:

            async def run():
                async with (
                    httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http,
                    AsyncPhoton(client=http, **options) as photon,
                ):
                    return await call(photon)

            asyncio.run(run())
        else:
            with (
                httpx.Client(transport=httpx.MockTransport(handler)) as http,
                Photon(client=http, **options) as photon,
            ):
                call(photon)
    assert error.value.status == 503
    assert attempts == 1
    assert slept == []


def test_retry_after_within_the_cap_is_honoured(monkeypatch):
    slept: list[float] = []
    monkeypatch.setattr("photon_api.transport.time.sleep", slept.append)
    attempts = 0

    def handler(request):
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            return httpx.Response(503, headers={"Retry-After": "60"}, json={"detail": "busy"})
        return httpx.Response(200, json={"count": 2})

    result = invoke_client(
        False,
        handler,
        lambda photon: photon.organizations.projects.count(
            CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
        ),
    )
    assert result.count == 2
    assert slept == [60.0]


@pytest.mark.parametrize("asynchronous", [False, True])
def test_configured_idempotency_key_enables_mutation_retries(asynchronous, monkeypatch):
    monkeypatch.setattr("photon_api.transport.time.sleep", lambda _: None)

    async def no_sleep(_):
        return None

    monkeypatch.setattr("photon_api.transport.asyncio.sleep", no_sleep)
    attempts = 0

    def handler(request):
        nonlocal attempts
        attempts += 1
        assert request.headers["idempotency-key"] == "global-key"
        return httpx.Response(503, json={"detail": "busy"})

    payload = DeviceTokenInput.model_validate(
        {"body": {"grant_type": "refresh_token", "refresh_token": "refresh"}}
    )
    headers = {"Idempotency-Key": "global-key"}
    with pytest.raises(ApiError):
        if asynchronous:

            async def run():
                async with (
                    httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http,
                    AsyncPhoton(client=http, headers=headers) as photon,
                ):
                    await photon.auth.device.token(payload)

            asyncio.run(run())
        else:
            with (
                httpx.Client(transport=httpx.MockTransport(handler)) as http,
                Photon(client=http, headers=headers) as photon,
            ):
                photon.auth.device.token(payload)
    assert attempts == 3


@pytest.mark.parametrize(
    "body",
    [b"", b"not json", b"{}", b"[]"],
)
def test_json_operations_reject_empty_non_json_and_invalid_bodies(body):
    def handler(request):
        return httpx.Response(200, content=body, headers={"content-type": "text/plain"})

    with pytest.raises(ResponseValidationError):
        invoke_client(
            False,
            handler,
            lambda photon: photon.organizations.projects.count(
                CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
            ),
        )


def test_accept_lists_declared_success_and_error_media_types():
    def handler(request):
        assert request.headers["accept"] == "application/json, application/problem+json"
        return httpx.Response(200, json={"count": 1})

    result = invoke_client(
        False,
        handler,
        lambda photon: photon.organizations.projects.count(
            CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
        ),
    )
    assert result.count == 1


def test_package_ships_py_typed_marker():
    import importlib.resources

    assert importlib.resources.files("photon_api").joinpath("py.typed").is_file()


@pytest.mark.parametrize("asynchronous", [False, True])
def test_undeclared_not_modified_stays_an_api_error(asynchronous):
    payload = CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
    with pytest.raises(ApiError) as error:
        invoke_client(
            asynchronous,
            lambda _: httpx.Response(304),
            lambda photon: photon.organizations.projects.count(payload),
        )
    assert error.value.status == 304


def test_validation_problem_with_issues_is_an_api_error():
    problem = {
        "type": "https://photon.codes/docs/problems/validation-failed",
        "title": "Request Validation Failed",
        "status": 422,
        "code": "VALIDATION_FAILED",
        "detail": "pageSize must be at most 100",
        "issues": [
            {"code": "too_big", "location": "query", "message": "Too big", "path": ["pageSize"]}
        ],
    }
    payload = CountProjectsInput.model_validate({"path": {"organizationId": "organization"}})
    with pytest.raises(ApiError) as error:
        invoke_client(
            False,
            lambda _: httpx.Response(422, json=problem, headers={"X-Request-ID": "validation"}),
            lambda photon: photon.organizations.projects.count(payload),
        )
    assert (error.value.status, error.value.body, error.value.request_id) == (
        422,
        problem,
        "validation",
    )
