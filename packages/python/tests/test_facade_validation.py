from __future__ import annotations

import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from photon_api.rpc_generated import (
    CheckProjectSlugAvailabilityQuery,
    GetMessageMetricsSqlSchemaHeader,
    UploadAttachmentHeader,
)

ROOT = Path(__file__).resolve().parents[3]
# The contract config/sdk.json names (openapi/openapi.json in the public repository).
SOURCE = json.loads(
    (ROOT / json.loads((ROOT / "config/sdk.json").read_text())["schemaPath"]).read_text()
)


def parameter_schema(operation_id, location, name):
    operation = next(
        operation
        for item in SOURCE["paths"].values()
        for operation in item.values()
        if isinstance(operation, dict) and operation.get("operationId") == operation_id
    )
    return next(
        parameter["schema"]
        for parameter in operation["parameters"]
        if parameter["in"] == location and parameter["name"] == name
    )


def test_parameters_carry_types_not_validation_keywords():
    """Lengths and patterns are left to the service; types and requiredness stay."""
    slug = parameter_schema("checkProjectSlugAvailability", "query", "slug")
    assert CheckProjectSlugAvailabilityQuery(slug="x" * (slug["maxLength"] + 1))
    for payload, error_type in [({}, "missing"), ({"slug": None}, "string_type")]:
        with pytest.raises(ValidationError) as error:
            CheckProjectSlugAvailabilityQuery.model_validate(payload)
        assert error.value.errors()[0]["type"] == error_type
    headers = {"content-length": "1", "idempotency-key": "upload-key"}
    for name in ("content-type", "content_type"):
        value = "x" * 1000
        result = UploadAttachmentHeader.model_validate({**headers, name: value})
        assert result.model_dump(by_alias=True)["content-type"] == value
    assert GetMessageMetricsSqlSchemaHeader.model_validate({"x-photon-version": "latest"})
