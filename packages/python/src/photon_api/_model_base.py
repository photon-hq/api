"""Base classes and helpers of the generated models (tools/python-codegen).

The models carry the contract's types; values the contract restricts only by
validation keywords (patterns, lengths, bounds, sizes) are left to the service.
"""

import types
from functools import lru_cache
from typing import Annotated, Any, Generic, Literal, TypeVar, Union, get_args, get_origin

from pydantic import AfterValidator, ConfigDict, TypeAdapter, ValidationError
from pydantic import BaseModel as PydanticBaseModel
from pydantic import RootModel as PydanticRootModel
from pydantic.experimental.missing_sentinel import MISSING

T = TypeVar("T")


class BaseModel(PydanticBaseModel):
    # Members the SDK does not know are kept (a response may gain fields).
    model_config = ConfigDict(extra="allow", defer_build=True)


class RootModel(PydanticRootModel[T], Generic[T]):
    model_config = ConfigDict(defer_build=True)


def validate_all_of(data: Any, *constraints: type[PydanticBaseModel]) -> Any:
    """Check the input of a union narrowed by object constraints against each constraint.

    Generated (tools/python-codegen/intersections.py) as a `mode="before"`
    validator: every constraint model validates the value as given, and the
    root type validates the union; the value is valid only if all accept it.
    A model instance is checked through its JSON form.
    """
    raw = (
        data.model_dump(mode="json", by_alias=True) if isinstance(data, PydanticBaseModel) else data
    )
    for constraint in constraints:
        constraint.model_validate(raw)
    return data


class _PrefixItemsCheck:
    """The validator of `PrefixItems[T1, ..., Tn]`: item i, when present, validates as Ti."""

    def __init__(self, types: tuple[Any, ...]) -> None:
        self.types = types
        self._adapters: list[TypeAdapter[Any]] = []

    def __call__(self, value: list[Any]) -> list[Any]:
        if not self._adapters:
            self._adapters = [TypeAdapter(item) for item in self.types]
        return [
            self._adapters[index].validate_python(item) if index < len(self._adapters) else item
            for index, item in enumerate(value)
        ]


class PrefixItems:
    """`PrefixItems[T1, ..., Tn]`: a JSON Schema `prefixItems` array without `items`.

    Item i, when present, validates as Ti; later items are unconstrained, and
    the array may be shorter than n. Generated for arrays whose positional
    items the model generator would otherwise drop
    (tools/python-codegen/prefix_items.py). The value is a `list`.
    """

    def __class_getitem__(cls, params: Any) -> Any:
        types = params if isinstance(params, tuple) else (params,)
        return Annotated[list[Any], AfterValidator(_PrefixItemsCheck(types))]


@lru_cache(maxsize=512)
def _cached_adapter(type_: Any) -> TypeAdapter[Any]:
    return TypeAdapter(type_)


def _validated(type_: Any, value: Any) -> tuple[bool, Any]:
    try:
        adapter = _cached_adapter(type_)
    except TypeError:
        adapter = TypeAdapter(type_)
    try:
        return True, adapter.validate_python(value)
    except ValidationError:
        return False, None


def _bare(type_: Any) -> Any:
    while get_origin(type_) is Annotated:
        type_ = get_args(type_)[0]
    return type_


def _model(type_: Any) -> type[PydanticBaseModel] | None:
    type_ = _bare(type_)
    if isinstance(type_, type) and issubclass(type_, PydanticBaseModel):
        return type_
    return None


def _union_member(members: tuple[Any, ...], value: Any) -> Any:
    """The member of a union that a value matching none of them is read as.

    For an object, the first model whose constant (`Literal`) fields, the
    discriminator, all take the value's, else the first model without constant
    fields (an open union's fallback); for a list, the first list member.
    """
    if isinstance(value, list):
        return next((member for member in members if get_origin(_bare(member)) is list), None)
    if not isinstance(value, dict):
        return None
    fallback = None
    for member in members:
        model = _model(member)
        if model is None or issubclass(model, PydanticRootModel):
            continue
        constants = [
            (field.alias if isinstance(field.alias, str) else name, get_args(field.annotation))
            for name, field in model.model_fields.items()
            if get_origin(field.annotation) is Literal
        ]
        if not constants:
            fallback = fallback or member
        elif all(key in value and value[key] in values for key, values in constants):
            return member
    return fallback


def loosen(type_: Any, value: Any) -> Any:
    """Read a JSON value that fails validation as `type_` as far as the type allows.

    The client's default for a successful response whose body does not match
    its model (`strict_response_validation=True` rejects it instead). Every
    part that validates is the usual model or value. A model that does not is
    built without validation (`model_construct`) from the members it has, each
    read the same way, and keeps the members the SDK does not know; a member
    the response leaves out is `MISSING`. Any other value that does not match
    is kept as the API sent it.
    """
    valid, result = _validated(type_, value)
    if valid:
        return result
    origin = get_origin(type_)
    if origin is Annotated:
        inner, *metadata = get_args(type_)
        prefix = next(
            (
                entry.func
                for entry in metadata
                if isinstance(entry, AfterValidator) and isinstance(entry.func, _PrefixItemsCheck)
            ),
            None,
        )
        if prefix is not None and isinstance(value, list):
            return [
                loosen(prefix.types[index], entry) if index < len(prefix.types) else entry
                for index, entry in enumerate(value)
            ]
        return loosen(inner, value)
    if origin is Union or origin is types.UnionType:
        member = _union_member(get_args(type_), value)
        return value if member is None else loosen(member, value)
    if origin is list and isinstance(value, list):
        (item,) = get_args(type_)
        return [loosen(item, entry) for entry in value]
    if origin is dict and isinstance(value, dict):
        _, item = get_args(type_)
        return {key: loosen(item, entry) for key, entry in value.items()}
    model = _model(type_)
    if model is None:
        return value
    if issubclass(model, PydanticRootModel):
        return model.model_construct(loosen(model.model_fields["root"].rebuild_annotation(), value))
    if not isinstance(value, dict):
        return value
    names = {
        field.alias if isinstance(field.alias, str) else name: name
        for name, field in model.model_fields.items()
    }
    members = {
        key: loosen(model.model_fields[names[key]].rebuild_annotation(), entry)
        if key in names
        else entry
        for key, entry in value.items()
    }
    for key, name in names.items():
        if key not in value and model.model_fields[name].is_required():
            members[key] = MISSING
    # model_construct's own parameters cannot pass as members; they are set afterwards.
    reserved = {key: members.pop(key) for key in ("cls", "_fields_set") if key in members}
    result = model.model_construct(
        _fields_set={names[key] for key in value if key in names}, **members
    )
    for key, entry in reserved.items():
        if key in names:
            result.__dict__[names[key]] = entry
        elif result.__pydantic_extra__ is not None:
            result.__pydantic_extra__[key] = entry
    return result
