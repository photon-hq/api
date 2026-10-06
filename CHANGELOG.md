# Changelog

## 0.2.3 (2026-10-06)


### Features

* **docs:** generate the SDK reference and rebuild the docs after each release

## 0.2.2 (2026-10-04)


### Features

* publish the contract with SDK code samples for the docs site
* update the public API from production


### Bug Fixes

* **typescript:** report body-read timeouts and aborts as transport errors


### Documentation

* add the API Client guide for the documentation site

## 0.2.1 (2026-10-01)


### Bug Fixes

* **python:** type client methods as their decoded results
* **python:** type client methods as their decoded results

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
