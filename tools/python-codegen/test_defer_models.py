import unittest

from defer_models import defer_models


class DeferredImportsTest(unittest.TestCase):
    def test_preserves_aliases_fields_constraints_and_other_imports(self):
        source = """from pydantic import BaseModel as Model, RootModel as Root, Field
from photon_api._model_base import BaseModel
# Preserve documentation.
class Example(Model):
    value: str = Field(min_length=2)
"""
        result = defer_models(source)
        self.assertIn("from pydantic import BaseModel as Model, Field", result)
        self.assertIn("from photon_api._model_base import RootModel as Root", result)
        self.assertIn("from photon_api._model_base import BaseModel", result)
        self.assertEqual(result[result.index("# Preserve") :], source[source.index("# Preserve") :])
        self.assertEqual(defer_models(result), result)
