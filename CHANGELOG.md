# Changelog

## 0.2.0 (2026-10-01)


### ⚠ BREAKING CHANGES

* Upgrading from 0.1.x:
    * **Type names now come from the API contract.** Names that 0.1.x derived from operations are gone, for example `AssignSmsLineCampaignResponse200ApplicationJson` is now `AssignSmsLineCampaignResponse`. Update imports of renamed types. Methods, requests and responses on the wire keep their names.
    * **Account deletion and account service keys no longer accept OAuth tokens** with `account:write`; use an account service key.
    * **The SMS line campaign response drops** `campaignObservedAt`, `observedAt`, `operationId`, `providerAssignmentStatus` and `requestedCampaignId`.

### Features

* Add `auth.disableOrganizationSso` (`POST /v1/auth/organizations/{orgId}/sso/disable`).


### Bug Fixes

* Python: the attachment upload body is typed as `bytes`.
* The `Sunset` response header is documented as an HTTP date.


### Documentation

* **postman:** add the Run in Postman button and the public workspace link

## 0.1.1 (2026-09-30)


### Bug Fixes

* use customer-facing text for the naming waiver in config and CI

## 0.1.0 (2026-09-30)


### Features

* initial release of the Photon API clients for TypeScript, Python and Rust
