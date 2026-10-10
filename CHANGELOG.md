# Changelog

## 0.3.0 (2026-10-10)


### ⚠ BREAKING CHANGES

* Upgrading from 0.2.x:
    * **Cancelling and resuming a subscription are removed:** `organizations.billing.cancelSubscription` and `organizations.billing.resumeSubscription` (`cancel_subscription` and `resume_subscription` in Python and Rust), with their request and response types. To leave a paid plan, call `organizations.billing.changePlan` with the default plan (`isDefault` in `projects.billing.listBillingPlans`); the change takes effect at the end of the billing period. To keep the paid plan, change back to it before then.
    * **Creating a project can return `202`** while the project's billing is still being set up, with the same project in the body. In Rust, `create_project` now returns `CreateProjectResponse` (`Status201` or `Status202`, each holding the project) instead of `types::Project`; TypeScript and Python still return the project. After a `202`, wait for `Retry-After` and read the project again until `billingInitialization` is `completed` or `unknown`.
    * **Response enums have new values.** Code that handles every value needs the new ones: `SubscriptionStatus` adds `restricted` and `suspended`, `BillingOperationFailureDetail` adds `reconciliation_required` and `release_required`, and `MessageMetricsSqlTableName` adds `call_events`. In `projects.getMessageMetricsSqlSchema`, a column's `json.resource.type` is now `MessageMetricsJsonResourceType` (`call` or `message`) instead of always `message`.
    * **Platform provisioning can fail with a new `503` problem, `BillingEntitlementsPendingProblem` (`BILLING_ENTITLEMENTS_PENDING`),** while the project's billing entitlements are pending: adding email domains, SMS numbers, WhatsApp Business numbers and senders, iMessage and WhatsApp assignments and dedicated lines, and reading the iMessage and WhatsApp settings. Error handling that matches every problem type needs the new one.

### Features

* Add `organizations.billing.getEffectiveTerms` (`GET /v1/organizations/{organizationId}/billing/projects/{projectId}/terms`): what a project is billed on now, per category.
* Add `organizations.billing.previewOrganizationChange` (`POST /v1/organizations/{organizationId}/billing/preview`) and `organizations.billing.previewProjectChange` (`POST /v1/organizations/{organizationId}/billing/projects/{projectId}/preview`), which price a billing change exactly as making it would bill it.
* Add `projects.platforms.listFilteredVerificationCodes` and `projects.platforms.countFilteredVerificationCodes` (`GET /v1/projects/{id}/platforms/filtered-otp` and `…/count`), and `listResourceFilteredVerificationCodes` and `countResourceFilteredVerificationCodes` for one line or number (`GET /v1/projects/{id}/platforms/resources/{resourceId}/filtered-otp` and `…/count`): the one-time codes Photon filtered from inbound messages.
* Billing plans report `isDefault`; organization subscriptions report `planName`, `baseAmountCents`, `currency` and `minimumCommitment`; platform operations report a `reason`; and `projects.platforms.listOperations` accepts `endedAfter`.


### Documentation

* publish ordinary MDX SDK references from released clients

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
