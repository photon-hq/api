"""Base classes and helpers of the generated models (tools/python-codegen).

The models carry the contract's types; values the contract restricts only by
validation keywords (patterns, lengths, bounds, sizes) are left to the service.
"""

from typing import Annotated, Any, Generic, TypeVar

from pydantic import AfterValidator, ConfigDict, TypeAdapter
from pydantic import BaseModel as PydanticBaseModel
from pydantic import RootModel as PydanticRootModel

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


class PrefixItems:
    """`PrefixItems[T1, ..., Tn]`: a JSON Schema `prefixItems` array without `items`.

    Item i, when present, validates as Ti; later items are unconstrained, and
    the array may be shorter than n. Generated for arrays whose positional
    items the model generator would otherwise drop
    (tools/python-codegen/prefix_items.py). The value is a `list`.
    """

    def __class_getitem__(cls, params: Any) -> Any:
        types = params if isinstance(params, tuple) else (params,)
        adapters: list[TypeAdapter[Any]] = []

        def validate(value: list[Any]) -> list[Any]:
            if not adapters:
                adapters.extend(TypeAdapter(item) for item in types)
            return [
                adapters[index].validate_python(item) if index < len(adapters) else item
                for index, item in enumerate(value)
            ]

        return Annotated[list[Any], AfterValidator(validate)]
