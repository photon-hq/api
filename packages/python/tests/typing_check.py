"""Static typing check, run by pyright in CI (not a pytest module).

The client's methods return decoded results; photon.raw returns whole responses.
"""

from typing import assert_type

from photon_api import AsyncPhoton, Photon
from photon_api.generated import models
from photon_api.rpc_generated import ListProjectsInput
from photon_api.transport import RawResponse


def sync_usage(photon: Photon) -> None:
    assert_type(photon.account.get(), models.Account)
    assert_type(photon.raw.account.get(), RawResponse[models.Account])
    request = ListProjectsInput.model_validate({"path": {"organizationId": "o"}})
    assert_type(photon.organizations.projects.list(request), models.ProjectPage)
    assert_type(photon.auth.list_oauth_scopes().scopes, list[str])


async def async_usage(photon: AsyncPhoton) -> None:
    assert_type(await photon.account.get(), models.Account)
    assert_type(await photon.raw.account.get(), RawResponse[models.Account])
