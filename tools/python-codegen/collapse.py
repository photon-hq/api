"""Root-collapse rules for the pinned Python generator.

`--collapse-root-models` inlines a root model's type where a field uses it and
deletes the model once no field refers to it. Two kinds of component root model
need a different answer:

- In the public lane every root model under `components/schemas` is a contract
  name that the SDK exports (the operation facade uses it as a request or
  response type), so `install(keep_components=True)` still inlines the root type
  where a field used it but keeps the component's class.
- `install(preserve=...)` names component root models that are never inlined
  (`Preparation.preserve` in generate.py: the roots that carry an `allOf`
  validator, the pinned platform unions and the types the RPC facade names).

The generator has no option for either rule, so `install` wraps its collapse
pass. With generator 0.76.2 this module also replaced the pass's reference
index, which rebuilt itself after every replacement (the internal lane took
41 s instead of 8 s). Generator 0.86.0 generates it in 5 s without the
replacement, so the replacement is gone (ENG-2979).
"""

from importlib.metadata import version

from datamodel_code_generator.parser import base

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
    if installed != "0.86.0":
        raise RuntimeError(f"Review the root-collapse adapter before using generator {installed}")
    setattr(
        base.Parser,
        _COLLAPSE,
        _collapse(keep_components, frozenset(preserve))
        if keep_components or preserve
        else _UPSTREAM_COLLAPSE,
    )
