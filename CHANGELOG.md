# Changelog

## 0.6.1 (2026-10-28)


### Bug Fixes

* **python:** type webhook event objects as the full Message union

## 0.6.0 (2026-10-23)


### ⚠ BREAKING CHANGES

* **sync:** the SDKs no longer expose getAccountOnboarding, updateAccountOnboarding, completeAccountOnboarding, or createOrganizationSetupIntent. These dashboard onboarding and billing setup flows moved behind the dashboard session on 2026-10-17 and have rejected API credentials since.
* **release:** the SDKs no longer expose startAccountPhoneVerification, confirmAccountPhoneVerification, beginOrganizationSsoAdmission, beginOrganizationAuthentication, beginOrganizationClosureAuthentication, beginInvitationSso, connectWhatsappBusiness, or getWhatsappSignupConfig. These operations moved behind the dashboard session and have rejected API credentials since 2026-10-17.

### Features

* **sync:** add the organizations and service identity API: 43 operations covering organizations and members, invitations, OAuth clients, service identities and their credentials, avatars, and SSO subscriptions


### Bug Fixes

* **release:** exclude browser-session operations from the public API (ENG-4375)


### Documentation

* **release:** correct three Go guide claims

## 0.5.0 (2026-10-16)


### ⚠ BREAKING CHANGES

* Go only; TypeScript, Python and Rust are unchanged. Upgrading from 0.4.x:
    * **Messages read back with their full content.** `PlatformMessage` — the items of `Projects.ListMessages` and the body of `Projects.GetMessage` — previously decoded only its `platform` field. It is now a `Union` value: branch on `Kind()`, decode the platform with its `As` method, then the status variant. For an incoming iMessage: `item.AsImessageMessage()`, then `.AsReceivedImessageMessage()` for the id, sender, space and content. `PlatformSpace` and `PlatformUser` change the same way. The former `.Platform` field is the `Platform()` method.
    * **Send results carry the sent message.** `SentMessage` from `Projects.SendMessage` is the same kind of `Union` value: `sent.AsImessageMessage()` then `.AsAcceptedImessageMessage()` reaches the sent message's `id`. The former `.Platform` and `.Status` fields are the `Platform()` and `Status()` methods. `MarkMessageReadResponse` and `SetSpaceTypingResponse` change the same way.
    * **`Organizations.Billing.ChangePlan` returns a typed union.** `*ChangePlanResponse` replaces `*Union`, with `AsTerminalBillingOperation()` (the status 200 body) and `AsPendingBillingOperation()` (status 202). The decoders check the HTTP status that produced the body and refuse the other status's schema; `Status()` returns it.

### Bug Fixes

* **go:** allOf-narrowed unions (messages, spaces, users, send results) decode with their full surface instead of only their constraint fields, and multi-status responses get a named, status-aware union

## 0.4.3 (2026-10-15)


### Features

* **docs:** add Go to the SDK reference, code samples and guides

## 0.4.2 (2026-10-15)


### Features

