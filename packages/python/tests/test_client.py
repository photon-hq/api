"""Contract-agnostic client tests: namespace layout, the transport on hand-written operations,
and packaging. Behaviour on generated operations is tested against the feature-coverage
fixture (tools/conformance/fixtures/tests/python), so these tests use no generated names.
"""

from __future__ import annotations

import asyncio
import re

import httpx
import pytest
from pydantic import BaseModel, TypeAdapter

from photon_api import AsyncPhoton, Photon, ResponseValidationError
from photon_api.transport import AsyncTransport, OperationSpec, SyncTransport


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


def test_package_ships_py_typed_marker():
    import importlib.resources

    assert importlib.resources.files("photon_api").joinpath("py.typed").is_file()
