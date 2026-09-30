"""Bound root-collapse indexing cost for the pinned Python generator.

The upstream incremental tracker falls back to rebuilding the complete index
after each shared-type mutation. Batch those rebuilds and answer reference
queries from the live objects instead. Model/base ownership does not change
during the default collapse pass; field and nested references do.

The collapse pass also deletes a root model once no field refers to it. In the
public lane every root model under `components/schemas` is a contract name that
the SDK exports (the operation facade uses it as a request or response type),
so `install(keep_components=True)` still inlines the root type where a field
used it but keeps the component's class. `install(preserve=...)` names component
root models that are never inlined (they carry a validator; intersections.py).
"""

from collections.abc import Iterator
from contextlib import contextmanager
from importlib.metadata import version

from datamodel_code_generator.model.base import DataModelFieldBase
from datamodel_code_generator.parser import base
from datamodel_code_generator.parser.generation import GenerationIndex, GenerationStore
from datamodel_code_generator.reference import Reference
from datamodel_code_generator.types import DataType


class CollapseIndex(GenerationIndex):
    def has_data_type_references_other_than(
        self, reference: Reference, excluded_data_type: DataType
    ) -> bool:
        store = self._store
        if not store.collapsing:
            return super().has_data_type_references_other_than(reference, excluded_data_type)

        # Reverse links can include detached temporaries and omit shallow copies.
        # Only use them to prove a positive answer through live ownership edges.
        for child in reference.children:
            if (
                isinstance(child, DataType)
                and child is not excluded_data_type
                and child.reference is reference
                and store.is_reachable(child)
            ):
                return True

        # A negative answer requires walking the actual graph, including shared
        # objects and dictionary keys. Never cache answers across mutations.
        seen: set[int] = set()
        for model in store.models:
            pending = [field.data_type for field in model.fields]
            pending.extend(model.base_classes)
            while pending:
                data_type = pending.pop()
                if id(data_type) in seen:
                    continue
                seen.add(id(data_type))
                if data_type is not excluded_data_type and data_type.reference is reference:
                    return True
                pending.extend(data_type.data_types)
                if data_type.dict_key is not None:
                    pending.append(data_type.dict_key)
        return False


class CollapseStore(GenerationStore):
    def __init__(self) -> None:
        super().__init__()
        self.index = CollapseIndex(self)
        self.collapsing = False
        self._collapse_models: set[int] = set()
        self._collapse_bases: set[int] = set()

    def is_reachable(self, data_type: DataType) -> bool:
        seen: set[int] = set()
        while id(data_type) not in seen:
            seen.add(id(data_type))
            if id(data_type) in self._collapse_bases:
                return True
            parent = data_type.parent
            if isinstance(parent, DataModelFieldBase):
                model = parent.parent
                return (
                    parent.data_type is data_type
                    and id(model) in self._collapse_models
                    and any(field is parent for field in model.fields)
                )
            if not isinstance(parent, DataType) or not (
                parent.dict_key is data_type
                or any(child is data_type for child in parent.data_types)
            ):
                return False
            data_type = parent
        return False

    @contextmanager
    def _collapse_root_reference_scope(self) -> Iterator[None]:
        self.refresh_now()
        self._collapse_models = {id(model) for model in self.models}
        self._collapse_bases = {id(base) for model in self.models for base in model.base_classes}
        try:
            with super()._collapse_root_reference_scope():
                self._active_root_collapse_reference_scope.invalidate()
                self.collapsing = True
                # The remaining index reads in this pass concern stable base
                # ownership. Rebuild all derived facts before leaving the pass.
                with self.defer_refresh():
                    yield
        finally:
            self.collapsing = False
            self._collapse_models.clear()
            self._collapse_bases.clear()


_COLLAPSE = "_Parser__collapse_root_models"
_UPSTREAM_COLLAPSE = getattr(base.Parser, _COLLAPSE)
_CIRCULAR = "_circular_root_model_paths"


def component_name(model) -> str | None:
    """The name of a model generated from exactly `#/components/schemas/<name>`."""
    fragment = model.reference.path.split("#", 1)[-1]
    parts = fragment.split("/")[1:]
    if len(parts) == 3 and parts[:2] == ["components", "schemas"]:
        return parts[2].replace("~1", "/").replace("~0", "~")
    return None


def _collapse(keep_components: bool, preserve: frozenset[str]):
    def collapse(self, models, unused_models, *args, **kwargs) -> None:
        circular = getattr(self, _CIRCULAR, ())
        # Upstream never inlines a circular root model; treat preserved roots
        # (they carry a validator, see intersections.py) the same way.
        kept = {model.path for model in models if component_name(model) in preserve}
        setattr(self, _CIRCULAR, frozenset(circular) | kept)
        collapsed: list = []
        try:
            _UPSTREAM_COLLAPSE(self, models, collapsed, *args, **kwargs)
        finally:
            setattr(self, _CIRCULAR, circular)
        unused_models.extend(
            model
            for model in collapsed
            if not (keep_components and component_name(model) is not None)
        )

    return collapse


def install(*, keep_components: bool = False, preserve: frozenset[str] = frozenset()) -> None:
    """Install only for the exact upstream implementation covered by our tests.

    keep_components: never delete a component's class during root collapse
    (public lane). preserve: component root models that are never inlined.
    """
    installed = version("datamodel-code-generator")
    if installed != "0.76.2":
        raise RuntimeError(f"Review the root-collapse adapter before using generator {installed}")
    base.GenerationStore = CollapseStore
    setattr(
        base.Parser,
        _COLLAPSE,
        _collapse(keep_components, frozenset(preserve))
        if keep_components or preserve
        else _UPSTREAM_COLLAPSE,
    )