* **Messaging operations.** Send and read conversations from the SDKs: `projects.sendMessage`, `projects.listMessages`, `projects.getMessage`, `projects.countMessages` and `projects.markMessageRead`; Spaces via `projects.listSpaces`, `projects.createOrGetSpace`, `projects.countSpaces`, `projects.getSpace` and `projects.setSpaceTyping`; platform Users via `projects.listUsers`, `projects.createOrGetUser`, `projects.countUsers` and `projects.getUser` (the same names in snake_case on `projects` in Python, flat on the client in Rust — `send_message`, `list_spaces`, … — and `Projects.SendMessage`, `Projects.ListSpaces`, … in Go). Sending takes the `SendContent` union (`SendTextContent`, attachments, reactions and more) with an idempotency key and returns the accepted `SentMessage`; message lifecycle and inbound traffic arrive on existing webhook destinations as the `message.received`, `message.dispatched`, `message.accepted`, `message.delivered` and `message.failed` events.
* **Email insight operations** `projects.platforms.getEmailDeliveryMetrics`, `projects.platforms.getEmailSendingPolicies` and `projects.platforms.listEmailRecommendations` (`get_email_delivery_metrics`, `get_email_sending_policies` and `list_email_recommendations` in Python and Rust; `Projects.Platforms.GetEmailDeliveryMetrics`, `.GetEmailSendingPolicies` and `.ListEmailRecommendations` in Go): delivery-metric series, sending policies and advisory recommendations for a project's email platform, with the new `EmailDeliveryMetrics`, `EmailSendingPolicies`, `EmailRecommendations` and related types.
* **Project subscriptions** `projects.billing.listProjectSubscriptions` (`list_project_subscriptions` in Python and Rust; `Projects.Billing.ListProjectSubscriptions` in Go): list a project's billing subscriptions, also readable with the `project:read_usage` OAuth scope.
* `CreditSource` entries in `organizations.billing.listCreditActivity` responses now carry a `description`.

## 0.4.1 (2026-10-14)


### Features

* **New Go client.** Install it with `go get github.com/photon-hq/api/packages/go`: the Photon API client for Go, generated from the same contract and released in lockstep with the TypeScript, Python and Rust packages (the module is versioned by the `packages/go/v<version>` tag). It requires Go 1.25+, uses only the standard library, and its API reference is on [pkg.go.dev](https://pkg.go.dev/github.com/photon-hq/api/packages/go).
* **Account onboarding operations** `account.onboarding.get`, `account.onboarding.update` and `account.onboarding.complete` in TypeScript and Python (`get_account_onboarding`, `update_account_onboarding` and `complete_account_onboarding` in Rust; `Account.Onboarding.Get`, `.Update` and `.Complete` in Go): read, update and complete the authenticated account's onboarding, with the new `AccountOnboardingBackground` and `AccountOnboardingPlatform` types.

## 0.4.0 (2026-10-14)


### ⚠ BREAKING CHANGES

* Upgrading from 0.3.x:
    * **Credit moved to its own operation:** `organizations.billing.getEffectiveTerms` (`get_effective_terms` in Python and Rust) no longer returns `creditBalance`, and the `CreditBalance` type is removed. Read an organization's granted credit from the new `organizations.billing.getOrganizationCredit` and its history from `organizations.billing.listCreditActivity`.
    * **Change previews are restructured:** `organizations.billing.previewOrganizationChange` and `organizations.billing.previewProjectChange` no longer return `planChange` and `quote`. A preview now returns what the change does as the required `change` union (`BillingChangeEffect`: a fixed-charge or a plan-change effect) and what it bills later as `dueLater`, next to the existing `dueNow`, `nextCharge` and `balanceAfterCents`.
    * **`updates[].profileId` no longer accepts `null`** in `projects.platforms.batchUpdateVoiceLineProfileAssignments` requests.
    * **Some response fields are no longer nullable:** `reasonCode` in `projects.platforms.getSmsLineCampaignAssignment`, `accountName` and `businessName` in `projects.platforms.getWhatsappBusinessAccount`, and `phoneNumbers[].displayName` in `projects.platforms.listWhatsappAccountPhoneNumbers`. The generated types change from nullable to plain values.
    * **Request timestamps require seconds:** date-time request fields now accept any RFC 3339 UTC offset (not only `Z`) but reject minute-precision values such as `2026-01-01T10:00Z`.

### Features

* New billing operations `organizations.billing.getOrganizationCredit`, `organizations.billing.listCreditActivity` and `organizations.billing.getOrganizationTerms`, and a `subject` filter on `organizations.billing.listInvoices`
* The Python package now allows pydantic 2.14 (`pydantic>=2.13.5,<2.15`) and the TypeScript package zod `^4.6.5`

### Documentation

* The `listInvoices` description now says invoices fully paid by credit are included; drafts and empty invoices are excluded

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
