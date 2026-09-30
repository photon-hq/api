import json
from pathlib import Path
from typing import Literal

import pytest
from pydantic import ConfigDict, Field, TypeAdapter, ValidationError

from photon_api._model_base import BaseModel, RootModel
from photon_api.generated import models

ROOT = Path(__file__).resolve().parents[3]
# The contract config/sdk.json names (openapi/openapi.json in the public repository).
SOURCE = json.loads(
    (ROOT / json.loads((ROOT / "config/sdk.json").read_text())["schemaPath"]).read_text()
)
COMPONENT_PREFIX = "#/components/schemas/"
DEVICE_TOKEN = ("/v1/auth/device/token", "post", "request")
COUNT_PROJECTS = ("/v1/organizations/{organizationId}/projects/count", "get", "200")
GET_RESOURCE = ("/v1/projects/{id}/platforms/resources/{resourceId}", "get", "200")
ASSIGN_SMS_LINE_CAMPAIGN = (
    "/v1/projects/{id}/platforms/sms/lines/{resourceId}/campaign",
    "put",
    "422",
)


def media_schema(operation: tuple[str, str, str], media_type: str) -> dict:
    path, method, where = operation
    source = SOURCE["paths"][path][method]
    holder = source["requestBody"] if where == "request" else source["responses"][where]
    return holder["content"][media_type]["schema"]


def component_name(schema: dict) -> str | None:
    reference = schema.get("$ref") if list(schema) == ["$ref"] else None
    return reference.removeprefix(COMPONENT_PREFIX) if reference else None


def resolved(schema: dict) -> dict:
    name = component_name(schema)
    return SOURCE["components"]["schemas"][name] if name else schema


def media_model(operation: tuple[str, str, str], media_type: str, hoisted: str):
    """The generated model of an operation media schema.

    The contract component the source references, or (internal lane) the
    operation-specific name that SDK preparation gives an inline schema.
    """
    return getattr(models, component_name(media_schema(operation, media_type)) or hoisted)


def test_deferred_models_build_on_use_and_preserve_validation_and_serialization():
    class Item(BaseModel):
        model_config = ConfigDict(extra="forbid")
        kind: Literal["sms"]
        text: str = Field(min_length=2)

    class Items(RootModel[list[Item]]):
        pass

    adapter = TypeAdapter(Items)
    assert not Item.__pydantic_complete__
    assert not Items.__pydantic_complete__
    valid = [{"kind": "sms", "text": "hello"}]
    assert adapter.validate_python(valid).model_dump(mode="json") == valid
    assert adapter.validate_json('[{"kind":"sms","text":"hello"}]').model_dump() == valid
    for invalid in [
        [{"kind": "email", "text": "hello"}],
        [{"kind": "sms", "text": "x"}],
        [{"kind": "sms", "text": "hello", "extra": True}],
    ]:
        with pytest.raises(ValidationError):
            adapter.validate_python(invalid)
    assert "items" in Items.model_json_schema()


@pytest.mark.parametrize(
    ("model", "value"),
    [
        (model, body)
        for model in [
            media_model(DEVICE_TOKEN, "application/json", "DeviceTokenRequestApplicationJson"),
            media_model(
                DEVICE_TOKEN,
                "application/x-www-form-urlencoded",
                "DeviceTokenRequestApplicationForm",
            ),
        ]
        for body in [
            {
                "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
                "device_code": "fixture",
            },
            {"grant_type": "refresh_token", "refresh_token": "fixture"},
        ]
    ],
)
def test_source_allowed_request_extras_survive_serialization(model, value):
    value = {**value, "futureField": {"nested": [1, None, True]}}
    assert (
        model.model_validate(value).model_dump(mode="json", by_alias=True, exclude_unset=True)
        == value
    )


def test_responses_keep_members_the_sdk_does_not_know():
    model = media_model(
        COUNT_PROJECTS, "application/json", "CountProjectsResponse200ApplicationJson"
    )
    value = model.model_validate({"count": 2, "futureField": True})
    assert value.model_dump(mode="json", by_alias=True) == {"count": 2, "futureField": True}


def test_responses_accept_enum_values_and_members_added_later():
    model = media_model(GET_RESOURCE, "application/json", "GetResourceResponse200ApplicationJson")
    resource = {
        "abilities": ["messaging"],
        "createdAt": "2026-01-01T00:00:00.000Z",
        "detail": {},
        "projectId": "project",
        "resourceId": "resource",
        "state": "active",
        "type": "phone_number",
        "updatedAt": "2026-01-01T00:00:00.000Z",
    }
    # A state the service adds later, and a member this SDK does not know, are kept.
    for value in (resource, {**resource, "state": "suspended", "futureField": {"a": [1]}}):
        assert model.model_validate(value).model_dump(mode="json", by_alias=True) == value
    with pytest.raises(ValidationError):
        model.model_validate({**resource, "state": 1})


@pytest.mark.parametrize("added_value", [None, "retry later", {"action": "wait"}])
def test_problem_that_gains_remediation_still_decodes(added_value):
    schema = resolved(media_schema(ASSIGN_SMS_LINE_CAMPAIGN, "application/problem+json"))
    if schema.get("properties", {}).get("remediation") != {"not": {}}:
        pytest.skip("this contract does not say remediation is absent")
    assert "remediation" not in schema["required"]
    payload = {name: schema["properties"][name]["const"] for name in schema["required"]}
    model = media_model(
        ASSIGN_SMS_LINE_CAMPAIGN,
        "application/problem+json",
        "AssignSmsLineCampaignResponse422ApplicationProblemPlusJson",
    )
    assert model.model_validate(payload).model_dump(mode="json", exclude_unset=True) == payload
    # The contract says remediation is absent, so the model does not declare it
    # (tools/python-codegen/absent_properties.py); a service that adds it later
    # must not break this SDK, and the value is kept like any undeclared member.
    assert "remediation" not in model.model_fields
    value = {**payload, "remediation": added_value}
    problem = model.model_validate(value)
    assert set(problem.model_extra) == {"remediation"}
    assert problem.model_dump(mode="json", exclude_unset=True) == value


def free_form_json_models() -> list[type]:
    """Root models of a free-form JSON value: a union of strings, numbers, lists and objects."""
    import typing

    found = []
    for value in vars(models).values():
        if not (isinstance(value, type) and issubclass(value, RootModel)):
            continue
        members = set(typing.get_args(value.model_fields["root"].annotation))
        for member in list(members):
            members |= set(typing.get_args(member))
        origins = {typing.get_origin(member) or member for member in members}
        if {str, float, list, dict} <= origins:
            found.append(value)
    return found


def test_free_form_json_values_keep_integers_and_decimals():
    found = free_form_json_models()
    assert found
    for model in found:
        for text in ('{"parts":1}', '{"x":1.5}', '[1,2.0,-3,true,"1",null]'):
            assert model.model_validate_json(text).model_dump_json() == text, model.__name__
        assert model({"parts": 1}).model_dump(mode="json") == {"parts": 1}
