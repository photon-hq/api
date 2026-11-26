"""Model base behaviour on hand-written models. Generated models are tested against the
feature-coverage fixture (tools/conformance/fixtures/tests/python).
"""

from typing import Literal

import pytest
from pydantic import ConfigDict, Field, TypeAdapter, ValidationError
from pydantic.experimental.missing_sentinel import MISSING

from photon_api._model_base import BaseModel, PrefixItems, RootModel, loosen


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


class SmsUser(BaseModel):
    platform: Literal["sms"]
    handle: str


class UnknownUser(BaseModel):
    platform: str
    id: str


class User(RootModel[SmsUser | UnknownUser]):
    root: SmsUser | UnknownUser


class Owner(BaseModel):
    from_: str = Field(alias="from")
    note: str | MISSING = MISSING


class Project(BaseModel):
    projectId: str
    createdByAccountId: str | None
    owner: Owner
    lead: User
    members: list[SmsUser | UnknownUser]
    labels: dict[str, str]


def test_a_value_that_fails_its_model_is_read_as_far_as_the_model_allows():
    value = {
        "projectId": "prj_1",
        "owner": {"from": 7},
        "lead": {"platform": "sms"},
        "members": [
            {"platform": "sms", "handle": "+1"},
            {"platform": "fax", "id": "u2"},
            {"platform": "fax"},
            7,
        ],
        "labels": {"color": "red", "size": 3},
        "futureField": True,
    }
    with pytest.raises(ValidationError):
        Project.model_validate(value)

    project = loosen(Project, value)

    assert type(project) is Project
    # A required member the value leaves out is MISSING, as an omitted optional one is.
    assert project.createdByAccountId is MISSING
    assert project.model_fields_set == {"projectId", "owner", "lead", "members", "labels"}
    assert project.model_extra == {"futureField": True}
    assert type(project.owner) is Owner
    assert (project.owner.from_, project.owner.note) == (7, MISSING)
    # A known union member that fails is read as that member, not as the fallback.
    assert type(project.lead.root) is SmsUser
    assert project.lead.root.handle is MISSING
    assert [type(member).__name__ for member in project.members] == [
        "SmsUser",
        "UnknownUser",
        "UnknownUser",
        "int",
    ]
    assert project.labels == {"color": "red", "size": 3}
    with pytest.warns(UserWarning):
        assert project.model_dump(mode="json", by_alias=True) == value


def test_a_value_that_matches_is_validated_and_one_that_matches_nothing_is_kept():
    assert loosen(SmsUser | UnknownUser, {"platform": "fax", "id": "u2"}) == UnknownUser(
        platform="fax", id="u2"
    )
    for value in [1, "text", None, [1]]:
        assert loosen(Project, value) == value
    assert loosen(list[int], "not a list") == "not a list"
    assert loosen(SmsUser | UnknownUser, ["a"]) == ["a"]


class Pin(BaseModel):
    label: str


class Map(BaseModel):
    name: str
    origin: PrefixItems[Pin, int]


def test_positional_items_keep_their_types_when_their_model_fails():
    matching = Map.model_validate({"name": "a", "origin": [{"label": "x"}, 1]})
    assert type(matching.origin[0]) is Pin

    read = loosen(Map, {"name": 1, "origin": [{"label": "x"}, 1, "extra"]})
    assert read.name == 1
    assert read.origin == [Pin(label="x"), 1, "extra"]
    assert type(read.origin[0]) is Pin

    read = loosen(Map, {"name": "a", "origin": [{"label": 2}, "one", "extra"]})
    assert type(read.origin[0]) is Pin
    assert (read.origin[0].label, read.origin[1:]) == (2, ["one", "extra"])


def test_members_named_like_model_construct_parameters_are_kept():
    value = {"projectId": 1, "cls": "c", "_fields_set": ["x"]}

    project = loosen(Project, value)

    assert type(project) is Project
    assert project.projectId == 1
    assert project.model_extra == {"cls": "c", "_fields_set": ["x"]}
