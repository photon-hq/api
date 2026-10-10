"""Model base behaviour on hand-written models. Generated models are tested against the
feature-coverage fixture (tools/conformance/fixtures/tests/python).
"""

from typing import Literal

import pytest
from pydantic import ConfigDict, Field, TypeAdapter, ValidationError

from photon_api._model_base import BaseModel, RootModel


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
