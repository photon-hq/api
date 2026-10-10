# This file is generated from openapi/rpc-manifest.json. Do not edit.
from __future__ import annotations

from typing import Literal

from pydantic import ConfigDict, Field, TypeAdapter
from pydantic.experimental.missing_sentinel import MISSING

from ._model_base import BaseModel
from .generated import models
from .transport import AsyncTransport, OperationSpec, RawResponse, SyncTransport


class AssignSmsLineCampaignPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class AssignSmsLineCampaignHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class AssignSmsLineCampaignInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.AssignSmsLineCampaignRequest
    path: AssignSmsLineCampaignPath
    headers: AssignSmsLineCampaignHeader


class AssignVoiceLineProfilePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class AssignVoiceLineProfileInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.AssignVoiceLineProfileRequest
    path: AssignVoiceLineProfilePath


class BatchUpdateVoiceLineProfileAssignmentsPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class BatchUpdateVoiceLineProfileAssignmentsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.BatchUpdateVoiceLineProfileAssignmentsRequest
    path: BatchUpdateVoiceLineProfileAssignmentsPath


class BeginInvitationSsoPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    org_id: str = Field(alias="orgId")


class BeginInvitationSsoInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.BeginInvitationSsoRequest
    path: BeginInvitationSsoPath


class BeginOrganizationAuthenticationPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    org_id: str = Field(alias="orgId")


class BeginOrganizationAuthenticationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.OrganizationAuthenticationRequest
    path: BeginOrganizationAuthenticationPath


class BeginOrganizationClosureAuthenticationPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    org_id: str = Field(alias="orgId")


class BeginOrganizationClosureAuthenticationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.OrganizationAuthenticationRequest
    path: BeginOrganizationClosureAuthenticationPath


class BeginOrganizationSsoAdmissionPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    org_id: str = Field(alias="orgId")


class BeginOrganizationSsoAdmissionInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.OrganizationAuthenticationRequest
    path: BeginOrganizationSsoAdmissionPath


class CancelOperationPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    operation_id: str = Field(alias="operationId")


class CancelOperationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: CancelOperationPath


class ChangePlanPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")
    project_id: str = Field(alias="projectId")


class ChangePlanHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class ChangePlanInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.ChangePlanRequest
    path: ChangePlanPath
    headers: ChangePlanHeader


class CheckProjectSlugAvailabilityPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")


class CheckProjectSlugAvailabilityQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    slug: str = Field(alias="slug")


class CheckProjectSlugAvailabilityInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: CheckProjectSlugAvailabilityPath
    query: CheckProjectSlugAvailabilityQuery


class CommitAccountProfilePictureHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class CommitAccountProfilePictureInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CommitAccountProfilePictureRequest
    headers: CommitAccountProfilePictureHeader


class CommitAgentProfileAvatarPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class CommitAgentProfileAvatarHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class CommitAgentProfileAvatarInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CommitAgentProfileAvatarRequest
    path: CommitAgentProfileAvatarPath
    headers: CommitAgentProfileAvatarHeader


class ConfigureVoiceProfileOutboundPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    profile_id: str = Field(alias="profileId")


class ConfigureVoiceProfileOutboundHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class ConfigureVoiceProfileOutboundInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.ConfigureVoiceProfileOutboundRequest
    path: ConfigureVoiceProfileOutboundPath
    headers: ConfigureVoiceProfileOutboundHeader


class ConfirmAccountPhoneVerificationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.ConfirmAccountPhoneVerificationRequest


class ConnectEmailDomainPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ConnectEmailDomainHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class ConnectEmailDomainInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.ConnectEmailDomainRequest
    path: ConnectEmailDomainPath
    headers: ConnectEmailDomainHeader


class ConnectTelegramBotPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ConnectTelegramBotHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class ConnectTelegramBotInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.ConnectTelegramBotRequest
    path: ConnectTelegramBotPath
    headers: ConnectTelegramBotHeader


class ConnectWhatsappBusinessPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ConnectWhatsappBusinessHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class ConnectWhatsappBusinessInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.ConnectWhatsappBusinessRequest
    path: ConnectWhatsappBusinessPath
    headers: ConnectWhatsappBusinessHeader


class CountFilteredVerificationCodesPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class CountFilteredVerificationCodesQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    platform: models.FilteredVerificationCodePlatform | MISSING = Field(
        default=MISSING, alias="platform"
    )
    received_after: str | MISSING = Field(default=MISSING, alias="receivedAfter")
    received_before: str | MISSING = Field(default=MISSING, alias="receivedBefore")


class CountFilteredVerificationCodesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: CountFilteredVerificationCodesPath
    query: CountFilteredVerificationCodesQuery | None = None


class CountProjectsPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")


class CountProjectsQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    created_after: str | MISSING = Field(default=MISSING, alias="createdAfter")
    created_before: str | MISSING = Field(default=MISSING, alias="createdBefore")
    query: str | MISSING = Field(default=MISSING, alias="query")


class CountProjectsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: CountProjectsPath
    query: CountProjectsQuery | None = None


class CountResourceFilteredVerificationCodesPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class CountResourceFilteredVerificationCodesQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    platform: models.FilteredVerificationCodePlatform | MISSING = Field(
        default=MISSING, alias="platform"
    )
    received_after: str | MISSING = Field(default=MISSING, alias="receivedAfter")
    received_before: str | MISSING = Field(default=MISSING, alias="receivedBefore")


class CountResourceFilteredVerificationCodesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: CountResourceFilteredVerificationCodesPath
    query: CountResourceFilteredVerificationCodesQuery | None = None


class CreateAccountProfilePictureUploadInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.ProfilePictureUploadRequest


class CreateAccountServiceKeyHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class CreateAccountServiceKeyInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CreateAccountServiceKeyRequest
    headers: CreateAccountServiceKeyHeader


class CreateAgentProfileAvatarUploadPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class CreateAgentProfileAvatarUploadInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CreateAgentProfileAvatarUploadRequest
    path: CreateAgentProfileAvatarUploadPath


class CreateAppInstallationRequestInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CreateAppInstallationRequestRequest


class CreateDefaultVoiceProfilePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class CreateDefaultVoiceProfileInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CreateDefaultVoiceProfileRequest
    path: CreateDefaultVoiceProfilePath


class CreateOrganizationPaymentMethodCheckoutPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")


class CreateOrganizationPaymentMethodCheckoutHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str | MISSING = Field(default=MISSING, alias="Idempotency-Key")


class CreateOrganizationPaymentMethodCheckoutInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: CreateOrganizationPaymentMethodCheckoutPath
    headers: CreateOrganizationPaymentMethodCheckoutHeader | None = None


class CreateOrganizationSetupIntentPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")


class CreateOrganizationSetupIntentHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class CreateOrganizationSetupIntentInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: CreateOrganizationSetupIntentPath
    headers: CreateOrganizationSetupIntentHeader


class CreateOrganizationSsoPortalLinkPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    org_id: str = Field(alias="orgId")


class CreateOrganizationSsoPortalLinkInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CreateOrganizationSsoPortalLinkRequest
    path: CreateOrganizationSsoPortalLinkPath


class CreateProjectPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")


class CreateProjectHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class CreateProjectInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CreateProjectRequest
    path: CreateProjectPath
    headers: CreateProjectHeader


class CreateProjectApiKeyPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class CreateProjectApiKeyHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class CreateProjectApiKeyInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CreateProjectApiKeyRequest
    path: CreateProjectApiKeyPath
    headers: CreateProjectApiKeyHeader


class CreateSharedLineAssignmentPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class CreateSharedLineAssignmentHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class CreateSharedLineAssignmentInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CreateSharedLineAssignmentRequest
    path: CreateSharedLineAssignmentPath
    headers: CreateSharedLineAssignmentHeader


class CreateVoiceProfilePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class CreateVoiceProfileInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CreateVoiceProfileRequest
    path: CreateVoiceProfilePath


class CreateWebhookDestinationPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class CreateWebhookDestinationHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class CreateWebhookDestinationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CreateWebhookDestinationRequest
    path: CreateWebhookDestinationPath
    headers: CreateWebhookDestinationHeader


class CreateWhatsappSharedLineAssignmentPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class CreateWhatsappSharedLineAssignmentHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class CreateWhatsappSharedLineAssignmentInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CreateWhatsappSharedLineAssignmentRequest
    path: CreateWhatsappSharedLineAssignmentPath
    headers: CreateWhatsappSharedLineAssignmentHeader


class CreateWhatsappVoipSenderPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class CreateWhatsappVoipSenderHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class CreateWhatsappVoipSenderInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.CreateWhatsappVoipSenderRequest
    path: CreateWhatsappVoipSenderPath
    headers: CreateWhatsappVoipSenderHeader


class DeleteAccountInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class DeleteProjectPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class DeleteProjectHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class DeleteProjectInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: DeleteProjectPath
    headers: DeleteProjectHeader


class DeleteVoiceProfilePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    profile_id: str = Field(alias="profileId")


class DeleteVoiceProfileQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    expected_version: int = Field(alias="expectedVersion")
    force: models.DeleteVoiceProfileForceInput | MISSING = Field(default=MISSING, alias="force")


class DeleteVoiceProfileInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: DeleteVoiceProfilePath
    query: DeleteVoiceProfileQuery


class DeleteVoiceProfileInboundPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    profile_id: str = Field(alias="profileId")


class DeleteVoiceProfileInboundQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    expected_version: int = Field(alias="expectedVersion")


class DeleteVoiceProfileInboundInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: DeleteVoiceProfileInboundPath
    query: DeleteVoiceProfileInboundQuery


class DeleteVoiceProfileOutboundPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    profile_id: str = Field(alias="profileId")


class DeleteVoiceProfileOutboundQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    expected_version: int = Field(alias="expectedVersion")


class DeleteVoiceProfileOutboundInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: DeleteVoiceProfileOutboundPath
    query: DeleteVoiceProfileOutboundQuery


class DeleteWebhookDestinationPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    destination_id: str = Field(alias="destinationId")
    project_id: str = Field(alias="projectId")


class DeleteWebhookDestinationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: DeleteWebhookDestinationPath


class DeviceAuthorizeInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class DeviceTokenInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.DeviceTokenRequest


class DisableOrganizationSsoPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    org_id: str = Field(alias="orgId")


class DisableOrganizationSsoHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class DisableOrganizationSsoInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.DisableOrganizationSsoRequest
    path: DisableOrganizationSsoPath
    headers: DisableOrganizationSsoHeader


class DisconnectWhatsappBusinessAccountPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class DisconnectWhatsappBusinessAccountHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class DisconnectWhatsappBusinessAccountInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: DisconnectWhatsappBusinessAccountPath
    headers: DisconnectWhatsappBusinessAccountHeader


class DownloadAttachmentPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    attachment_id: str = Field(alias="attachmentId")
    id: str = Field(alias="id")


class DownloadAttachmentInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: DownloadAttachmentPath


class GetAccountInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class GetAgentProfilePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class GetAgentProfileInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetAgentProfilePath


class GetAttachmentPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    attachment_id: str = Field(alias="attachmentId")
    id: str = Field(alias="id")


class GetAttachmentInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetAttachmentPath


class GetBillingOperationPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")
    operation_id: str = Field(alias="operationId")


class GetBillingOperationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetBillingOperationPath


class GetBillingOverviewPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class GetBillingOverviewInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetBillingOverviewPath


class GetDefaultVoiceProfilePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class GetDefaultVoiceProfileInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetDefaultVoiceProfilePath


class GetEffectiveTermsPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")
    project_id: str = Field(alias="projectId")


class GetEffectiveTermsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetEffectiveTermsPath


class GetMessageMetricsBackfillPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class GetMessageMetricsBackfillHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    x_photon_version: str | MISSING = Field(default=MISSING, alias="x-photon-version")


class GetMessageMetricsBackfillInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetMessageMetricsBackfillPath
    headers: GetMessageMetricsBackfillHeader | None = None


class GetMessageMetricsSqlSchemaPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class GetMessageMetricsSqlSchemaHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    x_photon_version: str | MISSING = Field(default=MISSING, alias="x-photon-version")


class GetMessageMetricsSqlSchemaInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetMessageMetricsSqlSchemaPath
    headers: GetMessageMetricsSqlSchemaHeader | None = None


class GetOperationPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    operation_id: str = Field(alias="operationId")


class GetOperationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetOperationPath


class GetOrganizationBillingOverviewPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")


class GetOrganizationBillingOverviewInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetOrganizationBillingOverviewPath


class GetOrganizationConnectionStatusPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    org_id: str = Field(alias="orgId")


class GetOrganizationConnectionStatusInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetOrganizationConnectionStatusPath


class GetOrganizationPaymentMethodPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")


class GetOrganizationPaymentMethodInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetOrganizationPaymentMethodPath


class GetOrganizationSsoConfigurationPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    org_id: str = Field(alias="orgId")


class GetOrganizationSsoConfigurationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetOrganizationSsoConfigurationPath


class GetProjectPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class GetProjectInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetProjectPath


class GetProjectClosureStatusPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")


class GetProjectClosureStatusQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class GetProjectClosureStatusInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetProjectClosureStatusPath
    query: GetProjectClosureStatusQuery


class GetProjectImessagePlatformPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class GetProjectImessagePlatformInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetProjectImessagePlatformPath


class GetProjectWhatsappPlatformPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class GetProjectWhatsappPlatformInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetProjectWhatsappPlatformPath


class GetResourcePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class GetResourceInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetResourcePath


class GetSharedLineAssignmentPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    assignment_id: str = Field(alias="assignmentId")
    id: str = Field(alias="id")


class GetSharedLineAssignmentInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetSharedLineAssignmentPath


class GetSmsLineCampaignAssignmentPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class GetSmsLineCampaignAssignmentInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetSmsLineCampaignAssignmentPath


class GetVoiceLineProfileAssignmentPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class GetVoiceLineProfileAssignmentInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetVoiceLineProfileAssignmentPath


class GetVoiceProfilePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    profile_id: str = Field(alias="profileId")


class GetVoiceProfileInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetVoiceProfilePath


class GetWebhookDestinationPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    destination_id: str = Field(alias="destinationId")
    project_id: str = Field(alias="projectId")


class GetWebhookDestinationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetWebhookDestinationPath


class GetWebhookEventSchemaPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")
    event_type: str = Field(alias="eventType")


class GetWebhookEventSchemaQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    api_version: str = Field(alias="apiVersion")


class GetWebhookEventSchemaInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetWebhookEventSchemaPath
    query: GetWebhookEventSchemaQuery


class GetWhatsappBusinessAccountPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class GetWhatsappBusinessAccountInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetWhatsappBusinessAccountPath


class GetWhatsappBusinessVerificationCodePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class GetWhatsappBusinessVerificationCodeQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    received_after: str = Field(alias="receivedAfter")


class GetWhatsappBusinessVerificationCodeInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetWhatsappBusinessVerificationCodePath
    query: GetWhatsappBusinessVerificationCodeQuery


class GetWhatsappSharedLineAssignmentPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    assignment_id: str = Field(alias="assignmentId")
    id: str = Field(alias="id")


class GetWhatsappSharedLineAssignmentInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetWhatsappSharedLineAssignmentPath


class GetWhatsappSignupConfigPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class GetWhatsappSignupConfigInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: GetWhatsappSignupConfigPath


class ListAccountServiceKeysInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class ListAttachmentsPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ListAttachmentsQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    created_before: str | MISSING = Field(default=MISSING, alias="createdBefore")
    created_since: str | MISSING = Field(default=MISSING, alias="createdSince")
    order: models.SortOrder | MISSING = Field(default=MISSING, alias="order")
    order_by: models.TimestampOrderBy | MISSING = Field(default=MISSING, alias="orderBy")
    page_size: int | MISSING = Field(default=MISSING, alias="pageSize")
    page_token: str | MISSING = Field(default=MISSING, alias="pageToken")
    updated_before: str | MISSING = Field(default=MISSING, alias="updatedBefore")
    updated_since: str | MISSING = Field(default=MISSING, alias="updatedSince")


class ListAttachmentsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListAttachmentsPath
    query: ListAttachmentsQuery | None = None


class ListAuthorizedApplicationsQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    after: str | MISSING = Field(default=MISSING, alias="after")
    before: str | MISSING = Field(default=MISSING, alias="before")
    limit: int | MISSING = Field(default=MISSING, alias="limit")
    order: models.ListAuthorizedApplicationsOrder | MISSING = Field(default=MISSING, alias="order")


class ListAuthorizedApplicationsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    query: ListAuthorizedApplicationsQuery | None = None


class ListBillingPlansPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class ListBillingPlansInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListBillingPlansPath


class ListFilteredVerificationCodesPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ListFilteredVerificationCodesQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    platform: models.FilteredVerificationCodePlatform | MISSING = Field(
        default=MISSING, alias="platform"
    )
    received_after: str | MISSING = Field(default=MISSING, alias="receivedAfter")
    received_before: str | MISSING = Field(default=MISSING, alias="receivedBefore")
    page_size: int | MISSING = Field(default=MISSING, alias="pageSize")
    page_token: str | MISSING = Field(default=MISSING, alias="pageToken")


class ListFilteredVerificationCodesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListFilteredVerificationCodesPath
    query: ListFilteredVerificationCodesQuery | None = None


class ListInvoicesPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")


class ListInvoicesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListInvoicesPath


class ListNumberAreaCodesPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ListNumberAreaCodesQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    country_code: Literal["US"] = Field(alias="countryCode")


class ListNumberAreaCodesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListNumberAreaCodesPath
    query: ListNumberAreaCodesQuery


class ListNumberCountriesPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ListNumberCountriesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListNumberCountriesPath


class ListOauthScopesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class ListOperationsPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ListOperationsQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    ended_after: str | MISSING = Field(default=MISSING, alias="endedAfter")
    page_size: int | MISSING = Field(default=MISSING, alias="pageSize")
    page_token: str | MISSING = Field(default=MISSING, alias="pageToken")
    resource_id: str | MISSING = Field(default=MISSING, alias="resourceId")
    state: str | MISSING = Field(default=MISSING, alias="state")
    type: models.OperationType | MISSING = Field(default=MISSING, alias="type")


class ListOperationsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListOperationsPath
    query: ListOperationsQuery | None = None


class ListProjectApiKeysPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class ListProjectApiKeysInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListProjectApiKeysPath


class ListProjectPlatformsPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ListProjectPlatformsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListProjectPlatformsPath


class ListProjectsPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")


class ListProjectsQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    created_after: str | MISSING = Field(default=MISSING, alias="createdAfter")
    created_before: str | MISSING = Field(default=MISSING, alias="createdBefore")
    query: str | MISSING = Field(default=MISSING, alias="query")
    page_size: int | MISSING = Field(default=MISSING, alias="pageSize")
    page_token: str | MISSING = Field(default=MISSING, alias="pageToken")


class ListProjectsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListProjectsPath
    query: ListProjectsQuery | None = None


class ListResourceFilteredVerificationCodesPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class ListResourceFilteredVerificationCodesQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    platform: models.FilteredVerificationCodePlatform | MISSING = Field(
        default=MISSING, alias="platform"
    )
    received_after: str | MISSING = Field(default=MISSING, alias="receivedAfter")
    received_before: str | MISSING = Field(default=MISSING, alias="receivedBefore")
    page_size: int | MISSING = Field(default=MISSING, alias="pageSize")
    page_token: str | MISSING = Field(default=MISSING, alias="pageToken")


class ListResourceFilteredVerificationCodesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListResourceFilteredVerificationCodesPath
    query: ListResourceFilteredVerificationCodesQuery | None = None


class ListResourcesPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ListResourcesQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    ability: str | MISSING = Field(default=MISSING, alias="ability")
    page_size: int | MISSING = Field(default=MISSING, alias="pageSize")
    page_token: str | MISSING = Field(default=MISSING, alias="pageToken")
    state: str | MISSING = Field(default=MISSING, alias="state")
    type: str | MISSING = Field(default=MISSING, alias="type")


class ListResourcesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListResourcesPath
    query: ListResourcesQuery | None = None


class ListSharedLineAssignmentsPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ListSharedLineAssignmentsQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    include_released: str | MISSING = Field(default=MISSING, alias="includeReleased")
    page_size: int | MISSING = Field(default=MISSING, alias="pageSize")
    page_token: str | MISSING = Field(default=MISSING, alias="pageToken")


class ListSharedLineAssignmentsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListSharedLineAssignmentsPath
    query: ListSharedLineAssignmentsQuery | None = None


class ListVoiceProfilesPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ListVoiceProfilesQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    default: models.ListVoiceProfilesDefaultInput | MISSING = Field(
        default=MISSING, alias="default"
    )
    page_size: int | MISSING = Field(default=MISSING, alias="pageSize")
    page_token: str | MISSING = Field(default=MISSING, alias="pageToken")


class ListVoiceProfilesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListVoiceProfilesPath
    query: ListVoiceProfilesQuery | None = None


class ListWebhookApiVersionsPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class ListWebhookApiVersionsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListWebhookApiVersionsPath


class ListWebhookDestinationsPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class ListWebhookDestinationsQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    page_size: int | MISSING = Field(default=MISSING, alias="pageSize")
    page_token: str | MISSING = Field(default=MISSING, alias="pageToken")


class ListWebhookDestinationsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListWebhookDestinationsPath
    query: ListWebhookDestinationsQuery | None = None


class ListWebhookEgressAddressesPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class ListWebhookEgressAddressesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListWebhookEgressAddressesPath


class ListWebhookEventTypesPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class ListWebhookEventTypesQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    api_version: str = Field(alias="apiVersion")


class ListWebhookEventTypesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListWebhookEventTypesPath
    query: ListWebhookEventTypesQuery


class ListWhatsappAccountPhoneNumbersPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ListWhatsappAccountPhoneNumbersInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListWhatsappAccountPhoneNumbersPath


class ListWhatsappSharedLineAssignmentsPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ListWhatsappSharedLineAssignmentsQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    include_released: str | MISSING = Field(default=MISSING, alias="includeReleased")
    page_size: int | MISSING = Field(default=MISSING, alias="pageSize")
    page_token: str | MISSING = Field(default=MISSING, alias="pageToken")


class ListWhatsappSharedLineAssignmentsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ListWhatsappSharedLineAssignmentsPath
    query: ListWhatsappSharedLineAssignmentsQuery | None = None


class PreviewOrganizationChangePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")


class PreviewOrganizationChangeInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.PreviewOrganizationChangeRequest
    path: PreviewOrganizationChangePath


class PreviewProjectChangePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    organization_id: str = Field(alias="organizationId")
    project_id: str = Field(alias="projectId")


class PreviewProjectChangeInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.PreviewProjectChangeRequest
    path: PreviewProjectChangePath


class ProvisionImessageDedicatedLinePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ProvisionImessageDedicatedLineHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class ProvisionImessageDedicatedLineInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ProvisionImessageDedicatedLinePath
    headers: ProvisionImessageDedicatedLineHeader


class ProvisionWhatsappDedicatedLinePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class ProvisionWhatsappDedicatedLineHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class ProvisionWhatsappDedicatedLineInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ProvisionWhatsappDedicatedLinePath
    headers: ProvisionWhatsappDedicatedLineHeader


class PurchaseSmsNumberPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class PurchaseSmsNumberHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class PurchaseSmsNumberInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.PurchaseSmsNumberRequest
    path: PurchaseSmsNumberPath
    headers: PurchaseSmsNumberHeader


class QueryMessageMetricsPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class QueryMessageMetricsHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    x_photon_version: str | MISSING = Field(default=MISSING, alias="x-photon-version")


class QueryMessageMetricsInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.ClickHouseSqlQueryRequest
    path: QueryMessageMetricsPath
    headers: QueryMessageMetricsHeader | None = None


class RedeemAppInstallationDeliveryInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.RedeemAppInstallationDeliveryRequest


class RefreshOrganizationSsoConnectionPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    org_id: str = Field(alias="orgId")


class RefreshOrganizationSsoConnectionInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: RefreshOrganizationSsoConnectionPath


class ReleaseImessageDedicatedLinePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class ReleaseImessageDedicatedLineInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ReleaseImessageDedicatedLinePath


class ReleaseResourcePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class ReleaseResourceInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ReleaseResourcePath


class ReleaseSharedLineAssignmentPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    assignment_id: str = Field(alias="assignmentId")
    id: str = Field(alias="id")


class ReleaseSharedLineAssignmentInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ReleaseSharedLineAssignmentPath


class ReleaseWhatsappDedicatedLinePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class ReleaseWhatsappDedicatedLineInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ReleaseWhatsappDedicatedLinePath


class ReleaseWhatsappSharedLineAssignmentPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    assignment_id: str = Field(alias="assignmentId")
    id: str = Field(alias="id")


class ReleaseWhatsappSharedLineAssignmentInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ReleaseWhatsappSharedLineAssignmentPath


class ReplaceVoiceProfileInboundPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    profile_id: str = Field(alias="profileId")


class ReplaceVoiceProfileInboundInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.ReplaceVoiceProfileInboundRequest
    path: ReplaceVoiceProfileInboundPath


class ResetAccountProfilePictureHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class ResetAccountProfilePictureInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    headers: ResetAccountProfilePictureHeader


class ResetAgentProfileAvatarPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class ResetAgentProfileAvatarHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class ResetAgentProfileAvatarInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: ResetAgentProfileAvatarPath
    headers: ResetAgentProfileAvatarHeader


class RetryOrganizationConnectionSyncPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    org_id: str = Field(alias="orgId")


class RetryOrganizationConnectionSyncInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: RetryOrganizationConnectionSyncPath


class RetryWebhookDeliveryPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    destination_id: str = Field(alias="destinationId")
    project_id: str = Field(alias="projectId")


class RetryWebhookDeliveryHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class RetryWebhookDeliveryInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.RetryWebhookDeliveryRequest
    path: RetryWebhookDeliveryPath
    headers: RetryWebhookDeliveryHeader


class RevokeAccountServiceKeyPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    service_key_id: str = Field(alias="serviceKeyId")


class RevokeAccountServiceKeyHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class RevokeAccountServiceKeyInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: RevokeAccountServiceKeyPath
    headers: RevokeAccountServiceKeyHeader


class RevokeAuthorizedApplicationPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    application_id: str = Field(alias="applicationId")


class RevokeAuthorizedApplicationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: RevokeAuthorizedApplicationPath


class RevokeProjectApiKeyPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    api_key_id: str = Field(alias="apiKeyId")
    project_id: str = Field(alias="projectId")


class RevokeProjectApiKeyHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class RevokeProjectApiKeyInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: RevokeProjectApiKeyPath
    headers: RevokeProjectApiKeyHeader


class RotateVoiceProfileOutboundCredentialPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    profile_id: str = Field(alias="profileId")


class RotateVoiceProfileOutboundCredentialHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class RotateVoiceProfileOutboundCredentialInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.RotateVoiceProfileOutboundCredentialRequest
    path: RotateVoiceProfileOutboundCredentialPath
    headers: RotateVoiceProfileOutboundCredentialHeader


class RotateWebhookSigningSecretPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    destination_id: str = Field(alias="destinationId")
    project_id: str = Field(alias="projectId")


class RotateWebhookSigningSecretHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class RotateWebhookSigningSecretInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.RotateWebhookSigningSecretRequest
    path: RotateWebhookSigningSecretPath
    headers: RotateWebhookSigningSecretHeader


class StartAccountPhoneVerificationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.StartAccountPhoneVerificationRequest


class StartEnterpriseLoginInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.StartEnterpriseLoginRequest


class UnassignSmsLineCampaignPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class UnassignSmsLineCampaignQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    expected_version: float = Field(alias="expectedVersion")


class UnassignSmsLineCampaignHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class UnassignSmsLineCampaignInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: UnassignSmsLineCampaignPath
    query: UnassignSmsLineCampaignQuery
    headers: UnassignSmsLineCampaignHeader


class UnassignVoiceLineProfilePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    resource_id: str = Field(alias="resourceId")


class UnassignVoiceLineProfileQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    expected_version: int = Field(alias="expectedVersion")


class UnassignVoiceLineProfileInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    path: UnassignVoiceLineProfilePath
    query: UnassignVoiceLineProfileQuery


class UpdateAccountHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class UpdateAccountInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.UpdateAccountRequest
    headers: UpdateAccountHeader


class UpdateAgentProfilePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class UpdateAgentProfileHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class UpdateAgentProfileInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.UpdateAgentProfileRequest
    path: UpdateAgentProfilePath
    headers: UpdateAgentProfileHeader


class UpdateDefaultVoiceProfilePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class UpdateDefaultVoiceProfileInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.UpdateDefaultVoiceProfileRequest
    path: UpdateDefaultVoiceProfilePath


class UpdateOrganizationSsoPolicyPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    org_id: str = Field(alias="orgId")


class UpdateOrganizationSsoPolicyInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.UpdateOrganizationSsoPolicyRequest
    path: UpdateOrganizationSsoPolicyPath


class UpdateProjectPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: str = Field(alias="projectId")


class UpdateProjectHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class UpdateProjectInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.UpdateProjectRequest
    path: UpdateProjectPath
    headers: UpdateProjectHeader


class UpdateProjectApiKeyPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    api_key_id: str = Field(alias="apiKeyId")
    project_id: str = Field(alias="projectId")


class UpdateProjectApiKeyHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class UpdateProjectApiKeyInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.UpdateProjectApiKeyRequest
    path: UpdateProjectApiKeyPath
    headers: UpdateProjectApiKeyHeader


class UpdateVoiceProfilePath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    profile_id: str = Field(alias="profileId")


class UpdateVoiceProfileInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.UpdateVoiceProfileRequest
    path: UpdateVoiceProfilePath


class UpdateVoiceProfileInboundPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    profile_id: str = Field(alias="profileId")


class UpdateVoiceProfileInboundInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.UpdateVoiceProfileInboundRequest
    path: UpdateVoiceProfileInboundPath


class UpdateVoiceProfileOutboundAuthenticationPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")
    profile_id: str = Field(alias="profileId")


class UpdateVoiceProfileOutboundAuthenticationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.UpdateVoiceProfileOutboundAuthenticationRequest
    path: UpdateVoiceProfileOutboundAuthenticationPath


class UpdateWebhookDestinationPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    destination_id: str = Field(alias="destinationId")
    project_id: str = Field(alias="projectId")


class UpdateWebhookDestinationHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    idempotency_key: str = Field(alias="Idempotency-Key")


class UpdateWebhookDestinationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.UpdateWebhookDestinationRequest
    path: UpdateWebhookDestinationPath
    headers: UpdateWebhookDestinationHeader


class UploadAttachmentPath(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(alias="id")


class UploadAttachmentHeader(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    content_length: str = Field(alias="content-length")
    content_type: str = Field(alias="content-type")
    idempotency_key: str = Field(alias="idempotency-key")


class UploadAttachmentInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    body: models.RootModel[bytes]
    path: UploadAttachmentPath
    headers: UploadAttachmentHeader


_OP_ASSIGN_SMS_LINE_CAMPAIGN = OperationSpec(
    operation_id="assignSmsLineCampaign",
    method="PUT",
    path="/v1/projects/{id}/platforms/sms/lines/{resourceId}/campaign",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Operation),
        "202": TypeAdapter(models.Operation),
    },
)

_OP_ASSIGN_VOICE_LINE_PROFILE = OperationSpec(
    operation_id="assignVoiceLineProfile",
    method="PUT",
    path="/v1/projects/{id}/platforms/voice/lines/{resourceId}/profile",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.VoiceLineProfileAssignment),
    },
)

_OP_BATCH_UPDATE_VOICE_LINE_PROFILE_ASSIGNMENTS = OperationSpec(
    operation_id="batchUpdateVoiceLineProfileAssignments",
    method="POST",
    path="/v1/projects/{id}/platforms/voice/lines/profile-assignments/batch",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.BatchUpdateVoiceLineProfileAssignmentsResponse),
    },
)

_OP_BEGIN_INVITATION_SSO = OperationSpec(
    operation_id="beginInvitationSso",
    method="POST",
    path="/v1/auth/organizations/{orgId}/sso/invitation",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.OrganizationAuthenticationRedirect),
    },
)

_OP_BEGIN_ORGANIZATION_AUTHENTICATION = OperationSpec(
    operation_id="beginOrganizationAuthentication",
    method="POST",
    path="/v1/auth/organizations/{orgId}/sso/authenticate",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.OrganizationAuthenticationRedirect),
    },
)

_OP_BEGIN_ORGANIZATION_CLOSURE_AUTHENTICATION = OperationSpec(
    operation_id="beginOrganizationClosureAuthentication",
    method="POST",
    path="/v1/auth/organizations/{orgId}/sso/closure-authenticate",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.OrganizationAuthenticationRedirect),
    },
)

_OP_BEGIN_ORGANIZATION_SSO_ADMISSION = OperationSpec(
    operation_id="beginOrganizationSsoAdmission",
    method="POST",
    path="/v1/auth/organizations/{orgId}/sso/admission",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.OrganizationAuthenticationRedirect),
    },
)

_OP_CANCEL_OPERATION = OperationSpec(
    operation_id="cancelOperation",
    method="POST",
    path="/v1/projects/{id}/platforms/operations/{operationId}/cancel",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Operation),
    },
)

_OP_CHANGE_PLAN = OperationSpec(
    operation_id="changePlan",
    method="POST",
    path="/v1/organizations/{organizationId}/billing/projects/{projectId}/purchase",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.TerminalBillingOperation),
        "202": TypeAdapter(models.PendingBillingOperation),
    },
)

_OP_CHECK_PROJECT_SLUG_AVAILABILITY = OperationSpec(
    operation_id="checkProjectSlugAvailability",
    method="GET",
    path="/v1/organizations/{organizationId}/projects/slug-availability",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.CheckProjectSlugAvailabilityResponse),
    },
)

_OP_COMMIT_ACCOUNT_PROFILE_PICTURE = OperationSpec(
    operation_id="commitAccountProfilePicture",
    method="PUT",
    path="/v1/account/profile-picture",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Account),
    },
)

_OP_COMMIT_AGENT_PROFILE_AVATAR = OperationSpec(
    operation_id="commitAgentProfileAvatar",
    method="PUT",
    path="/v1/projects/{projectId}/agent-profile/avatar",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.AgentProfile),
    },
)

_OP_CONFIGURE_VOICE_PROFILE_OUTBOUND = OperationSpec(
    operation_id="configureVoiceProfileOutbound",
    method="PUT",
    path="/v1/projects/{id}/platforms/voice/profiles/{profileId}/outbound",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ConfigureVoiceProfileOutboundResponse),
        "201": TypeAdapter(models.ConfigureVoiceProfileOutboundResponse),
    },
)

_OP_CONFIRM_ACCOUNT_PHONE_VERIFICATION = OperationSpec(
    operation_id="confirmAccountPhoneVerification",
    method="PUT",
    path="/v1/account/phone",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Account),
    },
)

_OP_CONNECT_EMAIL_DOMAIN = OperationSpec(
    operation_id="connectEmailDomain",
    method="POST",
    path="/v1/projects/{id}/platforms/email/domains",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "202": TypeAdapter(models.Operation),
    },
)

_OP_CONNECT_TELEGRAM_BOT = OperationSpec(
    operation_id="connectTelegramBot",
    method="POST",
    path="/v1/projects/{id}/platforms/telegram/bots",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "202": TypeAdapter(models.Operation),
    },
)

_OP_CONNECT_WHATSAPP_BUSINESS = OperationSpec(
    operation_id="connectWhatsappBusiness",
    method="POST",
    path="/v1/projects/{id}/platforms/whatsapp-business/numbers",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "202": TypeAdapter(models.Operation),
    },
)

_OP_COUNT_FILTERED_VERIFICATION_CODES = OperationSpec(
    operation_id="countFilteredVerificationCodes",
    method="GET",
    path="/v1/projects/{id}/platforms/filtered-otp/count",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.FilteredVerificationCodeCount),
    },
)

_OP_COUNT_PROJECTS = OperationSpec(
    operation_id="countProjects",
    method="GET",
    path="/v1/organizations/{organizationId}/projects/count",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ProjectCount),
    },
)

_OP_COUNT_RESOURCE_FILTERED_VERIFICATION_CODES = OperationSpec(
    operation_id="countResourceFilteredVerificationCodes",
    method="GET",
    path="/v1/projects/{id}/platforms/resources/{resourceId}/filtered-otp/count",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.FilteredVerificationCodeCount),
    },
)

_OP_CREATE_ACCOUNT_PROFILE_PICTURE_UPLOAD = OperationSpec(
    operation_id="createAccountProfilePictureUpload",
    method="POST",
    path="/v1/account/profile-picture/uploads",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "201": TypeAdapter(models.ProfilePictureUpload),
    },
)

_OP_CREATE_ACCOUNT_SERVICE_KEY = OperationSpec(
    operation_id="createAccountServiceKey",
    method="POST",
    path="/v1/account/service-keys",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "201": TypeAdapter(models.CreateAccountServiceKeyResponse),
    },
)

_OP_CREATE_AGENT_PROFILE_AVATAR_UPLOAD = OperationSpec(
    operation_id="createAgentProfileAvatarUpload",
    method="POST",
    path="/v1/projects/{projectId}/agent-profile/avatar/uploads",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "201": TypeAdapter(models.AgentProfileAvatarUpload),
    },
)

_OP_CREATE_APP_INSTALLATION_REQUEST = OperationSpec(
    operation_id="createAppInstallationRequest",
    method="POST",
    path="/v1/installation-requests",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "201": TypeAdapter(models.CreateAppInstallationRequestResponse),
    },
)

_OP_CREATE_DEFAULT_VOICE_PROFILE = OperationSpec(
    operation_id="createDefaultVoiceProfile",
    method="PUT",
    path="/v1/projects/{id}/platforms/voice/profiles/default",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.VoiceProfile),
        "201": TypeAdapter(models.VoiceProfile),
    },
)

_OP_CREATE_ORGANIZATION_PAYMENT_METHOD_CHECKOUT = OperationSpec(
    operation_id="createOrganizationPaymentMethodCheckout",
    method="POST",
    path="/v1/organizations/{organizationId}/billing/checkout",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.CreateOrganizationPaymentMethodCheckoutResponse),
    },
)

_OP_CREATE_ORGANIZATION_SETUP_INTENT = OperationSpec(
    operation_id="createOrganizationSetupIntent",
    method="POST",
    path="/v1/organizations/{organizationId}/billing/setup-intent",
    safe=False,
    idempotency_key_required=True,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.CreateOrganizationSetupIntentResponse),
    },
)

_OP_CREATE_ORGANIZATION_SSO_PORTAL_LINK = OperationSpec(
    operation_id="createOrganizationSsoPortalLink",
    method="POST",
    path="/v1/auth/organizations/{orgId}/sso/portal",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.CreateOrganizationSsoPortalLinkResponse),
    },
)

_OP_CREATE_PROJECT = OperationSpec(
    operation_id="createProject",
    method="POST",
    path="/v1/organizations/{organizationId}/projects",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "201": TypeAdapter(models.Project),
        "202": TypeAdapter(models.Project),
    },
)

_OP_CREATE_PROJECT_API_KEY = OperationSpec(
    operation_id="createProjectApiKey",
    method="POST",
    path="/v1/projects/{projectId}/api-keys",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "201": TypeAdapter(models.CreateProjectApiKeyResponse),
    },
)

_OP_CREATE_SHARED_LINE_ASSIGNMENT = OperationSpec(
    operation_id="createSharedLineAssignment",
    method="POST",
    path="/v1/projects/{id}/platforms/imessage/assignments",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "201": TypeAdapter(models.SharedLineAssignment),
    },
)

_OP_CREATE_VOICE_PROFILE = OperationSpec(
    operation_id="createVoiceProfile",
    method="POST",
    path="/v1/projects/{id}/platforms/voice/profiles",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "201": TypeAdapter(models.VoiceProfile),
    },
)

_OP_CREATE_WEBHOOK_DESTINATION = OperationSpec(
    operation_id="createWebhookDestination",
    method="POST",
    path="/v1/projects/{projectId}/webhooks/destinations",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "201": TypeAdapter(models.CreateWebhookDestinationResponse),
    },
)

_OP_CREATE_WHATSAPP_SHARED_LINE_ASSIGNMENT = OperationSpec(
    operation_id="createWhatsappSharedLineAssignment",
    method="POST",
    path="/v1/projects/{id}/platforms/whatsapp/assignments",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "201": TypeAdapter(models.SharedLineAssignment),
    },
)

_OP_CREATE_WHATSAPP_VOIP_SENDER = OperationSpec(
    operation_id="createWhatsappVoipSender",
    method="POST",
    path="/v1/projects/{id}/platforms/whatsapp-business/account/senders",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "202": TypeAdapter(models.Operation),
    },
)

_OP_DELETE_ACCOUNT = OperationSpec(
    operation_id="deleteAccount",
    method="DELETE",
    path="/v1/account",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Account),
    },
)

_OP_DELETE_PROJECT = OperationSpec(
    operation_id="deleteProject",
    method="DELETE",
    path="/v1/projects/{projectId}",
    safe=False,
    idempotency_key_required=True,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Project),
    },
)

_OP_DELETE_VOICE_PROFILE = OperationSpec(
    operation_id="deleteVoiceProfile",
    method="DELETE",
    path="/v1/projects/{id}/platforms/voice/profiles/{profileId}",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=("application/problem+json",),
    success_responses={
        "204": None,
    },
)

_OP_DELETE_VOICE_PROFILE_INBOUND = OperationSpec(
    operation_id="deleteVoiceProfileInbound",
    method="DELETE",
    path="/v1/projects/{id}/platforms/voice/profiles/{profileId}/inbound",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.VoiceProfileInboundConfiguration),
    },
)

_OP_DELETE_VOICE_PROFILE_OUTBOUND = OperationSpec(
    operation_id="deleteVoiceProfileOutbound",
    method="DELETE",
    path="/v1/projects/{id}/platforms/voice/profiles/{profileId}/outbound",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.DeleteVoiceProfileOutboundResponse),
    },
)

_OP_DELETE_WEBHOOK_DESTINATION = OperationSpec(
    operation_id="deleteWebhookDestination",
    method="DELETE",
    path="/v1/projects/{projectId}/webhooks/destinations/{destinationId}",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.WebhookDestination),
    },
)

_OP_DEVICE_AUTHORIZE = OperationSpec(
    operation_id="deviceAuthorize",
    method="POST",
    path="/v1/auth/device/code",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.DeviceAuthorizeResponse),
    },
)

_OP_DEVICE_TOKEN = OperationSpec(
    operation_id="deviceToken",
    method="POST",
    path="/v1/auth/device/token",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.DeviceTokenResponse),
    },
)

_OP_DISABLE_ORGANIZATION_SSO = OperationSpec(
    operation_id="disableOrganizationSso",
    method="POST",
    path="/v1/auth/organizations/{orgId}/sso/disable",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.OrganizationSsoConfiguration),
    },
)

_OP_DISCONNECT_WHATSAPP_BUSINESS_ACCOUNT = OperationSpec(
    operation_id="disconnectWhatsappBusinessAccount",
    method="DELETE",
    path="/v1/projects/{id}/platforms/whatsapp-business/account",
    safe=False,
    idempotency_key_required=True,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Operation),
        "202": TypeAdapter(models.Operation),
    },
)

_OP_DOWNLOAD_ATTACHMENT = OperationSpec(
    operation_id="downloadAttachment",
    method="GET",
    path="/v1/projects/{id}/attachments/{attachmentId}/content",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "*/*",
        "application/problem+json",
    ),
    success_responses={
        "200": bytes,
    },
)

_OP_GET_ACCOUNT = OperationSpec(
    operation_id="getAccount",
    method="GET",
    path="/v1/account",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Account),
    },
)

_OP_GET_AGENT_PROFILE = OperationSpec(
    operation_id="getAgentProfile",
    method="GET",
    path="/v1/projects/{projectId}/agent-profile",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.AgentProfile),
    },
)

_OP_GET_ATTACHMENT = OperationSpec(
    operation_id="getAttachment",
    method="GET",
    path="/v1/projects/{id}/attachments/{attachmentId}",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Attachment),
    },
)

_OP_GET_BILLING_OPERATION = OperationSpec(
    operation_id="getBillingOperation",
    method="GET",
    path="/v1/projects/{projectId}/billing/operations/{operationId}",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.BillingOperation),
    },
)

_OP_GET_BILLING_OVERVIEW = OperationSpec(
    operation_id="getBillingOverview",
    method="GET",
    path="/v1/projects/{projectId}/billing",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.GetBillingOverviewResponse),
    },
)

_OP_GET_DEFAULT_VOICE_PROFILE = OperationSpec(
    operation_id="getDefaultVoiceProfile",
    method="GET",
    path="/v1/projects/{id}/platforms/voice/profiles/default",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.VoiceProfile),
    },
)

_OP_GET_EFFECTIVE_TERMS = OperationSpec(
    operation_id="getEffectiveTerms",
    method="GET",
    path="/v1/organizations/{organizationId}/billing/projects/{projectId}/terms",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.GetEffectiveTermsResponse),
    },
)

_OP_GET_MESSAGE_METRICS_BACKFILL = OperationSpec(
    operation_id="getMessageMetricsBackfill",
    method="GET",
    path="/v1/projects/{projectId}/metrics/backfill",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.GetMessageMetricsBackfillResponse),
    },
)

_OP_GET_MESSAGE_METRICS_SQL_SCHEMA = OperationSpec(
    operation_id="getMessageMetricsSqlSchema",
    method="GET",
    path="/v1/projects/{projectId}/metrics/query",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.GetMessageMetricsSqlSchemaResponse),
    },
)

_OP_GET_OPERATION = OperationSpec(
    operation_id="getOperation",
    method="GET",
    path="/v1/projects/{id}/platforms/operations/{operationId}",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.GetOperationResponse),
    },
)

_OP_GET_ORGANIZATION_BILLING_OVERVIEW = OperationSpec(
    operation_id="getOrganizationBillingOverview",
    method="GET",
    path="/v1/organizations/{organizationId}/billing",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.GetOrganizationBillingOverviewResponse),
    },
)

_OP_GET_ORGANIZATION_CONNECTION_STATUS = OperationSpec(
    operation_id="getOrganizationConnectionStatus",
    method="GET",
    path="/v1/auth/organizations/{orgId}/connection-status",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.OrganizationConnectionStatus),
    },
)

_OP_GET_ORGANIZATION_PAYMENT_METHOD = OperationSpec(
    operation_id="getOrganizationPaymentMethod",
    method="GET",
    path="/v1/organizations/{organizationId}/billing/payment-method",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.GetOrganizationPaymentMethodResponse),
    },
)

_OP_GET_ORGANIZATION_SSO_CONFIGURATION = OperationSpec(
    operation_id="getOrganizationSsoConfiguration",
    method="GET",
    path="/v1/auth/organizations/{orgId}/sso",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.OrganizationSsoConfiguration),
    },
)

_OP_GET_PROJECT = OperationSpec(
    operation_id="getProject",
    method="GET",
    path="/v1/projects/{projectId}",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Project),
    },
)

_OP_GET_PROJECT_CLOSURE_STATUS = OperationSpec(
    operation_id="getProjectClosureStatus",
    method="GET",
    path="/v1/organizations/{organizationId}/projects/closure-status",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.GetProjectClosureStatusResponse),
    },
)

_OP_GET_PROJECT_IMESSAGE_PLATFORM = OperationSpec(
    operation_id="getProjectImessagePlatform",
    method="GET",
    path="/v1/projects/{id}/platforms/imessage",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ProjectPlatformSettings),
    },
)

_OP_GET_PROJECT_WHATSAPP_PLATFORM = OperationSpec(
    operation_id="getProjectWhatsappPlatform",
    method="GET",
    path="/v1/projects/{id}/platforms/whatsapp",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ProjectPlatformSettings),
    },
)

_OP_GET_RESOURCE = OperationSpec(
    operation_id="getResource",
    method="GET",
    path="/v1/projects/{id}/platforms/resources/{resourceId}",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Resource),
    },
)

_OP_GET_SHARED_LINE_ASSIGNMENT = OperationSpec(
    operation_id="getSharedLineAssignment",
    method="GET",
    path="/v1/projects/{id}/platforms/imessage/assignments/{assignmentId}",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.SharedLineAssignment),
    },
)

_OP_GET_SMS_LINE_CAMPAIGN_ASSIGNMENT = OperationSpec(
    operation_id="getSmsLineCampaignAssignment",
    method="GET",
    path="/v1/projects/{id}/platforms/sms/lines/{resourceId}/campaign",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.GetSmsLineCampaignAssignmentResponse),
    },
)

_OP_GET_VOICE_LINE_PROFILE_ASSIGNMENT = OperationSpec(
    operation_id="getVoiceLineProfileAssignment",
    method="GET",
    path="/v1/projects/{id}/platforms/voice/lines/{resourceId}/profile",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.VoiceLineProfileAssignment),
    },
)

_OP_GET_VOICE_PROFILE = OperationSpec(
    operation_id="getVoiceProfile",
    method="GET",
    path="/v1/projects/{id}/platforms/voice/profiles/{profileId}",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.VoiceProfile),
    },
)

_OP_GET_WEBHOOK_DESTINATION = OperationSpec(
    operation_id="getWebhookDestination",
    method="GET",
    path="/v1/projects/{projectId}/webhooks/destinations/{destinationId}",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.WebhookDestination),
    },
)

_OP_GET_WEBHOOK_EVENT_SCHEMA = OperationSpec(
    operation_id="getWebhookEventSchema",
    method="GET",
    path="/v1/projects/{projectId}/webhooks/event-types/{eventType}/schema",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/schema+json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.WebhookEventSchema),
        "304": None,
    },
)

_OP_GET_WHATSAPP_BUSINESS_ACCOUNT = OperationSpec(
    operation_id="getWhatsappBusinessAccount",
    method="GET",
    path="/v1/projects/{id}/platforms/whatsapp-business/account",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.WhatsappBusinessAccount),
    },
)

_OP_GET_WHATSAPP_BUSINESS_VERIFICATION_CODE = OperationSpec(
    operation_id="getWhatsappBusinessVerificationCode",
    method="GET",
    path="/v1/projects/{id}/platforms/whatsapp-business/numbers/{resourceId}/verification-code",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.GetWhatsappBusinessVerificationCodeResponse),
    },
)

_OP_GET_WHATSAPP_SHARED_LINE_ASSIGNMENT = OperationSpec(
    operation_id="getWhatsappSharedLineAssignment",
    method="GET",
    path="/v1/projects/{id}/platforms/whatsapp/assignments/{assignmentId}",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.SharedLineAssignment),
    },
)

_OP_GET_WHATSAPP_SIGNUP_CONFIG = OperationSpec(
    operation_id="getWhatsappSignupConfig",
    method="GET",
    path="/v1/projects/{id}/platforms/whatsapp-business/signup-config",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.GetWhatsappSignupConfigResponse),
    },
)

_OP_LIST_ACCOUNT_SERVICE_KEYS = OperationSpec(
    operation_id="listAccountServiceKeys",
    method="GET",
    path="/v1/account/service-keys",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListAccountServiceKeysResponse),
    },
)

_OP_LIST_ATTACHMENTS = OperationSpec(
    operation_id="listAttachments",
    method="GET",
    path="/v1/projects/{id}/attachments",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.AttachmentPage),
    },
)

_OP_LIST_AUTHORIZED_APPLICATIONS = OperationSpec(
    operation_id="listAuthorizedApplications",
    method="GET",
    path="/v1/account/oauth/authorized-applications",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListAuthorizedApplicationsResponse),
    },
)

_OP_LIST_BILLING_PLANS = OperationSpec(
    operation_id="listBillingPlans",
    method="GET",
    path="/v1/projects/{projectId}/billing/plans",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListBillingPlansResponse),
    },
)

_OP_LIST_FILTERED_VERIFICATION_CODES = OperationSpec(
    operation_id="listFilteredVerificationCodes",
    method="GET",
    path="/v1/projects/{id}/platforms/filtered-otp",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.FilteredVerificationCodePage),
    },
)

_OP_LIST_INVOICES = OperationSpec(
    operation_id="listInvoices",
    method="GET",
    path="/v1/organizations/{organizationId}/billing/invoices",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListInvoicesResponse),
    },
)

_OP_LIST_NUMBER_AREA_CODES = OperationSpec(
    operation_id="listNumberAreaCodes",
    method="GET",
    path="/v1/projects/{id}/platforms/sms/numbers/area-codes",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListNumberAreaCodesResponse),
    },
)

_OP_LIST_NUMBER_COUNTRIES = OperationSpec(
    operation_id="listNumberCountries",
    method="GET",
    path="/v1/projects/{id}/platforms/sms/numbers/countries",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListNumberCountriesResponse),
    },
)

_OP_LIST_OAUTH_SCOPES = OperationSpec(
    operation_id="listOauthScopes",
    method="GET",
    path="/v1/auth/oauth/scopes",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListOauthScopesResponse),
    },
)

_OP_LIST_OPERATIONS = OperationSpec(
    operation_id="listOperations",
    method="GET",
    path="/v1/projects/{id}/platforms/operations",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.OperationPage),
    },
)

_OP_LIST_PROJECT_API_KEYS = OperationSpec(
    operation_id="listProjectApiKeys",
    method="GET",
    path="/v1/projects/{projectId}/api-keys",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListProjectApiKeysResponse),
    },
)

_OP_LIST_PROJECT_PLATFORMS = OperationSpec(
    operation_id="listProjectPlatforms",
    method="GET",
    path="/v1/projects/{id}/platforms",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListProjectPlatformsResponse),
    },
)

_OP_LIST_PROJECTS = OperationSpec(
    operation_id="listProjects",
    method="GET",
    path="/v1/organizations/{organizationId}/projects",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ProjectPage),
    },
)

_OP_LIST_RESOURCE_FILTERED_VERIFICATION_CODES = OperationSpec(
    operation_id="listResourceFilteredVerificationCodes",
    method="GET",
    path="/v1/projects/{id}/platforms/resources/{resourceId}/filtered-otp",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.FilteredVerificationCodePage),
    },
)

_OP_LIST_RESOURCES = OperationSpec(
    operation_id="listResources",
    method="GET",
    path="/v1/projects/{id}/platforms/resources",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ResourcePage),
    },
)

_OP_LIST_SHARED_LINE_ASSIGNMENTS = OperationSpec(
    operation_id="listSharedLineAssignments",
    method="GET",
    path="/v1/projects/{id}/platforms/imessage/assignments",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.SharedLineAssignmentPage),
    },
)

_OP_LIST_VOICE_PROFILES = OperationSpec(
    operation_id="listVoiceProfiles",
    method="GET",
    path="/v1/projects/{id}/platforms/voice/profiles",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.VoiceProfilePage),
    },
)

_OP_LIST_WEBHOOK_API_VERSIONS = OperationSpec(
    operation_id="listWebhookApiVersions",
    method="GET",
    path="/v1/projects/{projectId}/webhooks/api-versions",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListWebhookApiVersionsResponse),
        "304": None,
    },
)

_OP_LIST_WEBHOOK_DESTINATIONS = OperationSpec(
    operation_id="listWebhookDestinations",
    method="GET",
    path="/v1/projects/{projectId}/webhooks/destinations",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.WebhookDestinationPage),
    },
)

_OP_LIST_WEBHOOK_EGRESS_ADDRESSES = OperationSpec(
    operation_id="listWebhookEgressAddresses",
    method="GET",
    path="/v1/projects/{projectId}/webhooks/egress-addresses",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListWebhookEgressAddressesResponse),
        "304": None,
    },
)

_OP_LIST_WEBHOOK_EVENT_TYPES = OperationSpec(
    operation_id="listWebhookEventTypes",
    method="GET",
    path="/v1/projects/{projectId}/webhooks/event-types",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListWebhookEventTypesResponse),
        "304": None,
    },
)

_OP_LIST_WHATSAPP_ACCOUNT_PHONE_NUMBERS = OperationSpec(
    operation_id="listWhatsappAccountPhoneNumbers",
    method="GET",
    path="/v1/projects/{id}/platforms/whatsapp-business/account/phone-numbers",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ListWhatsappAccountPhoneNumbersResponse),
    },
)

_OP_LIST_WHATSAPP_SHARED_LINE_ASSIGNMENTS = OperationSpec(
    operation_id="listWhatsappSharedLineAssignments",
    method="GET",
    path="/v1/projects/{id}/platforms/whatsapp/assignments",
    safe=True,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.SharedLineAssignmentPage),
    },
)

_OP_PREVIEW_ORGANIZATION_CHANGE = OperationSpec(
    operation_id="previewOrganizationChange",
    method="POST",
    path="/v1/organizations/{organizationId}/billing/preview",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.PreviewOrganizationChangeResponse),
    },
)

_OP_PREVIEW_PROJECT_CHANGE = OperationSpec(
    operation_id="previewProjectChange",
    method="POST",
    path="/v1/organizations/{organizationId}/billing/projects/{projectId}/preview",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.PreviewProjectChangeResponse),
    },
)

_OP_PROVISION_IMESSAGE_DEDICATED_LINE = OperationSpec(
    operation_id="provisionImessageDedicatedLine",
    method="POST",
    path="/v1/projects/{id}/platforms/imessage/dedicated",
    safe=False,
    idempotency_key_required=True,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "202": TypeAdapter(models.Operation),
    },
)

_OP_PROVISION_WHATSAPP_DEDICATED_LINE = OperationSpec(
    operation_id="provisionWhatsappDedicatedLine",
    method="POST",
    path="/v1/projects/{id}/platforms/whatsapp/dedicated",
    safe=False,
    idempotency_key_required=True,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "202": TypeAdapter(models.Operation),
    },
)

_OP_PURCHASE_SMS_NUMBER = OperationSpec(
    operation_id="purchaseSmsNumber",
    method="POST",
    path="/v1/projects/{id}/platforms/sms/numbers",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "202": TypeAdapter(models.Operation),
    },
)

_OP_QUERY_MESSAGE_METRICS = OperationSpec(
    operation_id="queryMessageMetrics",
    method="POST",
    path="/v1/projects/{projectId}/metrics/query",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.QueryMessageMetricsResponse),
    },
)

_OP_REDEEM_APP_INSTALLATION_DELIVERY = OperationSpec(
    operation_id="redeemAppInstallationDelivery",
    method="POST",
    path="/v1/installation-requests/redeem",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.RedeemAppInstallationDeliveryResponse),
    },
)

_OP_REFRESH_ORGANIZATION_SSO_CONNECTION = OperationSpec(
    operation_id="refreshOrganizationSsoConnection",
    method="POST",
    path="/v1/auth/organizations/{orgId}/sso/refresh",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.OrganizationSsoConfiguration),
    },
)

_OP_RELEASE_IMESSAGE_DEDICATED_LINE = OperationSpec(
    operation_id="releaseImessageDedicatedLine",
    method="DELETE",
    path="/v1/projects/{id}/platforms/imessage/dedicated/{resourceId}",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Operation),
        "202": TypeAdapter(models.Operation),
    },
)

_OP_RELEASE_RESOURCE = OperationSpec(
    operation_id="releaseResource",
    method="DELETE",
    path="/v1/projects/{id}/platforms/resources/{resourceId}",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Operation),
        "202": TypeAdapter(models.Operation),
    },
)

_OP_RELEASE_SHARED_LINE_ASSIGNMENT = OperationSpec(
    operation_id="releaseSharedLineAssignment",
    method="DELETE",
    path="/v1/projects/{id}/platforms/imessage/assignments/{assignmentId}",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.SharedLineAssignment),
    },
)

_OP_RELEASE_WHATSAPP_DEDICATED_LINE = OperationSpec(
    operation_id="releaseWhatsappDedicatedLine",
    method="DELETE",
    path="/v1/projects/{id}/platforms/whatsapp/dedicated/{resourceId}",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Operation),
        "202": TypeAdapter(models.Operation),
    },
)

_OP_RELEASE_WHATSAPP_SHARED_LINE_ASSIGNMENT = OperationSpec(
    operation_id="releaseWhatsappSharedLineAssignment",
    method="DELETE",
    path="/v1/projects/{id}/platforms/whatsapp/assignments/{assignmentId}",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.SharedLineAssignment),
    },
)

_OP_REPLACE_VOICE_PROFILE_INBOUND = OperationSpec(
    operation_id="replaceVoiceProfileInbound",
    method="PUT",
    path="/v1/projects/{id}/platforms/voice/profiles/{profileId}/inbound",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.VoiceProfileInboundConfiguration),
        "201": TypeAdapter(models.VoiceProfileInboundConfiguration),
    },
)

_OP_RESET_ACCOUNT_PROFILE_PICTURE = OperationSpec(
    operation_id="resetAccountProfilePicture",
    method="DELETE",
    path="/v1/account/profile-picture",
    safe=False,
    idempotency_key_required=True,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Account),
    },
)

_OP_RESET_AGENT_PROFILE_AVATAR = OperationSpec(
    operation_id="resetAgentProfileAvatar",
    method="DELETE",
    path="/v1/projects/{projectId}/agent-profile/avatar",
    safe=False,
    idempotency_key_required=True,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.AgentProfile),
    },
)

_OP_RETRY_ORGANIZATION_CONNECTION_SYNC = OperationSpec(
    operation_id="retryOrganizationConnectionSync",
    method="POST",
    path="/v1/auth/organizations/{orgId}/connection-sync/retry",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.OrganizationConnectionStatus),
    },
)

_OP_RETRY_WEBHOOK_DELIVERY = OperationSpec(
    operation_id="retryWebhookDelivery",
    method="POST",
    path="/v1/projects/{projectId}/webhooks/destinations/{destinationId}/retries",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "202": TypeAdapter(models.RetryWebhookDeliveryResponse),
    },
)

_OP_REVOKE_ACCOUNT_SERVICE_KEY = OperationSpec(
    operation_id="revokeAccountServiceKey",
    method="DELETE",
    path="/v1/account/service-keys/{serviceKeyId}",
    safe=False,
    idempotency_key_required=True,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.RevokeAccountServiceKeyResponse),
    },
)

_OP_REVOKE_AUTHORIZED_APPLICATION = OperationSpec(
    operation_id="revokeAuthorizedApplication",
    method="DELETE",
    path="/v1/account/oauth/authorized-applications/{applicationId}",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=("application/problem+json",),
    success_responses={
        "204": None,
    },
)

_OP_REVOKE_PROJECT_API_KEY = OperationSpec(
    operation_id="revokeProjectApiKey",
    method="DELETE",
    path="/v1/projects/{projectId}/api-keys/{apiKeyId}",
    safe=False,
    idempotency_key_required=True,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ProjectApiKeyResponse),
    },
)

_OP_ROTATE_VOICE_PROFILE_OUTBOUND_CREDENTIAL = OperationSpec(
    operation_id="rotateVoiceProfileOutboundCredential",
    method="POST",
    path="/v1/projects/{id}/platforms/voice/profiles/{profileId}/outbound/rotate",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.RotateVoiceProfileOutboundCredentialResponse),
    },
)

_OP_ROTATE_WEBHOOK_SIGNING_SECRET = OperationSpec(
    operation_id="rotateWebhookSigningSecret",
    method="POST",
    path="/v1/projects/{projectId}/webhooks/destinations/{destinationId}/secret-rotations",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.RotateWebhookSigningSecretResponse),
    },
)

_OP_START_ACCOUNT_PHONE_VERIFICATION = OperationSpec(
    operation_id="startAccountPhoneVerification",
    method="POST",
    path="/v1/account/phone/verifications",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "201": TypeAdapter(models.StartAccountPhoneVerificationResponse),
    },
)

_OP_START_ENTERPRISE_LOGIN = OperationSpec(
    operation_id="startEnterpriseLogin",
    method="POST",
    path="/v1/auth/login/enrollment",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.StartEnterpriseLoginResponse),
    },
)

_OP_UNASSIGN_SMS_LINE_CAMPAIGN = OperationSpec(
    operation_id="unassignSmsLineCampaign",
    method="DELETE",
    path="/v1/projects/{id}/platforms/sms/lines/{resourceId}/campaign",
    safe=False,
    idempotency_key_required=True,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Operation),
        "202": TypeAdapter(models.Operation),
    },
)

_OP_UNASSIGN_VOICE_LINE_PROFILE = OperationSpec(
    operation_id="unassignVoiceLineProfile",
    method="DELETE",
    path="/v1/projects/{id}/platforms/voice/lines/{resourceId}/profile",
    safe=False,
    idempotency_key_required=False,
    accept_media_types=("application/problem+json",),
    success_responses={
        "204": None,
    },
)

_OP_UPDATE_ACCOUNT = OperationSpec(
    operation_id="updateAccount",
    method="PATCH",
    path="/v1/account",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Account),
    },
)

_OP_UPDATE_AGENT_PROFILE = OperationSpec(
    operation_id="updateAgentProfile",
    method="PATCH",
    path="/v1/projects/{projectId}/agent-profile",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.AgentProfile),
    },
)

_OP_UPDATE_DEFAULT_VOICE_PROFILE = OperationSpec(
    operation_id="updateDefaultVoiceProfile",
    method="PATCH",
    path="/v1/projects/{id}/platforms/voice/profiles/default",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.VoiceProfile),
    },
)

_OP_UPDATE_ORGANIZATION_SSO_POLICY = OperationSpec(
    operation_id="updateOrganizationSsoPolicy",
    method="PATCH",
    path="/v1/auth/organizations/{orgId}/sso",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.OrganizationSsoConfiguration),
    },
)

_OP_UPDATE_PROJECT = OperationSpec(
    operation_id="updateProject",
    method="PATCH",
    path="/v1/projects/{projectId}",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Project),
    },
)

_OP_UPDATE_PROJECT_API_KEY = OperationSpec(
    operation_id="updateProjectApiKey",
    method="PATCH",
    path="/v1/projects/{projectId}/api-keys/{apiKeyId}",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.ProjectApiKeyResponse),
    },
)

_OP_UPDATE_VOICE_PROFILE = OperationSpec(
    operation_id="updateVoiceProfile",
    method="PATCH",
    path="/v1/projects/{id}/platforms/voice/profiles/{profileId}",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.VoiceProfile),
    },
)

_OP_UPDATE_VOICE_PROFILE_INBOUND = OperationSpec(
    operation_id="updateVoiceProfileInbound",
    method="PATCH",
    path="/v1/projects/{id}/platforms/voice/profiles/{profileId}/inbound",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.VoiceProfileInboundConfiguration),
    },
)

_OP_UPDATE_VOICE_PROFILE_OUTBOUND_AUTHENTICATION = OperationSpec(
    operation_id="updateVoiceProfileOutboundAuthentication",
    method="PATCH",
    path="/v1/projects/{id}/platforms/voice/profiles/{profileId}/outbound",
    safe=False,
    idempotency_key_required=False,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.UpdateVoiceProfileOutboundAuthenticationResponse),
    },
)

_OP_UPDATE_WEBHOOK_DESTINATION = OperationSpec(
    operation_id="updateWebhookDestination",
    method="PATCH",
    path="/v1/projects/{projectId}/webhooks/destinations/{destinationId}",
    safe=False,
    idempotency_key_required=True,
    request_media_type="application/json",
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.WebhookDestination),
    },
)

_OP_UPLOAD_ATTACHMENT = OperationSpec(
    operation_id="uploadAttachment",
    method="POST",
    path="/v1/projects/{id}/attachments",
    safe=False,
    idempotency_key_required=True,
    raw_request=True,
    accept_media_types=(
        "application/json",
        "application/problem+json",
    ),
    success_responses={
        "200": TypeAdapter(models.Attachment),
        "201": TypeAdapter(models.Attachment),
    },
)


class SyncRawProjectsPlatformsImessageAssignmentsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport

    def create(
        self, input: CreateSharedLineAssignmentInput
    ) -> RawResponse[models.SharedLineAssignment]:
        "Create shared line assignment\n\nMaps an end user's iMessage handle — an E.164 phone number or an email address — onto one of the project's pooled shared iMessage lines, consuming a seat from the project's entitlement. The assigned number is allocated by the server. When an email address is supplied in `email` the user is sent an invite asynchronously to that address; it is never inferred from the handle, and the response never reports whether the send succeeded. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_SHARED_LINE_ASSIGNMENT, payload)

    def get(self, input: GetSharedLineAssignmentInput) -> RawResponse[models.SharedLineAssignment]:
        "Get shared line assignment\n\nReads one shared line assignment. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_SHARED_LINE_ASSIGNMENT, payload)

    def list(
        self, input: ListSharedLineAssignmentsInput
    ) -> RawResponse[models.SharedLineAssignmentPage]:
        "List shared line assignments\n\nLists the project's shared line assignments, oldest first. Released assignments are excluded unless includeReleased is set. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_SHARED_LINE_ASSIGNMENTS, payload)

    def release(
        self, input: ReleaseSharedLineAssignmentInput
    ) -> RawResponse[models.SharedLineAssignment]:
        "Release shared line assignment\n\nReleases a shared line assignment, freeing both its seat and its handle for reassignment. The row is retained for audit and returned with releasedAt set, so repeating the call is safe. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_RELEASE_SHARED_LINE_ASSIGNMENT, payload)


class SyncRawProjectsPlatformsImessageResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport
        self.assignments = SyncRawProjectsPlatformsImessageAssignmentsResource(transport)


class SyncRawProjectsPlatformsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport
        self.imessage = SyncRawProjectsPlatformsImessageResource(transport)

    def assign_sms_line_campaign(
        self, input: AssignSmsLineCampaignInput
    ) -> RawResponse[models.Operation]:
        "Assign or replace SMS line campaign\n\nAttach a ready campaign from this project’s organization to its line. Requires platforms:write for the project; human and machine actors retain their authenticated identity. Requires a permanent Idempotency-Key and the current assignment version. Provider provisioning runs asynchronously."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_ASSIGN_SMS_LINE_CAMPAIGN, payload)

    def assign_voice_line_profile(
        self, input: AssignVoiceLineProfileInput
    ) -> RawResponse[models.VoiceLineProfileAssignment]:
        "Assign Voice line profile\n\nAssigns or replaces a line's explicit additional-profile override when the resource version matches. The current default cannot be assigned explicitly. The pstn_voice ability remains the admission source of truth. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_ASSIGN_VOICE_LINE_PROFILE, payload)

    def batch_update_voice_line_profile_assignments(
        self, input: BatchUpdateVoiceLineProfileAssignmentsInput
    ) -> RawResponse[models.BatchUpdateVoiceLineProfileAssignmentsResponse]:
        "Batch update Voice line assignments\n\nAtomically sets additional-profile overrides or switches lines back to the project default for up to 100 Voice-capable lines. A null profileId means use the default. Every expected resource version must match or no line changes. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_BATCH_UPDATE_VOICE_LINE_PROFILE_ASSIGNMENTS, payload)

    def cancel_operation(self, input: CancelOperationInput) -> RawResponse[models.Operation]:
        "Cancel operation\n\nWithdraws a provision that has not been fulfilled yet. This is an operations action rather than a DELETE, because there is nothing to delete: no resource exists until the work commits. Whether it is accepted depends on the resource type — a dedicated iMessage line may sit waiting on inventory for hours and withdrawing costs nothing, while an SMS number is cancellable during inventory waiting and answers 409 once the workflow commits to its first provider order. Campaign assignment and detachment operations cannot be cancelled in any state. Wait for completion before requesting another change; that new change is not a guaranteed rollback. The output-only `cancellable` field is a snapshot; the cancellation transaction always checks the current phase under a row lock. A cancel that loses the race against the work finishing also answers 409: the resource exists and is billed for, so what you want then is to release it. Nothing is charged for a cancelled provision — billing runs after the work, so there is never anything to refund. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CANCEL_OPERATION, payload)

    def configure_voice_profile_outbound(
        self, input: ConfigureVoiceProfileOutboundInput
    ) -> RawResponse[models.ConfigureVoiceProfileOutboundResponse]:
        "Configure Voice outbound credential\n\nConfigures a SIP credential for outbound calls from a profile when the shared profile version matches. Outbound calls are paid usage, so the organization needs a payment method and no invoices overdue 7 days or more; otherwise this returns 402 ENTITLEMENT_REQUIRED with a reason. authentication.algorithm is required: SHA-256 is recommended, while MD5 is a weaker legacy option supported over UDP, TCP, and TLS; TLS is strongly recommended because UDP and TCP do not encrypt SIP signaling. The profileId may identify the default or an additional profile. The new password is returned once and is never recoverable. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CONFIGURE_VOICE_PROFILE_OUTBOUND, payload)

    def connect_email_domain(self, input: ConnectEmailDomainInput) -> RawResponse[models.Operation]:
        "Connect email domain\n\nReserves a normalized DNS domain and starts its durable email-provider setup. The accepted provision consumes one email-domain entitlement slot until it fails, is cancelled, or becomes a live resource; the plan's email.max_email_domains value sets the project limit. The customer resource does not exist until provider identity and DNS setup reach READY; poll the returned operation for progress. A domain may have only one unfinished provision or live resource globally. Email domains have no additional per-domain charge. The Idempotency-Key is required and permanent: replaying the same key and canonical domain returns the original operation forever. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CONNECT_EMAIL_DOMAIN, payload)

    def connect_telegram_bot(self, input: ConnectTelegramBotInput) -> RawResponse[models.Operation]:
        "Connect Telegram bot\n\nStarts a free managed Telegram bot connection. Each project may have one unfinished Telegram provision, including user interaction and failure cleanup. A different Idempotency-Key while one is active returns 409 TELEGRAM_PROVISION_IN_PROGRESS with its operationId and operationUrl; resume it, cancel it while cancellation is available, or wait for it to finish. Rejected keys remain reusable. Open detail.setupUrl to connect an existing managed bot or create a new one with the project's default agent name or a custom display name, then poll Location. The link remains usable while the operation is active and never expires. Replaying the same Idempotency-Key returns the original operation, even after completion or while a newer setup is active. POST, GET and list share the same operation details. The API includes detail.setupUrl only for callers with platforms:write for the project; read-only callers receive the other details unchanged."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CONNECT_TELEGRAM_BOT, payload)

    def connect_whatsapp_business(
        self, input: ConnectWhatsappBusinessInput
    ) -> RawResponse[models.Operation]:
        "Connect WhatsApp Business\n\nExchanges the authorization code Embedded Signup returned and connects exactly the selected phone number as one `whatsapp_sender`. Send the WABA id and phone-number id emitted by the same popup attempt; both are treated as selectors and verified against Meta before use. A selected number that matches a non-retired, same-project `voip_line` is linked to it; a number absent from Photon inventory stays unbound; a matching non-retired `cosmos_line`, foreign VoIP line or unassigned VoIP line fails the operation before registration. Connecting is free — no plan requirement — but Billing must report the project's organization as ready with a payment method on file. The Idempotency-Key is required and permanent: replaying the same key returns the original operation forever. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CONNECT_WHATSAPP_BUSINESS, payload)

    def count_filtered_verification_codes(
        self, input: CountFilteredVerificationCodesInput
    ) -> RawResponse[models.FilteredVerificationCodeCount]:
        "Count filtered verification codes\n\nCounts the verification codes Photon kept from this project's dedicated lines and numbers, optionally for one `platform`. Without `receivedAfter` and `receivedBefore` the window is the 30 days before the request; a window longer than 366 days is rejected. The response echoes the window it resolved, so the number always says which period it covers. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_COUNT_FILTERED_VERIFICATION_CODES, payload)

    def count_resource_filtered_verification_codes(
        self, input: CountResourceFilteredVerificationCodesInput
    ) -> RawResponse[models.FilteredVerificationCodeCount]:
        "Count a line's filtered verification codes\n\nCounts the verification codes Photon kept from one dedicated line or number. Without `receivedAfter` and `receivedBefore` the window is the 30 days before the request; a window longer than 366 days is rejected. The response echoes the window it resolved, so the number always says which period it covers. Answers 404 unless the project holds the resource now. Codes from an earlier tenure stay in the project-wide list. Filter by `platform` — a number receives both SMS and WhatsApp. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_COUNT_RESOURCE_FILTERED_VERIFICATION_CODES, payload)

    def create_default_voice_profile(
        self, input: CreateDefaultVoiceProfileInput
    ) -> RawResponse[models.VoiceProfile]:
        "Create default Voice profile\n\nCreates the project default Voice profile when absent. An identical replay returns the existing default without changing its version; a different existing default conflicts. Direction configuration is managed separately. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_DEFAULT_VOICE_PROFILE, payload)

    def create_voice_profile(
        self, input: CreateVoiceProfileInput
    ) -> RawResponse[models.VoiceProfile]:
        "Create Voice profile\n\nCreates a direction-neutral additional Voice profile. The project default must already exist. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_VOICE_PROFILE, payload)

    def create_whatsapp_shared_line_assignment(
        self, input: CreateWhatsappSharedLineAssignmentInput
    ) -> RawResponse[models.SharedLineAssignment]:
        "Create WhatsApp shared line assignment\n\nMaps an end user's phone number onto one of the project's pooled shared WhatsApp lines, consuming a seat from the project's WhatsApp entitlement. The assigned number is allocated by the server. When an email address is supplied the user is sent an invite asynchronously; the response never reports whether that succeeded. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_WHATSAPP_SHARED_LINE_ASSIGNMENT, payload)

    def create_whatsapp_voip_sender(
        self, input: CreateWhatsappVoipSenderInput
    ) -> RawResponse[models.Operation]:
        "Create WhatsApp VoIP sender\n\nRegisters an active, SMS-capable Photon VoIP line on this project's connected WhatsApp Business Account. The account is resolved server-side; callers never select a WABA. The platform creates or reuses the Meta number, requests and consumes the SMS ownership code internally, verifies it, and registers the sender. displayName is optional; when omitted the project agent profile name is snapshotted before acceptance. The VoIP line remains a separate resource and never receives the whatsapp_business ability."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_WHATSAPP_VOIP_SENDER, payload)

    def delete_voice_profile(self, input: DeleteVoiceProfileInput) -> RawResponse[None]:
        "Delete Voice profile\n\nDeletes an additional profile when expectedVersion matches. Assigned profiles require force=true, which atomically removes every stored override so affected lines follow the default. The default can never be deleted. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_DELETE_VOICE_PROFILE, payload)

    def delete_voice_profile_inbound(
        self, input: DeleteVoiceProfileInboundInput
    ) -> RawResponse[models.VoiceProfileInboundConfiguration]:
        "Delete Voice inbound configuration\n\nRemoves a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. The profile and its line assignments remain. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_DELETE_VOICE_PROFILE_INBOUND, payload)

    def delete_voice_profile_outbound(
        self, input: DeleteVoiceProfileOutboundInput
    ) -> RawResponse[models.DeleteVoiceProfileOutboundResponse]:
        "Revoke Voice outbound credential\n\nRevokes outbound calling for a profile when the shared profile version matches. The profileId may identify the default or an additional profile. The profile, inbound destination, and line assignments remain. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_DELETE_VOICE_PROFILE_OUTBOUND, payload)

    def disconnect_whatsapp_business_account(
        self, input: DisconnectWhatsappBusinessAccountInput
    ) -> RawResponse[models.Operation]:
        "Disconnect WhatsApp Business account\n\nDisconnects every attached WhatsApp sender, then unsubscribes our app and removes the project's business account connection. Photon VoIP lines and the numbers in Meta remain. Requires Idempotency-Key. Poll the returned operation; provider refusals appear as operation failures and retain the account for retry with a new key. New signups are blocked while disconnecting, and existing provisions must finish before this request can be accepted."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_DISCONNECT_WHATSAPP_BUSINESS_ACCOUNT, payload)

    def get_default_voice_profile(
        self, input: GetDefaultVoiceProfileInput
    ) -> RawResponse[models.VoiceProfile]:
        "Get default Voice profile\n\nGets the profile currently selected as the project default, including its optional inbound delivery state. Requires platforms:read bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_DEFAULT_VOICE_PROFILE, payload)

    def get_imessage(
        self, input: GetProjectImessagePlatformInput
    ) -> RawResponse[models.ProjectPlatformSettings]:
        "Get project iMessage platform\n\nReports whether the project is on shared or dedicated iMessage lines, derived from its billing entitlements. Shared mode carries the seat cap. Both say whether a dedicated line requested now would be assigned without waiting. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_PROJECT_IMESSAGE_PLATFORM, payload)

    def get_operation(self, input: GetOperationInput) -> RawResponse[models.GetOperationResponse]:
        "Get operation\n\nReads one operation using the same operation representation as creation and list. The API includes detail.setupUrl only with platforms:write for this project. This is the polling endpoint every asynchronous request here points its Location at, and it resolves from the moment that request is accepted — an operation is committed before its work is dispatched, so there is no window in which the URL 404s. Poll until `state` is one of `succeeded`, `failed` or `cancelled`, pacing from the Retry-After the accepting response returned. While an email domain waits for DNS, `detail` always contains the manual records and may additionally contain `automaticSetup` with a signed provider URL to open separately. Once the operation has produced a resource, the response carries that resource too, so the poll that finishes is also the one that tells you what you got. `succeeded` means the work is done; billing runs behind it and is not something the caller waits on. Operations are never purged, so a 404 means the id was never this project's. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_OPERATION, payload)

    def get_project_whatsapp_platform(
        self, input: GetProjectWhatsappPlatformInput
    ) -> RawResponse[models.ProjectPlatformSettings]:
        "Get project WhatsApp platform\n\nReports whether the project is on shared or dedicated WhatsApp lines, derived from its billing entitlements. Shared mode carries the seat cap. Both say whether a dedicated line requested now would be assigned without waiting. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_PROJECT_WHATSAPP_PLATFORM, payload)

    def get_resource(self, input: GetResourceInput) -> RawResponse[models.Resource]:
        "Get resource\n\nReads one resource the project holds. A released number stays readable and reads `retired`, because it remains part of this project's history. A dedicated line given back does NOT: returning it to inventory is what makes it claimable by someone else, so it answers 404 and the operation that returned it is the record that this project once held it. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_RESOURCE, payload)

    def get_sms_line_campaign_assignment(
        self, input: GetSmsLineCampaignAssignmentInput
    ) -> RawResponse[models.GetSmsLineCampaignAssignmentResponse]:
        "Get SMS line campaign assignment\n\nRead the last confirmed campaign and current eligibility. Follow changes through their operations. Eligibility is a control-plane assessment, not a delivery or recipient-consent guarantee."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_SMS_LINE_CAMPAIGN_ASSIGNMENT, payload)

    def get_voice_line_profile_assignment(
        self, input: GetVoiceLineProfileAssignmentInput
    ) -> RawResponse[models.VoiceLineProfileAssignment]:
        "Get Voice line profile assignment\n\nGets the explicit additional-profile override for an owned Voice-capable line. A line following the project default returns 200 without profileId. Requires platforms:read bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_VOICE_LINE_PROFILE_ASSIGNMENT, payload)

    def get_voice_profile(self, input: GetVoiceProfileInput) -> RawResponse[models.VoiceProfile]:
        "Get Voice profile\n\nGets one reusable Voice profile, including its optional inbound delivery state. Requires platforms:read bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_VOICE_PROFILE, payload)

    def get_whatsapp_business_account(
        self, input: GetWhatsappBusinessAccountInput
    ) -> RawResponse[models.WhatsappBusinessAccount]:
        "Get WhatsApp Business account\n\nGets the one WhatsApp Business Account this project has connected, with its number of live senders. Senders are resources and are listed by GET /platforms/resources?ability=whatsapp_business. The account is not a resource and carries no access token. Meta's retained numbers are listed separately by GET /platforms/whatsapp-business/account/phone-numbers. `subscribedAt` is absent until our app is attached to the account's webhooks. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_WHATSAPP_BUSINESS_ACCOUNT, payload)

    def get_whatsapp_business_verification_code(
        self, input: GetWhatsappBusinessVerificationCodeInput
    ) -> RawResponse[models.GetWhatsappBusinessVerificationCodeResponse]:
        "Get WhatsApp Business verification code\n\nReturns the latest six-digit WhatsApp Business ownership code received by SMS for an active Photon VOIP number, but only when its provider timestamp is strictly newer than the required receivedAfter boundary. receivedAfter must be an RFC 3339 timestamp between this request's arrival time and two minutes before it; once it expires, restart Meta's verification flow with a new boundary. A missing newer code is a retryable 404 with Retry-After: 2. Poll after 2, 4, 8, then 10 seconds, applying ±20% jitter and capping later intervals at 10 seconds. Stop when the original boundary is two minutes old. Responses are never cached. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_WHATSAPP_BUSINESS_VERIFICATION_CODE, payload)

    def get_whatsapp_shared_line_assignment(
        self, input: GetWhatsappSharedLineAssignmentInput
    ) -> RawResponse[models.SharedLineAssignment]:
        "Get WhatsApp shared line assignment\n\nReads one WhatsApp shared line assignment. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_WHATSAPP_SHARED_LINE_ASSIGNMENT, payload)

    def get_whatsapp_signup_config(
        self, input: GetWhatsappSignupConfigInput
    ) -> RawResponse[models.GetWhatsappSignupConfigResponse]:
        "Get WhatsApp signup config\n\nReturns what the browser needs to open Meta's Embedded Signup popup: the Facebook Login for Business configuration id, the Graph version to run against, and the scopes it will request. Answered in-process rather than forwarded, so the first step of onboarding survives an outage of the private service. Pass `configId` to `FB.login` as `config_id` with `response_type: 'code'` and `override_default_response_type: true`. Do NOT add a `featureType` — omitting it is what keeps the phone-number screen in the flow, and `only_waba_sharing` produces an account with no number that cannot be provisioned. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_WHATSAPP_SIGNUP_CONFIG, payload)

    def list_filtered_verification_codes(
        self, input: ListFilteredVerificationCodesInput
    ) -> RawResponse[models.FilteredVerificationCodePage]:
        "List filtered verification codes\n\nLists the verification codes Photon kept from this project's dedicated lines and numbers. Inbound messages that carry a one-time code are filtered before delivery; this is the record that they arrived, so a quiet line can be told apart from a broken one. It records the receiving line, its platform and when the code arrived — never the code itself. Each entry names the dedicated line or number (`resourceId`) that received it. Newest first, within an optional inclusive `receivedAfter`/`receivedBefore` window. A page may hold fewer than `pageSize` entries and still return a `nextPageToken`; only its absence means the end. Filter by `platform`; to read one line, use its own filtered-otp path. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_FILTERED_VERIFICATION_CODES, payload)

    def list_number_area_codes(
        self, input: ListNumberAreaCodesInput
    ) -> RawResponse[models.ListNumberAreaCodesResponse]:
        "List number area codes\n\nLists current provider coverage for US local numbers, sorted and deduplicated. Coverage does not guarantee inventory carrying every required feature. New area-specific purchases must use a listed code; accepted purchases keep waiting if coverage later changes. Requires platforms:read for the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_NUMBER_AREA_CODES, payload)

    def list_number_countries(
        self, input: ListNumberCountriesInput
    ) -> RawResponse[models.ListNumberCountriesResponse]:
        "List number countries\n\nLists supported purchase countries independently of current provider inventory. Requires platforms:read for the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_NUMBER_COUNTRIES, payload)

    def list_operations(self, input: ListOperationsInput) -> RawResponse[models.OperationPage]:
        "List operations\n\nLists the project's operations using the same operation representation as creation and GET. The API includes detail.setupUrl only with platforms:write for this project. Results are oldest first — every provision and release it has ever asked for, including the ones still running. This is the entire in-flight view: a resource only appears once it is real, so nothing half-built shows up in the resource list and nothing in flight is missing from this one. Filter by `resourceId` to get one resource's whole history, which for a pooled line is every tenure this project has had on it. `state` is comma-separated; `type` accepts one operation type and an absent filter means everything, including failed and cancelled operations. `endedAfter` keeps only operations that finished after that instant, so what failed or was withdrawn recently is one short page. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_OPERATIONS, payload)

    def list_project_platforms(
        self, input: ListProjectPlatformsInput
    ) -> RawResponse[models.ListProjectPlatformsResponse]:
        "List project platforms\n\nLists the platform types available to this project. Every project currently sees the same fixed public contract, answered in-process rather than forwarded, so the list survives an outage of the private service. The project binding exists so that answer can narrow per project without moving the route. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_PROJECT_PLATFORMS, payload)

    def list_resource_filtered_verification_codes(
        self, input: ListResourceFilteredVerificationCodesInput
    ) -> RawResponse[models.FilteredVerificationCodePage]:
        "List a line's filtered verification codes\n\nLists the verification codes Photon kept from one dedicated line or number. Inbound messages that carry a one-time code are filtered before delivery; this is the record that they arrived, so a quiet line can be told apart from a broken one. It records the receiving line, its platform and when the code arrived — never the code itself. Each entry names the dedicated line or number (`resourceId`) that received it. Newest first, within an optional inclusive `receivedAfter`/`receivedBefore` window. A page may hold fewer than `pageSize` entries and still return a `nextPageToken`; only its absence means the end. Answers 404 unless the project holds the resource now. Codes from an earlier tenure stay in the project-wide list. Filter by `platform` — a number receives both SMS and WhatsApp. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_RESOURCE_FILTERED_VERIFICATION_CODES, payload)

    def list_resources(self, input: ListResourcesInput) -> RawResponse[models.ResourcePage]:
        "List resources\n\nLists everything the project holds, oldest first, whatever kind of thing it is — one endpoint and one id shape for numbers, dedicated lines and whatever ships next. Nothing half-built appears here: a resource exists only once it is real, so anything still being provisioned is an operation rather than a resource with a pending flag. Filter by `type`, by `ability` (which matches only abilities that are currently enabled), and by `state` — comma-separated, and absent means every state, including retired ones. `detail` carries a per-type public view: an SMS number's number, a dedicated line's number and its per-capability health (`imessageHealth`, `whatsappHealth`, each with an `overallStatus` of `available`, `degraded`, `unavailable` or `unknown`; `imessageHealth` also carries `account`, `photonSystemComponents`, `newConversations`, `sms` and `mms`, each a `status` with the `cause` that decided it: `account`, `photonSystemComponents`, or null for the item's own state). Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_RESOURCES, payload)

    def list_voice_profiles(
        self, input: ListVoiceProfilesInput
    ) -> RawResponse[models.VoiceProfilePage]:
        "List Voice profiles\n\nLists reusable Voice profiles in this project. Requires platforms:read bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_VOICE_PROFILES, payload)

    def list_whatsapp_account_phone_numbers(
        self, input: ListWhatsappAccountPhoneNumbersInput
    ) -> RawResponse[models.ListWhatsappAccountPhoneNumbersResponse]:
        "List WhatsApp account phone numbers\n\nLists the connected WABA's phone numbers directly from Meta, including numbers whose Photon sender was disconnected. Ownership is photon for a number in this project's current Photon inventory and meta otherwise. Match a Photon SMS number by its E.164 phoneNumber and reuse its existing displayName when reconnecting. A null name is unavailable, not permission to choose a new name. A failed lookup returns an error rather than an empty list. Requires platforms:read on the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_WHATSAPP_ACCOUNT_PHONE_NUMBERS, payload)

    def list_whatsapp_shared_line_assignments(
        self, input: ListWhatsappSharedLineAssignmentsInput
    ) -> RawResponse[models.SharedLineAssignmentPage]:
        "List WhatsApp shared line assignments\n\nLists the project's WhatsApp shared line assignments, oldest first. Released assignments are excluded unless includeReleased is set. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_WHATSAPP_SHARED_LINE_ASSIGNMENTS, payload)

    def provision_imessage_dedicated_line(
        self, input: ProvisionImessageDedicatedLineInput
    ) -> RawResponse[models.Operation]:
        "Provision dedicated iMessage line\n\nClaims one dedicated iMessage line for the project and enables iMessage on it. Always answers 202 with an operation: dedicated lines are allocated from available capacity, and unavailable capacity causes a wait rather than a failure — this can legitimately stay `running` for hours, which is exactly why the response is a handle to poll rather than a number. The project's messaging subscription must grant the dedicated iMessage lines entitlement (`imessage_dedicated_lines.can_purchase`), and that is checked before capacity is reserved. The line's own charge starts when a line is claimed; the subscription that grants the entitlement bills on its own terms, which cancelling a request does not change. Waiting requests are served first come, first served. One that is still waiting is cancelled with a `reason` if the project is deleted (`project_deleted`) or its plan stops selling dedicated lines (`entitlement_lost`); while the payer is restricted for overdue payment it keeps waiting. If you no longer want to wait, POST to the operation's cancel endpoint, which charges nothing for the line. The Idempotency-Key is required and permanent: repeating it returns the same operation forever. A further line always needs a NEW key, including while others are still waiting. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_PROVISION_IMESSAGE_DEDICATED_LINE, payload)

    def provision_whatsapp_dedicated_line(
        self, input: ProvisionWhatsappDedicatedLineInput
    ) -> RawResponse[models.Operation]:
        "Provision dedicated WhatsApp line\n\nProvisions one dedicated WhatsApp line with WhatsApp and shared Voice enabled. It attaches to an eligible iMessage line the project already owns when possible so both products keep the same number; otherwise it claims healthy, available WhatsApp-capable dedicated-line inventory. Always answers 202, because waiting when no inventory is available is not a failure. The product opens its own charge period after the abilities are enabled; Voice has no separate charge. Waiting requests are served first come, first served, and are cancelled with a `reason` exactly as for a dedicated iMessage line. Cancel the returned operation to stop waiting. The Idempotency-Key is required and permanent."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_PROVISION_WHATSAPP_DEDICATED_LINE, payload)

    def purchase_sms_number(self, input: PurchaseSmsNumberInput) -> RawResponse[models.Operation]:
        "Purchase SMS number\n\nBuys one US local number from the provider and records it as a resource with SMS enabled. Requires countryCode (US) and accepts an optional three-digit geographic areaCode. The server selects an exact matching number. Empty inventory keeps the operation running until a number is available or the caller cancels before ordering begins. Always answers 202 with an operation: the work runs behind the response, and the Location points at the operation to poll. New area-specific requests must appear in current provider coverage; discover it with GET /sms/numbers/area-codes?countryCode=US. Coverage and subscription checks run before operation creation. Billing follows delivery. Replays return the original operation without checking current coverage. The Idempotency-Key is required and permanent: repeating it returns the same operation forever, never a second number. A further number always needs a NEW key, including while others are still running. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_PURCHASE_SMS_NUMBER, payload)

    def release_imessage_dedicated_line(
        self, input: ReleaseImessageDedicatedLineInput
    ) -> RawResponse[models.Operation]:
        "Release dedicated iMessage line\n\nRemoves only iMessage from one dedicated line. Shared Voice is removed only when WhatsApp is absent; if WhatsApp remains, Voice, the resource, ownership, and phone number are preserved. Usually finishes inside this request and answers 200; a slow workflow answers 202 with an operation to poll. Takes no Idempotency-Key because the open iMessage charge period identifies this product tenure."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_RELEASE_IMESSAGE_DEDICATED_LINE, payload)

    def release_resource(self, input: ReleaseResourceInput) -> RawResponse[models.Operation]:
        "Release resource\n\nGives one resource back, whatever it is. What that means is the resource's own business: an SMS number goes back to the provider and is retired, a dedicated iMessage line goes back to the shared pool and stays in existence for someone else to claim. Either way the provider is contacted first where there is one, then a single transaction disables every ability, ends the project's hold and closes the charge period — so a provider that refuses leaves the resource exactly as it was, still owned and still billed. Usually finishes inside this request and answers 200; if the provider is slow it answers 202 and the Location points at the operation to poll. The decrement runs behind the answer either way, so the resource is gone when you are told it is. Takes no Idempotency-Key — releasing the same resource twice is the same request. Releasing one that is already gone answers 404. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_RELEASE_RESOURCE, payload)

    def release_whatsapp_dedicated_line(
        self, input: ReleaseWhatsappDedicatedLineInput
    ) -> RawResponse[models.Operation]:
        "Release dedicated WhatsApp line\n\nRemoves only WhatsApp from one dedicated line. Shared Voice is removed only when iMessage is absent; if iMessage remains, Voice, the resource, ownership, and phone number are preserved. Usually finishes inside this request and answers 200; a slow workflow answers 202 with an operation to poll. Takes no Idempotency-Key because the open WhatsApp charge period identifies this product tenure."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_RELEASE_WHATSAPP_DEDICATED_LINE, payload)

    def release_whatsapp_shared_line_assignment(
        self, input: ReleaseWhatsappSharedLineAssignmentInput
    ) -> RawResponse[models.SharedLineAssignment]:
        "Release WhatsApp shared line assignment\n\nReleases a WhatsApp shared line assignment, freeing its seat for reassignment. The row is retained for audit and returned with releasedAt set, so repeating the call is safe. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_RELEASE_WHATSAPP_SHARED_LINE_ASSIGNMENT, payload)

    def replace_voice_profile_inbound(
        self, input: ReplaceVoiceProfileInboundInput
    ) -> RawResponse[models.VoiceProfileInboundConfiguration]:
        "Replace Voice inbound configuration\n\nCreates or fully replaces a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. Credentials are required and nullable; null removes destination authentication. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_REPLACE_VOICE_PROFILE_INBOUND, payload)

    def rotate_voice_profile_outbound_credential(
        self, input: RotateVoiceProfileOutboundCredentialInput
    ) -> RawResponse[models.RotateVoiceProfileOutboundCredentialResponse]:
        "Rotate Voice outbound credential\n\nRotates a SIP profile's outbound credential when expectedVersion matches. The profileId may identify the default or an additional profile. Normal rotation gives the previous credential one hour of grace; emergency rotation gives none. The new password is returned once and is never recoverable. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_ROTATE_VOICE_PROFILE_OUTBOUND_CREDENTIAL, payload)

    def unassign_sms_line_campaign(
        self, input: UnassignSmsLineCampaignInput
    ) -> RawResponse[models.Operation]:
        "Unassign SMS line campaign\n\nAny project writer, including a scoped API key, may detach the campaign. The number and campaign remain owned. Requires a permanent Idempotency-Key and expectedVersion. Local eligibility is blocked immediately; provider detachment runs asynchronously."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_UNASSIGN_SMS_LINE_CAMPAIGN, payload)

    def unassign_voice_line_profile(
        self, input: UnassignVoiceLineProfileInput
    ) -> RawResponse[None]:
        "Unassign Voice line profile\n\nRemoves a line's explicit override when the resource version matches so the line follows the project default. Profiles and the pstn_voice ability are unchanged. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_UNASSIGN_VOICE_LINE_PROFILE, payload)

    def update_default_voice_profile(
        self, input: UpdateDefaultVoiceProfileInput
    ) -> RawResponse[models.VoiceProfile]:
        "Update default Voice profile\n\nPatches the default profile's protocol or mediaEncryption when expectedVersion matches. Omitted fields are preserved. Its server-assigned name is immutable, and directional configuration uses the profileId returned by this resource. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_UPDATE_DEFAULT_VOICE_PROFILE, payload)

    def update_voice_profile(
        self, input: UpdateVoiceProfileInput
    ) -> RawResponse[models.VoiceProfile]:
        "Update Voice profile\n\nPatches an additional profile's name, protocol, or mediaEncryption when expectedVersion matches. Omitted fields are preserved. Directional configuration is managed through the profile's inbound and outbound endpoints. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_UPDATE_VOICE_PROFILE, payload)

    def update_voice_profile_inbound(
        self, input: UpdateVoiceProfileInboundInput
    ) -> RawResponse[models.VoiceProfileInboundConfiguration]:
        "Update Voice inbound configuration\n\nUpdates selected fields of a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. At least one of destinationUri or credentials is required. Credential omission preserves destination authentication, null removes it, and an object replaces it atomically. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_UPDATE_VOICE_PROFILE_INBOUND, payload)

    def update_voice_profile_outbound_authentication(
        self, input: UpdateVoiceProfileOutboundAuthenticationInput
    ) -> RawResponse[models.UpdateVoiceProfileOutboundAuthenticationResponse]:
        "Update Voice outbound authentication\n\nChanges a SIP profile's outbound Digest algorithm when expectedVersion matches. The profileId may identify the default or an additional profile. This policy-only change preserves the password, username, and any previous-password grace deadline. SHA-256 is recommended; MD5 is a weaker legacy option. Returns non-secret outbound metadata and the profile version. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_UPDATE_VOICE_PROFILE_OUTBOUND_AUTHENTICATION, payload)


class SyncRawProjectsAgentProfileResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport

    def commit_avatar(
        self, input: CommitAgentProfileAvatarInput
    ) -> RawResponse[models.AgentProfile]:
        "Commit agent avatar\n\nCommits an agent avatar previously uploaded through createAgentProfileAvatarUpload. Call this only after the direct multipart upload succeeds, using the uploadId from the same upload session and a stable Idempotency-Key. The service validates the temporary object's Project ownership, size, content type, image bytes, dimensions, encryption, and age before changing the agent profile."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_COMMIT_AGENT_PROFILE_AVATAR, payload)

    def create_avatar_upload(
        self, input: CreateAgentProfileAvatarUploadInput
    ) -> RawResponse[models.AgentProfileAvatarUpload]:
        "Create agent avatar upload\n\nCreates a ten-minute, Project-bound presigned S3 POST for a JPEG, PNG, or WebP agent avatar up to 5 MiB. Copy every returned formFields entry into a multipart/form-data request to uploadUrl, append the local file as the final form part, and upload it directly without sending Photon credentials. After the upload succeeds, call commitAgentProfileAvatar with the returned uploadId. Do not cache or log the upload URL or form fields."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_AGENT_PROFILE_AVATAR_UPLOAD, payload)

    def get(self, input: GetAgentProfileInput) -> RawResponse[models.AgentProfile]:
        "Get agent profile\n\nReturns the agent profile belonging to the identified project. The profile is project-scoped and is distinct from the authenticated account's personal profile. Use the dedicated avatar operations when uploading or removing an agent avatar."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_AGENT_PROFILE, payload)

    def reset_avatar(self, input: ResetAgentProfileAvatarInput) -> RawResponse[models.AgentProfile]:
        "Reset agent avatar\n\nReplaces the selected project's agent avatar with the project's default avatar, a generated planet image derived from the project ID, and returns the updated agent profile. The reset does not restore an earlier avatar: a custom avatar it replaces is discarded and must be uploaded and committed again to use it. When the default avatar is already in use, the profile is returned unchanged. This does not change the account's personal profile picture. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_RESET_AGENT_PROFILE_AVATAR, payload)

    def update(self, input: UpdateAgentProfileInput) -> RawResponse[models.AgentProfile]:
        "Update agent profile\n\nUpdates the supplied firstName and lastName fields in the project's agent profile and returns the updated profile. Avatar upload, commit and reset are separate operations. The caller must be authorized to change configuration for the selected project. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_UPDATE_AGENT_PROFILE, payload)


class SyncRawProjectsBillingResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport

    def get_operation(
        self, input: GetBillingOperationInput
    ) -> RawResponse[models.BillingOperation]:
        "Get billing operation\n\nReturns the authoritative state of a billing operation belonging to the selected project. Use it to recover or poll a plan-change request until the operation reaches success or failure. An accepted request is not evidence that the plan change has completed."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_BILLING_OPERATION, payload)

    def get_overview(
        self, input: GetBillingOverviewInput
    ) -> RawResponse[models.GetBillingOverviewResponse]:
        "Get project billing overview\n\nReturns the selected project's plan information, entitlements and current billing-period usage. This operation reads project billing state; it does not change plans or the payer's payment method. Organization-level plans are available through the organization billing overview."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_BILLING_OVERVIEW, payload)

    def list_billing_plans(
        self, input: ListBillingPlansInput
    ) -> RawResponse[models.ListBillingPlansResponse]:
        "List billing plans\n\nLists the billing plan catalog, grouped by their public plan-metadata type. Use the returned plan information when choosing the category and planCode for a plan change. The catalog is the same for every project, and reading it does not purchase a plan."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_BILLING_PLANS, payload)


class SyncRawProjectsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport
        self.agent_profile = SyncRawProjectsAgentProfileResource(transport)
        self.billing = SyncRawProjectsBillingResource(transport)
        self.platforms = SyncRawProjectsPlatformsResource(transport)

    def create_project_api_key(
        self, input: CreateProjectApiKeyInput
    ) -> RawResponse[models.CreateProjectApiKeyResponse]:
        "Create project API key\n\nCreates a key bound to the selected project using the supplied name, permissions and optional expiry. The secret is returned only in this response and in idempotent replays of it; store it securely because other reads never return it. The key is scoped to this project and does not grant account-level access. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_PROJECT_API_KEY, payload)

    def create_webhook_destination(
        self, input: CreateWebhookDestinationInput
    ) -> RawResponse[models.CreateWebhookDestinationResponse]:
        "Create webhook destination\n\nCreates a webhook destination for the selected project using its URL, payload API version, event selection and other documented settings. The response includes the signing secret, which is returned only in this response and in idempotent replays of it, never by destination reads; store it securely for signature verification. The API version must be selectable and selected event types must belong to that version's catalog. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_WEBHOOK_DESTINATION, payload)

    def delete(self, input: DeleteProjectInput) -> RawResponse[models.Project]:
        "Delete project\n\nStarts deletion of the identified project using a credential authorized for project management. Inspect the documented response and use getProjectClosureStatus with the organization and project identifiers to read closure progress. A project API key is not an accepted credential for this operation."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_DELETE_PROJECT, payload)

    def delete_webhook_destination(
        self, input: DeleteWebhookDestinationInput
    ) -> RawResponse[models.WebhookDestination]:
        "Delete webhook destination\n\nDeletes the selected project's destination and returns its stable tombstone. Repeated deletion returns the deletion representation. This operation removes the destination configuration; it is separate from disabling a destination through an update."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_DELETE_WEBHOOK_DESTINATION, payload)

    def download_attachment(self, input: DownloadAttachmentInput) -> RawResponse[bytes]:
        "Download attachment\n\nDownloads an Attachment's bytes. If unavailable after ten seconds, returns ATTACHMENT_NOT_READY with Retry-After: 5."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_DOWNLOAD_ATTACHMENT, payload)

    def get(self, input: GetProjectInput) -> RawResponse[models.Project]:
        "Get project\n\nReturns the identified project's settings for an authorized caller. The credential must be allowed to access that project; possession of an unrelated project's key does not provide access. Missing and deleted projects are reported through the documented error responses."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_PROJECT, payload)

    def get_attachment(self, input: GetAttachmentInput) -> RawResponse[models.Attachment]:
        "Get attachment\n\nReturns an Attachment's metadata. Use the content endpoint to download its bytes."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_ATTACHMENT, payload)

    def get_message_metrics_backfill(
        self, input: GetMessageMetricsBackfillInput
    ) -> RawResponse[models.GetMessageMetricsBackfillResponse]:
        "Get metrics backfill status\n\nReturns historical metrics update progress. Completion reflects lastVerifiedAt; queries remain available during updates."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_MESSAGE_METRICS_BACKFILL, payload)

    def get_message_metrics_sql_schema(
        self, input: GetMessageMetricsSqlSchemaInput
    ) -> RawResponse[models.GetMessageMetricsSqlSchemaResponse]:
        "Get metrics SQL schema\n\nReturns the message_events and call_events SQL schema, supported queries, and limits for the selected API version."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_MESSAGE_METRICS_SQL_SCHEMA, payload)

    def get_webhook_destination(
        self, input: GetWebhookDestinationInput
    ) -> RawResponse[models.WebhookDestination]:
        "Get webhook destination\n\nReturns the configuration of one webhook destination belonging to the selected project. Missing or deleted destinations are reported as errors. This read does not disclose the signing secret returned when the destination or a secret rotation was created."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_WEBHOOK_DESTINATION, payload)

    def get_webhook_event_schema(
        self, input: GetWebhookEventSchemaInput
    ) -> RawResponse[models.WebhookEventSchema | None]:
        "Get webhook event schema\n\nReturns the published reader JSON Schema for eventType in the requested webhook apiVersion. Use it to interpret events for that exact payload version. The response media type is application/schema+json; an authorized conditional request may return 304 without a body. Unsupported event/version combinations are rejected."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_WEBHOOK_EVENT_SCHEMA, payload)

    def list_attachments(self, input: ListAttachmentsInput) -> RawResponse[models.AttachmentPage]:
        "List attachments\n\nLists the Project's Attachment metadata, with optional time filters."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_ATTACHMENTS, payload)

    def list_project_api_keys(
        self, input: ListProjectApiKeysInput
    ) -> RawResponse[models.ListProjectApiKeysResponse]:
        "List project API keys\n\nLists the API keys on the selected project, ordered newest first. Revoked keys are not listed; expired keys stay listed until they are revoked. Entries contain key metadata and permissions, never secret values. Use the returned identifiers to manage an existing key; lost secrets cannot be recovered through this operation."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_PROJECT_API_KEYS, payload)

    def list_webhook_api_versions(
        self, input: ListWebhookApiVersionsInput
    ) -> RawResponse[models.ListWebhookApiVersionsResponse | None]:
        "List webhook API versions\n\nLists the published webhook payload API versions and their lifecycle metadata. The list is the same for every project. Use the selectable indicator when choosing a version for a destination. These payload dates are separate from SDK package versions. An authorized conditional request may return 304 without a response body."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_WEBHOOK_API_VERSIONS, payload)

    def list_webhook_destinations(
        self, input: ListWebhookDestinationsInput
    ) -> RawResponse[models.WebhookDestinationPage]:
        "List webhook destinations\n\nReturns a cursor-paginated page of active webhook destinations configured for the selected project. Use pageSize and pageToken to navigate it. The listing returns destination configuration, never signing secrets."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_WEBHOOK_DESTINATIONS, payload)

    def list_webhook_egress_addresses(
        self, input: ListWebhookEgressAddressesInput
    ) -> RawResponse[models.ListWebhookEgressAddressesResponse | None]:
        "List webhook egress addresses\n\nReturns the public network addresses from which this environment sends webhook deliveries. Use this information when configuring the receiving system's network allowlist. The result is environment-specific and does not describe the API service's ingress addresses."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_WEBHOOK_EGRESS_ADDRESSES, payload)

    def list_webhook_event_types(
        self, input: ListWebhookEventTypesInput
    ) -> RawResponse[models.ListWebhookEventTypesResponse | None]:
        "List webhook event types\n\nLists the webhook event types available in the requested apiVersion, including their descriptions, audiences and reader-schema URLs. Use this versioned catalog when selecting a destination's enabledEvents. The response may include version-retirement information; an authorized conditional request can return 304 without a body."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_WEBHOOK_EVENT_TYPES, payload)

    def query_message_metrics(
        self, input: QueryMessageMetricsInput
    ) -> RawResponse[models.QueryMessageMetricsResponse]:
        "Query metrics\n\nRuns read-only SQL over the Project's message_events or call_events table. Get the SQL schema for supported columns, capabilities, and limits."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_QUERY_MESSAGE_METRICS, payload)

    def retry_webhook_delivery(
        self, input: RetryWebhookDeliveryInput
    ) -> RawResponse[models.RetryWebhookDeliveryResponse]:
        "Retry webhook delivery\n\nRequests an immediate attempt of the selected delivery if it is still the waiting head for its destination and event type. expectedAttemptCount is the failed-attempt counter recorded on the delivery and fences stale requests. This overrides the current backoff, including Retry-After, once. It preserves event identity and the retry budget. Delivered, active, disabled and dead-lettered deliveries cannot be retried. A 202 acknowledges the wake-up, not successful delivery. Supply an Idempotency-Key and retain it when retrying an ambiguous failure."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_RETRY_WEBHOOK_DELIVERY, payload)

    def revoke_project_api_key(
        self, input: RevokeProjectApiKeyInput
    ) -> RawResponse[models.ProjectApiKeyResponse]:
        "Revoke project API key\n\nRevokes the identified key on the selected project and returns its revoked metadata. Repeating the deletion returns the same revokedAt value. This operation does not rotate the key or return a replacement secret. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_REVOKE_PROJECT_API_KEY, payload)

    def rotate_webhook_signing_secret(
        self, input: RotateWebhookSigningSecretInput
    ) -> RawResponse[models.RotateWebhookSigningSecretResponse]:
        "Rotate webhook signing secret\n\nRotates the signing secret for the selected project's webhook destination and returns the new secret. The optional overlapSeconds controls the requested overlap with the previous secret according to the documented request constraints. Store the new secret securely and update the receiver's signature verification configuration; it is returned only in this response and in idempotent replays of it, never by destination reads. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_ROTATE_WEBHOOK_SIGNING_SECRET, payload)

    def update(self, input: UpdateProjectInput) -> RawResponse[models.Project]:
        "Update project\n\nUpdates the identified project's name and returns the updated project. The project slug is not a mutable field in this request. Use an authorized account or organization service-identity credential; a project API key is not accepted. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_UPDATE_PROJECT, payload)

    def update_project_api_key(
        self, input: UpdateProjectApiKeyInput
    ) -> RawResponse[models.ProjectApiKeyResponse]:
        "Update project API key permissions\n\nReplaces the identified project key's permission list with the supplied permissions and returns the updated metadata. Sending the permission list the key already has leaves it unchanged. This request does not create a new secret or change the key's project binding. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_UPDATE_PROJECT_API_KEY, payload)

    def update_webhook_destination(
        self, input: UpdateWebhookDestinationInput
    ) -> RawResponse[models.WebhookDestination]:
        "Update webhook destination\n\nUpdates the supplied URL, name, description, status or enabledEvents fields on a project's webhook destination and returns its updated configuration. The payload API version is not a mutable field in this request. Event selections are checked against the destination's versioned catalog; signing-secret rotation is a separate operation. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_UPDATE_WEBHOOK_DESTINATION, payload)

    def upload_attachment(self, input: UploadAttachmentInput) -> RawResponse[models.Attachment]:
        "Upload attachment\n\nUploads a file and returns its Attachment once ready to download."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True, exclude={"body"})
        payload["body"] = input.body.root if input.body is not None else None
        return self._transport.request(_OP_UPLOAD_ATTACHMENT, payload)


class SyncRawAuthDeviceResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport

    def authorize(
        self, input: DeviceAuthorizeInput | None = None
    ) -> RawResponse[models.DeviceAuthorizeResponse]:
        "Start device authorization\n\nStarts the device authorization flow for a CLI or another device without a browser. Show the verification URL and user code, then poll the token endpoint at the returned interval. No request fields are required; any supplied body is ignored."
        payload = (input or DeviceAuthorizeInput()).model_dump(
            mode="json", by_alias=True, exclude_unset=True
        )
        return self._transport.request(_OP_DEVICE_AUTHORIZE, payload)

    def token(self, input: DeviceTokenInput) -> RawResponse[models.DeviceTokenResponse]:
        "Exchange device code or refresh token\n\nExchanges an authorized device code or a refresh token for an access token and rotating refresh token. Accepts JSON and form-encoded bodies. While polling, wait at least interval seconds and increase the interval on slow_down. Store the new refresh token after every successful grant.\n\nThis SDK method sends uncompressed JSON (application/json). Other request formats described above apply to direct HTTP requests."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_DEVICE_TOKEN, payload)


class SyncRawAuthResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport
        self.device = SyncRawAuthDeviceResource(transport)

    def begin_invitation_sso(
        self, input: BeginInvitationSsoInput
    ) -> RawResponse[models.OrganizationAuthenticationRedirect]:
        "Sign in with invitation SSO\n\nReturns an authentication URL for the organization SSO connection associated with the supplied invitation token. Supply token and returnTo. Complete the returned authentication flow; requesting its URL does not itself accept the invitation."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_BEGIN_INVITATION_SSO, payload)

    def begin_organization_authentication(
        self, input: BeginOrganizationAuthenticationInput
    ) -> RawResponse[models.OrganizationAuthenticationRedirect]:
        "Sign in with organization SSO\n\nReturns a URL to authenticate through the selected organization’s current SSO connection. Supply returnTo and open the returned URL to continue the flow. Receiving the URL does not establish an authenticated session."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_BEGIN_ORGANIZATION_AUTHENTICATION, payload)

    def begin_organization_closure_authentication(
        self, input: BeginOrganizationClosureAuthenticationInput
    ) -> RawResponse[models.OrganizationAuthenticationRedirect]:
        "Sign in to close organization\n\nReturns an authentication URL for the current organization owner to inspect organization closure. Supply returnTo and complete the returned flow. This operation initiates authentication and does not close the organization."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_BEGIN_ORGANIZATION_CLOSURE_AUTHENTICATION, payload)

    def begin_organization_sso_admission(
        self, input: BeginOrganizationSsoAdmissionInput
    ) -> RawResponse[models.OrganizationAuthenticationRedirect]:
        "Begin organization SSO admission\n\nReturns an SSO admission URL for an existing account and the selected organization. Supply returnTo for the continuation URL. Admission requires completing the returned authentication flow; creating the URL does not itself grant membership."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_BEGIN_ORGANIZATION_SSO_ADMISSION, payload)

    def create_organization_sso_portal_link(
        self, input: CreateOrganizationSsoPortalLinkInput
    ) -> RawResponse[models.CreateOrganizationSsoPortalLinkResponse]:
        "Create organization setup portal link\n\nReturns an organization setup portal URL. Supply returnTo and optionally intent, either sso or domain_verification; sso is the default. Open the returned URL to complete the selected setup flow."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_ORGANIZATION_SSO_PORTAL_LINK, payload)

    def disable_organization_sso(
        self, input: DisableOrganizationSsoInput
    ) -> RawResponse[models.OrganizationSsoConfiguration]:
        "Disable organization SSO\n\nDeletes the provider connection, releases the SSO requirement once the connection is gone, then unbinds the chosen domains. Retry with the same Idempotency-Key to resume or await the same run."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_DISABLE_ORGANIZATION_SSO, payload)

    def get_organization_connection_status(
        self, input: GetOrganizationConnectionStatusInput
    ) -> RawResponse[models.OrganizationConnectionStatus]:
        "Get organization connection status\n\nRequires current human organization membership. Synchronization status does not attest SSO configuration or completed authorization."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_ORGANIZATION_CONNECTION_STATUS, payload)

    def get_organization_sso_configuration(
        self, input: GetOrganizationSsoConfigurationInput
    ) -> RawResponse[models.OrganizationSsoConfiguration]:
        "Get organization SSO configuration\n\nReturns the selected organization’s SSO connection state, configuration version, and desired and effective policy settings. Read policySyncStatus alongside the enforcement fields to distinguish requested settings from synchronized settings."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_ORGANIZATION_SSO_CONFIGURATION, payload)

    def list_oauth_scopes(
        self, input: ListOauthScopesInput | None = None
    ) -> RawResponse[models.ListOauthScopesResponse]:
        "List OAuth scopes\n\nLists the business permissions available to OAuth applications."
        payload = (input or ListOauthScopesInput()).model_dump(
            mode="json", by_alias=True, exclude_unset=True
        )
        return self._transport.request(_OP_LIST_OAUTH_SCOPES, payload)

    def refresh_organization_sso_connection(
        self, input: RefreshOrganizationSsoConnectionInput
    ) -> RawResponse[models.OrganizationSsoConfiguration]:
        "Refresh organization SSO connection\n\nRefreshes the selected organization’s SSO connection and returns its current connection state, configuration version and policy synchronization status. This operation takes no request body."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_REFRESH_ORGANIZATION_SSO_CONNECTION, payload)

    def retry_organization_connection_sync(
        self, input: RetryOrganizationConnectionSyncInput
    ) -> RawResponse[models.OrganizationConnectionStatus]:
        "Retry organization connection sync\n\nReconciles existing local intent. Takes no body and cannot change membership, roles or authentication policy."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_RETRY_ORGANIZATION_CONNECTION_SYNC, payload)

    def start_enterprise_login(
        self, input: StartEnterpriseLoginInput
    ) -> RawResponse[models.StartEnterpriseLoginResponse]:
        "Start company sign-in\n\nReturns a sign-in URL without requiring an existing account: the company SSO connection when the target has a ready connection, otherwise ordinary account login. Supply one documented enrollment variant: organizationId with returnTo (optionally invitationToken), invitationToken with returnTo, or retryToken. Open the returned URL to continue authentication; receiving a URL does not complete sign-in. This is a browser flow: the request must come from an allowed Origin, and the retryToken variant also needs the retry cookie set by the failed sign-in, so send it with credentials."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_START_ENTERPRISE_LOGIN, payload)

    def update_organization_sso_policy(
        self, input: UpdateOrganizationSsoPolicyInput
    ) -> RawResponse[models.OrganizationSsoConfiguration]:
        "Update organization SSO policy\n\nUpdates whether SSO can admit new members automatically using ssoJitEnabled and the current expectedVersion. Returns the organization’s SSO configuration and policy synchronization status; a successful response does not mean every desired policy setting has finished synchronizing."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_UPDATE_ORGANIZATION_SSO_POLICY, payload)


class SyncRawOrganizationsBillingResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport

    def change_plan(
        self, input: ChangePlanInput
    ) -> RawResponse[models.TerminalBillingOperation | models.PendingBillingOperation]:
        "Change plan\n\nPurchases or changes the selected project's plan for the supplied category and planCode. A 202 response means the change is pending: poll the returned operation URL and honor Retry-After until it succeeds or fails. A 200 response means the idempotency key resolved to an operation that is already terminal; inspect that result rather than assuming success from the status code alone. Supply the required Idempotency-Key header. Supply both organizationId and projectId to select the project within its organization."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CHANGE_PLAN, payload)

    def create_organization_payment_method_checkout(
        self, input: CreateOrganizationPaymentMethodCheckoutInput
    ) -> RawResponse[models.CreateOrganizationPaymentMethodCheckoutResponse]:
        "Create payment method checkout\n\nReturns a hosted payment-method collection URL for the selected organization. An Idempotency-Key header is optional; supply one to make retries safe. Complete the returned checkout flow. Receiving the URL does not mean a card has been saved; check payment-method status afterward."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_ORGANIZATION_PAYMENT_METHOD_CHECKOUT, payload)

    def create_organization_setup_intent(
        self, input: CreateOrganizationSetupIntentInput
    ) -> RawResponse[models.CreateOrganizationSetupIntentResponse]:
        "Create card setup intent\n\nCreates payment-provider configuration for collecting a card for the selected organization and returns clientSecret and publishableKey. Supply the required Idempotency-Key header. Complete the provider’s card-collection flow separately and avoid logging the returned client secret."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_ORGANIZATION_SETUP_INTENT, payload)

    def get_effective_terms(
        self, input: GetEffectiveTermsInput
    ) -> RawResponse[models.GetEffectiveTermsResponse]:
        "Get the project's effective billing terms\n\nReturns what the selected project is billed on now, per category it holds: the plan as its subscription has it, with any override applied, each fixed charge at the subscription's price and quantity, and resolved entitlements; where the plan comes from; how invoices are paid; the current period and next billing date; and any downgrade or cancellation waiting for the period end. It also returns the credit the paying organization holds on credit notes, such as the unused time of a plan an upgrade replaced; it offsets that organization's next invoices. Supply both organizationId and projectId; the organization must pay for the project. This operation does not change billing."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_EFFECTIVE_TERMS, payload)

    def get_organization_billing_overview(
        self, input: GetOrganizationBillingOverviewInput
    ) -> RawResponse[models.GetOrganizationBillingOverviewResponse]:
        "Get organization billing overview\n\nReturns the selected organization’s billing subscription and entitlementsVersion. The subscription can be null. Read the returned plan, charges and entitlements to inspect organization billing; this operation does not purchase or change a plan."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_ORGANIZATION_BILLING_OVERVIEW, payload)

    def get_organization_payment_method(
        self, input: GetOrganizationPaymentMethodInput
    ) -> RawResponse[models.GetOrganizationPaymentMethodResponse]:
        "Get organization payment method\n\nReports whether the selected organization has a card on file and returns its documented payment-method metadata. Reading this endpoint does not collect a new card or create a checkout session."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_ORGANIZATION_PAYMENT_METHOD, payload)

    def list_invoices(self, input: ListInvoicesInput) -> RawResponse[models.ListInvoicesResponse]:
        "List invoices\n\nReturns a single page of the selected organization's invoices; invoices with a zero total are excluded. Use the documented invoice fields to inspect each invoice's billing state. Listing invoices does not make a payment or modify a subscription."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_INVOICES, payload)

    def preview_organization_change(
        self, input: PreviewOrganizationChangeInput
    ) -> RawResponse[models.PreviewOrganizationChangeResponse]:
        "Preview an organization billing change\n\nPreviews a fixed-charge quantity change on the selected organization's own subscription, such as SSO. Prices the change by the billing engine exactly as making it would bill it now: dueNow is that invoice, with taxes and the payer's credits applied. A quantity already paid for this period is not billed again, so a purchase after a release can be free. nextCharge is what is charged in advance at the next period start. For a fixed-charge change, pass quote on with the purchase so it is refused if the price or period no longer hold. This operation does not change billing."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_PREVIEW_ORGANIZATION_CHANGE, payload)

    def preview_project_change(
        self, input: PreviewProjectChangeInput
    ) -> RawResponse[models.PreviewProjectChangeResponse]:
        "Preview a project billing change\n\nPreviews a change on the selected project's subscription in the supplied category: a fixed-charge quantity change, or a plan change with the held fixed charges it carries over. Prices the change by the billing engine exactly as making it would bill it now: dueNow is that invoice, with taxes and the payer's credits applied. A quantity already paid for this period is not billed again, so a purchase after a release can be free. nextCharge is what is charged in advance at the next period start. For a fixed-charge change, pass quote on with the purchase so it is refused if the price or period no longer hold. This operation does not change billing. An upgrade bills the replaced plan's usage to date and the new plan from now, less the replaced plan's unused time; planChange says when it applies and which held fixed charges the target does not sell: released first for a change that applies now, released with a downgrade when it applies. additions quotes what is added once an upgrade applies, each billed when it is added, in planChange.additions and outside dueNow. Supply both organizationId and projectId; the organization must pay for the project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_PREVIEW_PROJECT_CHANGE, payload)


class SyncRawOrganizationsProjectsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport

    def check_project_slug_availability(
        self, input: CheckProjectSlugAvailabilityInput
    ) -> RawResponse[models.CheckProjectSlugAvailabilityResponse]:
        "Check project slug availability\n\nReports whether createProject would accept `slug` right now. Advisory: only the create itself allocates, so a caller must still handle SLUG_TAKEN. A malformed slug is rejected on shape; a reserved slug, a slug held by an active project, and a slug retired with a deleted project each answer `available: false` with a reason."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CHECK_PROJECT_SLUG_AVAILABILITY, payload)

    def count(self, input: CountProjectsInput) -> RawResponse[models.ProjectCount]:
        "Count projects\n\nCounts the projects the same filter would list. The count is read from the primary, so it is authoritative rather than replica-lagged."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_COUNT_PROJECTS, payload)

    def create(self, input: CreateProjectInput) -> RawResponse[models.Project]:
        "Create project\n\nCreates in the authorized organization. In addition to account credentials, explicitly granted Service Identity API keys and M2M tokens may create projects. Project API keys cannot create projects. Creator and private credential evidence come only from the trusted authorization context. The caller-selected slug is immutable, must be 3 to 63 lowercase ASCII alphanumerics separated by single hyphens, and cannot be reserved or held by any active or deleted project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_PROJECT, payload)

    def get_project_closure_status(
        self, input: GetProjectClosureStatusInput
    ) -> RawResponse[models.GetProjectClosureStatusResponse]:
        "Get project closure status\n\nReturns closure progress for projectId within organizationId, including deletionOperationId, domain progress and ready. This read operation does not initiate deletion."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_GET_PROJECT_CLOSURE_STATUS, payload)

    def list(self, input: ListProjectsInput) -> RawResponse[models.ProjectPage]:
        "List projects\n\nReturns a cursor-paginated page of the active projects in organizationId. Filter using query and the documented creation-time bounds, and navigate with pageSize and pageToken. Project roles are not returned and role is not a supported filter."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_LIST_PROJECTS, payload)


class SyncRawOrganizationsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport
        self.billing = SyncRawOrganizationsBillingResource(transport)
        self.projects = SyncRawOrganizationsProjectsResource(transport)


class SyncRawAccountResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport

    def commit_profile_picture(
        self, input: CommitAccountProfilePictureInput
    ) -> RawResponse[models.Account]:
        "Commit profile picture\n\nCommits a profile picture previously uploaded through createAccountProfilePictureUpload. Call this only after the direct multipart upload succeeds, using the uploadId from the same upload session and a stable Idempotency-Key. The service validates the temporary object's ownership, size, content type, image bytes, dimensions, encryption, and age before changing the Account."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_COMMIT_ACCOUNT_PROFILE_PICTURE, payload)

    def confirm_phone_verification(
        self, input: ConfirmAccountPhoneVerificationInput
    ) -> RawResponse[models.Account]:
        "Confirm phone verification\n\nBinds the number once the code is approved. Repeat calls return the bound Account."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CONFIRM_ACCOUNT_PHONE_VERIFICATION, payload)

    def create_account_service_key(
        self, input: CreateAccountServiceKeyInput
    ) -> RawResponse[models.CreateAccountServiceKeyResponse]:
        "Create Account Service Key\n\nCreates a service key for the authenticated account with the supplied name and optional expiresAt. Returns key metadata and a one-time credential; store the credential securely because it cannot be retrieved through the listing endpoint. These credentials act as the account and must not be distributed as project-scoped keys. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_ACCOUNT_SERVICE_KEY, payload)

    def create_profile_picture_upload(
        self, input: CreateAccountProfilePictureUploadInput
    ) -> RawResponse[models.ProfilePictureUpload]:
        "Create profile picture upload\n\nCreates a ten-minute, Account-bound presigned S3 POST for a JPEG, PNG, or WebP profile picture up to 5 MiB. Copy every returned formFields entry into a multipart/form-data request to uploadUrl, append the local file as the final form part, and upload it directly without sending Photon credentials. After the upload succeeds, call commitAccountProfilePicture with the returned uploadId. Do not cache or log the upload URL or form fields."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_ACCOUNT_PROFILE_PICTURE_UPLOAD, payload)

    def delete(self, input: DeleteAccountInput | None = None) -> RawResponse[models.Account]:
        "Delete account\n\nDeletes the authenticated account and returns its account tombstone. The operation is rejected while the account still owns organizations; transfer or close those organizations before retrying. This endpoint acts on the caller's account and does not accept another account's identifier."
        payload = (input or DeleteAccountInput()).model_dump(
            mode="json", by_alias=True, exclude_unset=True
        )
        return self._transport.request(_OP_DELETE_ACCOUNT, payload)

    def get(self, input: GetAccountInput | None = None) -> RawResponse[models.Account]:
        "Get account\n\nReturns the profile of the authenticated account. The account is selected from the credential rather than a request parameter. A missing or deleted account is reported as an error instead of an empty profile."
        payload = (input or GetAccountInput()).model_dump(
            mode="json", by_alias=True, exclude_unset=True
        )
        return self._transport.request(_OP_GET_ACCOUNT, payload)

    def list_account_service_keys(
        self, input: ListAccountServiceKeysInput | None = None
    ) -> RawResponse[models.ListAccountServiceKeysResponse]:
        "List Account Service Keys\n\nReturns metadata for the authenticated account's unrevoked service keys, including expired keys, ordered newest first. Secret values are not returned; a key's credential is disclosed only when that key is created."
        payload = (input or ListAccountServiceKeysInput()).model_dump(
            mode="json", by_alias=True, exclude_unset=True
        )
        return self._transport.request(_OP_LIST_ACCOUNT_SERVICE_KEYS, payload)

    def list_authorized_applications(
        self, input: ListAuthorizedApplicationsInput | None = None
    ) -> RawResponse[models.ListAuthorizedApplicationsResponse]:
        "List connected applications\n\nLists the OAuth applications authorized by the authenticated user."
        payload = (input or ListAuthorizedApplicationsInput()).model_dump(
            mode="json", by_alias=True, exclude_unset=True
        )
        return self._transport.request(_OP_LIST_AUTHORIZED_APPLICATIONS, payload)

    def reset_profile_picture(
        self, input: ResetAccountProfilePictureInput
    ) -> RawResponse[models.Account]:
        "Remove profile picture\n\nRemoves the authenticated account's custom profile picture and returns the account using its default picture. This operation does not upload a replacement; use the upload-and-commit operations when setting a new custom picture. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_RESET_ACCOUNT_PROFILE_PICTURE, payload)

    def revoke_account_service_key(
        self, input: RevokeAccountServiceKeyInput
    ) -> RawResponse[models.RevokeAccountServiceKeyResponse]:
        "Revoke Account Service Key\n\nRevokes the account-owned service key identified by serviceKeyId and returns its revoked metadata. Repeating the revocation is stable. Revocation changes the credential's validity; it does not create a replacement key. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_REVOKE_ACCOUNT_SERVICE_KEY, payload)

    def revoke_authorized_application(
        self, input: RevokeAuthorizedApplicationInput
    ) -> RawResponse[None]:
        "Revoke connected application\n\nRevokes the authenticated user's grant for one OAuth application."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_REVOKE_AUTHORIZED_APPLICATION, payload)

    def start_phone_verification(
        self, input: StartAccountPhoneVerificationInput
    ) -> RawResponse[models.StartAccountPhoneVerificationResponse]:
        "Start phone verification\n\nSends an SMS code. Answers CAPTCHA_REQUIRED with the widget to render when no solved challenge accompanies the request; retry with the returned challengeContext and a token. Rate limited per account, per destination number, and globally; a rejection carries Retry-After."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_START_ACCOUNT_PHONE_VERIFICATION, payload)

    def update(self, input: UpdateAccountInput) -> RawResponse[models.Account]:
        "Update account\n\nUpdates the supplied firstName and lastName fields on the authenticated account and returns the updated profile. Only the documented profile fields can be changed through this endpoint; profile-picture uploads and phone-number verification use their dedicated operations. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_UPDATE_ACCOUNT, payload)


class SyncRawSystemResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport

    def create_app_installation_request(
        self, input: CreateAppInstallationRequestInput
    ) -> RawResponse[models.CreateAppInstallationRequestResponse]:
        "Request app installation\n\nAuthenticates a registered app backend using a short-lived signed client assertion. Creates request metadata only; customer approval is still required."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_CREATE_APP_INSTALLATION_REQUEST, payload)

    def redeem_app_installation_delivery(
        self, input: RedeemAppInstallationDeliveryInput
    ) -> RawResponse[models.RedeemAppInstallationDeliveryResponse]:
        "Redeem installation credential\n\nThe registered app backend authenticates with a signed client assertion and a single-use code. Plaintext is returned only once; retries return status and never create another credential."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return self._transport.request(_OP_REDEEM_APP_INSTALLATION_DELIVERY, payload)


class SyncProjectsPlatformsImessageAssignmentsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawProjectsPlatformsImessageAssignmentsResource(transport)

    def create(self, input: CreateSharedLineAssignmentInput) -> models.SharedLineAssignment:
        "Create shared line assignment\n\nMaps an end user's iMessage handle — an E.164 phone number or an email address — onto one of the project's pooled shared iMessage lines, consuming a seat from the project's entitlement. The assigned number is allocated by the server. When an email address is supplied in `email` the user is sent an invite asynchronously to that address; it is never inferred from the handle, and the response never reports whether the send succeeded. Requires the platforms:write permission bound to the project resource in the path."
        return (self._raw_resource.create(input)).data

    def get(self, input: GetSharedLineAssignmentInput) -> models.SharedLineAssignment:
        "Get shared line assignment\n\nReads one shared line assignment. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.get(input)).data

    def list(self, input: ListSharedLineAssignmentsInput) -> models.SharedLineAssignmentPage:
        "List shared line assignments\n\nLists the project's shared line assignments, oldest first. Released assignments are excluded unless includeReleased is set. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.list(input)).data

    def release(self, input: ReleaseSharedLineAssignmentInput) -> models.SharedLineAssignment:
        "Release shared line assignment\n\nReleases a shared line assignment, freeing both its seat and its handle for reassignment. The row is retained for audit and returned with releasedAt set, so repeating the call is safe. Requires the platforms:write permission bound to the project resource in the path."
        return (self._raw_resource.release(input)).data


class SyncProjectsPlatformsImessageResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawProjectsPlatformsImessageResource(transport)
        self.assignments = SyncProjectsPlatformsImessageAssignmentsResource(transport)


class SyncProjectsPlatformsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawProjectsPlatformsResource(transport)
        self.imessage = SyncProjectsPlatformsImessageResource(transport)

    def assign_sms_line_campaign(self, input: AssignSmsLineCampaignInput) -> models.Operation:
        "Assign or replace SMS line campaign\n\nAttach a ready campaign from this project’s organization to its line. Requires platforms:write for the project; human and machine actors retain their authenticated identity. Requires a permanent Idempotency-Key and the current assignment version. Provider provisioning runs asynchronously."
        return (self._raw_resource.assign_sms_line_campaign(input)).data

    def assign_voice_line_profile(
        self, input: AssignVoiceLineProfileInput
    ) -> models.VoiceLineProfileAssignment:
        "Assign Voice line profile\n\nAssigns or replaces a line's explicit additional-profile override when the resource version matches. The current default cannot be assigned explicitly. The pstn_voice ability remains the admission source of truth. Requires platforms:write bound to the path project."
        return (self._raw_resource.assign_voice_line_profile(input)).data

    def batch_update_voice_line_profile_assignments(
        self, input: BatchUpdateVoiceLineProfileAssignmentsInput
    ) -> models.BatchUpdateVoiceLineProfileAssignmentsResponse:
        "Batch update Voice line assignments\n\nAtomically sets additional-profile overrides or switches lines back to the project default for up to 100 Voice-capable lines. A null profileId means use the default. Every expected resource version must match or no line changes. Requires platforms:write bound to the path project."
        return (self._raw_resource.batch_update_voice_line_profile_assignments(input)).data

    def cancel_operation(self, input: CancelOperationInput) -> models.Operation:
        "Cancel operation\n\nWithdraws a provision that has not been fulfilled yet. This is an operations action rather than a DELETE, because there is nothing to delete: no resource exists until the work commits. Whether it is accepted depends on the resource type — a dedicated iMessage line may sit waiting on inventory for hours and withdrawing costs nothing, while an SMS number is cancellable during inventory waiting and answers 409 once the workflow commits to its first provider order. Campaign assignment and detachment operations cannot be cancelled in any state. Wait for completion before requesting another change; that new change is not a guaranteed rollback. The output-only `cancellable` field is a snapshot; the cancellation transaction always checks the current phase under a row lock. A cancel that loses the race against the work finishing also answers 409: the resource exists and is billed for, so what you want then is to release it. Nothing is charged for a cancelled provision — billing runs after the work, so there is never anything to refund. Requires the platforms:write permission bound to the project resource in the path."
        return (self._raw_resource.cancel_operation(input)).data

    def configure_voice_profile_outbound(
        self, input: ConfigureVoiceProfileOutboundInput
    ) -> models.ConfigureVoiceProfileOutboundResponse:
        "Configure Voice outbound credential\n\nConfigures a SIP credential for outbound calls from a profile when the shared profile version matches. Outbound calls are paid usage, so the organization needs a payment method and no invoices overdue 7 days or more; otherwise this returns 402 ENTITLEMENT_REQUIRED with a reason. authentication.algorithm is required: SHA-256 is recommended, while MD5 is a weaker legacy option supported over UDP, TCP, and TLS; TLS is strongly recommended because UDP and TCP do not encrypt SIP signaling. The profileId may identify the default or an additional profile. The new password is returned once and is never recoverable. Requires platforms:write bound to the path project."
        return (self._raw_resource.configure_voice_profile_outbound(input)).data

    def connect_email_domain(self, input: ConnectEmailDomainInput) -> models.Operation:
        "Connect email domain\n\nReserves a normalized DNS domain and starts its durable email-provider setup. The accepted provision consumes one email-domain entitlement slot until it fails, is cancelled, or becomes a live resource; the plan's email.max_email_domains value sets the project limit. The customer resource does not exist until provider identity and DNS setup reach READY; poll the returned operation for progress. A domain may have only one unfinished provision or live resource globally. Email domains have no additional per-domain charge. The Idempotency-Key is required and permanent: replaying the same key and canonical domain returns the original operation forever. Requires the platforms:write permission bound to the project resource in the path."
        return (self._raw_resource.connect_email_domain(input)).data

    def connect_telegram_bot(self, input: ConnectTelegramBotInput) -> models.Operation:
        "Connect Telegram bot\n\nStarts a free managed Telegram bot connection. Each project may have one unfinished Telegram provision, including user interaction and failure cleanup. A different Idempotency-Key while one is active returns 409 TELEGRAM_PROVISION_IN_PROGRESS with its operationId and operationUrl; resume it, cancel it while cancellation is available, or wait for it to finish. Rejected keys remain reusable. Open detail.setupUrl to connect an existing managed bot or create a new one with the project's default agent name or a custom display name, then poll Location. The link remains usable while the operation is active and never expires. Replaying the same Idempotency-Key returns the original operation, even after completion or while a newer setup is active. POST, GET and list share the same operation details. The API includes detail.setupUrl only for callers with platforms:write for the project; read-only callers receive the other details unchanged."
        return (self._raw_resource.connect_telegram_bot(input)).data

    def connect_whatsapp_business(self, input: ConnectWhatsappBusinessInput) -> models.Operation:
        "Connect WhatsApp Business\n\nExchanges the authorization code Embedded Signup returned and connects exactly the selected phone number as one `whatsapp_sender`. Send the WABA id and phone-number id emitted by the same popup attempt; both are treated as selectors and verified against Meta before use. A selected number that matches a non-retired, same-project `voip_line` is linked to it; a number absent from Photon inventory stays unbound; a matching non-retired `cosmos_line`, foreign VoIP line or unassigned VoIP line fails the operation before registration. Connecting is free — no plan requirement — but Billing must report the project's organization as ready with a payment method on file. The Idempotency-Key is required and permanent: replaying the same key returns the original operation forever. Requires the platforms:write permission bound to the project resource in the path."
        return (self._raw_resource.connect_whatsapp_business(input)).data

    def count_filtered_verification_codes(
        self, input: CountFilteredVerificationCodesInput
    ) -> models.FilteredVerificationCodeCount:
        "Count filtered verification codes\n\nCounts the verification codes Photon kept from this project's dedicated lines and numbers, optionally for one `platform`. Without `receivedAfter` and `receivedBefore` the window is the 30 days before the request; a window longer than 366 days is rejected. The response echoes the window it resolved, so the number always says which period it covers. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.count_filtered_verification_codes(input)).data

    def count_resource_filtered_verification_codes(
        self, input: CountResourceFilteredVerificationCodesInput
    ) -> models.FilteredVerificationCodeCount:
        "Count a line's filtered verification codes\n\nCounts the verification codes Photon kept from one dedicated line or number. Without `receivedAfter` and `receivedBefore` the window is the 30 days before the request; a window longer than 366 days is rejected. The response echoes the window it resolved, so the number always says which period it covers. Answers 404 unless the project holds the resource now. Codes from an earlier tenure stay in the project-wide list. Filter by `platform` — a number receives both SMS and WhatsApp. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.count_resource_filtered_verification_codes(input)).data

    def create_default_voice_profile(
        self, input: CreateDefaultVoiceProfileInput
    ) -> models.VoiceProfile:
        "Create default Voice profile\n\nCreates the project default Voice profile when absent. An identical replay returns the existing default without changing its version; a different existing default conflicts. Direction configuration is managed separately. Requires platforms:write bound to the path project."
        return (self._raw_resource.create_default_voice_profile(input)).data

    def create_voice_profile(self, input: CreateVoiceProfileInput) -> models.VoiceProfile:
        "Create Voice profile\n\nCreates a direction-neutral additional Voice profile. The project default must already exist. Requires platforms:write bound to the path project."
        return (self._raw_resource.create_voice_profile(input)).data

    def create_whatsapp_shared_line_assignment(
        self, input: CreateWhatsappSharedLineAssignmentInput
    ) -> models.SharedLineAssignment:
        "Create WhatsApp shared line assignment\n\nMaps an end user's phone number onto one of the project's pooled shared WhatsApp lines, consuming a seat from the project's WhatsApp entitlement. The assigned number is allocated by the server. When an email address is supplied the user is sent an invite asynchronously; the response never reports whether that succeeded. Requires the platforms:write permission bound to the project resource in the path."
        return (self._raw_resource.create_whatsapp_shared_line_assignment(input)).data

    def create_whatsapp_voip_sender(self, input: CreateWhatsappVoipSenderInput) -> models.Operation:
        "Create WhatsApp VoIP sender\n\nRegisters an active, SMS-capable Photon VoIP line on this project's connected WhatsApp Business Account. The account is resolved server-side; callers never select a WABA. The platform creates or reuses the Meta number, requests and consumes the SMS ownership code internally, verifies it, and registers the sender. displayName is optional; when omitted the project agent profile name is snapshotted before acceptance. The VoIP line remains a separate resource and never receives the whatsapp_business ability."
        return (self._raw_resource.create_whatsapp_voip_sender(input)).data

    def delete_voice_profile(self, input: DeleteVoiceProfileInput) -> None:
        "Delete Voice profile\n\nDeletes an additional profile when expectedVersion matches. Assigned profiles require force=true, which atomically removes every stored override so affected lines follow the default. The default can never be deleted. Requires platforms:write bound to the path project."
        return (self._raw_resource.delete_voice_profile(input)).data

    def delete_voice_profile_inbound(
        self, input: DeleteVoiceProfileInboundInput
    ) -> models.VoiceProfileInboundConfiguration:
        "Delete Voice inbound configuration\n\nRemoves a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. The profile and its line assignments remain. Requires platforms:write bound to the path project."
        return (self._raw_resource.delete_voice_profile_inbound(input)).data

    def delete_voice_profile_outbound(
        self, input: DeleteVoiceProfileOutboundInput
    ) -> models.DeleteVoiceProfileOutboundResponse:
        "Revoke Voice outbound credential\n\nRevokes outbound calling for a profile when the shared profile version matches. The profileId may identify the default or an additional profile. The profile, inbound destination, and line assignments remain. Requires platforms:write bound to the path project."
        return (self._raw_resource.delete_voice_profile_outbound(input)).data

    def disconnect_whatsapp_business_account(
        self, input: DisconnectWhatsappBusinessAccountInput
    ) -> models.Operation:
        "Disconnect WhatsApp Business account\n\nDisconnects every attached WhatsApp sender, then unsubscribes our app and removes the project's business account connection. Photon VoIP lines and the numbers in Meta remain. Requires Idempotency-Key. Poll the returned operation; provider refusals appear as operation failures and retain the account for retry with a new key. New signups are blocked while disconnecting, and existing provisions must finish before this request can be accepted."
        return (self._raw_resource.disconnect_whatsapp_business_account(input)).data

    def get_default_voice_profile(self, input: GetDefaultVoiceProfileInput) -> models.VoiceProfile:
        "Get default Voice profile\n\nGets the profile currently selected as the project default, including its optional inbound delivery state. Requires platforms:read bound to the path project."
        return (self._raw_resource.get_default_voice_profile(input)).data

    def get_imessage(
        self, input: GetProjectImessagePlatformInput
    ) -> models.ProjectPlatformSettings:
        "Get project iMessage platform\n\nReports whether the project is on shared or dedicated iMessage lines, derived from its billing entitlements. Shared mode carries the seat cap. Both say whether a dedicated line requested now would be assigned without waiting. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.get_imessage(input)).data

    def get_operation(self, input: GetOperationInput) -> models.GetOperationResponse:
        "Get operation\n\nReads one operation using the same operation representation as creation and list. The API includes detail.setupUrl only with platforms:write for this project. This is the polling endpoint every asynchronous request here points its Location at, and it resolves from the moment that request is accepted — an operation is committed before its work is dispatched, so there is no window in which the URL 404s. Poll until `state` is one of `succeeded`, `failed` or `cancelled`, pacing from the Retry-After the accepting response returned. While an email domain waits for DNS, `detail` always contains the manual records and may additionally contain `automaticSetup` with a signed provider URL to open separately. Once the operation has produced a resource, the response carries that resource too, so the poll that finishes is also the one that tells you what you got. `succeeded` means the work is done; billing runs behind it and is not something the caller waits on. Operations are never purged, so a 404 means the id was never this project's. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.get_operation(input)).data

    def get_project_whatsapp_platform(
        self, input: GetProjectWhatsappPlatformInput
    ) -> models.ProjectPlatformSettings:
        "Get project WhatsApp platform\n\nReports whether the project is on shared or dedicated WhatsApp lines, derived from its billing entitlements. Shared mode carries the seat cap. Both say whether a dedicated line requested now would be assigned without waiting. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.get_project_whatsapp_platform(input)).data

    def get_resource(self, input: GetResourceInput) -> models.Resource:
        "Get resource\n\nReads one resource the project holds. A released number stays readable and reads `retired`, because it remains part of this project's history. A dedicated line given back does NOT: returning it to inventory is what makes it claimable by someone else, so it answers 404 and the operation that returned it is the record that this project once held it. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.get_resource(input)).data

    def get_sms_line_campaign_assignment(
        self, input: GetSmsLineCampaignAssignmentInput
    ) -> models.GetSmsLineCampaignAssignmentResponse:
        "Get SMS line campaign assignment\n\nRead the last confirmed campaign and current eligibility. Follow changes through their operations. Eligibility is a control-plane assessment, not a delivery or recipient-consent guarantee."
        return (self._raw_resource.get_sms_line_campaign_assignment(input)).data

    def get_voice_line_profile_assignment(
        self, input: GetVoiceLineProfileAssignmentInput
    ) -> models.VoiceLineProfileAssignment:
        "Get Voice line profile assignment\n\nGets the explicit additional-profile override for an owned Voice-capable line. A line following the project default returns 200 without profileId. Requires platforms:read bound to the path project."
        return (self._raw_resource.get_voice_line_profile_assignment(input)).data

    def get_voice_profile(self, input: GetVoiceProfileInput) -> models.VoiceProfile:
        "Get Voice profile\n\nGets one reusable Voice profile, including its optional inbound delivery state. Requires platforms:read bound to the path project."
        return (self._raw_resource.get_voice_profile(input)).data

    def get_whatsapp_business_account(
        self, input: GetWhatsappBusinessAccountInput
    ) -> models.WhatsappBusinessAccount:
        "Get WhatsApp Business account\n\nGets the one WhatsApp Business Account this project has connected, with its number of live senders. Senders are resources and are listed by GET /platforms/resources?ability=whatsapp_business. The account is not a resource and carries no access token. Meta's retained numbers are listed separately by GET /platforms/whatsapp-business/account/phone-numbers. `subscribedAt` is absent until our app is attached to the account's webhooks. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.get_whatsapp_business_account(input)).data

    def get_whatsapp_business_verification_code(
        self, input: GetWhatsappBusinessVerificationCodeInput
    ) -> models.GetWhatsappBusinessVerificationCodeResponse:
        "Get WhatsApp Business verification code\n\nReturns the latest six-digit WhatsApp Business ownership code received by SMS for an active Photon VOIP number, but only when its provider timestamp is strictly newer than the required receivedAfter boundary. receivedAfter must be an RFC 3339 timestamp between this request's arrival time and two minutes before it; once it expires, restart Meta's verification flow with a new boundary. A missing newer code is a retryable 404 with Retry-After: 2. Poll after 2, 4, 8, then 10 seconds, applying ±20% jitter and capping later intervals at 10 seconds. Stop when the original boundary is two minutes old. Responses are never cached. Requires the platforms:write permission bound to the project resource in the path."
        return (self._raw_resource.get_whatsapp_business_verification_code(input)).data

    def get_whatsapp_shared_line_assignment(
        self, input: GetWhatsappSharedLineAssignmentInput
    ) -> models.SharedLineAssignment:
        "Get WhatsApp shared line assignment\n\nReads one WhatsApp shared line assignment. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.get_whatsapp_shared_line_assignment(input)).data

    def get_whatsapp_signup_config(
        self, input: GetWhatsappSignupConfigInput
    ) -> models.GetWhatsappSignupConfigResponse:
        "Get WhatsApp signup config\n\nReturns what the browser needs to open Meta's Embedded Signup popup: the Facebook Login for Business configuration id, the Graph version to run against, and the scopes it will request. Answered in-process rather than forwarded, so the first step of onboarding survives an outage of the private service. Pass `configId` to `FB.login` as `config_id` with `response_type: 'code'` and `override_default_response_type: true`. Do NOT add a `featureType` — omitting it is what keeps the phone-number screen in the flow, and `only_waba_sharing` produces an account with no number that cannot be provisioned. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.get_whatsapp_signup_config(input)).data

    def list_filtered_verification_codes(
        self, input: ListFilteredVerificationCodesInput
    ) -> models.FilteredVerificationCodePage:
        "List filtered verification codes\n\nLists the verification codes Photon kept from this project's dedicated lines and numbers. Inbound messages that carry a one-time code are filtered before delivery; this is the record that they arrived, so a quiet line can be told apart from a broken one. It records the receiving line, its platform and when the code arrived — never the code itself. Each entry names the dedicated line or number (`resourceId`) that received it. Newest first, within an optional inclusive `receivedAfter`/`receivedBefore` window. A page may hold fewer than `pageSize` entries and still return a `nextPageToken`; only its absence means the end. Filter by `platform`; to read one line, use its own filtered-otp path. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.list_filtered_verification_codes(input)).data

    def list_number_area_codes(
        self, input: ListNumberAreaCodesInput
    ) -> models.ListNumberAreaCodesResponse:
        "List number area codes\n\nLists current provider coverage for US local numbers, sorted and deduplicated. Coverage does not guarantee inventory carrying every required feature. New area-specific purchases must use a listed code; accepted purchases keep waiting if coverage later changes. Requires platforms:read for the path project."
        return (self._raw_resource.list_number_area_codes(input)).data

    def list_number_countries(
        self, input: ListNumberCountriesInput
    ) -> models.ListNumberCountriesResponse:
        "List number countries\n\nLists supported purchase countries independently of current provider inventory. Requires platforms:read for the path project."
        return (self._raw_resource.list_number_countries(input)).data

    def list_operations(self, input: ListOperationsInput) -> models.OperationPage:
        "List operations\n\nLists the project's operations using the same operation representation as creation and GET. The API includes detail.setupUrl only with platforms:write for this project. Results are oldest first — every provision and release it has ever asked for, including the ones still running. This is the entire in-flight view: a resource only appears once it is real, so nothing half-built shows up in the resource list and nothing in flight is missing from this one. Filter by `resourceId` to get one resource's whole history, which for a pooled line is every tenure this project has had on it. `state` is comma-separated; `type` accepts one operation type and an absent filter means everything, including failed and cancelled operations. `endedAfter` keeps only operations that finished after that instant, so what failed or was withdrawn recently is one short page. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.list_operations(input)).data

    def list_project_platforms(
        self, input: ListProjectPlatformsInput
    ) -> models.ListProjectPlatformsResponse:
        "List project platforms\n\nLists the platform types available to this project. Every project currently sees the same fixed public contract, answered in-process rather than forwarded, so the list survives an outage of the private service. The project binding exists so that answer can narrow per project without moving the route. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.list_project_platforms(input)).data

    def list_resource_filtered_verification_codes(
        self, input: ListResourceFilteredVerificationCodesInput
    ) -> models.FilteredVerificationCodePage:
        "List a line's filtered verification codes\n\nLists the verification codes Photon kept from one dedicated line or number. Inbound messages that carry a one-time code are filtered before delivery; this is the record that they arrived, so a quiet line can be told apart from a broken one. It records the receiving line, its platform and when the code arrived — never the code itself. Each entry names the dedicated line or number (`resourceId`) that received it. Newest first, within an optional inclusive `receivedAfter`/`receivedBefore` window. A page may hold fewer than `pageSize` entries and still return a `nextPageToken`; only its absence means the end. Answers 404 unless the project holds the resource now. Codes from an earlier tenure stay in the project-wide list. Filter by `platform` — a number receives both SMS and WhatsApp. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.list_resource_filtered_verification_codes(input)).data

    def list_resources(self, input: ListResourcesInput) -> models.ResourcePage:
        "List resources\n\nLists everything the project holds, oldest first, whatever kind of thing it is — one endpoint and one id shape for numbers, dedicated lines and whatever ships next. Nothing half-built appears here: a resource exists only once it is real, so anything still being provisioned is an operation rather than a resource with a pending flag. Filter by `type`, by `ability` (which matches only abilities that are currently enabled), and by `state` — comma-separated, and absent means every state, including retired ones. `detail` carries a per-type public view: an SMS number's number, a dedicated line's number and its per-capability health (`imessageHealth`, `whatsappHealth`, each with an `overallStatus` of `available`, `degraded`, `unavailable` or `unknown`; `imessageHealth` also carries `account`, `photonSystemComponents`, `newConversations`, `sms` and `mms`, each a `status` with the `cause` that decided it: `account`, `photonSystemComponents`, or null for the item's own state). Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.list_resources(input)).data

    def list_voice_profiles(self, input: ListVoiceProfilesInput) -> models.VoiceProfilePage:
        "List Voice profiles\n\nLists reusable Voice profiles in this project. Requires platforms:read bound to the path project."
        return (self._raw_resource.list_voice_profiles(input)).data

    def list_whatsapp_account_phone_numbers(
        self, input: ListWhatsappAccountPhoneNumbersInput
    ) -> models.ListWhatsappAccountPhoneNumbersResponse:
        "List WhatsApp account phone numbers\n\nLists the connected WABA's phone numbers directly from Meta, including numbers whose Photon sender was disconnected. Ownership is photon for a number in this project's current Photon inventory and meta otherwise. Match a Photon SMS number by its E.164 phoneNumber and reuse its existing displayName when reconnecting. A null name is unavailable, not permission to choose a new name. A failed lookup returns an error rather than an empty list. Requires platforms:read on the path project."
        return (self._raw_resource.list_whatsapp_account_phone_numbers(input)).data

    def list_whatsapp_shared_line_assignments(
        self, input: ListWhatsappSharedLineAssignmentsInput
    ) -> models.SharedLineAssignmentPage:
        "List WhatsApp shared line assignments\n\nLists the project's WhatsApp shared line assignments, oldest first. Released assignments are excluded unless includeReleased is set. Requires the platforms:read permission bound to the project resource in the path."
        return (self._raw_resource.list_whatsapp_shared_line_assignments(input)).data

    def provision_imessage_dedicated_line(
        self, input: ProvisionImessageDedicatedLineInput
    ) -> models.Operation:
        "Provision dedicated iMessage line\n\nClaims one dedicated iMessage line for the project and enables iMessage on it. Always answers 202 with an operation: dedicated lines are allocated from available capacity, and unavailable capacity causes a wait rather than a failure — this can legitimately stay `running` for hours, which is exactly why the response is a handle to poll rather than a number. The project's messaging subscription must grant the dedicated iMessage lines entitlement (`imessage_dedicated_lines.can_purchase`), and that is checked before capacity is reserved. The line's own charge starts when a line is claimed; the subscription that grants the entitlement bills on its own terms, which cancelling a request does not change. Waiting requests are served first come, first served. One that is still waiting is cancelled with a `reason` if the project is deleted (`project_deleted`) or its plan stops selling dedicated lines (`entitlement_lost`); while the payer is restricted for overdue payment it keeps waiting. If you no longer want to wait, POST to the operation's cancel endpoint, which charges nothing for the line. The Idempotency-Key is required and permanent: repeating it returns the same operation forever. A further line always needs a NEW key, including while others are still waiting. Requires the platforms:write permission bound to the project resource in the path."
        return (self._raw_resource.provision_imessage_dedicated_line(input)).data

    def provision_whatsapp_dedicated_line(
        self, input: ProvisionWhatsappDedicatedLineInput
    ) -> models.Operation:
        "Provision dedicated WhatsApp line\n\nProvisions one dedicated WhatsApp line with WhatsApp and shared Voice enabled. It attaches to an eligible iMessage line the project already owns when possible so both products keep the same number; otherwise it claims healthy, available WhatsApp-capable dedicated-line inventory. Always answers 202, because waiting when no inventory is available is not a failure. The product opens its own charge period after the abilities are enabled; Voice has no separate charge. Waiting requests are served first come, first served, and are cancelled with a `reason` exactly as for a dedicated iMessage line. Cancel the returned operation to stop waiting. The Idempotency-Key is required and permanent."
        return (self._raw_resource.provision_whatsapp_dedicated_line(input)).data

    def purchase_sms_number(self, input: PurchaseSmsNumberInput) -> models.Operation:
        "Purchase SMS number\n\nBuys one US local number from the provider and records it as a resource with SMS enabled. Requires countryCode (US) and accepts an optional three-digit geographic areaCode. The server selects an exact matching number. Empty inventory keeps the operation running until a number is available or the caller cancels before ordering begins. Always answers 202 with an operation: the work runs behind the response, and the Location points at the operation to poll. New area-specific requests must appear in current provider coverage; discover it with GET /sms/numbers/area-codes?countryCode=US. Coverage and subscription checks run before operation creation. Billing follows delivery. Replays return the original operation without checking current coverage. The Idempotency-Key is required and permanent: repeating it returns the same operation forever, never a second number. A further number always needs a NEW key, including while others are still running. Requires the platforms:write permission bound to the project resource in the path."
        return (self._raw_resource.purchase_sms_number(input)).data

    def release_imessage_dedicated_line(
        self, input: ReleaseImessageDedicatedLineInput
    ) -> models.Operation:
        "Release dedicated iMessage line\n\nRemoves only iMessage from one dedicated line. Shared Voice is removed only when WhatsApp is absent; if WhatsApp remains, Voice, the resource, ownership, and phone number are preserved. Usually finishes inside this request and answers 200; a slow workflow answers 202 with an operation to poll. Takes no Idempotency-Key because the open iMessage charge period identifies this product tenure."
        return (self._raw_resource.release_imessage_dedicated_line(input)).data

    def release_resource(self, input: ReleaseResourceInput) -> models.Operation:
        "Release resource\n\nGives one resource back, whatever it is. What that means is the resource's own business: an SMS number goes back to the provider and is retired, a dedicated iMessage line goes back to the shared pool and stays in existence for someone else to claim. Either way the provider is contacted first where there is one, then a single transaction disables every ability, ends the project's hold and closes the charge period — so a provider that refuses leaves the resource exactly as it was, still owned and still billed. Usually finishes inside this request and answers 200; if the provider is slow it answers 202 and the Location points at the operation to poll. The decrement runs behind the answer either way, so the resource is gone when you are told it is. Takes no Idempotency-Key — releasing the same resource twice is the same request. Releasing one that is already gone answers 404. Requires the platforms:write permission bound to the project resource in the path."
        return (self._raw_resource.release_resource(input)).data

    def release_whatsapp_dedicated_line(
        self, input: ReleaseWhatsappDedicatedLineInput
    ) -> models.Operation:
        "Release dedicated WhatsApp line\n\nRemoves only WhatsApp from one dedicated line. Shared Voice is removed only when iMessage is absent; if iMessage remains, Voice, the resource, ownership, and phone number are preserved. Usually finishes inside this request and answers 200; a slow workflow answers 202 with an operation to poll. Takes no Idempotency-Key because the open WhatsApp charge period identifies this product tenure."
        return (self._raw_resource.release_whatsapp_dedicated_line(input)).data

    def release_whatsapp_shared_line_assignment(
        self, input: ReleaseWhatsappSharedLineAssignmentInput
    ) -> models.SharedLineAssignment:
        "Release WhatsApp shared line assignment\n\nReleases a WhatsApp shared line assignment, freeing its seat for reassignment. The row is retained for audit and returned with releasedAt set, so repeating the call is safe. Requires the platforms:write permission bound to the project resource in the path."
        return (self._raw_resource.release_whatsapp_shared_line_assignment(input)).data

    def replace_voice_profile_inbound(
        self, input: ReplaceVoiceProfileInboundInput
    ) -> models.VoiceProfileInboundConfiguration:
        "Replace Voice inbound configuration\n\nCreates or fully replaces a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. Credentials are required and nullable; null removes destination authentication. Requires platforms:write bound to the path project."
        return (self._raw_resource.replace_voice_profile_inbound(input)).data

    def rotate_voice_profile_outbound_credential(
        self, input: RotateVoiceProfileOutboundCredentialInput
    ) -> models.RotateVoiceProfileOutboundCredentialResponse:
        "Rotate Voice outbound credential\n\nRotates a SIP profile's outbound credential when expectedVersion matches. The profileId may identify the default or an additional profile. Normal rotation gives the previous credential one hour of grace; emergency rotation gives none. The new password is returned once and is never recoverable. Requires platforms:write bound to the path project."
        return (self._raw_resource.rotate_voice_profile_outbound_credential(input)).data

    def unassign_sms_line_campaign(self, input: UnassignSmsLineCampaignInput) -> models.Operation:
        "Unassign SMS line campaign\n\nAny project writer, including a scoped API key, may detach the campaign. The number and campaign remain owned. Requires a permanent Idempotency-Key and expectedVersion. Local eligibility is blocked immediately; provider detachment runs asynchronously."
        return (self._raw_resource.unassign_sms_line_campaign(input)).data

    def unassign_voice_line_profile(self, input: UnassignVoiceLineProfileInput) -> None:
        "Unassign Voice line profile\n\nRemoves a line's explicit override when the resource version matches so the line follows the project default. Profiles and the pstn_voice ability are unchanged. Requires platforms:write bound to the path project."
        return (self._raw_resource.unassign_voice_line_profile(input)).data

    def update_default_voice_profile(
        self, input: UpdateDefaultVoiceProfileInput
    ) -> models.VoiceProfile:
        "Update default Voice profile\n\nPatches the default profile's protocol or mediaEncryption when expectedVersion matches. Omitted fields are preserved. Its server-assigned name is immutable, and directional configuration uses the profileId returned by this resource. Requires platforms:write bound to the path project."
        return (self._raw_resource.update_default_voice_profile(input)).data

    def update_voice_profile(self, input: UpdateVoiceProfileInput) -> models.VoiceProfile:
        "Update Voice profile\n\nPatches an additional profile's name, protocol, or mediaEncryption when expectedVersion matches. Omitted fields are preserved. Directional configuration is managed through the profile's inbound and outbound endpoints. Requires platforms:write bound to the path project."
        return (self._raw_resource.update_voice_profile(input)).data

    def update_voice_profile_inbound(
        self, input: UpdateVoiceProfileInboundInput
    ) -> models.VoiceProfileInboundConfiguration:
        "Update Voice inbound configuration\n\nUpdates selected fields of a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. At least one of destinationUri or credentials is required. Credential omission preserves destination authentication, null removes it, and an object replaces it atomically. Requires platforms:write bound to the path project."
        return (self._raw_resource.update_voice_profile_inbound(input)).data

    def update_voice_profile_outbound_authentication(
        self, input: UpdateVoiceProfileOutboundAuthenticationInput
    ) -> models.UpdateVoiceProfileOutboundAuthenticationResponse:
        "Update Voice outbound authentication\n\nChanges a SIP profile's outbound Digest algorithm when expectedVersion matches. The profileId may identify the default or an additional profile. This policy-only change preserves the password, username, and any previous-password grace deadline. SHA-256 is recommended; MD5 is a weaker legacy option. Returns non-secret outbound metadata and the profile version. Requires platforms:write bound to the path project."
        return (self._raw_resource.update_voice_profile_outbound_authentication(input)).data


class SyncProjectsAgentProfileResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawProjectsAgentProfileResource(transport)

    def commit_avatar(self, input: CommitAgentProfileAvatarInput) -> models.AgentProfile:
        "Commit agent avatar\n\nCommits an agent avatar previously uploaded through createAgentProfileAvatarUpload. Call this only after the direct multipart upload succeeds, using the uploadId from the same upload session and a stable Idempotency-Key. The service validates the temporary object's Project ownership, size, content type, image bytes, dimensions, encryption, and age before changing the agent profile."
        return (self._raw_resource.commit_avatar(input)).data

    def create_avatar_upload(
        self, input: CreateAgentProfileAvatarUploadInput
    ) -> models.AgentProfileAvatarUpload:
        "Create agent avatar upload\n\nCreates a ten-minute, Project-bound presigned S3 POST for a JPEG, PNG, or WebP agent avatar up to 5 MiB. Copy every returned formFields entry into a multipart/form-data request to uploadUrl, append the local file as the final form part, and upload it directly without sending Photon credentials. After the upload succeeds, call commitAgentProfileAvatar with the returned uploadId. Do not cache or log the upload URL or form fields."
        return (self._raw_resource.create_avatar_upload(input)).data

    def get(self, input: GetAgentProfileInput) -> models.AgentProfile:
        "Get agent profile\n\nReturns the agent profile belonging to the identified project. The profile is project-scoped and is distinct from the authenticated account's personal profile. Use the dedicated avatar operations when uploading or removing an agent avatar."
        return (self._raw_resource.get(input)).data

    def reset_avatar(self, input: ResetAgentProfileAvatarInput) -> models.AgentProfile:
        "Reset agent avatar\n\nReplaces the selected project's agent avatar with the project's default avatar, a generated planet image derived from the project ID, and returns the updated agent profile. The reset does not restore an earlier avatar: a custom avatar it replaces is discarded and must be uploaded and committed again to use it. When the default avatar is already in use, the profile is returned unchanged. This does not change the account's personal profile picture. Supply the required Idempotency-Key header."
        return (self._raw_resource.reset_avatar(input)).data

    def update(self, input: UpdateAgentProfileInput) -> models.AgentProfile:
        "Update agent profile\n\nUpdates the supplied firstName and lastName fields in the project's agent profile and returns the updated profile. Avatar upload, commit and reset are separate operations. The caller must be authorized to change configuration for the selected project. Supply the required Idempotency-Key header."
        return (self._raw_resource.update(input)).data


class SyncProjectsBillingResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawProjectsBillingResource(transport)

    def get_operation(self, input: GetBillingOperationInput) -> models.BillingOperation:
        "Get billing operation\n\nReturns the authoritative state of a billing operation belonging to the selected project. Use it to recover or poll a plan-change request until the operation reaches success or failure. An accepted request is not evidence that the plan change has completed."
        return (self._raw_resource.get_operation(input)).data

    def get_overview(self, input: GetBillingOverviewInput) -> models.GetBillingOverviewResponse:
        "Get project billing overview\n\nReturns the selected project's plan information, entitlements and current billing-period usage. This operation reads project billing state; it does not change plans or the payer's payment method. Organization-level plans are available through the organization billing overview."
        return (self._raw_resource.get_overview(input)).data

    def list_billing_plans(self, input: ListBillingPlansInput) -> models.ListBillingPlansResponse:
        "List billing plans\n\nLists the billing plan catalog, grouped by their public plan-metadata type. Use the returned plan information when choosing the category and planCode for a plan change. The catalog is the same for every project, and reading it does not purchase a plan."
        return (self._raw_resource.list_billing_plans(input)).data


class SyncProjectsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawProjectsResource(transport)
        self.agent_profile = SyncProjectsAgentProfileResource(transport)
        self.billing = SyncProjectsBillingResource(transport)
        self.platforms = SyncProjectsPlatformsResource(transport)

    def create_project_api_key(
        self, input: CreateProjectApiKeyInput
    ) -> models.CreateProjectApiKeyResponse:
        "Create project API key\n\nCreates a key bound to the selected project using the supplied name, permissions and optional expiry. The secret is returned only in this response and in idempotent replays of it; store it securely because other reads never return it. The key is scoped to this project and does not grant account-level access. Supply the required Idempotency-Key header."
        return (self._raw_resource.create_project_api_key(input)).data

    def create_webhook_destination(
        self, input: CreateWebhookDestinationInput
    ) -> models.CreateWebhookDestinationResponse:
        "Create webhook destination\n\nCreates a webhook destination for the selected project using its URL, payload API version, event selection and other documented settings. The response includes the signing secret, which is returned only in this response and in idempotent replays of it, never by destination reads; store it securely for signature verification. The API version must be selectable and selected event types must belong to that version's catalog. Supply the required Idempotency-Key header."
        return (self._raw_resource.create_webhook_destination(input)).data

    def delete(self, input: DeleteProjectInput) -> models.Project:
        "Delete project\n\nStarts deletion of the identified project using a credential authorized for project management. Inspect the documented response and use getProjectClosureStatus with the organization and project identifiers to read closure progress. A project API key is not an accepted credential for this operation."
        return (self._raw_resource.delete(input)).data

    def delete_webhook_destination(
        self, input: DeleteWebhookDestinationInput
    ) -> models.WebhookDestination:
        "Delete webhook destination\n\nDeletes the selected project's destination and returns its stable tombstone. Repeated deletion returns the deletion representation. This operation removes the destination configuration; it is separate from disabling a destination through an update."
        return (self._raw_resource.delete_webhook_destination(input)).data

    def download_attachment(self, input: DownloadAttachmentInput) -> bytes:
        "Download attachment\n\nDownloads an Attachment's bytes. If unavailable after ten seconds, returns ATTACHMENT_NOT_READY with Retry-After: 5."
        return (self._raw_resource.download_attachment(input)).data

    def get(self, input: GetProjectInput) -> models.Project:
        "Get project\n\nReturns the identified project's settings for an authorized caller. The credential must be allowed to access that project; possession of an unrelated project's key does not provide access. Missing and deleted projects are reported through the documented error responses."
        return (self._raw_resource.get(input)).data

    def get_attachment(self, input: GetAttachmentInput) -> models.Attachment:
        "Get attachment\n\nReturns an Attachment's metadata. Use the content endpoint to download its bytes."
        return (self._raw_resource.get_attachment(input)).data

    def get_message_metrics_backfill(
        self, input: GetMessageMetricsBackfillInput
    ) -> models.GetMessageMetricsBackfillResponse:
        "Get metrics backfill status\n\nReturns historical metrics update progress. Completion reflects lastVerifiedAt; queries remain available during updates."
        return (self._raw_resource.get_message_metrics_backfill(input)).data

    def get_message_metrics_sql_schema(
        self, input: GetMessageMetricsSqlSchemaInput
    ) -> models.GetMessageMetricsSqlSchemaResponse:
        "Get metrics SQL schema\n\nReturns the message_events and call_events SQL schema, supported queries, and limits for the selected API version."
        return (self._raw_resource.get_message_metrics_sql_schema(input)).data

    def get_webhook_destination(
        self, input: GetWebhookDestinationInput
    ) -> models.WebhookDestination:
        "Get webhook destination\n\nReturns the configuration of one webhook destination belonging to the selected project. Missing or deleted destinations are reported as errors. This read does not disclose the signing secret returned when the destination or a secret rotation was created."
        return (self._raw_resource.get_webhook_destination(input)).data

    def get_webhook_event_schema(
        self, input: GetWebhookEventSchemaInput
    ) -> models.WebhookEventSchema | None:
        "Get webhook event schema\n\nReturns the published reader JSON Schema for eventType in the requested webhook apiVersion. Use it to interpret events for that exact payload version. The response media type is application/schema+json; an authorized conditional request may return 304 without a body. Unsupported event/version combinations are rejected."
        return (self._raw_resource.get_webhook_event_schema(input)).data

    def list_attachments(self, input: ListAttachmentsInput) -> models.AttachmentPage:
        "List attachments\n\nLists the Project's Attachment metadata, with optional time filters."
        return (self._raw_resource.list_attachments(input)).data

    def list_project_api_keys(
        self, input: ListProjectApiKeysInput
    ) -> models.ListProjectApiKeysResponse:
        "List project API keys\n\nLists the API keys on the selected project, ordered newest first. Revoked keys are not listed; expired keys stay listed until they are revoked. Entries contain key metadata and permissions, never secret values. Use the returned identifiers to manage an existing key; lost secrets cannot be recovered through this operation."
        return (self._raw_resource.list_project_api_keys(input)).data

    def list_webhook_api_versions(
        self, input: ListWebhookApiVersionsInput
    ) -> models.ListWebhookApiVersionsResponse | None:
        "List webhook API versions\n\nLists the published webhook payload API versions and their lifecycle metadata. The list is the same for every project. Use the selectable indicator when choosing a version for a destination. These payload dates are separate from SDK package versions. An authorized conditional request may return 304 without a response body."
        return (self._raw_resource.list_webhook_api_versions(input)).data

    def list_webhook_destinations(
        self, input: ListWebhookDestinationsInput
    ) -> models.WebhookDestinationPage:
        "List webhook destinations\n\nReturns a cursor-paginated page of active webhook destinations configured for the selected project. Use pageSize and pageToken to navigate it. The listing returns destination configuration, never signing secrets."
        return (self._raw_resource.list_webhook_destinations(input)).data

    def list_webhook_egress_addresses(
        self, input: ListWebhookEgressAddressesInput
    ) -> models.ListWebhookEgressAddressesResponse | None:
        "List webhook egress addresses\n\nReturns the public network addresses from which this environment sends webhook deliveries. Use this information when configuring the receiving system's network allowlist. The result is environment-specific and does not describe the API service's ingress addresses."
        return (self._raw_resource.list_webhook_egress_addresses(input)).data

    def list_webhook_event_types(
        self, input: ListWebhookEventTypesInput
    ) -> models.ListWebhookEventTypesResponse | None:
        "List webhook event types\n\nLists the webhook event types available in the requested apiVersion, including their descriptions, audiences and reader-schema URLs. Use this versioned catalog when selecting a destination's enabledEvents. The response may include version-retirement information; an authorized conditional request can return 304 without a body."
        return (self._raw_resource.list_webhook_event_types(input)).data

    def query_message_metrics(
        self, input: QueryMessageMetricsInput
    ) -> models.QueryMessageMetricsResponse:
        "Query metrics\n\nRuns read-only SQL over the Project's message_events or call_events table. Get the SQL schema for supported columns, capabilities, and limits."
        return (self._raw_resource.query_message_metrics(input)).data

    def retry_webhook_delivery(
        self, input: RetryWebhookDeliveryInput
    ) -> models.RetryWebhookDeliveryResponse:
        "Retry webhook delivery\n\nRequests an immediate attempt of the selected delivery if it is still the waiting head for its destination and event type. expectedAttemptCount is the failed-attempt counter recorded on the delivery and fences stale requests. This overrides the current backoff, including Retry-After, once. It preserves event identity and the retry budget. Delivered, active, disabled and dead-lettered deliveries cannot be retried. A 202 acknowledges the wake-up, not successful delivery. Supply an Idempotency-Key and retain it when retrying an ambiguous failure."
        return (self._raw_resource.retry_webhook_delivery(input)).data

    def revoke_project_api_key(
        self, input: RevokeProjectApiKeyInput
    ) -> models.ProjectApiKeyResponse:
        "Revoke project API key\n\nRevokes the identified key on the selected project and returns its revoked metadata. Repeating the deletion returns the same revokedAt value. This operation does not rotate the key or return a replacement secret. Supply the required Idempotency-Key header."
        return (self._raw_resource.revoke_project_api_key(input)).data

    def rotate_webhook_signing_secret(
        self, input: RotateWebhookSigningSecretInput
    ) -> models.RotateWebhookSigningSecretResponse:
        "Rotate webhook signing secret\n\nRotates the signing secret for the selected project's webhook destination and returns the new secret. The optional overlapSeconds controls the requested overlap with the previous secret according to the documented request constraints. Store the new secret securely and update the receiver's signature verification configuration; it is returned only in this response and in idempotent replays of it, never by destination reads. Supply the required Idempotency-Key header."
        return (self._raw_resource.rotate_webhook_signing_secret(input)).data

    def update(self, input: UpdateProjectInput) -> models.Project:
        "Update project\n\nUpdates the identified project's name and returns the updated project. The project slug is not a mutable field in this request. Use an authorized account or organization service-identity credential; a project API key is not accepted. Supply the required Idempotency-Key header."
        return (self._raw_resource.update(input)).data

    def update_project_api_key(
        self, input: UpdateProjectApiKeyInput
    ) -> models.ProjectApiKeyResponse:
        "Update project API key permissions\n\nReplaces the identified project key's permission list with the supplied permissions and returns the updated metadata. Sending the permission list the key already has leaves it unchanged. This request does not create a new secret or change the key's project binding. Supply the required Idempotency-Key header."
        return (self._raw_resource.update_project_api_key(input)).data

    def update_webhook_destination(
        self, input: UpdateWebhookDestinationInput
    ) -> models.WebhookDestination:
        "Update webhook destination\n\nUpdates the supplied URL, name, description, status or enabledEvents fields on a project's webhook destination and returns its updated configuration. The payload API version is not a mutable field in this request. Event selections are checked against the destination's versioned catalog; signing-secret rotation is a separate operation. Supply the required Idempotency-Key header."
        return (self._raw_resource.update_webhook_destination(input)).data

    def upload_attachment(self, input: UploadAttachmentInput) -> models.Attachment:
        "Upload attachment\n\nUploads a file and returns its Attachment once ready to download."
        return (self._raw_resource.upload_attachment(input)).data


class SyncAuthDeviceResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawAuthDeviceResource(transport)

    def authorize(
        self, input: DeviceAuthorizeInput | None = None
    ) -> models.DeviceAuthorizeResponse:
        "Start device authorization\n\nStarts the device authorization flow for a CLI or another device without a browser. Show the verification URL and user code, then poll the token endpoint at the returned interval. No request fields are required; any supplied body is ignored."
        return (self._raw_resource.authorize(input)).data

    def token(self, input: DeviceTokenInput) -> models.DeviceTokenResponse:
        "Exchange device code or refresh token\n\nExchanges an authorized device code or a refresh token for an access token and rotating refresh token. Accepts JSON and form-encoded bodies. While polling, wait at least interval seconds and increase the interval on slow_down. Store the new refresh token after every successful grant.\n\nThis SDK method sends uncompressed JSON (application/json). Other request formats described above apply to direct HTTP requests."
        return (self._raw_resource.token(input)).data


class SyncAuthResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawAuthResource(transport)
        self.device = SyncAuthDeviceResource(transport)

    def begin_invitation_sso(
        self, input: BeginInvitationSsoInput
    ) -> models.OrganizationAuthenticationRedirect:
        "Sign in with invitation SSO\n\nReturns an authentication URL for the organization SSO connection associated with the supplied invitation token. Supply token and returnTo. Complete the returned authentication flow; requesting its URL does not itself accept the invitation."
        return (self._raw_resource.begin_invitation_sso(input)).data

    def begin_organization_authentication(
        self, input: BeginOrganizationAuthenticationInput
    ) -> models.OrganizationAuthenticationRedirect:
        "Sign in with organization SSO\n\nReturns a URL to authenticate through the selected organization’s current SSO connection. Supply returnTo and open the returned URL to continue the flow. Receiving the URL does not establish an authenticated session."
        return (self._raw_resource.begin_organization_authentication(input)).data

    def begin_organization_closure_authentication(
        self, input: BeginOrganizationClosureAuthenticationInput
    ) -> models.OrganizationAuthenticationRedirect:
        "Sign in to close organization\n\nReturns an authentication URL for the current organization owner to inspect organization closure. Supply returnTo and complete the returned flow. This operation initiates authentication and does not close the organization."
        return (self._raw_resource.begin_organization_closure_authentication(input)).data

    def begin_organization_sso_admission(
        self, input: BeginOrganizationSsoAdmissionInput
    ) -> models.OrganizationAuthenticationRedirect:
        "Begin organization SSO admission\n\nReturns an SSO admission URL for an existing account and the selected organization. Supply returnTo for the continuation URL. Admission requires completing the returned authentication flow; creating the URL does not itself grant membership."
        return (self._raw_resource.begin_organization_sso_admission(input)).data

    def create_organization_sso_portal_link(
        self, input: CreateOrganizationSsoPortalLinkInput
    ) -> models.CreateOrganizationSsoPortalLinkResponse:
        "Create organization setup portal link\n\nReturns an organization setup portal URL. Supply returnTo and optionally intent, either sso or domain_verification; sso is the default. Open the returned URL to complete the selected setup flow."
        return (self._raw_resource.create_organization_sso_portal_link(input)).data

    def disable_organization_sso(
        self, input: DisableOrganizationSsoInput
    ) -> models.OrganizationSsoConfiguration:
        "Disable organization SSO\n\nDeletes the provider connection, releases the SSO requirement once the connection is gone, then unbinds the chosen domains. Retry with the same Idempotency-Key to resume or await the same run."
        return (self._raw_resource.disable_organization_sso(input)).data

    def get_organization_connection_status(
        self, input: GetOrganizationConnectionStatusInput
    ) -> models.OrganizationConnectionStatus:
        "Get organization connection status\n\nRequires current human organization membership. Synchronization status does not attest SSO configuration or completed authorization."
        return (self._raw_resource.get_organization_connection_status(input)).data

    def get_organization_sso_configuration(
        self, input: GetOrganizationSsoConfigurationInput
    ) -> models.OrganizationSsoConfiguration:
        "Get organization SSO configuration\n\nReturns the selected organization’s SSO connection state, configuration version, and desired and effective policy settings. Read policySyncStatus alongside the enforcement fields to distinguish requested settings from synchronized settings."
        return (self._raw_resource.get_organization_sso_configuration(input)).data

    def list_oauth_scopes(
        self, input: ListOauthScopesInput | None = None
    ) -> models.ListOauthScopesResponse:
        "List OAuth scopes\n\nLists the business permissions available to OAuth applications."
        return (self._raw_resource.list_oauth_scopes(input)).data

    def refresh_organization_sso_connection(
        self, input: RefreshOrganizationSsoConnectionInput
    ) -> models.OrganizationSsoConfiguration:
        "Refresh organization SSO connection\n\nRefreshes the selected organization’s SSO connection and returns its current connection state, configuration version and policy synchronization status. This operation takes no request body."
        return (self._raw_resource.refresh_organization_sso_connection(input)).data

    def retry_organization_connection_sync(
        self, input: RetryOrganizationConnectionSyncInput
    ) -> models.OrganizationConnectionStatus:
        "Retry organization connection sync\n\nReconciles existing local intent. Takes no body and cannot change membership, roles or authentication policy."
        return (self._raw_resource.retry_organization_connection_sync(input)).data

    def start_enterprise_login(
        self, input: StartEnterpriseLoginInput
    ) -> models.StartEnterpriseLoginResponse:
        "Start company sign-in\n\nReturns a sign-in URL without requiring an existing account: the company SSO connection when the target has a ready connection, otherwise ordinary account login. Supply one documented enrollment variant: organizationId with returnTo (optionally invitationToken), invitationToken with returnTo, or retryToken. Open the returned URL to continue authentication; receiving a URL does not complete sign-in. This is a browser flow: the request must come from an allowed Origin, and the retryToken variant also needs the retry cookie set by the failed sign-in, so send it with credentials."
        return (self._raw_resource.start_enterprise_login(input)).data

    def update_organization_sso_policy(
        self, input: UpdateOrganizationSsoPolicyInput
    ) -> models.OrganizationSsoConfiguration:
        "Update organization SSO policy\n\nUpdates whether SSO can admit new members automatically using ssoJitEnabled and the current expectedVersion. Returns the organization’s SSO configuration and policy synchronization status; a successful response does not mean every desired policy setting has finished synchronizing."
        return (self._raw_resource.update_organization_sso_policy(input)).data


class SyncOrganizationsBillingResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawOrganizationsBillingResource(transport)

    def change_plan(
        self, input: ChangePlanInput
    ) -> models.TerminalBillingOperation | models.PendingBillingOperation:
        "Change plan\n\nPurchases or changes the selected project's plan for the supplied category and planCode. A 202 response means the change is pending: poll the returned operation URL and honor Retry-After until it succeeds or fails. A 200 response means the idempotency key resolved to an operation that is already terminal; inspect that result rather than assuming success from the status code alone. Supply the required Idempotency-Key header. Supply both organizationId and projectId to select the project within its organization."
        return (self._raw_resource.change_plan(input)).data

    def create_organization_payment_method_checkout(
        self, input: CreateOrganizationPaymentMethodCheckoutInput
    ) -> models.CreateOrganizationPaymentMethodCheckoutResponse:
        "Create payment method checkout\n\nReturns a hosted payment-method collection URL for the selected organization. An Idempotency-Key header is optional; supply one to make retries safe. Complete the returned checkout flow. Receiving the URL does not mean a card has been saved; check payment-method status afterward."
        return (self._raw_resource.create_organization_payment_method_checkout(input)).data

    def create_organization_setup_intent(
        self, input: CreateOrganizationSetupIntentInput
    ) -> models.CreateOrganizationSetupIntentResponse:
        "Create card setup intent\n\nCreates payment-provider configuration for collecting a card for the selected organization and returns clientSecret and publishableKey. Supply the required Idempotency-Key header. Complete the provider’s card-collection flow separately and avoid logging the returned client secret."
        return (self._raw_resource.create_organization_setup_intent(input)).data

    def get_effective_terms(
        self, input: GetEffectiveTermsInput
    ) -> models.GetEffectiveTermsResponse:
        "Get the project's effective billing terms\n\nReturns what the selected project is billed on now, per category it holds: the plan as its subscription has it, with any override applied, each fixed charge at the subscription's price and quantity, and resolved entitlements; where the plan comes from; how invoices are paid; the current period and next billing date; and any downgrade or cancellation waiting for the period end. It also returns the credit the paying organization holds on credit notes, such as the unused time of a plan an upgrade replaced; it offsets that organization's next invoices. Supply both organizationId and projectId; the organization must pay for the project. This operation does not change billing."
        return (self._raw_resource.get_effective_terms(input)).data

    def get_organization_billing_overview(
        self, input: GetOrganizationBillingOverviewInput
    ) -> models.GetOrganizationBillingOverviewResponse:
        "Get organization billing overview\n\nReturns the selected organization’s billing subscription and entitlementsVersion. The subscription can be null. Read the returned plan, charges and entitlements to inspect organization billing; this operation does not purchase or change a plan."
        return (self._raw_resource.get_organization_billing_overview(input)).data

    def get_organization_payment_method(
        self, input: GetOrganizationPaymentMethodInput
    ) -> models.GetOrganizationPaymentMethodResponse:
        "Get organization payment method\n\nReports whether the selected organization has a card on file and returns its documented payment-method metadata. Reading this endpoint does not collect a new card or create a checkout session."
        return (self._raw_resource.get_organization_payment_method(input)).data

    def list_invoices(self, input: ListInvoicesInput) -> models.ListInvoicesResponse:
        "List invoices\n\nReturns a single page of the selected organization's invoices; invoices with a zero total are excluded. Use the documented invoice fields to inspect each invoice's billing state. Listing invoices does not make a payment or modify a subscription."
        return (self._raw_resource.list_invoices(input)).data

    def preview_organization_change(
        self, input: PreviewOrganizationChangeInput
    ) -> models.PreviewOrganizationChangeResponse:
        "Preview an organization billing change\n\nPreviews a fixed-charge quantity change on the selected organization's own subscription, such as SSO. Prices the change by the billing engine exactly as making it would bill it now: dueNow is that invoice, with taxes and the payer's credits applied. A quantity already paid for this period is not billed again, so a purchase after a release can be free. nextCharge is what is charged in advance at the next period start. For a fixed-charge change, pass quote on with the purchase so it is refused if the price or period no longer hold. This operation does not change billing."
        return (self._raw_resource.preview_organization_change(input)).data

    def preview_project_change(
        self, input: PreviewProjectChangeInput
    ) -> models.PreviewProjectChangeResponse:
        "Preview a project billing change\n\nPreviews a change on the selected project's subscription in the supplied category: a fixed-charge quantity change, or a plan change with the held fixed charges it carries over. Prices the change by the billing engine exactly as making it would bill it now: dueNow is that invoice, with taxes and the payer's credits applied. A quantity already paid for this period is not billed again, so a purchase after a release can be free. nextCharge is what is charged in advance at the next period start. For a fixed-charge change, pass quote on with the purchase so it is refused if the price or period no longer hold. This operation does not change billing. An upgrade bills the replaced plan's usage to date and the new plan from now, less the replaced plan's unused time; planChange says when it applies and which held fixed charges the target does not sell: released first for a change that applies now, released with a downgrade when it applies. additions quotes what is added once an upgrade applies, each billed when it is added, in planChange.additions and outside dueNow. Supply both organizationId and projectId; the organization must pay for the project."
        return (self._raw_resource.preview_project_change(input)).data


class SyncOrganizationsProjectsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawOrganizationsProjectsResource(transport)

    def check_project_slug_availability(
        self, input: CheckProjectSlugAvailabilityInput
    ) -> models.CheckProjectSlugAvailabilityResponse:
        "Check project slug availability\n\nReports whether createProject would accept `slug` right now. Advisory: only the create itself allocates, so a caller must still handle SLUG_TAKEN. A malformed slug is rejected on shape; a reserved slug, a slug held by an active project, and a slug retired with a deleted project each answer `available: false` with a reason."
        return (self._raw_resource.check_project_slug_availability(input)).data

    def count(self, input: CountProjectsInput) -> models.ProjectCount:
        "Count projects\n\nCounts the projects the same filter would list. The count is read from the primary, so it is authoritative rather than replica-lagged."
        return (self._raw_resource.count(input)).data

    def create(self, input: CreateProjectInput) -> models.Project:
        "Create project\n\nCreates in the authorized organization. In addition to account credentials, explicitly granted Service Identity API keys and M2M tokens may create projects. Project API keys cannot create projects. Creator and private credential evidence come only from the trusted authorization context. The caller-selected slug is immutable, must be 3 to 63 lowercase ASCII alphanumerics separated by single hyphens, and cannot be reserved or held by any active or deleted project."
        return (self._raw_resource.create(input)).data

    def get_project_closure_status(
        self, input: GetProjectClosureStatusInput
    ) -> models.GetProjectClosureStatusResponse:
        "Get project closure status\n\nReturns closure progress for projectId within organizationId, including deletionOperationId, domain progress and ready. This read operation does not initiate deletion."
        return (self._raw_resource.get_project_closure_status(input)).data

    def list(self, input: ListProjectsInput) -> models.ProjectPage:
        "List projects\n\nReturns a cursor-paginated page of the active projects in organizationId. Filter using query and the documented creation-time bounds, and navigate with pageSize and pageToken. Project roles are not returned and role is not a supported filter."
        return (self._raw_resource.list(input)).data


class SyncOrganizationsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawOrganizationsResource(transport)
        self.billing = SyncOrganizationsBillingResource(transport)
        self.projects = SyncOrganizationsProjectsResource(transport)


class SyncAccountResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawAccountResource(transport)

    def commit_profile_picture(self, input: CommitAccountProfilePictureInput) -> models.Account:
        "Commit profile picture\n\nCommits a profile picture previously uploaded through createAccountProfilePictureUpload. Call this only after the direct multipart upload succeeds, using the uploadId from the same upload session and a stable Idempotency-Key. The service validates the temporary object's ownership, size, content type, image bytes, dimensions, encryption, and age before changing the Account."
        return (self._raw_resource.commit_profile_picture(input)).data

    def confirm_phone_verification(
        self, input: ConfirmAccountPhoneVerificationInput
    ) -> models.Account:
        "Confirm phone verification\n\nBinds the number once the code is approved. Repeat calls return the bound Account."
        return (self._raw_resource.confirm_phone_verification(input)).data

    def create_account_service_key(
        self, input: CreateAccountServiceKeyInput
    ) -> models.CreateAccountServiceKeyResponse:
        "Create Account Service Key\n\nCreates a service key for the authenticated account with the supplied name and optional expiresAt. Returns key metadata and a one-time credential; store the credential securely because it cannot be retrieved through the listing endpoint. These credentials act as the account and must not be distributed as project-scoped keys. Supply the required Idempotency-Key header."
        return (self._raw_resource.create_account_service_key(input)).data

    def create_profile_picture_upload(
        self, input: CreateAccountProfilePictureUploadInput
    ) -> models.ProfilePictureUpload:
        "Create profile picture upload\n\nCreates a ten-minute, Account-bound presigned S3 POST for a JPEG, PNG, or WebP profile picture up to 5 MiB. Copy every returned formFields entry into a multipart/form-data request to uploadUrl, append the local file as the final form part, and upload it directly without sending Photon credentials. After the upload succeeds, call commitAccountProfilePicture with the returned uploadId. Do not cache or log the upload URL or form fields."
        return (self._raw_resource.create_profile_picture_upload(input)).data

    def delete(self, input: DeleteAccountInput | None = None) -> models.Account:
        "Delete account\n\nDeletes the authenticated account and returns its account tombstone. The operation is rejected while the account still owns organizations; transfer or close those organizations before retrying. This endpoint acts on the caller's account and does not accept another account's identifier."
        return (self._raw_resource.delete(input)).data

    def get(self, input: GetAccountInput | None = None) -> models.Account:
        "Get account\n\nReturns the profile of the authenticated account. The account is selected from the credential rather than a request parameter. A missing or deleted account is reported as an error instead of an empty profile."
        return (self._raw_resource.get(input)).data

    def list_account_service_keys(
        self, input: ListAccountServiceKeysInput | None = None
    ) -> models.ListAccountServiceKeysResponse:
        "List Account Service Keys\n\nReturns metadata for the authenticated account's unrevoked service keys, including expired keys, ordered newest first. Secret values are not returned; a key's credential is disclosed only when that key is created."
        return (self._raw_resource.list_account_service_keys(input)).data

    def list_authorized_applications(
        self, input: ListAuthorizedApplicationsInput | None = None
    ) -> models.ListAuthorizedApplicationsResponse:
        "List connected applications\n\nLists the OAuth applications authorized by the authenticated user."
        return (self._raw_resource.list_authorized_applications(input)).data

    def reset_profile_picture(self, input: ResetAccountProfilePictureInput) -> models.Account:
        "Remove profile picture\n\nRemoves the authenticated account's custom profile picture and returns the account using its default picture. This operation does not upload a replacement; use the upload-and-commit operations when setting a new custom picture. Supply the required Idempotency-Key header."
        return (self._raw_resource.reset_profile_picture(input)).data

    def revoke_account_service_key(
        self, input: RevokeAccountServiceKeyInput
    ) -> models.RevokeAccountServiceKeyResponse:
        "Revoke Account Service Key\n\nRevokes the account-owned service key identified by serviceKeyId and returns its revoked metadata. Repeating the revocation is stable. Revocation changes the credential's validity; it does not create a replacement key. Supply the required Idempotency-Key header."
        return (self._raw_resource.revoke_account_service_key(input)).data

    def revoke_authorized_application(self, input: RevokeAuthorizedApplicationInput) -> None:
        "Revoke connected application\n\nRevokes the authenticated user's grant for one OAuth application."
        return (self._raw_resource.revoke_authorized_application(input)).data

    def start_phone_verification(
        self, input: StartAccountPhoneVerificationInput
    ) -> models.StartAccountPhoneVerificationResponse:
        "Start phone verification\n\nSends an SMS code. Answers CAPTCHA_REQUIRED with the widget to render when no solved challenge accompanies the request; retry with the returned challengeContext and a token. Rate limited per account, per destination number, and globally; a rejection carries Retry-After."
        return (self._raw_resource.start_phone_verification(input)).data

    def update(self, input: UpdateAccountInput) -> models.Account:
        "Update account\n\nUpdates the supplied firstName and lastName fields on the authenticated account and returns the updated profile. Only the documented profile fields can be changed through this endpoint; profile-picture uploads and phone-number verification use their dedicated operations. Supply the required Idempotency-Key header."
        return (self._raw_resource.update(input)).data


class SyncSystemResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawSystemResource(transport)

    def create_app_installation_request(
        self, input: CreateAppInstallationRequestInput
    ) -> models.CreateAppInstallationRequestResponse:
        "Request app installation\n\nAuthenticates a registered app backend using a short-lived signed client assertion. Creates request metadata only; customer approval is still required."
        return (self._raw_resource.create_app_installation_request(input)).data

    def redeem_app_installation_delivery(
        self, input: RedeemAppInstallationDeliveryInput
    ) -> models.RedeemAppInstallationDeliveryResponse:
        "Redeem installation credential\n\nThe registered app backend authenticates with a signed client assertion and a single-use code. Plaintext is returned only once; retries return status and never create another credential."
        return (self._raw_resource.redeem_app_installation_delivery(input)).data


class AsyncRawProjectsPlatformsImessageAssignmentsResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport

    async def create(
        self, input: CreateSharedLineAssignmentInput
    ) -> RawResponse[models.SharedLineAssignment]:
        "Create shared line assignment\n\nMaps an end user's iMessage handle — an E.164 phone number or an email address — onto one of the project's pooled shared iMessage lines, consuming a seat from the project's entitlement. The assigned number is allocated by the server. When an email address is supplied in `email` the user is sent an invite asynchronously to that address; it is never inferred from the handle, and the response never reports whether the send succeeded. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_SHARED_LINE_ASSIGNMENT, payload)

    async def get(
        self, input: GetSharedLineAssignmentInput
    ) -> RawResponse[models.SharedLineAssignment]:
        "Get shared line assignment\n\nReads one shared line assignment. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_SHARED_LINE_ASSIGNMENT, payload)

    async def list(
        self, input: ListSharedLineAssignmentsInput
    ) -> RawResponse[models.SharedLineAssignmentPage]:
        "List shared line assignments\n\nLists the project's shared line assignments, oldest first. Released assignments are excluded unless includeReleased is set. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_SHARED_LINE_ASSIGNMENTS, payload)

    async def release(
        self, input: ReleaseSharedLineAssignmentInput
    ) -> RawResponse[models.SharedLineAssignment]:
        "Release shared line assignment\n\nReleases a shared line assignment, freeing both its seat and its handle for reassignment. The row is retained for audit and returned with releasedAt set, so repeating the call is safe. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_RELEASE_SHARED_LINE_ASSIGNMENT, payload)


class AsyncRawProjectsPlatformsImessageResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport
        self.assignments = AsyncRawProjectsPlatformsImessageAssignmentsResource(transport)


class AsyncRawProjectsPlatformsResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport
        self.imessage = AsyncRawProjectsPlatformsImessageResource(transport)

    async def assign_sms_line_campaign(
        self, input: AssignSmsLineCampaignInput
    ) -> RawResponse[models.Operation]:
        "Assign or replace SMS line campaign\n\nAttach a ready campaign from this project’s organization to its line. Requires platforms:write for the project; human and machine actors retain their authenticated identity. Requires a permanent Idempotency-Key and the current assignment version. Provider provisioning runs asynchronously."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_ASSIGN_SMS_LINE_CAMPAIGN, payload)

    async def assign_voice_line_profile(
        self, input: AssignVoiceLineProfileInput
    ) -> RawResponse[models.VoiceLineProfileAssignment]:
        "Assign Voice line profile\n\nAssigns or replaces a line's explicit additional-profile override when the resource version matches. The current default cannot be assigned explicitly. The pstn_voice ability remains the admission source of truth. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_ASSIGN_VOICE_LINE_PROFILE, payload)

    async def batch_update_voice_line_profile_assignments(
        self, input: BatchUpdateVoiceLineProfileAssignmentsInput
    ) -> RawResponse[models.BatchUpdateVoiceLineProfileAssignmentsResponse]:
        "Batch update Voice line assignments\n\nAtomically sets additional-profile overrides or switches lines back to the project default for up to 100 Voice-capable lines. A null profileId means use the default. Every expected resource version must match or no line changes. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(
            _OP_BATCH_UPDATE_VOICE_LINE_PROFILE_ASSIGNMENTS, payload
        )

    async def cancel_operation(self, input: CancelOperationInput) -> RawResponse[models.Operation]:
        "Cancel operation\n\nWithdraws a provision that has not been fulfilled yet. This is an operations action rather than a DELETE, because there is nothing to delete: no resource exists until the work commits. Whether it is accepted depends on the resource type — a dedicated iMessage line may sit waiting on inventory for hours and withdrawing costs nothing, while an SMS number is cancellable during inventory waiting and answers 409 once the workflow commits to its first provider order. Campaign assignment and detachment operations cannot be cancelled in any state. Wait for completion before requesting another change; that new change is not a guaranteed rollback. The output-only `cancellable` field is a snapshot; the cancellation transaction always checks the current phase under a row lock. A cancel that loses the race against the work finishing also answers 409: the resource exists and is billed for, so what you want then is to release it. Nothing is charged for a cancelled provision — billing runs after the work, so there is never anything to refund. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CANCEL_OPERATION, payload)

    async def configure_voice_profile_outbound(
        self, input: ConfigureVoiceProfileOutboundInput
    ) -> RawResponse[models.ConfigureVoiceProfileOutboundResponse]:
        "Configure Voice outbound credential\n\nConfigures a SIP credential for outbound calls from a profile when the shared profile version matches. Outbound calls are paid usage, so the organization needs a payment method and no invoices overdue 7 days or more; otherwise this returns 402 ENTITLEMENT_REQUIRED with a reason. authentication.algorithm is required: SHA-256 is recommended, while MD5 is a weaker legacy option supported over UDP, TCP, and TLS; TLS is strongly recommended because UDP and TCP do not encrypt SIP signaling. The profileId may identify the default or an additional profile. The new password is returned once and is never recoverable. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CONFIGURE_VOICE_PROFILE_OUTBOUND, payload)

    async def connect_email_domain(
        self, input: ConnectEmailDomainInput
    ) -> RawResponse[models.Operation]:
        "Connect email domain\n\nReserves a normalized DNS domain and starts its durable email-provider setup. The accepted provision consumes one email-domain entitlement slot until it fails, is cancelled, or becomes a live resource; the plan's email.max_email_domains value sets the project limit. The customer resource does not exist until provider identity and DNS setup reach READY; poll the returned operation for progress. A domain may have only one unfinished provision or live resource globally. Email domains have no additional per-domain charge. The Idempotency-Key is required and permanent: replaying the same key and canonical domain returns the original operation forever. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CONNECT_EMAIL_DOMAIN, payload)

    async def connect_telegram_bot(
        self, input: ConnectTelegramBotInput
    ) -> RawResponse[models.Operation]:
        "Connect Telegram bot\n\nStarts a free managed Telegram bot connection. Each project may have one unfinished Telegram provision, including user interaction and failure cleanup. A different Idempotency-Key while one is active returns 409 TELEGRAM_PROVISION_IN_PROGRESS with its operationId and operationUrl; resume it, cancel it while cancellation is available, or wait for it to finish. Rejected keys remain reusable. Open detail.setupUrl to connect an existing managed bot or create a new one with the project's default agent name or a custom display name, then poll Location. The link remains usable while the operation is active and never expires. Replaying the same Idempotency-Key returns the original operation, even after completion or while a newer setup is active. POST, GET and list share the same operation details. The API includes detail.setupUrl only for callers with platforms:write for the project; read-only callers receive the other details unchanged."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CONNECT_TELEGRAM_BOT, payload)

    async def connect_whatsapp_business(
        self, input: ConnectWhatsappBusinessInput
    ) -> RawResponse[models.Operation]:
        "Connect WhatsApp Business\n\nExchanges the authorization code Embedded Signup returned and connects exactly the selected phone number as one `whatsapp_sender`. Send the WABA id and phone-number id emitted by the same popup attempt; both are treated as selectors and verified against Meta before use. A selected number that matches a non-retired, same-project `voip_line` is linked to it; a number absent from Photon inventory stays unbound; a matching non-retired `cosmos_line`, foreign VoIP line or unassigned VoIP line fails the operation before registration. Connecting is free — no plan requirement — but Billing must report the project's organization as ready with a payment method on file. The Idempotency-Key is required and permanent: replaying the same key returns the original operation forever. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CONNECT_WHATSAPP_BUSINESS, payload)

    async def count_filtered_verification_codes(
        self, input: CountFilteredVerificationCodesInput
    ) -> RawResponse[models.FilteredVerificationCodeCount]:
        "Count filtered verification codes\n\nCounts the verification codes Photon kept from this project's dedicated lines and numbers, optionally for one `platform`. Without `receivedAfter` and `receivedBefore` the window is the 30 days before the request; a window longer than 366 days is rejected. The response echoes the window it resolved, so the number always says which period it covers. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_COUNT_FILTERED_VERIFICATION_CODES, payload)

    async def count_resource_filtered_verification_codes(
        self, input: CountResourceFilteredVerificationCodesInput
    ) -> RawResponse[models.FilteredVerificationCodeCount]:
        "Count a line's filtered verification codes\n\nCounts the verification codes Photon kept from one dedicated line or number. Without `receivedAfter` and `receivedBefore` the window is the 30 days before the request; a window longer than 366 days is rejected. The response echoes the window it resolved, so the number always says which period it covers. Answers 404 unless the project holds the resource now. Codes from an earlier tenure stay in the project-wide list. Filter by `platform` — a number receives both SMS and WhatsApp. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(
            _OP_COUNT_RESOURCE_FILTERED_VERIFICATION_CODES, payload
        )

    async def create_default_voice_profile(
        self, input: CreateDefaultVoiceProfileInput
    ) -> RawResponse[models.VoiceProfile]:
        "Create default Voice profile\n\nCreates the project default Voice profile when absent. An identical replay returns the existing default without changing its version; a different existing default conflicts. Direction configuration is managed separately. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_DEFAULT_VOICE_PROFILE, payload)

    async def create_voice_profile(
        self, input: CreateVoiceProfileInput
    ) -> RawResponse[models.VoiceProfile]:
        "Create Voice profile\n\nCreates a direction-neutral additional Voice profile. The project default must already exist. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_VOICE_PROFILE, payload)

    async def create_whatsapp_shared_line_assignment(
        self, input: CreateWhatsappSharedLineAssignmentInput
    ) -> RawResponse[models.SharedLineAssignment]:
        "Create WhatsApp shared line assignment\n\nMaps an end user's phone number onto one of the project's pooled shared WhatsApp lines, consuming a seat from the project's WhatsApp entitlement. The assigned number is allocated by the server. When an email address is supplied the user is sent an invite asynchronously; the response never reports whether that succeeded. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_WHATSAPP_SHARED_LINE_ASSIGNMENT, payload)

    async def create_whatsapp_voip_sender(
        self, input: CreateWhatsappVoipSenderInput
    ) -> RawResponse[models.Operation]:
        "Create WhatsApp VoIP sender\n\nRegisters an active, SMS-capable Photon VoIP line on this project's connected WhatsApp Business Account. The account is resolved server-side; callers never select a WABA. The platform creates or reuses the Meta number, requests and consumes the SMS ownership code internally, verifies it, and registers the sender. displayName is optional; when omitted the project agent profile name is snapshotted before acceptance. The VoIP line remains a separate resource and never receives the whatsapp_business ability."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_WHATSAPP_VOIP_SENDER, payload)

    async def delete_voice_profile(self, input: DeleteVoiceProfileInput) -> RawResponse[None]:
        "Delete Voice profile\n\nDeletes an additional profile when expectedVersion matches. Assigned profiles require force=true, which atomically removes every stored override so affected lines follow the default. The default can never be deleted. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_DELETE_VOICE_PROFILE, payload)

    async def delete_voice_profile_inbound(
        self, input: DeleteVoiceProfileInboundInput
    ) -> RawResponse[models.VoiceProfileInboundConfiguration]:
        "Delete Voice inbound configuration\n\nRemoves a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. The profile and its line assignments remain. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_DELETE_VOICE_PROFILE_INBOUND, payload)

    async def delete_voice_profile_outbound(
        self, input: DeleteVoiceProfileOutboundInput
    ) -> RawResponse[models.DeleteVoiceProfileOutboundResponse]:
        "Revoke Voice outbound credential\n\nRevokes outbound calling for a profile when the shared profile version matches. The profileId may identify the default or an additional profile. The profile, inbound destination, and line assignments remain. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_DELETE_VOICE_PROFILE_OUTBOUND, payload)

    async def disconnect_whatsapp_business_account(
        self, input: DisconnectWhatsappBusinessAccountInput
    ) -> RawResponse[models.Operation]:
        "Disconnect WhatsApp Business account\n\nDisconnects every attached WhatsApp sender, then unsubscribes our app and removes the project's business account connection. Photon VoIP lines and the numbers in Meta remain. Requires Idempotency-Key. Poll the returned operation; provider refusals appear as operation failures and retain the account for retry with a new key. New signups are blocked while disconnecting, and existing provisions must finish before this request can be accepted."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_DISCONNECT_WHATSAPP_BUSINESS_ACCOUNT, payload)

    async def get_default_voice_profile(
        self, input: GetDefaultVoiceProfileInput
    ) -> RawResponse[models.VoiceProfile]:
        "Get default Voice profile\n\nGets the profile currently selected as the project default, including its optional inbound delivery state. Requires platforms:read bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_DEFAULT_VOICE_PROFILE, payload)

    async def get_imessage(
        self, input: GetProjectImessagePlatformInput
    ) -> RawResponse[models.ProjectPlatformSettings]:
        "Get project iMessage platform\n\nReports whether the project is on shared or dedicated iMessage lines, derived from its billing entitlements. Shared mode carries the seat cap. Both say whether a dedicated line requested now would be assigned without waiting. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_PROJECT_IMESSAGE_PLATFORM, payload)

    async def get_operation(
        self, input: GetOperationInput
    ) -> RawResponse[models.GetOperationResponse]:
        "Get operation\n\nReads one operation using the same operation representation as creation and list. The API includes detail.setupUrl only with platforms:write for this project. This is the polling endpoint every asynchronous request here points its Location at, and it resolves from the moment that request is accepted — an operation is committed before its work is dispatched, so there is no window in which the URL 404s. Poll until `state` is one of `succeeded`, `failed` or `cancelled`, pacing from the Retry-After the accepting response returned. While an email domain waits for DNS, `detail` always contains the manual records and may additionally contain `automaticSetup` with a signed provider URL to open separately. Once the operation has produced a resource, the response carries that resource too, so the poll that finishes is also the one that tells you what you got. `succeeded` means the work is done; billing runs behind it and is not something the caller waits on. Operations are never purged, so a 404 means the id was never this project's. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_OPERATION, payload)

    async def get_project_whatsapp_platform(
        self, input: GetProjectWhatsappPlatformInput
    ) -> RawResponse[models.ProjectPlatformSettings]:
        "Get project WhatsApp platform\n\nReports whether the project is on shared or dedicated WhatsApp lines, derived from its billing entitlements. Shared mode carries the seat cap. Both say whether a dedicated line requested now would be assigned without waiting. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_PROJECT_WHATSAPP_PLATFORM, payload)

    async def get_resource(self, input: GetResourceInput) -> RawResponse[models.Resource]:
        "Get resource\n\nReads one resource the project holds. A released number stays readable and reads `retired`, because it remains part of this project's history. A dedicated line given back does NOT: returning it to inventory is what makes it claimable by someone else, so it answers 404 and the operation that returned it is the record that this project once held it. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_RESOURCE, payload)

    async def get_sms_line_campaign_assignment(
        self, input: GetSmsLineCampaignAssignmentInput
    ) -> RawResponse[models.GetSmsLineCampaignAssignmentResponse]:
        "Get SMS line campaign assignment\n\nRead the last confirmed campaign and current eligibility. Follow changes through their operations. Eligibility is a control-plane assessment, not a delivery or recipient-consent guarantee."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_SMS_LINE_CAMPAIGN_ASSIGNMENT, payload)

    async def get_voice_line_profile_assignment(
        self, input: GetVoiceLineProfileAssignmentInput
    ) -> RawResponse[models.VoiceLineProfileAssignment]:
        "Get Voice line profile assignment\n\nGets the explicit additional-profile override for an owned Voice-capable line. A line following the project default returns 200 without profileId. Requires platforms:read bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_VOICE_LINE_PROFILE_ASSIGNMENT, payload)

    async def get_voice_profile(
        self, input: GetVoiceProfileInput
    ) -> RawResponse[models.VoiceProfile]:
        "Get Voice profile\n\nGets one reusable Voice profile, including its optional inbound delivery state. Requires platforms:read bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_VOICE_PROFILE, payload)

    async def get_whatsapp_business_account(
        self, input: GetWhatsappBusinessAccountInput
    ) -> RawResponse[models.WhatsappBusinessAccount]:
        "Get WhatsApp Business account\n\nGets the one WhatsApp Business Account this project has connected, with its number of live senders. Senders are resources and are listed by GET /platforms/resources?ability=whatsapp_business. The account is not a resource and carries no access token. Meta's retained numbers are listed separately by GET /platforms/whatsapp-business/account/phone-numbers. `subscribedAt` is absent until our app is attached to the account's webhooks. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_WHATSAPP_BUSINESS_ACCOUNT, payload)

    async def get_whatsapp_business_verification_code(
        self, input: GetWhatsappBusinessVerificationCodeInput
    ) -> RawResponse[models.GetWhatsappBusinessVerificationCodeResponse]:
        "Get WhatsApp Business verification code\n\nReturns the latest six-digit WhatsApp Business ownership code received by SMS for an active Photon VOIP number, but only when its provider timestamp is strictly newer than the required receivedAfter boundary. receivedAfter must be an RFC 3339 timestamp between this request's arrival time and two minutes before it; once it expires, restart Meta's verification flow with a new boundary. A missing newer code is a retryable 404 with Retry-After: 2. Poll after 2, 4, 8, then 10 seconds, applying ±20% jitter and capping later intervals at 10 seconds. Stop when the original boundary is two minutes old. Responses are never cached. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_WHATSAPP_BUSINESS_VERIFICATION_CODE, payload)

    async def get_whatsapp_shared_line_assignment(
        self, input: GetWhatsappSharedLineAssignmentInput
    ) -> RawResponse[models.SharedLineAssignment]:
        "Get WhatsApp shared line assignment\n\nReads one WhatsApp shared line assignment. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_WHATSAPP_SHARED_LINE_ASSIGNMENT, payload)

    async def get_whatsapp_signup_config(
        self, input: GetWhatsappSignupConfigInput
    ) -> RawResponse[models.GetWhatsappSignupConfigResponse]:
        "Get WhatsApp signup config\n\nReturns what the browser needs to open Meta's Embedded Signup popup: the Facebook Login for Business configuration id, the Graph version to run against, and the scopes it will request. Answered in-process rather than forwarded, so the first step of onboarding survives an outage of the private service. Pass `configId` to `FB.login` as `config_id` with `response_type: 'code'` and `override_default_response_type: true`. Do NOT add a `featureType` — omitting it is what keeps the phone-number screen in the flow, and `only_waba_sharing` produces an account with no number that cannot be provisioned. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_WHATSAPP_SIGNUP_CONFIG, payload)

    async def list_filtered_verification_codes(
        self, input: ListFilteredVerificationCodesInput
    ) -> RawResponse[models.FilteredVerificationCodePage]:
        "List filtered verification codes\n\nLists the verification codes Photon kept from this project's dedicated lines and numbers. Inbound messages that carry a one-time code are filtered before delivery; this is the record that they arrived, so a quiet line can be told apart from a broken one. It records the receiving line, its platform and when the code arrived — never the code itself. Each entry names the dedicated line or number (`resourceId`) that received it. Newest first, within an optional inclusive `receivedAfter`/`receivedBefore` window. A page may hold fewer than `pageSize` entries and still return a `nextPageToken`; only its absence means the end. Filter by `platform`; to read one line, use its own filtered-otp path. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_FILTERED_VERIFICATION_CODES, payload)

    async def list_number_area_codes(
        self, input: ListNumberAreaCodesInput
    ) -> RawResponse[models.ListNumberAreaCodesResponse]:
        "List number area codes\n\nLists current provider coverage for US local numbers, sorted and deduplicated. Coverage does not guarantee inventory carrying every required feature. New area-specific purchases must use a listed code; accepted purchases keep waiting if coverage later changes. Requires platforms:read for the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_NUMBER_AREA_CODES, payload)

    async def list_number_countries(
        self, input: ListNumberCountriesInput
    ) -> RawResponse[models.ListNumberCountriesResponse]:
        "List number countries\n\nLists supported purchase countries independently of current provider inventory. Requires platforms:read for the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_NUMBER_COUNTRIES, payload)

    async def list_operations(
        self, input: ListOperationsInput
    ) -> RawResponse[models.OperationPage]:
        "List operations\n\nLists the project's operations using the same operation representation as creation and GET. The API includes detail.setupUrl only with platforms:write for this project. Results are oldest first — every provision and release it has ever asked for, including the ones still running. This is the entire in-flight view: a resource only appears once it is real, so nothing half-built shows up in the resource list and nothing in flight is missing from this one. Filter by `resourceId` to get one resource's whole history, which for a pooled line is every tenure this project has had on it. `state` is comma-separated; `type` accepts one operation type and an absent filter means everything, including failed and cancelled operations. `endedAfter` keeps only operations that finished after that instant, so what failed or was withdrawn recently is one short page. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_OPERATIONS, payload)

    async def list_project_platforms(
        self, input: ListProjectPlatformsInput
    ) -> RawResponse[models.ListProjectPlatformsResponse]:
        "List project platforms\n\nLists the platform types available to this project. Every project currently sees the same fixed public contract, answered in-process rather than forwarded, so the list survives an outage of the private service. The project binding exists so that answer can narrow per project without moving the route. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_PROJECT_PLATFORMS, payload)

    async def list_resource_filtered_verification_codes(
        self, input: ListResourceFilteredVerificationCodesInput
    ) -> RawResponse[models.FilteredVerificationCodePage]:
        "List a line's filtered verification codes\n\nLists the verification codes Photon kept from one dedicated line or number. Inbound messages that carry a one-time code are filtered before delivery; this is the record that they arrived, so a quiet line can be told apart from a broken one. It records the receiving line, its platform and when the code arrived — never the code itself. Each entry names the dedicated line or number (`resourceId`) that received it. Newest first, within an optional inclusive `receivedAfter`/`receivedBefore` window. A page may hold fewer than `pageSize` entries and still return a `nextPageToken`; only its absence means the end. Answers 404 unless the project holds the resource now. Codes from an earlier tenure stay in the project-wide list. Filter by `platform` — a number receives both SMS and WhatsApp. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_RESOURCE_FILTERED_VERIFICATION_CODES, payload)

    async def list_resources(self, input: ListResourcesInput) -> RawResponse[models.ResourcePage]:
        "List resources\n\nLists everything the project holds, oldest first, whatever kind of thing it is — one endpoint and one id shape for numbers, dedicated lines and whatever ships next. Nothing half-built appears here: a resource exists only once it is real, so anything still being provisioned is an operation rather than a resource with a pending flag. Filter by `type`, by `ability` (which matches only abilities that are currently enabled), and by `state` — comma-separated, and absent means every state, including retired ones. `detail` carries a per-type public view: an SMS number's number, a dedicated line's number and its per-capability health (`imessageHealth`, `whatsappHealth`, each with an `overallStatus` of `available`, `degraded`, `unavailable` or `unknown`; `imessageHealth` also carries `account`, `photonSystemComponents`, `newConversations`, `sms` and `mms`, each a `status` with the `cause` that decided it: `account`, `photonSystemComponents`, or null for the item's own state). Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_RESOURCES, payload)

    async def list_voice_profiles(
        self, input: ListVoiceProfilesInput
    ) -> RawResponse[models.VoiceProfilePage]:
        "List Voice profiles\n\nLists reusable Voice profiles in this project. Requires platforms:read bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_VOICE_PROFILES, payload)

    async def list_whatsapp_account_phone_numbers(
        self, input: ListWhatsappAccountPhoneNumbersInput
    ) -> RawResponse[models.ListWhatsappAccountPhoneNumbersResponse]:
        "List WhatsApp account phone numbers\n\nLists the connected WABA's phone numbers directly from Meta, including numbers whose Photon sender was disconnected. Ownership is photon for a number in this project's current Photon inventory and meta otherwise. Match a Photon SMS number by its E.164 phoneNumber and reuse its existing displayName when reconnecting. A null name is unavailable, not permission to choose a new name. A failed lookup returns an error rather than an empty list. Requires platforms:read on the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_WHATSAPP_ACCOUNT_PHONE_NUMBERS, payload)

    async def list_whatsapp_shared_line_assignments(
        self, input: ListWhatsappSharedLineAssignmentsInput
    ) -> RawResponse[models.SharedLineAssignmentPage]:
        "List WhatsApp shared line assignments\n\nLists the project's WhatsApp shared line assignments, oldest first. Released assignments are excluded unless includeReleased is set. Requires the platforms:read permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_WHATSAPP_SHARED_LINE_ASSIGNMENTS, payload)

    async def provision_imessage_dedicated_line(
        self, input: ProvisionImessageDedicatedLineInput
    ) -> RawResponse[models.Operation]:
        "Provision dedicated iMessage line\n\nClaims one dedicated iMessage line for the project and enables iMessage on it. Always answers 202 with an operation: dedicated lines are allocated from available capacity, and unavailable capacity causes a wait rather than a failure — this can legitimately stay `running` for hours, which is exactly why the response is a handle to poll rather than a number. The project's messaging subscription must grant the dedicated iMessage lines entitlement (`imessage_dedicated_lines.can_purchase`), and that is checked before capacity is reserved. The line's own charge starts when a line is claimed; the subscription that grants the entitlement bills on its own terms, which cancelling a request does not change. Waiting requests are served first come, first served. One that is still waiting is cancelled with a `reason` if the project is deleted (`project_deleted`) or its plan stops selling dedicated lines (`entitlement_lost`); while the payer is restricted for overdue payment it keeps waiting. If you no longer want to wait, POST to the operation's cancel endpoint, which charges nothing for the line. The Idempotency-Key is required and permanent: repeating it returns the same operation forever. A further line always needs a NEW key, including while others are still waiting. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_PROVISION_IMESSAGE_DEDICATED_LINE, payload)

    async def provision_whatsapp_dedicated_line(
        self, input: ProvisionWhatsappDedicatedLineInput
    ) -> RawResponse[models.Operation]:
        "Provision dedicated WhatsApp line\n\nProvisions one dedicated WhatsApp line with WhatsApp and shared Voice enabled. It attaches to an eligible iMessage line the project already owns when possible so both products keep the same number; otherwise it claims healthy, available WhatsApp-capable dedicated-line inventory. Always answers 202, because waiting when no inventory is available is not a failure. The product opens its own charge period after the abilities are enabled; Voice has no separate charge. Waiting requests are served first come, first served, and are cancelled with a `reason` exactly as for a dedicated iMessage line. Cancel the returned operation to stop waiting. The Idempotency-Key is required and permanent."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_PROVISION_WHATSAPP_DEDICATED_LINE, payload)

    async def purchase_sms_number(
        self, input: PurchaseSmsNumberInput
    ) -> RawResponse[models.Operation]:
        "Purchase SMS number\n\nBuys one US local number from the provider and records it as a resource with SMS enabled. Requires countryCode (US) and accepts an optional three-digit geographic areaCode. The server selects an exact matching number. Empty inventory keeps the operation running until a number is available or the caller cancels before ordering begins. Always answers 202 with an operation: the work runs behind the response, and the Location points at the operation to poll. New area-specific requests must appear in current provider coverage; discover it with GET /sms/numbers/area-codes?countryCode=US. Coverage and subscription checks run before operation creation. Billing follows delivery. Replays return the original operation without checking current coverage. The Idempotency-Key is required and permanent: repeating it returns the same operation forever, never a second number. A further number always needs a NEW key, including while others are still running. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_PURCHASE_SMS_NUMBER, payload)

    async def release_imessage_dedicated_line(
        self, input: ReleaseImessageDedicatedLineInput
    ) -> RawResponse[models.Operation]:
        "Release dedicated iMessage line\n\nRemoves only iMessage from one dedicated line. Shared Voice is removed only when WhatsApp is absent; if WhatsApp remains, Voice, the resource, ownership, and phone number are preserved. Usually finishes inside this request and answers 200; a slow workflow answers 202 with an operation to poll. Takes no Idempotency-Key because the open iMessage charge period identifies this product tenure."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_RELEASE_IMESSAGE_DEDICATED_LINE, payload)

    async def release_resource(self, input: ReleaseResourceInput) -> RawResponse[models.Operation]:
        "Release resource\n\nGives one resource back, whatever it is. What that means is the resource's own business: an SMS number goes back to the provider and is retired, a dedicated iMessage line goes back to the shared pool and stays in existence for someone else to claim. Either way the provider is contacted first where there is one, then a single transaction disables every ability, ends the project's hold and closes the charge period — so a provider that refuses leaves the resource exactly as it was, still owned and still billed. Usually finishes inside this request and answers 200; if the provider is slow it answers 202 and the Location points at the operation to poll. The decrement runs behind the answer either way, so the resource is gone when you are told it is. Takes no Idempotency-Key — releasing the same resource twice is the same request. Releasing one that is already gone answers 404. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_RELEASE_RESOURCE, payload)

    async def release_whatsapp_dedicated_line(
        self, input: ReleaseWhatsappDedicatedLineInput
    ) -> RawResponse[models.Operation]:
        "Release dedicated WhatsApp line\n\nRemoves only WhatsApp from one dedicated line. Shared Voice is removed only when iMessage is absent; if iMessage remains, Voice, the resource, ownership, and phone number are preserved. Usually finishes inside this request and answers 200; a slow workflow answers 202 with an operation to poll. Takes no Idempotency-Key because the open WhatsApp charge period identifies this product tenure."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_RELEASE_WHATSAPP_DEDICATED_LINE, payload)

    async def release_whatsapp_shared_line_assignment(
        self, input: ReleaseWhatsappSharedLineAssignmentInput
    ) -> RawResponse[models.SharedLineAssignment]:
        "Release WhatsApp shared line assignment\n\nReleases a WhatsApp shared line assignment, freeing its seat for reassignment. The row is retained for audit and returned with releasedAt set, so repeating the call is safe. Requires the platforms:write permission bound to the project resource in the path."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_RELEASE_WHATSAPP_SHARED_LINE_ASSIGNMENT, payload)

    async def replace_voice_profile_inbound(
        self, input: ReplaceVoiceProfileInboundInput
    ) -> RawResponse[models.VoiceProfileInboundConfiguration]:
        "Replace Voice inbound configuration\n\nCreates or fully replaces a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. Credentials are required and nullable; null removes destination authentication. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_REPLACE_VOICE_PROFILE_INBOUND, payload)

    async def rotate_voice_profile_outbound_credential(
        self, input: RotateVoiceProfileOutboundCredentialInput
    ) -> RawResponse[models.RotateVoiceProfileOutboundCredentialResponse]:
        "Rotate Voice outbound credential\n\nRotates a SIP profile's outbound credential when expectedVersion matches. The profileId may identify the default or an additional profile. Normal rotation gives the previous credential one hour of grace; emergency rotation gives none. The new password is returned once and is never recoverable. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_ROTATE_VOICE_PROFILE_OUTBOUND_CREDENTIAL, payload)

    async def unassign_sms_line_campaign(
        self, input: UnassignSmsLineCampaignInput
    ) -> RawResponse[models.Operation]:
        "Unassign SMS line campaign\n\nAny project writer, including a scoped API key, may detach the campaign. The number and campaign remain owned. Requires a permanent Idempotency-Key and expectedVersion. Local eligibility is blocked immediately; provider detachment runs asynchronously."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_UNASSIGN_SMS_LINE_CAMPAIGN, payload)

    async def unassign_voice_line_profile(
        self, input: UnassignVoiceLineProfileInput
    ) -> RawResponse[None]:
        "Unassign Voice line profile\n\nRemoves a line's explicit override when the resource version matches so the line follows the project default. Profiles and the pstn_voice ability are unchanged. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_UNASSIGN_VOICE_LINE_PROFILE, payload)

    async def update_default_voice_profile(
        self, input: UpdateDefaultVoiceProfileInput
    ) -> RawResponse[models.VoiceProfile]:
        "Update default Voice profile\n\nPatches the default profile's protocol or mediaEncryption when expectedVersion matches. Omitted fields are preserved. Its server-assigned name is immutable, and directional configuration uses the profileId returned by this resource. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_UPDATE_DEFAULT_VOICE_PROFILE, payload)

    async def update_voice_profile(
        self, input: UpdateVoiceProfileInput
    ) -> RawResponse[models.VoiceProfile]:
        "Update Voice profile\n\nPatches an additional profile's name, protocol, or mediaEncryption when expectedVersion matches. Omitted fields are preserved. Directional configuration is managed through the profile's inbound and outbound endpoints. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_UPDATE_VOICE_PROFILE, payload)

    async def update_voice_profile_inbound(
        self, input: UpdateVoiceProfileInboundInput
    ) -> RawResponse[models.VoiceProfileInboundConfiguration]:
        "Update Voice inbound configuration\n\nUpdates selected fields of a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. At least one of destinationUri or credentials is required. Credential omission preserves destination authentication, null removes it, and an object replaces it atomically. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_UPDATE_VOICE_PROFILE_INBOUND, payload)

    async def update_voice_profile_outbound_authentication(
        self, input: UpdateVoiceProfileOutboundAuthenticationInput
    ) -> RawResponse[models.UpdateVoiceProfileOutboundAuthenticationResponse]:
        "Update Voice outbound authentication\n\nChanges a SIP profile's outbound Digest algorithm when expectedVersion matches. The profileId may identify the default or an additional profile. This policy-only change preserves the password, username, and any previous-password grace deadline. SHA-256 is recommended; MD5 is a weaker legacy option. Returns non-secret outbound metadata and the profile version. Requires platforms:write bound to the path project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(
            _OP_UPDATE_VOICE_PROFILE_OUTBOUND_AUTHENTICATION, payload
        )


class AsyncRawProjectsAgentProfileResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport

    async def commit_avatar(
        self, input: CommitAgentProfileAvatarInput
    ) -> RawResponse[models.AgentProfile]:
        "Commit agent avatar\n\nCommits an agent avatar previously uploaded through createAgentProfileAvatarUpload. Call this only after the direct multipart upload succeeds, using the uploadId from the same upload session and a stable Idempotency-Key. The service validates the temporary object's Project ownership, size, content type, image bytes, dimensions, encryption, and age before changing the agent profile."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_COMMIT_AGENT_PROFILE_AVATAR, payload)

    async def create_avatar_upload(
        self, input: CreateAgentProfileAvatarUploadInput
    ) -> RawResponse[models.AgentProfileAvatarUpload]:
        "Create agent avatar upload\n\nCreates a ten-minute, Project-bound presigned S3 POST for a JPEG, PNG, or WebP agent avatar up to 5 MiB. Copy every returned formFields entry into a multipart/form-data request to uploadUrl, append the local file as the final form part, and upload it directly without sending Photon credentials. After the upload succeeds, call commitAgentProfileAvatar with the returned uploadId. Do not cache or log the upload URL or form fields."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_AGENT_PROFILE_AVATAR_UPLOAD, payload)

    async def get(self, input: GetAgentProfileInput) -> RawResponse[models.AgentProfile]:
        "Get agent profile\n\nReturns the agent profile belonging to the identified project. The profile is project-scoped and is distinct from the authenticated account's personal profile. Use the dedicated avatar operations when uploading or removing an agent avatar."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_AGENT_PROFILE, payload)

    async def reset_avatar(
        self, input: ResetAgentProfileAvatarInput
    ) -> RawResponse[models.AgentProfile]:
        "Reset agent avatar\n\nReplaces the selected project's agent avatar with the project's default avatar, a generated planet image derived from the project ID, and returns the updated agent profile. The reset does not restore an earlier avatar: a custom avatar it replaces is discarded and must be uploaded and committed again to use it. When the default avatar is already in use, the profile is returned unchanged. This does not change the account's personal profile picture. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_RESET_AGENT_PROFILE_AVATAR, payload)

    async def update(self, input: UpdateAgentProfileInput) -> RawResponse[models.AgentProfile]:
        "Update agent profile\n\nUpdates the supplied firstName and lastName fields in the project's agent profile and returns the updated profile. Avatar upload, commit and reset are separate operations. The caller must be authorized to change configuration for the selected project. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_UPDATE_AGENT_PROFILE, payload)


class AsyncRawProjectsBillingResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport

    async def get_operation(
        self, input: GetBillingOperationInput
    ) -> RawResponse[models.BillingOperation]:
        "Get billing operation\n\nReturns the authoritative state of a billing operation belonging to the selected project. Use it to recover or poll a plan-change request until the operation reaches success or failure. An accepted request is not evidence that the plan change has completed."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_BILLING_OPERATION, payload)

    async def get_overview(
        self, input: GetBillingOverviewInput
    ) -> RawResponse[models.GetBillingOverviewResponse]:
        "Get project billing overview\n\nReturns the selected project's plan information, entitlements and current billing-period usage. This operation reads project billing state; it does not change plans or the payer's payment method. Organization-level plans are available through the organization billing overview."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_BILLING_OVERVIEW, payload)

    async def list_billing_plans(
        self, input: ListBillingPlansInput
    ) -> RawResponse[models.ListBillingPlansResponse]:
        "List billing plans\n\nLists the billing plan catalog, grouped by their public plan-metadata type. Use the returned plan information when choosing the category and planCode for a plan change. The catalog is the same for every project, and reading it does not purchase a plan."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_BILLING_PLANS, payload)


class AsyncRawProjectsResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport
        self.agent_profile = AsyncRawProjectsAgentProfileResource(transport)
        self.billing = AsyncRawProjectsBillingResource(transport)
        self.platforms = AsyncRawProjectsPlatformsResource(transport)

    async def create_project_api_key(
        self, input: CreateProjectApiKeyInput
    ) -> RawResponse[models.CreateProjectApiKeyResponse]:
        "Create project API key\n\nCreates a key bound to the selected project using the supplied name, permissions and optional expiry. The secret is returned only in this response and in idempotent replays of it; store it securely because other reads never return it. The key is scoped to this project and does not grant account-level access. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_PROJECT_API_KEY, payload)

    async def create_webhook_destination(
        self, input: CreateWebhookDestinationInput
    ) -> RawResponse[models.CreateWebhookDestinationResponse]:
        "Create webhook destination\n\nCreates a webhook destination for the selected project using its URL, payload API version, event selection and other documented settings. The response includes the signing secret, which is returned only in this response and in idempotent replays of it, never by destination reads; store it securely for signature verification. The API version must be selectable and selected event types must belong to that version's catalog. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_WEBHOOK_DESTINATION, payload)

    async def delete(self, input: DeleteProjectInput) -> RawResponse[models.Project]:
        "Delete project\n\nStarts deletion of the identified project using a credential authorized for project management. Inspect the documented response and use getProjectClosureStatus with the organization and project identifiers to read closure progress. A project API key is not an accepted credential for this operation."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_DELETE_PROJECT, payload)

    async def delete_webhook_destination(
        self, input: DeleteWebhookDestinationInput
    ) -> RawResponse[models.WebhookDestination]:
        "Delete webhook destination\n\nDeletes the selected project's destination and returns its stable tombstone. Repeated deletion returns the deletion representation. This operation removes the destination configuration; it is separate from disabling a destination through an update."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_DELETE_WEBHOOK_DESTINATION, payload)

    async def download_attachment(self, input: DownloadAttachmentInput) -> RawResponse[bytes]:
        "Download attachment\n\nDownloads an Attachment's bytes. If unavailable after ten seconds, returns ATTACHMENT_NOT_READY with Retry-After: 5."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_DOWNLOAD_ATTACHMENT, payload)

    async def get(self, input: GetProjectInput) -> RawResponse[models.Project]:
        "Get project\n\nReturns the identified project's settings for an authorized caller. The credential must be allowed to access that project; possession of an unrelated project's key does not provide access. Missing and deleted projects are reported through the documented error responses."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_PROJECT, payload)

    async def get_attachment(self, input: GetAttachmentInput) -> RawResponse[models.Attachment]:
        "Get attachment\n\nReturns an Attachment's metadata. Use the content endpoint to download its bytes."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_ATTACHMENT, payload)

    async def get_message_metrics_backfill(
        self, input: GetMessageMetricsBackfillInput
    ) -> RawResponse[models.GetMessageMetricsBackfillResponse]:
        "Get metrics backfill status\n\nReturns historical metrics update progress. Completion reflects lastVerifiedAt; queries remain available during updates."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_MESSAGE_METRICS_BACKFILL, payload)

    async def get_message_metrics_sql_schema(
        self, input: GetMessageMetricsSqlSchemaInput
    ) -> RawResponse[models.GetMessageMetricsSqlSchemaResponse]:
        "Get metrics SQL schema\n\nReturns the message_events and call_events SQL schema, supported queries, and limits for the selected API version."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_MESSAGE_METRICS_SQL_SCHEMA, payload)

    async def get_webhook_destination(
        self, input: GetWebhookDestinationInput
    ) -> RawResponse[models.WebhookDestination]:
        "Get webhook destination\n\nReturns the configuration of one webhook destination belonging to the selected project. Missing or deleted destinations are reported as errors. This read does not disclose the signing secret returned when the destination or a secret rotation was created."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_WEBHOOK_DESTINATION, payload)

    async def get_webhook_event_schema(
        self, input: GetWebhookEventSchemaInput
    ) -> RawResponse[models.WebhookEventSchema | None]:
        "Get webhook event schema\n\nReturns the published reader JSON Schema for eventType in the requested webhook apiVersion. Use it to interpret events for that exact payload version. The response media type is application/schema+json; an authorized conditional request may return 304 without a body. Unsupported event/version combinations are rejected."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_WEBHOOK_EVENT_SCHEMA, payload)

    async def list_attachments(
        self, input: ListAttachmentsInput
    ) -> RawResponse[models.AttachmentPage]:
        "List attachments\n\nLists the Project's Attachment metadata, with optional time filters."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_ATTACHMENTS, payload)

    async def list_project_api_keys(
        self, input: ListProjectApiKeysInput
    ) -> RawResponse[models.ListProjectApiKeysResponse]:
        "List project API keys\n\nLists the API keys on the selected project, ordered newest first. Revoked keys are not listed; expired keys stay listed until they are revoked. Entries contain key metadata and permissions, never secret values. Use the returned identifiers to manage an existing key; lost secrets cannot be recovered through this operation."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_PROJECT_API_KEYS, payload)

    async def list_webhook_api_versions(
        self, input: ListWebhookApiVersionsInput
    ) -> RawResponse[models.ListWebhookApiVersionsResponse | None]:
        "List webhook API versions\n\nLists the published webhook payload API versions and their lifecycle metadata. The list is the same for every project. Use the selectable indicator when choosing a version for a destination. These payload dates are separate from SDK package versions. An authorized conditional request may return 304 without a response body."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_WEBHOOK_API_VERSIONS, payload)

    async def list_webhook_destinations(
        self, input: ListWebhookDestinationsInput
    ) -> RawResponse[models.WebhookDestinationPage]:
        "List webhook destinations\n\nReturns a cursor-paginated page of active webhook destinations configured for the selected project. Use pageSize and pageToken to navigate it. The listing returns destination configuration, never signing secrets."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_WEBHOOK_DESTINATIONS, payload)

    async def list_webhook_egress_addresses(
        self, input: ListWebhookEgressAddressesInput
    ) -> RawResponse[models.ListWebhookEgressAddressesResponse | None]:
        "List webhook egress addresses\n\nReturns the public network addresses from which this environment sends webhook deliveries. Use this information when configuring the receiving system's network allowlist. The result is environment-specific and does not describe the API service's ingress addresses."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_WEBHOOK_EGRESS_ADDRESSES, payload)

    async def list_webhook_event_types(
        self, input: ListWebhookEventTypesInput
    ) -> RawResponse[models.ListWebhookEventTypesResponse | None]:
        "List webhook event types\n\nLists the webhook event types available in the requested apiVersion, including their descriptions, audiences and reader-schema URLs. Use this versioned catalog when selecting a destination's enabledEvents. The response may include version-retirement information; an authorized conditional request can return 304 without a body."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_WEBHOOK_EVENT_TYPES, payload)

    async def query_message_metrics(
        self, input: QueryMessageMetricsInput
    ) -> RawResponse[models.QueryMessageMetricsResponse]:
        "Query metrics\n\nRuns read-only SQL over the Project's message_events or call_events table. Get the SQL schema for supported columns, capabilities, and limits."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_QUERY_MESSAGE_METRICS, payload)

    async def retry_webhook_delivery(
        self, input: RetryWebhookDeliveryInput
    ) -> RawResponse[models.RetryWebhookDeliveryResponse]:
        "Retry webhook delivery\n\nRequests an immediate attempt of the selected delivery if it is still the waiting head for its destination and event type. expectedAttemptCount is the failed-attempt counter recorded on the delivery and fences stale requests. This overrides the current backoff, including Retry-After, once. It preserves event identity and the retry budget. Delivered, active, disabled and dead-lettered deliveries cannot be retried. A 202 acknowledges the wake-up, not successful delivery. Supply an Idempotency-Key and retain it when retrying an ambiguous failure."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_RETRY_WEBHOOK_DELIVERY, payload)

    async def revoke_project_api_key(
        self, input: RevokeProjectApiKeyInput
    ) -> RawResponse[models.ProjectApiKeyResponse]:
        "Revoke project API key\n\nRevokes the identified key on the selected project and returns its revoked metadata. Repeating the deletion returns the same revokedAt value. This operation does not rotate the key or return a replacement secret. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_REVOKE_PROJECT_API_KEY, payload)

    async def rotate_webhook_signing_secret(
        self, input: RotateWebhookSigningSecretInput
    ) -> RawResponse[models.RotateWebhookSigningSecretResponse]:
        "Rotate webhook signing secret\n\nRotates the signing secret for the selected project's webhook destination and returns the new secret. The optional overlapSeconds controls the requested overlap with the previous secret according to the documented request constraints. Store the new secret securely and update the receiver's signature verification configuration; it is returned only in this response and in idempotent replays of it, never by destination reads. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_ROTATE_WEBHOOK_SIGNING_SECRET, payload)

    async def update(self, input: UpdateProjectInput) -> RawResponse[models.Project]:
        "Update project\n\nUpdates the identified project's name and returns the updated project. The project slug is not a mutable field in this request. Use an authorized account or organization service-identity credential; a project API key is not accepted. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_UPDATE_PROJECT, payload)

    async def update_project_api_key(
        self, input: UpdateProjectApiKeyInput
    ) -> RawResponse[models.ProjectApiKeyResponse]:
        "Update project API key permissions\n\nReplaces the identified project key's permission list with the supplied permissions and returns the updated metadata. Sending the permission list the key already has leaves it unchanged. This request does not create a new secret or change the key's project binding. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_UPDATE_PROJECT_API_KEY, payload)

    async def update_webhook_destination(
        self, input: UpdateWebhookDestinationInput
    ) -> RawResponse[models.WebhookDestination]:
        "Update webhook destination\n\nUpdates the supplied URL, name, description, status or enabledEvents fields on a project's webhook destination and returns its updated configuration. The payload API version is not a mutable field in this request. Event selections are checked against the destination's versioned catalog; signing-secret rotation is a separate operation. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_UPDATE_WEBHOOK_DESTINATION, payload)

    async def upload_attachment(
        self, input: UploadAttachmentInput
    ) -> RawResponse[models.Attachment]:
        "Upload attachment\n\nUploads a file and returns its Attachment once ready to download."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True, exclude={"body"})
        payload["body"] = input.body.root if input.body is not None else None
        return await self._transport.request(_OP_UPLOAD_ATTACHMENT, payload)


class AsyncRawAuthDeviceResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport

    async def authorize(
        self, input: DeviceAuthorizeInput | None = None
    ) -> RawResponse[models.DeviceAuthorizeResponse]:
        "Start device authorization\n\nStarts the device authorization flow for a CLI or another device without a browser. Show the verification URL and user code, then poll the token endpoint at the returned interval. No request fields are required; any supplied body is ignored."
        payload = (input or DeviceAuthorizeInput()).model_dump(
            mode="json", by_alias=True, exclude_unset=True
        )
        return await self._transport.request(_OP_DEVICE_AUTHORIZE, payload)

    async def token(self, input: DeviceTokenInput) -> RawResponse[models.DeviceTokenResponse]:
        "Exchange device code or refresh token\n\nExchanges an authorized device code or a refresh token for an access token and rotating refresh token. Accepts JSON and form-encoded bodies. While polling, wait at least interval seconds and increase the interval on slow_down. Store the new refresh token after every successful grant.\n\nThis SDK method sends uncompressed JSON (application/json). Other request formats described above apply to direct HTTP requests."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_DEVICE_TOKEN, payload)


class AsyncRawAuthResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport
        self.device = AsyncRawAuthDeviceResource(transport)

    async def begin_invitation_sso(
        self, input: BeginInvitationSsoInput
    ) -> RawResponse[models.OrganizationAuthenticationRedirect]:
        "Sign in with invitation SSO\n\nReturns an authentication URL for the organization SSO connection associated with the supplied invitation token. Supply token and returnTo. Complete the returned authentication flow; requesting its URL does not itself accept the invitation."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_BEGIN_INVITATION_SSO, payload)

    async def begin_organization_authentication(
        self, input: BeginOrganizationAuthenticationInput
    ) -> RawResponse[models.OrganizationAuthenticationRedirect]:
        "Sign in with organization SSO\n\nReturns a URL to authenticate through the selected organization’s current SSO connection. Supply returnTo and open the returned URL to continue the flow. Receiving the URL does not establish an authenticated session."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_BEGIN_ORGANIZATION_AUTHENTICATION, payload)

    async def begin_organization_closure_authentication(
        self, input: BeginOrganizationClosureAuthenticationInput
    ) -> RawResponse[models.OrganizationAuthenticationRedirect]:
        "Sign in to close organization\n\nReturns an authentication URL for the current organization owner to inspect organization closure. Supply returnTo and complete the returned flow. This operation initiates authentication and does not close the organization."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_BEGIN_ORGANIZATION_CLOSURE_AUTHENTICATION, payload)

    async def begin_organization_sso_admission(
        self, input: BeginOrganizationSsoAdmissionInput
    ) -> RawResponse[models.OrganizationAuthenticationRedirect]:
        "Begin organization SSO admission\n\nReturns an SSO admission URL for an existing account and the selected organization. Supply returnTo for the continuation URL. Admission requires completing the returned authentication flow; creating the URL does not itself grant membership."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_BEGIN_ORGANIZATION_SSO_ADMISSION, payload)

    async def create_organization_sso_portal_link(
        self, input: CreateOrganizationSsoPortalLinkInput
    ) -> RawResponse[models.CreateOrganizationSsoPortalLinkResponse]:
        "Create organization setup portal link\n\nReturns an organization setup portal URL. Supply returnTo and optionally intent, either sso or domain_verification; sso is the default. Open the returned URL to complete the selected setup flow."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_ORGANIZATION_SSO_PORTAL_LINK, payload)

    async def disable_organization_sso(
        self, input: DisableOrganizationSsoInput
    ) -> RawResponse[models.OrganizationSsoConfiguration]:
        "Disable organization SSO\n\nDeletes the provider connection, releases the SSO requirement once the connection is gone, then unbinds the chosen domains. Retry with the same Idempotency-Key to resume or await the same run."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_DISABLE_ORGANIZATION_SSO, payload)

    async def get_organization_connection_status(
        self, input: GetOrganizationConnectionStatusInput
    ) -> RawResponse[models.OrganizationConnectionStatus]:
        "Get organization connection status\n\nRequires current human organization membership. Synchronization status does not attest SSO configuration or completed authorization."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_ORGANIZATION_CONNECTION_STATUS, payload)

    async def get_organization_sso_configuration(
        self, input: GetOrganizationSsoConfigurationInput
    ) -> RawResponse[models.OrganizationSsoConfiguration]:
        "Get organization SSO configuration\n\nReturns the selected organization’s SSO connection state, configuration version, and desired and effective policy settings. Read policySyncStatus alongside the enforcement fields to distinguish requested settings from synchronized settings."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_ORGANIZATION_SSO_CONFIGURATION, payload)

    async def list_oauth_scopes(
        self, input: ListOauthScopesInput | None = None
    ) -> RawResponse[models.ListOauthScopesResponse]:
        "List OAuth scopes\n\nLists the business permissions available to OAuth applications."
        payload = (input or ListOauthScopesInput()).model_dump(
            mode="json", by_alias=True, exclude_unset=True
        )
        return await self._transport.request(_OP_LIST_OAUTH_SCOPES, payload)

    async def refresh_organization_sso_connection(
        self, input: RefreshOrganizationSsoConnectionInput
    ) -> RawResponse[models.OrganizationSsoConfiguration]:
        "Refresh organization SSO connection\n\nRefreshes the selected organization’s SSO connection and returns its current connection state, configuration version and policy synchronization status. This operation takes no request body."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_REFRESH_ORGANIZATION_SSO_CONNECTION, payload)

    async def retry_organization_connection_sync(
        self, input: RetryOrganizationConnectionSyncInput
    ) -> RawResponse[models.OrganizationConnectionStatus]:
        "Retry organization connection sync\n\nReconciles existing local intent. Takes no body and cannot change membership, roles or authentication policy."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_RETRY_ORGANIZATION_CONNECTION_SYNC, payload)

    async def start_enterprise_login(
        self, input: StartEnterpriseLoginInput
    ) -> RawResponse[models.StartEnterpriseLoginResponse]:
        "Start company sign-in\n\nReturns a sign-in URL without requiring an existing account: the company SSO connection when the target has a ready connection, otherwise ordinary account login. Supply one documented enrollment variant: organizationId with returnTo (optionally invitationToken), invitationToken with returnTo, or retryToken. Open the returned URL to continue authentication; receiving a URL does not complete sign-in. This is a browser flow: the request must come from an allowed Origin, and the retryToken variant also needs the retry cookie set by the failed sign-in, so send it with credentials."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_START_ENTERPRISE_LOGIN, payload)

    async def update_organization_sso_policy(
        self, input: UpdateOrganizationSsoPolicyInput
    ) -> RawResponse[models.OrganizationSsoConfiguration]:
        "Update organization SSO policy\n\nUpdates whether SSO can admit new members automatically using ssoJitEnabled and the current expectedVersion. Returns the organization’s SSO configuration and policy synchronization status; a successful response does not mean every desired policy setting has finished synchronizing."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_UPDATE_ORGANIZATION_SSO_POLICY, payload)


class AsyncRawOrganizationsBillingResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport

    async def change_plan(
        self, input: ChangePlanInput
    ) -> RawResponse[models.TerminalBillingOperation | models.PendingBillingOperation]:
        "Change plan\n\nPurchases or changes the selected project's plan for the supplied category and planCode. A 202 response means the change is pending: poll the returned operation URL and honor Retry-After until it succeeds or fails. A 200 response means the idempotency key resolved to an operation that is already terminal; inspect that result rather than assuming success from the status code alone. Supply the required Idempotency-Key header. Supply both organizationId and projectId to select the project within its organization."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CHANGE_PLAN, payload)

    async def create_organization_payment_method_checkout(
        self, input: CreateOrganizationPaymentMethodCheckoutInput
    ) -> RawResponse[models.CreateOrganizationPaymentMethodCheckoutResponse]:
        "Create payment method checkout\n\nReturns a hosted payment-method collection URL for the selected organization. An Idempotency-Key header is optional; supply one to make retries safe. Complete the returned checkout flow. Receiving the URL does not mean a card has been saved; check payment-method status afterward."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(
            _OP_CREATE_ORGANIZATION_PAYMENT_METHOD_CHECKOUT, payload
        )

    async def create_organization_setup_intent(
        self, input: CreateOrganizationSetupIntentInput
    ) -> RawResponse[models.CreateOrganizationSetupIntentResponse]:
        "Create card setup intent\n\nCreates payment-provider configuration for collecting a card for the selected organization and returns clientSecret and publishableKey. Supply the required Idempotency-Key header. Complete the provider’s card-collection flow separately and avoid logging the returned client secret."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_ORGANIZATION_SETUP_INTENT, payload)

    async def get_effective_terms(
        self, input: GetEffectiveTermsInput
    ) -> RawResponse[models.GetEffectiveTermsResponse]:
        "Get the project's effective billing terms\n\nReturns what the selected project is billed on now, per category it holds: the plan as its subscription has it, with any override applied, each fixed charge at the subscription's price and quantity, and resolved entitlements; where the plan comes from; how invoices are paid; the current period and next billing date; and any downgrade or cancellation waiting for the period end. It also returns the credit the paying organization holds on credit notes, such as the unused time of a plan an upgrade replaced; it offsets that organization's next invoices. Supply both organizationId and projectId; the organization must pay for the project. This operation does not change billing."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_EFFECTIVE_TERMS, payload)

    async def get_organization_billing_overview(
        self, input: GetOrganizationBillingOverviewInput
    ) -> RawResponse[models.GetOrganizationBillingOverviewResponse]:
        "Get organization billing overview\n\nReturns the selected organization’s billing subscription and entitlementsVersion. The subscription can be null. Read the returned plan, charges and entitlements to inspect organization billing; this operation does not purchase or change a plan."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_ORGANIZATION_BILLING_OVERVIEW, payload)

    async def get_organization_payment_method(
        self, input: GetOrganizationPaymentMethodInput
    ) -> RawResponse[models.GetOrganizationPaymentMethodResponse]:
        "Get organization payment method\n\nReports whether the selected organization has a card on file and returns its documented payment-method metadata. Reading this endpoint does not collect a new card or create a checkout session."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_ORGANIZATION_PAYMENT_METHOD, payload)

    async def list_invoices(
        self, input: ListInvoicesInput
    ) -> RawResponse[models.ListInvoicesResponse]:
        "List invoices\n\nReturns a single page of the selected organization's invoices; invoices with a zero total are excluded. Use the documented invoice fields to inspect each invoice's billing state. Listing invoices does not make a payment or modify a subscription."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_INVOICES, payload)

    async def preview_organization_change(
        self, input: PreviewOrganizationChangeInput
    ) -> RawResponse[models.PreviewOrganizationChangeResponse]:
        "Preview an organization billing change\n\nPreviews a fixed-charge quantity change on the selected organization's own subscription, such as SSO. Prices the change by the billing engine exactly as making it would bill it now: dueNow is that invoice, with taxes and the payer's credits applied. A quantity already paid for this period is not billed again, so a purchase after a release can be free. nextCharge is what is charged in advance at the next period start. For a fixed-charge change, pass quote on with the purchase so it is refused if the price or period no longer hold. This operation does not change billing."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_PREVIEW_ORGANIZATION_CHANGE, payload)

    async def preview_project_change(
        self, input: PreviewProjectChangeInput
    ) -> RawResponse[models.PreviewProjectChangeResponse]:
        "Preview a project billing change\n\nPreviews a change on the selected project's subscription in the supplied category: a fixed-charge quantity change, or a plan change with the held fixed charges it carries over. Prices the change by the billing engine exactly as making it would bill it now: dueNow is that invoice, with taxes and the payer's credits applied. A quantity already paid for this period is not billed again, so a purchase after a release can be free. nextCharge is what is charged in advance at the next period start. For a fixed-charge change, pass quote on with the purchase so it is refused if the price or period no longer hold. This operation does not change billing. An upgrade bills the replaced plan's usage to date and the new plan from now, less the replaced plan's unused time; planChange says when it applies and which held fixed charges the target does not sell: released first for a change that applies now, released with a downgrade when it applies. additions quotes what is added once an upgrade applies, each billed when it is added, in planChange.additions and outside dueNow. Supply both organizationId and projectId; the organization must pay for the project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_PREVIEW_PROJECT_CHANGE, payload)


class AsyncRawOrganizationsProjectsResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport

    async def check_project_slug_availability(
        self, input: CheckProjectSlugAvailabilityInput
    ) -> RawResponse[models.CheckProjectSlugAvailabilityResponse]:
        "Check project slug availability\n\nReports whether createProject would accept `slug` right now. Advisory: only the create itself allocates, so a caller must still handle SLUG_TAKEN. A malformed slug is rejected on shape; a reserved slug, a slug held by an active project, and a slug retired with a deleted project each answer `available: false` with a reason."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CHECK_PROJECT_SLUG_AVAILABILITY, payload)

    async def count(self, input: CountProjectsInput) -> RawResponse[models.ProjectCount]:
        "Count projects\n\nCounts the projects the same filter would list. The count is read from the primary, so it is authoritative rather than replica-lagged."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_COUNT_PROJECTS, payload)

    async def create(self, input: CreateProjectInput) -> RawResponse[models.Project]:
        "Create project\n\nCreates in the authorized organization. In addition to account credentials, explicitly granted Service Identity API keys and M2M tokens may create projects. Project API keys cannot create projects. Creator and private credential evidence come only from the trusted authorization context. The caller-selected slug is immutable, must be 3 to 63 lowercase ASCII alphanumerics separated by single hyphens, and cannot be reserved or held by any active or deleted project."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_PROJECT, payload)

    async def get_project_closure_status(
        self, input: GetProjectClosureStatusInput
    ) -> RawResponse[models.GetProjectClosureStatusResponse]:
        "Get project closure status\n\nReturns closure progress for projectId within organizationId, including deletionOperationId, domain progress and ready. This read operation does not initiate deletion."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_GET_PROJECT_CLOSURE_STATUS, payload)

    async def list(self, input: ListProjectsInput) -> RawResponse[models.ProjectPage]:
        "List projects\n\nReturns a cursor-paginated page of the active projects in organizationId. Filter using query and the documented creation-time bounds, and navigate with pageSize and pageToken. Project roles are not returned and role is not a supported filter."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_LIST_PROJECTS, payload)


class AsyncRawOrganizationsResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport
        self.billing = AsyncRawOrganizationsBillingResource(transport)
        self.projects = AsyncRawOrganizationsProjectsResource(transport)


class AsyncRawAccountResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport

    async def commit_profile_picture(
        self, input: CommitAccountProfilePictureInput
    ) -> RawResponse[models.Account]:
        "Commit profile picture\n\nCommits a profile picture previously uploaded through createAccountProfilePictureUpload. Call this only after the direct multipart upload succeeds, using the uploadId from the same upload session and a stable Idempotency-Key. The service validates the temporary object's ownership, size, content type, image bytes, dimensions, encryption, and age before changing the Account."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_COMMIT_ACCOUNT_PROFILE_PICTURE, payload)

    async def confirm_phone_verification(
        self, input: ConfirmAccountPhoneVerificationInput
    ) -> RawResponse[models.Account]:
        "Confirm phone verification\n\nBinds the number once the code is approved. Repeat calls return the bound Account."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CONFIRM_ACCOUNT_PHONE_VERIFICATION, payload)

    async def create_account_service_key(
        self, input: CreateAccountServiceKeyInput
    ) -> RawResponse[models.CreateAccountServiceKeyResponse]:
        "Create Account Service Key\n\nCreates a service key for the authenticated account with the supplied name and optional expiresAt. Returns key metadata and a one-time credential; store the credential securely because it cannot be retrieved through the listing endpoint. These credentials act as the account and must not be distributed as project-scoped keys. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_ACCOUNT_SERVICE_KEY, payload)

    async def create_profile_picture_upload(
        self, input: CreateAccountProfilePictureUploadInput
    ) -> RawResponse[models.ProfilePictureUpload]:
        "Create profile picture upload\n\nCreates a ten-minute, Account-bound presigned S3 POST for a JPEG, PNG, or WebP profile picture up to 5 MiB. Copy every returned formFields entry into a multipart/form-data request to uploadUrl, append the local file as the final form part, and upload it directly without sending Photon credentials. After the upload succeeds, call commitAccountProfilePicture with the returned uploadId. Do not cache or log the upload URL or form fields."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_ACCOUNT_PROFILE_PICTURE_UPLOAD, payload)

    async def delete(self, input: DeleteAccountInput | None = None) -> RawResponse[models.Account]:
        "Delete account\n\nDeletes the authenticated account and returns its account tombstone. The operation is rejected while the account still owns organizations; transfer or close those organizations before retrying. This endpoint acts on the caller's account and does not accept another account's identifier."
        payload = (input or DeleteAccountInput()).model_dump(
            mode="json", by_alias=True, exclude_unset=True
        )
        return await self._transport.request(_OP_DELETE_ACCOUNT, payload)

    async def get(self, input: GetAccountInput | None = None) -> RawResponse[models.Account]:
        "Get account\n\nReturns the profile of the authenticated account. The account is selected from the credential rather than a request parameter. A missing or deleted account is reported as an error instead of an empty profile."
        payload = (input or GetAccountInput()).model_dump(
            mode="json", by_alias=True, exclude_unset=True
        )
        return await self._transport.request(_OP_GET_ACCOUNT, payload)

    async def list_account_service_keys(
        self, input: ListAccountServiceKeysInput | None = None
    ) -> RawResponse[models.ListAccountServiceKeysResponse]:
        "List Account Service Keys\n\nReturns metadata for the authenticated account's unrevoked service keys, including expired keys, ordered newest first. Secret values are not returned; a key's credential is disclosed only when that key is created."
        payload = (input or ListAccountServiceKeysInput()).model_dump(
            mode="json", by_alias=True, exclude_unset=True
        )
        return await self._transport.request(_OP_LIST_ACCOUNT_SERVICE_KEYS, payload)

    async def list_authorized_applications(
        self, input: ListAuthorizedApplicationsInput | None = None
    ) -> RawResponse[models.ListAuthorizedApplicationsResponse]:
        "List connected applications\n\nLists the OAuth applications authorized by the authenticated user."
        payload = (input or ListAuthorizedApplicationsInput()).model_dump(
            mode="json", by_alias=True, exclude_unset=True
        )
        return await self._transport.request(_OP_LIST_AUTHORIZED_APPLICATIONS, payload)

    async def reset_profile_picture(
        self, input: ResetAccountProfilePictureInput
    ) -> RawResponse[models.Account]:
        "Remove profile picture\n\nRemoves the authenticated account's custom profile picture and returns the account using its default picture. This operation does not upload a replacement; use the upload-and-commit operations when setting a new custom picture. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_RESET_ACCOUNT_PROFILE_PICTURE, payload)

    async def revoke_account_service_key(
        self, input: RevokeAccountServiceKeyInput
    ) -> RawResponse[models.RevokeAccountServiceKeyResponse]:
        "Revoke Account Service Key\n\nRevokes the account-owned service key identified by serviceKeyId and returns its revoked metadata. Repeating the revocation is stable. Revocation changes the credential's validity; it does not create a replacement key. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_REVOKE_ACCOUNT_SERVICE_KEY, payload)

    async def revoke_authorized_application(
        self, input: RevokeAuthorizedApplicationInput
    ) -> RawResponse[None]:
        "Revoke connected application\n\nRevokes the authenticated user's grant for one OAuth application."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_REVOKE_AUTHORIZED_APPLICATION, payload)

    async def start_phone_verification(
        self, input: StartAccountPhoneVerificationInput
    ) -> RawResponse[models.StartAccountPhoneVerificationResponse]:
        "Start phone verification\n\nSends an SMS code. Answers CAPTCHA_REQUIRED with the widget to render when no solved challenge accompanies the request; retry with the returned challengeContext and a token. Rate limited per account, per destination number, and globally; a rejection carries Retry-After."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_START_ACCOUNT_PHONE_VERIFICATION, payload)

    async def update(self, input: UpdateAccountInput) -> RawResponse[models.Account]:
        "Update account\n\nUpdates the supplied firstName and lastName fields on the authenticated account and returns the updated profile. Only the documented profile fields can be changed through this endpoint; profile-picture uploads and phone-number verification use their dedicated operations. Supply the required Idempotency-Key header."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_UPDATE_ACCOUNT, payload)


class AsyncRawSystemResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._transport = transport

    async def create_app_installation_request(
        self, input: CreateAppInstallationRequestInput
    ) -> RawResponse[models.CreateAppInstallationRequestResponse]:
        "Request app installation\n\nAuthenticates a registered app backend using a short-lived signed client assertion. Creates request metadata only; customer approval is still required."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_CREATE_APP_INSTALLATION_REQUEST, payload)

    async def redeem_app_installation_delivery(
        self, input: RedeemAppInstallationDeliveryInput
    ) -> RawResponse[models.RedeemAppInstallationDeliveryResponse]:
        "Redeem installation credential\n\nThe registered app backend authenticates with a signed client assertion and a single-use code. Plaintext is returned only once; retries return status and never create another credential."
        payload = input.model_dump(mode="json", by_alias=True, exclude_unset=True)
        return await self._transport.request(_OP_REDEEM_APP_INSTALLATION_DELIVERY, payload)


class AsyncProjectsPlatformsImessageAssignmentsResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawProjectsPlatformsImessageAssignmentsResource(transport)

    async def create(self, input: CreateSharedLineAssignmentInput) -> models.SharedLineAssignment:
        "Create shared line assignment\n\nMaps an end user's iMessage handle — an E.164 phone number or an email address — onto one of the project's pooled shared iMessage lines, consuming a seat from the project's entitlement. The assigned number is allocated by the server. When an email address is supplied in `email` the user is sent an invite asynchronously to that address; it is never inferred from the handle, and the response never reports whether the send succeeded. Requires the platforms:write permission bound to the project resource in the path."
        return (await self._raw_resource.create(input)).data

    async def get(self, input: GetSharedLineAssignmentInput) -> models.SharedLineAssignment:
        "Get shared line assignment\n\nReads one shared line assignment. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.get(input)).data

    async def list(self, input: ListSharedLineAssignmentsInput) -> models.SharedLineAssignmentPage:
        "List shared line assignments\n\nLists the project's shared line assignments, oldest first. Released assignments are excluded unless includeReleased is set. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.list(input)).data

    async def release(self, input: ReleaseSharedLineAssignmentInput) -> models.SharedLineAssignment:
        "Release shared line assignment\n\nReleases a shared line assignment, freeing both its seat and its handle for reassignment. The row is retained for audit and returned with releasedAt set, so repeating the call is safe. Requires the platforms:write permission bound to the project resource in the path."
        return (await self._raw_resource.release(input)).data


class AsyncProjectsPlatformsImessageResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawProjectsPlatformsImessageResource(transport)
        self.assignments = AsyncProjectsPlatformsImessageAssignmentsResource(transport)


class AsyncProjectsPlatformsResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawProjectsPlatformsResource(transport)
        self.imessage = AsyncProjectsPlatformsImessageResource(transport)

    async def assign_sms_line_campaign(self, input: AssignSmsLineCampaignInput) -> models.Operation:
        "Assign or replace SMS line campaign\n\nAttach a ready campaign from this project’s organization to its line. Requires platforms:write for the project; human and machine actors retain their authenticated identity. Requires a permanent Idempotency-Key and the current assignment version. Provider provisioning runs asynchronously."
        return (await self._raw_resource.assign_sms_line_campaign(input)).data

    async def assign_voice_line_profile(
        self, input: AssignVoiceLineProfileInput
    ) -> models.VoiceLineProfileAssignment:
        "Assign Voice line profile\n\nAssigns or replaces a line's explicit additional-profile override when the resource version matches. The current default cannot be assigned explicitly. The pstn_voice ability remains the admission source of truth. Requires platforms:write bound to the path project."
        return (await self._raw_resource.assign_voice_line_profile(input)).data

    async def batch_update_voice_line_profile_assignments(
        self, input: BatchUpdateVoiceLineProfileAssignmentsInput
    ) -> models.BatchUpdateVoiceLineProfileAssignmentsResponse:
        "Batch update Voice line assignments\n\nAtomically sets additional-profile overrides or switches lines back to the project default for up to 100 Voice-capable lines. A null profileId means use the default. Every expected resource version must match or no line changes. Requires platforms:write bound to the path project."
        return (await self._raw_resource.batch_update_voice_line_profile_assignments(input)).data

    async def cancel_operation(self, input: CancelOperationInput) -> models.Operation:
        "Cancel operation\n\nWithdraws a provision that has not been fulfilled yet. This is an operations action rather than a DELETE, because there is nothing to delete: no resource exists until the work commits. Whether it is accepted depends on the resource type — a dedicated iMessage line may sit waiting on inventory for hours and withdrawing costs nothing, while an SMS number is cancellable during inventory waiting and answers 409 once the workflow commits to its first provider order. Campaign assignment and detachment operations cannot be cancelled in any state. Wait for completion before requesting another change; that new change is not a guaranteed rollback. The output-only `cancellable` field is a snapshot; the cancellation transaction always checks the current phase under a row lock. A cancel that loses the race against the work finishing also answers 409: the resource exists and is billed for, so what you want then is to release it. Nothing is charged for a cancelled provision — billing runs after the work, so there is never anything to refund. Requires the platforms:write permission bound to the project resource in the path."
        return (await self._raw_resource.cancel_operation(input)).data

    async def configure_voice_profile_outbound(
        self, input: ConfigureVoiceProfileOutboundInput
    ) -> models.ConfigureVoiceProfileOutboundResponse:
        "Configure Voice outbound credential\n\nConfigures a SIP credential for outbound calls from a profile when the shared profile version matches. Outbound calls are paid usage, so the organization needs a payment method and no invoices overdue 7 days or more; otherwise this returns 402 ENTITLEMENT_REQUIRED with a reason. authentication.algorithm is required: SHA-256 is recommended, while MD5 is a weaker legacy option supported over UDP, TCP, and TLS; TLS is strongly recommended because UDP and TCP do not encrypt SIP signaling. The profileId may identify the default or an additional profile. The new password is returned once and is never recoverable. Requires platforms:write bound to the path project."
        return (await self._raw_resource.configure_voice_profile_outbound(input)).data

    async def connect_email_domain(self, input: ConnectEmailDomainInput) -> models.Operation:
        "Connect email domain\n\nReserves a normalized DNS domain and starts its durable email-provider setup. The accepted provision consumes one email-domain entitlement slot until it fails, is cancelled, or becomes a live resource; the plan's email.max_email_domains value sets the project limit. The customer resource does not exist until provider identity and DNS setup reach READY; poll the returned operation for progress. A domain may have only one unfinished provision or live resource globally. Email domains have no additional per-domain charge. The Idempotency-Key is required and permanent: replaying the same key and canonical domain returns the original operation forever. Requires the platforms:write permission bound to the project resource in the path."
        return (await self._raw_resource.connect_email_domain(input)).data

    async def connect_telegram_bot(self, input: ConnectTelegramBotInput) -> models.Operation:
        "Connect Telegram bot\n\nStarts a free managed Telegram bot connection. Each project may have one unfinished Telegram provision, including user interaction and failure cleanup. A different Idempotency-Key while one is active returns 409 TELEGRAM_PROVISION_IN_PROGRESS with its operationId and operationUrl; resume it, cancel it while cancellation is available, or wait for it to finish. Rejected keys remain reusable. Open detail.setupUrl to connect an existing managed bot or create a new one with the project's default agent name or a custom display name, then poll Location. The link remains usable while the operation is active and never expires. Replaying the same Idempotency-Key returns the original operation, even after completion or while a newer setup is active. POST, GET and list share the same operation details. The API includes detail.setupUrl only for callers with platforms:write for the project; read-only callers receive the other details unchanged."
        return (await self._raw_resource.connect_telegram_bot(input)).data

    async def connect_whatsapp_business(
        self, input: ConnectWhatsappBusinessInput
    ) -> models.Operation:
        "Connect WhatsApp Business\n\nExchanges the authorization code Embedded Signup returned and connects exactly the selected phone number as one `whatsapp_sender`. Send the WABA id and phone-number id emitted by the same popup attempt; both are treated as selectors and verified against Meta before use. A selected number that matches a non-retired, same-project `voip_line` is linked to it; a number absent from Photon inventory stays unbound; a matching non-retired `cosmos_line`, foreign VoIP line or unassigned VoIP line fails the operation before registration. Connecting is free — no plan requirement — but Billing must report the project's organization as ready with a payment method on file. The Idempotency-Key is required and permanent: replaying the same key returns the original operation forever. Requires the platforms:write permission bound to the project resource in the path."
        return (await self._raw_resource.connect_whatsapp_business(input)).data

    async def count_filtered_verification_codes(
        self, input: CountFilteredVerificationCodesInput
    ) -> models.FilteredVerificationCodeCount:
        "Count filtered verification codes\n\nCounts the verification codes Photon kept from this project's dedicated lines and numbers, optionally for one `platform`. Without `receivedAfter` and `receivedBefore` the window is the 30 days before the request; a window longer than 366 days is rejected. The response echoes the window it resolved, so the number always says which period it covers. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.count_filtered_verification_codes(input)).data

    async def count_resource_filtered_verification_codes(
        self, input: CountResourceFilteredVerificationCodesInput
    ) -> models.FilteredVerificationCodeCount:
        "Count a line's filtered verification codes\n\nCounts the verification codes Photon kept from one dedicated line or number. Without `receivedAfter` and `receivedBefore` the window is the 30 days before the request; a window longer than 366 days is rejected. The response echoes the window it resolved, so the number always says which period it covers. Answers 404 unless the project holds the resource now. Codes from an earlier tenure stay in the project-wide list. Filter by `platform` — a number receives both SMS and WhatsApp. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.count_resource_filtered_verification_codes(input)).data

    async def create_default_voice_profile(
        self, input: CreateDefaultVoiceProfileInput
    ) -> models.VoiceProfile:
        "Create default Voice profile\n\nCreates the project default Voice profile when absent. An identical replay returns the existing default without changing its version; a different existing default conflicts. Direction configuration is managed separately. Requires platforms:write bound to the path project."
        return (await self._raw_resource.create_default_voice_profile(input)).data

    async def create_voice_profile(self, input: CreateVoiceProfileInput) -> models.VoiceProfile:
        "Create Voice profile\n\nCreates a direction-neutral additional Voice profile. The project default must already exist. Requires platforms:write bound to the path project."
        return (await self._raw_resource.create_voice_profile(input)).data

    async def create_whatsapp_shared_line_assignment(
        self, input: CreateWhatsappSharedLineAssignmentInput
    ) -> models.SharedLineAssignment:
        "Create WhatsApp shared line assignment\n\nMaps an end user's phone number onto one of the project's pooled shared WhatsApp lines, consuming a seat from the project's WhatsApp entitlement. The assigned number is allocated by the server. When an email address is supplied the user is sent an invite asynchronously; the response never reports whether that succeeded. Requires the platforms:write permission bound to the project resource in the path."
        return (await self._raw_resource.create_whatsapp_shared_line_assignment(input)).data

    async def create_whatsapp_voip_sender(
        self, input: CreateWhatsappVoipSenderInput
    ) -> models.Operation:
        "Create WhatsApp VoIP sender\n\nRegisters an active, SMS-capable Photon VoIP line on this project's connected WhatsApp Business Account. The account is resolved server-side; callers never select a WABA. The platform creates or reuses the Meta number, requests and consumes the SMS ownership code internally, verifies it, and registers the sender. displayName is optional; when omitted the project agent profile name is snapshotted before acceptance. The VoIP line remains a separate resource and never receives the whatsapp_business ability."
        return (await self._raw_resource.create_whatsapp_voip_sender(input)).data

    async def delete_voice_profile(self, input: DeleteVoiceProfileInput) -> None:
        "Delete Voice profile\n\nDeletes an additional profile when expectedVersion matches. Assigned profiles require force=true, which atomically removes every stored override so affected lines follow the default. The default can never be deleted. Requires platforms:write bound to the path project."
        return (await self._raw_resource.delete_voice_profile(input)).data

    async def delete_voice_profile_inbound(
        self, input: DeleteVoiceProfileInboundInput
    ) -> models.VoiceProfileInboundConfiguration:
        "Delete Voice inbound configuration\n\nRemoves a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. The profile and its line assignments remain. Requires platforms:write bound to the path project."
        return (await self._raw_resource.delete_voice_profile_inbound(input)).data

    async def delete_voice_profile_outbound(
        self, input: DeleteVoiceProfileOutboundInput
    ) -> models.DeleteVoiceProfileOutboundResponse:
        "Revoke Voice outbound credential\n\nRevokes outbound calling for a profile when the shared profile version matches. The profileId may identify the default or an additional profile. The profile, inbound destination, and line assignments remain. Requires platforms:write bound to the path project."
        return (await self._raw_resource.delete_voice_profile_outbound(input)).data

    async def disconnect_whatsapp_business_account(
        self, input: DisconnectWhatsappBusinessAccountInput
    ) -> models.Operation:
        "Disconnect WhatsApp Business account\n\nDisconnects every attached WhatsApp sender, then unsubscribes our app and removes the project's business account connection. Photon VoIP lines and the numbers in Meta remain. Requires Idempotency-Key. Poll the returned operation; provider refusals appear as operation failures and retain the account for retry with a new key. New signups are blocked while disconnecting, and existing provisions must finish before this request can be accepted."
        return (await self._raw_resource.disconnect_whatsapp_business_account(input)).data

    async def get_default_voice_profile(
        self, input: GetDefaultVoiceProfileInput
    ) -> models.VoiceProfile:
        "Get default Voice profile\n\nGets the profile currently selected as the project default, including its optional inbound delivery state. Requires platforms:read bound to the path project."
        return (await self._raw_resource.get_default_voice_profile(input)).data

    async def get_imessage(
        self, input: GetProjectImessagePlatformInput
    ) -> models.ProjectPlatformSettings:
        "Get project iMessage platform\n\nReports whether the project is on shared or dedicated iMessage lines, derived from its billing entitlements. Shared mode carries the seat cap. Both say whether a dedicated line requested now would be assigned without waiting. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.get_imessage(input)).data

    async def get_operation(self, input: GetOperationInput) -> models.GetOperationResponse:
        "Get operation\n\nReads one operation using the same operation representation as creation and list. The API includes detail.setupUrl only with platforms:write for this project. This is the polling endpoint every asynchronous request here points its Location at, and it resolves from the moment that request is accepted — an operation is committed before its work is dispatched, so there is no window in which the URL 404s. Poll until `state` is one of `succeeded`, `failed` or `cancelled`, pacing from the Retry-After the accepting response returned. While an email domain waits for DNS, `detail` always contains the manual records and may additionally contain `automaticSetup` with a signed provider URL to open separately. Once the operation has produced a resource, the response carries that resource too, so the poll that finishes is also the one that tells you what you got. `succeeded` means the work is done; billing runs behind it and is not something the caller waits on. Operations are never purged, so a 404 means the id was never this project's. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.get_operation(input)).data

    async def get_project_whatsapp_platform(
        self, input: GetProjectWhatsappPlatformInput
    ) -> models.ProjectPlatformSettings:
        "Get project WhatsApp platform\n\nReports whether the project is on shared or dedicated WhatsApp lines, derived from its billing entitlements. Shared mode carries the seat cap. Both say whether a dedicated line requested now would be assigned without waiting. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.get_project_whatsapp_platform(input)).data

    async def get_resource(self, input: GetResourceInput) -> models.Resource:
        "Get resource\n\nReads one resource the project holds. A released number stays readable and reads `retired`, because it remains part of this project's history. A dedicated line given back does NOT: returning it to inventory is what makes it claimable by someone else, so it answers 404 and the operation that returned it is the record that this project once held it. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.get_resource(input)).data

    async def get_sms_line_campaign_assignment(
        self, input: GetSmsLineCampaignAssignmentInput
    ) -> models.GetSmsLineCampaignAssignmentResponse:
        "Get SMS line campaign assignment\n\nRead the last confirmed campaign and current eligibility. Follow changes through their operations. Eligibility is a control-plane assessment, not a delivery or recipient-consent guarantee."
        return (await self._raw_resource.get_sms_line_campaign_assignment(input)).data

    async def get_voice_line_profile_assignment(
        self, input: GetVoiceLineProfileAssignmentInput
    ) -> models.VoiceLineProfileAssignment:
        "Get Voice line profile assignment\n\nGets the explicit additional-profile override for an owned Voice-capable line. A line following the project default returns 200 without profileId. Requires platforms:read bound to the path project."
        return (await self._raw_resource.get_voice_line_profile_assignment(input)).data

    async def get_voice_profile(self, input: GetVoiceProfileInput) -> models.VoiceProfile:
        "Get Voice profile\n\nGets one reusable Voice profile, including its optional inbound delivery state. Requires platforms:read bound to the path project."
        return (await self._raw_resource.get_voice_profile(input)).data

    async def get_whatsapp_business_account(
        self, input: GetWhatsappBusinessAccountInput
    ) -> models.WhatsappBusinessAccount:
        "Get WhatsApp Business account\n\nGets the one WhatsApp Business Account this project has connected, with its number of live senders. Senders are resources and are listed by GET /platforms/resources?ability=whatsapp_business. The account is not a resource and carries no access token. Meta's retained numbers are listed separately by GET /platforms/whatsapp-business/account/phone-numbers. `subscribedAt` is absent until our app is attached to the account's webhooks. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.get_whatsapp_business_account(input)).data

    async def get_whatsapp_business_verification_code(
        self, input: GetWhatsappBusinessVerificationCodeInput
    ) -> models.GetWhatsappBusinessVerificationCodeResponse:
        "Get WhatsApp Business verification code\n\nReturns the latest six-digit WhatsApp Business ownership code received by SMS for an active Photon VOIP number, but only when its provider timestamp is strictly newer than the required receivedAfter boundary. receivedAfter must be an RFC 3339 timestamp between this request's arrival time and two minutes before it; once it expires, restart Meta's verification flow with a new boundary. A missing newer code is a retryable 404 with Retry-After: 2. Poll after 2, 4, 8, then 10 seconds, applying ±20% jitter and capping later intervals at 10 seconds. Stop when the original boundary is two minutes old. Responses are never cached. Requires the platforms:write permission bound to the project resource in the path."
        return (await self._raw_resource.get_whatsapp_business_verification_code(input)).data

    async def get_whatsapp_shared_line_assignment(
        self, input: GetWhatsappSharedLineAssignmentInput
    ) -> models.SharedLineAssignment:
        "Get WhatsApp shared line assignment\n\nReads one WhatsApp shared line assignment. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.get_whatsapp_shared_line_assignment(input)).data

    async def get_whatsapp_signup_config(
        self, input: GetWhatsappSignupConfigInput
    ) -> models.GetWhatsappSignupConfigResponse:
        "Get WhatsApp signup config\n\nReturns what the browser needs to open Meta's Embedded Signup popup: the Facebook Login for Business configuration id, the Graph version to run against, and the scopes it will request. Answered in-process rather than forwarded, so the first step of onboarding survives an outage of the private service. Pass `configId` to `FB.login` as `config_id` with `response_type: 'code'` and `override_default_response_type: true`. Do NOT add a `featureType` — omitting it is what keeps the phone-number screen in the flow, and `only_waba_sharing` produces an account with no number that cannot be provisioned. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.get_whatsapp_signup_config(input)).data

    async def list_filtered_verification_codes(
        self, input: ListFilteredVerificationCodesInput
    ) -> models.FilteredVerificationCodePage:
        "List filtered verification codes\n\nLists the verification codes Photon kept from this project's dedicated lines and numbers. Inbound messages that carry a one-time code are filtered before delivery; this is the record that they arrived, so a quiet line can be told apart from a broken one. It records the receiving line, its platform and when the code arrived — never the code itself. Each entry names the dedicated line or number (`resourceId`) that received it. Newest first, within an optional inclusive `receivedAfter`/`receivedBefore` window. A page may hold fewer than `pageSize` entries and still return a `nextPageToken`; only its absence means the end. Filter by `platform`; to read one line, use its own filtered-otp path. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.list_filtered_verification_codes(input)).data

    async def list_number_area_codes(
        self, input: ListNumberAreaCodesInput
    ) -> models.ListNumberAreaCodesResponse:
        "List number area codes\n\nLists current provider coverage for US local numbers, sorted and deduplicated. Coverage does not guarantee inventory carrying every required feature. New area-specific purchases must use a listed code; accepted purchases keep waiting if coverage later changes. Requires platforms:read for the path project."
        return (await self._raw_resource.list_number_area_codes(input)).data

    async def list_number_countries(
        self, input: ListNumberCountriesInput
    ) -> models.ListNumberCountriesResponse:
        "List number countries\n\nLists supported purchase countries independently of current provider inventory. Requires platforms:read for the path project."
        return (await self._raw_resource.list_number_countries(input)).data

    async def list_operations(self, input: ListOperationsInput) -> models.OperationPage:
        "List operations\n\nLists the project's operations using the same operation representation as creation and GET. The API includes detail.setupUrl only with platforms:write for this project. Results are oldest first — every provision and release it has ever asked for, including the ones still running. This is the entire in-flight view: a resource only appears once it is real, so nothing half-built shows up in the resource list and nothing in flight is missing from this one. Filter by `resourceId` to get one resource's whole history, which for a pooled line is every tenure this project has had on it. `state` is comma-separated; `type` accepts one operation type and an absent filter means everything, including failed and cancelled operations. `endedAfter` keeps only operations that finished after that instant, so what failed or was withdrawn recently is one short page. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.list_operations(input)).data

    async def list_project_platforms(
        self, input: ListProjectPlatformsInput
    ) -> models.ListProjectPlatformsResponse:
        "List project platforms\n\nLists the platform types available to this project. Every project currently sees the same fixed public contract, answered in-process rather than forwarded, so the list survives an outage of the private service. The project binding exists so that answer can narrow per project without moving the route. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.list_project_platforms(input)).data

    async def list_resource_filtered_verification_codes(
        self, input: ListResourceFilteredVerificationCodesInput
    ) -> models.FilteredVerificationCodePage:
        "List a line's filtered verification codes\n\nLists the verification codes Photon kept from one dedicated line or number. Inbound messages that carry a one-time code are filtered before delivery; this is the record that they arrived, so a quiet line can be told apart from a broken one. It records the receiving line, its platform and when the code arrived — never the code itself. Each entry names the dedicated line or number (`resourceId`) that received it. Newest first, within an optional inclusive `receivedAfter`/`receivedBefore` window. A page may hold fewer than `pageSize` entries and still return a `nextPageToken`; only its absence means the end. Answers 404 unless the project holds the resource now. Codes from an earlier tenure stay in the project-wide list. Filter by `platform` — a number receives both SMS and WhatsApp. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.list_resource_filtered_verification_codes(input)).data

    async def list_resources(self, input: ListResourcesInput) -> models.ResourcePage:
        "List resources\n\nLists everything the project holds, oldest first, whatever kind of thing it is — one endpoint and one id shape for numbers, dedicated lines and whatever ships next. Nothing half-built appears here: a resource exists only once it is real, so anything still being provisioned is an operation rather than a resource with a pending flag. Filter by `type`, by `ability` (which matches only abilities that are currently enabled), and by `state` — comma-separated, and absent means every state, including retired ones. `detail` carries a per-type public view: an SMS number's number, a dedicated line's number and its per-capability health (`imessageHealth`, `whatsappHealth`, each with an `overallStatus` of `available`, `degraded`, `unavailable` or `unknown`; `imessageHealth` also carries `account`, `photonSystemComponents`, `newConversations`, `sms` and `mms`, each a `status` with the `cause` that decided it: `account`, `photonSystemComponents`, or null for the item's own state). Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.list_resources(input)).data

    async def list_voice_profiles(self, input: ListVoiceProfilesInput) -> models.VoiceProfilePage:
        "List Voice profiles\n\nLists reusable Voice profiles in this project. Requires platforms:read bound to the path project."
        return (await self._raw_resource.list_voice_profiles(input)).data

    async def list_whatsapp_account_phone_numbers(
        self, input: ListWhatsappAccountPhoneNumbersInput
    ) -> models.ListWhatsappAccountPhoneNumbersResponse:
        "List WhatsApp account phone numbers\n\nLists the connected WABA's phone numbers directly from Meta, including numbers whose Photon sender was disconnected. Ownership is photon for a number in this project's current Photon inventory and meta otherwise. Match a Photon SMS number by its E.164 phoneNumber and reuse its existing displayName when reconnecting. A null name is unavailable, not permission to choose a new name. A failed lookup returns an error rather than an empty list. Requires platforms:read on the path project."
        return (await self._raw_resource.list_whatsapp_account_phone_numbers(input)).data

    async def list_whatsapp_shared_line_assignments(
        self, input: ListWhatsappSharedLineAssignmentsInput
    ) -> models.SharedLineAssignmentPage:
        "List WhatsApp shared line assignments\n\nLists the project's WhatsApp shared line assignments, oldest first. Released assignments are excluded unless includeReleased is set. Requires the platforms:read permission bound to the project resource in the path."
        return (await self._raw_resource.list_whatsapp_shared_line_assignments(input)).data

    async def provision_imessage_dedicated_line(
        self, input: ProvisionImessageDedicatedLineInput
    ) -> models.Operation:
        "Provision dedicated iMessage line\n\nClaims one dedicated iMessage line for the project and enables iMessage on it. Always answers 202 with an operation: dedicated lines are allocated from available capacity, and unavailable capacity causes a wait rather than a failure — this can legitimately stay `running` for hours, which is exactly why the response is a handle to poll rather than a number. The project's messaging subscription must grant the dedicated iMessage lines entitlement (`imessage_dedicated_lines.can_purchase`), and that is checked before capacity is reserved. The line's own charge starts when a line is claimed; the subscription that grants the entitlement bills on its own terms, which cancelling a request does not change. Waiting requests are served first come, first served. One that is still waiting is cancelled with a `reason` if the project is deleted (`project_deleted`) or its plan stops selling dedicated lines (`entitlement_lost`); while the payer is restricted for overdue payment it keeps waiting. If you no longer want to wait, POST to the operation's cancel endpoint, which charges nothing for the line. The Idempotency-Key is required and permanent: repeating it returns the same operation forever. A further line always needs a NEW key, including while others are still waiting. Requires the platforms:write permission bound to the project resource in the path."
        return (await self._raw_resource.provision_imessage_dedicated_line(input)).data

    async def provision_whatsapp_dedicated_line(
        self, input: ProvisionWhatsappDedicatedLineInput
    ) -> models.Operation:
        "Provision dedicated WhatsApp line\n\nProvisions one dedicated WhatsApp line with WhatsApp and shared Voice enabled. It attaches to an eligible iMessage line the project already owns when possible so both products keep the same number; otherwise it claims healthy, available WhatsApp-capable dedicated-line inventory. Always answers 202, because waiting when no inventory is available is not a failure. The product opens its own charge period after the abilities are enabled; Voice has no separate charge. Waiting requests are served first come, first served, and are cancelled with a `reason` exactly as for a dedicated iMessage line. Cancel the returned operation to stop waiting. The Idempotency-Key is required and permanent."
        return (await self._raw_resource.provision_whatsapp_dedicated_line(input)).data

    async def purchase_sms_number(self, input: PurchaseSmsNumberInput) -> models.Operation:
        "Purchase SMS number\n\nBuys one US local number from the provider and records it as a resource with SMS enabled. Requires countryCode (US) and accepts an optional three-digit geographic areaCode. The server selects an exact matching number. Empty inventory keeps the operation running until a number is available or the caller cancels before ordering begins. Always answers 202 with an operation: the work runs behind the response, and the Location points at the operation to poll. New area-specific requests must appear in current provider coverage; discover it with GET /sms/numbers/area-codes?countryCode=US. Coverage and subscription checks run before operation creation. Billing follows delivery. Replays return the original operation without checking current coverage. The Idempotency-Key is required and permanent: repeating it returns the same operation forever, never a second number. A further number always needs a NEW key, including while others are still running. Requires the platforms:write permission bound to the project resource in the path."
        return (await self._raw_resource.purchase_sms_number(input)).data

    async def release_imessage_dedicated_line(
        self, input: ReleaseImessageDedicatedLineInput
    ) -> models.Operation:
        "Release dedicated iMessage line\n\nRemoves only iMessage from one dedicated line. Shared Voice is removed only when WhatsApp is absent; if WhatsApp remains, Voice, the resource, ownership, and phone number are preserved. Usually finishes inside this request and answers 200; a slow workflow answers 202 with an operation to poll. Takes no Idempotency-Key because the open iMessage charge period identifies this product tenure."
        return (await self._raw_resource.release_imessage_dedicated_line(input)).data

    async def release_resource(self, input: ReleaseResourceInput) -> models.Operation:
        "Release resource\n\nGives one resource back, whatever it is. What that means is the resource's own business: an SMS number goes back to the provider and is retired, a dedicated iMessage line goes back to the shared pool and stays in existence for someone else to claim. Either way the provider is contacted first where there is one, then a single transaction disables every ability, ends the project's hold and closes the charge period — so a provider that refuses leaves the resource exactly as it was, still owned and still billed. Usually finishes inside this request and answers 200; if the provider is slow it answers 202 and the Location points at the operation to poll. The decrement runs behind the answer either way, so the resource is gone when you are told it is. Takes no Idempotency-Key — releasing the same resource twice is the same request. Releasing one that is already gone answers 404. Requires the platforms:write permission bound to the project resource in the path."
        return (await self._raw_resource.release_resource(input)).data

    async def release_whatsapp_dedicated_line(
        self, input: ReleaseWhatsappDedicatedLineInput
    ) -> models.Operation:
        "Release dedicated WhatsApp line\n\nRemoves only WhatsApp from one dedicated line. Shared Voice is removed only when iMessage is absent; if iMessage remains, Voice, the resource, ownership, and phone number are preserved. Usually finishes inside this request and answers 200; a slow workflow answers 202 with an operation to poll. Takes no Idempotency-Key because the open WhatsApp charge period identifies this product tenure."
        return (await self._raw_resource.release_whatsapp_dedicated_line(input)).data

    async def release_whatsapp_shared_line_assignment(
        self, input: ReleaseWhatsappSharedLineAssignmentInput
    ) -> models.SharedLineAssignment:
        "Release WhatsApp shared line assignment\n\nReleases a WhatsApp shared line assignment, freeing its seat for reassignment. The row is retained for audit and returned with releasedAt set, so repeating the call is safe. Requires the platforms:write permission bound to the project resource in the path."
        return (await self._raw_resource.release_whatsapp_shared_line_assignment(input)).data

    async def replace_voice_profile_inbound(
        self, input: ReplaceVoiceProfileInboundInput
    ) -> models.VoiceProfileInboundConfiguration:
        "Replace Voice inbound configuration\n\nCreates or fully replaces a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. Credentials are required and nullable; null removes destination authentication. Requires platforms:write bound to the path project."
        return (await self._raw_resource.replace_voice_profile_inbound(input)).data

    async def rotate_voice_profile_outbound_credential(
        self, input: RotateVoiceProfileOutboundCredentialInput
    ) -> models.RotateVoiceProfileOutboundCredentialResponse:
        "Rotate Voice outbound credential\n\nRotates a SIP profile's outbound credential when expectedVersion matches. The profileId may identify the default or an additional profile. Normal rotation gives the previous credential one hour of grace; emergency rotation gives none. The new password is returned once and is never recoverable. Requires platforms:write bound to the path project."
        return (await self._raw_resource.rotate_voice_profile_outbound_credential(input)).data

    async def unassign_sms_line_campaign(
        self, input: UnassignSmsLineCampaignInput
    ) -> models.Operation:
        "Unassign SMS line campaign\n\nAny project writer, including a scoped API key, may detach the campaign. The number and campaign remain owned. Requires a permanent Idempotency-Key and expectedVersion. Local eligibility is blocked immediately; provider detachment runs asynchronously."
        return (await self._raw_resource.unassign_sms_line_campaign(input)).data

    async def unassign_voice_line_profile(self, input: UnassignVoiceLineProfileInput) -> None:
        "Unassign Voice line profile\n\nRemoves a line's explicit override when the resource version matches so the line follows the project default. Profiles and the pstn_voice ability are unchanged. Requires platforms:write bound to the path project."
        return (await self._raw_resource.unassign_voice_line_profile(input)).data

    async def update_default_voice_profile(
        self, input: UpdateDefaultVoiceProfileInput
    ) -> models.VoiceProfile:
        "Update default Voice profile\n\nPatches the default profile's protocol or mediaEncryption when expectedVersion matches. Omitted fields are preserved. Its server-assigned name is immutable, and directional configuration uses the profileId returned by this resource. Requires platforms:write bound to the path project."
        return (await self._raw_resource.update_default_voice_profile(input)).data

    async def update_voice_profile(self, input: UpdateVoiceProfileInput) -> models.VoiceProfile:
        "Update Voice profile\n\nPatches an additional profile's name, protocol, or mediaEncryption when expectedVersion matches. Omitted fields are preserved. Directional configuration is managed through the profile's inbound and outbound endpoints. Requires platforms:write bound to the path project."
        return (await self._raw_resource.update_voice_profile(input)).data

    async def update_voice_profile_inbound(
        self, input: UpdateVoiceProfileInboundInput
    ) -> models.VoiceProfileInboundConfiguration:
        "Update Voice inbound configuration\n\nUpdates selected fields of a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. At least one of destinationUri or credentials is required. Credential omission preserves destination authentication, null removes it, and an object replaces it atomically. Requires platforms:write bound to the path project."
        return (await self._raw_resource.update_voice_profile_inbound(input)).data

    async def update_voice_profile_outbound_authentication(
        self, input: UpdateVoiceProfileOutboundAuthenticationInput
    ) -> models.UpdateVoiceProfileOutboundAuthenticationResponse:
        "Update Voice outbound authentication\n\nChanges a SIP profile's outbound Digest algorithm when expectedVersion matches. The profileId may identify the default or an additional profile. This policy-only change preserves the password, username, and any previous-password grace deadline. SHA-256 is recommended; MD5 is a weaker legacy option. Returns non-secret outbound metadata and the profile version. Requires platforms:write bound to the path project."
        return (await self._raw_resource.update_voice_profile_outbound_authentication(input)).data


class AsyncProjectsAgentProfileResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawProjectsAgentProfileResource(transport)

    async def commit_avatar(self, input: CommitAgentProfileAvatarInput) -> models.AgentProfile:
        "Commit agent avatar\n\nCommits an agent avatar previously uploaded through createAgentProfileAvatarUpload. Call this only after the direct multipart upload succeeds, using the uploadId from the same upload session and a stable Idempotency-Key. The service validates the temporary object's Project ownership, size, content type, image bytes, dimensions, encryption, and age before changing the agent profile."
        return (await self._raw_resource.commit_avatar(input)).data

    async def create_avatar_upload(
        self, input: CreateAgentProfileAvatarUploadInput
    ) -> models.AgentProfileAvatarUpload:
        "Create agent avatar upload\n\nCreates a ten-minute, Project-bound presigned S3 POST for a JPEG, PNG, or WebP agent avatar up to 5 MiB. Copy every returned formFields entry into a multipart/form-data request to uploadUrl, append the local file as the final form part, and upload it directly without sending Photon credentials. After the upload succeeds, call commitAgentProfileAvatar with the returned uploadId. Do not cache or log the upload URL or form fields."
        return (await self._raw_resource.create_avatar_upload(input)).data

    async def get(self, input: GetAgentProfileInput) -> models.AgentProfile:
        "Get agent profile\n\nReturns the agent profile belonging to the identified project. The profile is project-scoped and is distinct from the authenticated account's personal profile. Use the dedicated avatar operations when uploading or removing an agent avatar."
        return (await self._raw_resource.get(input)).data

    async def reset_avatar(self, input: ResetAgentProfileAvatarInput) -> models.AgentProfile:
        "Reset agent avatar\n\nReplaces the selected project's agent avatar with the project's default avatar, a generated planet image derived from the project ID, and returns the updated agent profile. The reset does not restore an earlier avatar: a custom avatar it replaces is discarded and must be uploaded and committed again to use it. When the default avatar is already in use, the profile is returned unchanged. This does not change the account's personal profile picture. Supply the required Idempotency-Key header."
        return (await self._raw_resource.reset_avatar(input)).data

    async def update(self, input: UpdateAgentProfileInput) -> models.AgentProfile:
        "Update agent profile\n\nUpdates the supplied firstName and lastName fields in the project's agent profile and returns the updated profile. Avatar upload, commit and reset are separate operations. The caller must be authorized to change configuration for the selected project. Supply the required Idempotency-Key header."
        return (await self._raw_resource.update(input)).data


class AsyncProjectsBillingResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawProjectsBillingResource(transport)

    async def get_operation(self, input: GetBillingOperationInput) -> models.BillingOperation:
        "Get billing operation\n\nReturns the authoritative state of a billing operation belonging to the selected project. Use it to recover or poll a plan-change request until the operation reaches success or failure. An accepted request is not evidence that the plan change has completed."
        return (await self._raw_resource.get_operation(input)).data

    async def get_overview(
        self, input: GetBillingOverviewInput
    ) -> models.GetBillingOverviewResponse:
        "Get project billing overview\n\nReturns the selected project's plan information, entitlements and current billing-period usage. This operation reads project billing state; it does not change plans or the payer's payment method. Organization-level plans are available through the organization billing overview."
        return (await self._raw_resource.get_overview(input)).data

    async def list_billing_plans(
        self, input: ListBillingPlansInput
    ) -> models.ListBillingPlansResponse:
        "List billing plans\n\nLists the billing plan catalog, grouped by their public plan-metadata type. Use the returned plan information when choosing the category and planCode for a plan change. The catalog is the same for every project, and reading it does not purchase a plan."
        return (await self._raw_resource.list_billing_plans(input)).data


class AsyncProjectsResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawProjectsResource(transport)
        self.agent_profile = AsyncProjectsAgentProfileResource(transport)
        self.billing = AsyncProjectsBillingResource(transport)
        self.platforms = AsyncProjectsPlatformsResource(transport)

    async def create_project_api_key(
        self, input: CreateProjectApiKeyInput
    ) -> models.CreateProjectApiKeyResponse:
        "Create project API key\n\nCreates a key bound to the selected project using the supplied name, permissions and optional expiry. The secret is returned only in this response and in idempotent replays of it; store it securely because other reads never return it. The key is scoped to this project and does not grant account-level access. Supply the required Idempotency-Key header."
        return (await self._raw_resource.create_project_api_key(input)).data

    async def create_webhook_destination(
        self, input: CreateWebhookDestinationInput
    ) -> models.CreateWebhookDestinationResponse:
        "Create webhook destination\n\nCreates a webhook destination for the selected project using its URL, payload API version, event selection and other documented settings. The response includes the signing secret, which is returned only in this response and in idempotent replays of it, never by destination reads; store it securely for signature verification. The API version must be selectable and selected event types must belong to that version's catalog. Supply the required Idempotency-Key header."
        return (await self._raw_resource.create_webhook_destination(input)).data

    async def delete(self, input: DeleteProjectInput) -> models.Project:
        "Delete project\n\nStarts deletion of the identified project using a credential authorized for project management. Inspect the documented response and use getProjectClosureStatus with the organization and project identifiers to read closure progress. A project API key is not an accepted credential for this operation."
        return (await self._raw_resource.delete(input)).data

    async def delete_webhook_destination(
        self, input: DeleteWebhookDestinationInput
    ) -> models.WebhookDestination:
        "Delete webhook destination\n\nDeletes the selected project's destination and returns its stable tombstone. Repeated deletion returns the deletion representation. This operation removes the destination configuration; it is separate from disabling a destination through an update."
        return (await self._raw_resource.delete_webhook_destination(input)).data

    async def download_attachment(self, input: DownloadAttachmentInput) -> bytes:
        "Download attachment\n\nDownloads an Attachment's bytes. If unavailable after ten seconds, returns ATTACHMENT_NOT_READY with Retry-After: 5."
        return (await self._raw_resource.download_attachment(input)).data

    async def get(self, input: GetProjectInput) -> models.Project:
        "Get project\n\nReturns the identified project's settings for an authorized caller. The credential must be allowed to access that project; possession of an unrelated project's key does not provide access. Missing and deleted projects are reported through the documented error responses."
        return (await self._raw_resource.get(input)).data

    async def get_attachment(self, input: GetAttachmentInput) -> models.Attachment:
        "Get attachment\n\nReturns an Attachment's metadata. Use the content endpoint to download its bytes."
        return (await self._raw_resource.get_attachment(input)).data

    async def get_message_metrics_backfill(
        self, input: GetMessageMetricsBackfillInput
    ) -> models.GetMessageMetricsBackfillResponse:
        "Get metrics backfill status\n\nReturns historical metrics update progress. Completion reflects lastVerifiedAt; queries remain available during updates."
        return (await self._raw_resource.get_message_metrics_backfill(input)).data

    async def get_message_metrics_sql_schema(
        self, input: GetMessageMetricsSqlSchemaInput
    ) -> models.GetMessageMetricsSqlSchemaResponse:
        "Get metrics SQL schema\n\nReturns the message_events and call_events SQL schema, supported queries, and limits for the selected API version."
        return (await self._raw_resource.get_message_metrics_sql_schema(input)).data

    async def get_webhook_destination(
        self, input: GetWebhookDestinationInput
    ) -> models.WebhookDestination:
        "Get webhook destination\n\nReturns the configuration of one webhook destination belonging to the selected project. Missing or deleted destinations are reported as errors. This read does not disclose the signing secret returned when the destination or a secret rotation was created."
        return (await self._raw_resource.get_webhook_destination(input)).data

    async def get_webhook_event_schema(
        self, input: GetWebhookEventSchemaInput
    ) -> models.WebhookEventSchema | None:
        "Get webhook event schema\n\nReturns the published reader JSON Schema for eventType in the requested webhook apiVersion. Use it to interpret events for that exact payload version. The response media type is application/schema+json; an authorized conditional request may return 304 without a body. Unsupported event/version combinations are rejected."
        return (await self._raw_resource.get_webhook_event_schema(input)).data

    async def list_attachments(self, input: ListAttachmentsInput) -> models.AttachmentPage:
        "List attachments\n\nLists the Project's Attachment metadata, with optional time filters."
        return (await self._raw_resource.list_attachments(input)).data

    async def list_project_api_keys(
        self, input: ListProjectApiKeysInput
    ) -> models.ListProjectApiKeysResponse:
        "List project API keys\n\nLists the API keys on the selected project, ordered newest first. Revoked keys are not listed; expired keys stay listed until they are revoked. Entries contain key metadata and permissions, never secret values. Use the returned identifiers to manage an existing key; lost secrets cannot be recovered through this operation."
        return (await self._raw_resource.list_project_api_keys(input)).data

    async def list_webhook_api_versions(
        self, input: ListWebhookApiVersionsInput
    ) -> models.ListWebhookApiVersionsResponse | None:
        "List webhook API versions\n\nLists the published webhook payload API versions and their lifecycle metadata. The list is the same for every project. Use the selectable indicator when choosing a version for a destination. These payload dates are separate from SDK package versions. An authorized conditional request may return 304 without a response body."
        return (await self._raw_resource.list_webhook_api_versions(input)).data

    async def list_webhook_destinations(
        self, input: ListWebhookDestinationsInput
    ) -> models.WebhookDestinationPage:
        "List webhook destinations\n\nReturns a cursor-paginated page of active webhook destinations configured for the selected project. Use pageSize and pageToken to navigate it. The listing returns destination configuration, never signing secrets."
        return (await self._raw_resource.list_webhook_destinations(input)).data

    async def list_webhook_egress_addresses(
        self, input: ListWebhookEgressAddressesInput
    ) -> models.ListWebhookEgressAddressesResponse | None:
        "List webhook egress addresses\n\nReturns the public network addresses from which this environment sends webhook deliveries. Use this information when configuring the receiving system's network allowlist. The result is environment-specific and does not describe the API service's ingress addresses."
        return (await self._raw_resource.list_webhook_egress_addresses(input)).data

    async def list_webhook_event_types(
        self, input: ListWebhookEventTypesInput
    ) -> models.ListWebhookEventTypesResponse | None:
        "List webhook event types\n\nLists the webhook event types available in the requested apiVersion, including their descriptions, audiences and reader-schema URLs. Use this versioned catalog when selecting a destination's enabledEvents. The response may include version-retirement information; an authorized conditional request can return 304 without a body."
        return (await self._raw_resource.list_webhook_event_types(input)).data

    async def query_message_metrics(
        self, input: QueryMessageMetricsInput
    ) -> models.QueryMessageMetricsResponse:
        "Query metrics\n\nRuns read-only SQL over the Project's message_events or call_events table. Get the SQL schema for supported columns, capabilities, and limits."
        return (await self._raw_resource.query_message_metrics(input)).data

    async def retry_webhook_delivery(
        self, input: RetryWebhookDeliveryInput
    ) -> models.RetryWebhookDeliveryResponse:
        "Retry webhook delivery\n\nRequests an immediate attempt of the selected delivery if it is still the waiting head for its destination and event type. expectedAttemptCount is the failed-attempt counter recorded on the delivery and fences stale requests. This overrides the current backoff, including Retry-After, once. It preserves event identity and the retry budget. Delivered, active, disabled and dead-lettered deliveries cannot be retried. A 202 acknowledges the wake-up, not successful delivery. Supply an Idempotency-Key and retain it when retrying an ambiguous failure."
        return (await self._raw_resource.retry_webhook_delivery(input)).data

    async def revoke_project_api_key(
        self, input: RevokeProjectApiKeyInput
    ) -> models.ProjectApiKeyResponse:
        "Revoke project API key\n\nRevokes the identified key on the selected project and returns its revoked metadata. Repeating the deletion returns the same revokedAt value. This operation does not rotate the key or return a replacement secret. Supply the required Idempotency-Key header."
        return (await self._raw_resource.revoke_project_api_key(input)).data

    async def rotate_webhook_signing_secret(
        self, input: RotateWebhookSigningSecretInput
    ) -> models.RotateWebhookSigningSecretResponse:
        "Rotate webhook signing secret\n\nRotates the signing secret for the selected project's webhook destination and returns the new secret. The optional overlapSeconds controls the requested overlap with the previous secret according to the documented request constraints. Store the new secret securely and update the receiver's signature verification configuration; it is returned only in this response and in idempotent replays of it, never by destination reads. Supply the required Idempotency-Key header."
        return (await self._raw_resource.rotate_webhook_signing_secret(input)).data

    async def update(self, input: UpdateProjectInput) -> models.Project:
        "Update project\n\nUpdates the identified project's name and returns the updated project. The project slug is not a mutable field in this request. Use an authorized account or organization service-identity credential; a project API key is not accepted. Supply the required Idempotency-Key header."
        return (await self._raw_resource.update(input)).data

    async def update_project_api_key(
        self, input: UpdateProjectApiKeyInput
    ) -> models.ProjectApiKeyResponse:
        "Update project API key permissions\n\nReplaces the identified project key's permission list with the supplied permissions and returns the updated metadata. Sending the permission list the key already has leaves it unchanged. This request does not create a new secret or change the key's project binding. Supply the required Idempotency-Key header."
        return (await self._raw_resource.update_project_api_key(input)).data

    async def update_webhook_destination(
        self, input: UpdateWebhookDestinationInput
    ) -> models.WebhookDestination:
        "Update webhook destination\n\nUpdates the supplied URL, name, description, status or enabledEvents fields on a project's webhook destination and returns its updated configuration. The payload API version is not a mutable field in this request. Event selections are checked against the destination's versioned catalog; signing-secret rotation is a separate operation. Supply the required Idempotency-Key header."
        return (await self._raw_resource.update_webhook_destination(input)).data

    async def upload_attachment(self, input: UploadAttachmentInput) -> models.Attachment:
        "Upload attachment\n\nUploads a file and returns its Attachment once ready to download."
        return (await self._raw_resource.upload_attachment(input)).data


class AsyncAuthDeviceResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawAuthDeviceResource(transport)

    async def authorize(
        self, input: DeviceAuthorizeInput | None = None
    ) -> models.DeviceAuthorizeResponse:
        "Start device authorization\n\nStarts the device authorization flow for a CLI or another device without a browser. Show the verification URL and user code, then poll the token endpoint at the returned interval. No request fields are required; any supplied body is ignored."
        return (await self._raw_resource.authorize(input)).data

    async def token(self, input: DeviceTokenInput) -> models.DeviceTokenResponse:
        "Exchange device code or refresh token\n\nExchanges an authorized device code or a refresh token for an access token and rotating refresh token. Accepts JSON and form-encoded bodies. While polling, wait at least interval seconds and increase the interval on slow_down. Store the new refresh token after every successful grant.\n\nThis SDK method sends uncompressed JSON (application/json). Other request formats described above apply to direct HTTP requests."
        return (await self._raw_resource.token(input)).data


class AsyncAuthResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawAuthResource(transport)
        self.device = AsyncAuthDeviceResource(transport)

    async def begin_invitation_sso(
        self, input: BeginInvitationSsoInput
    ) -> models.OrganizationAuthenticationRedirect:
        "Sign in with invitation SSO\n\nReturns an authentication URL for the organization SSO connection associated with the supplied invitation token. Supply token and returnTo. Complete the returned authentication flow; requesting its URL does not itself accept the invitation."
        return (await self._raw_resource.begin_invitation_sso(input)).data

    async def begin_organization_authentication(
        self, input: BeginOrganizationAuthenticationInput
    ) -> models.OrganizationAuthenticationRedirect:
        "Sign in with organization SSO\n\nReturns a URL to authenticate through the selected organization’s current SSO connection. Supply returnTo and open the returned URL to continue the flow. Receiving the URL does not establish an authenticated session."
        return (await self._raw_resource.begin_organization_authentication(input)).data

    async def begin_organization_closure_authentication(
        self, input: BeginOrganizationClosureAuthenticationInput
    ) -> models.OrganizationAuthenticationRedirect:
        "Sign in to close organization\n\nReturns an authentication URL for the current organization owner to inspect organization closure. Supply returnTo and complete the returned flow. This operation initiates authentication and does not close the organization."
        return (await self._raw_resource.begin_organization_closure_authentication(input)).data

    async def begin_organization_sso_admission(
        self, input: BeginOrganizationSsoAdmissionInput
    ) -> models.OrganizationAuthenticationRedirect:
        "Begin organization SSO admission\n\nReturns an SSO admission URL for an existing account and the selected organization. Supply returnTo for the continuation URL. Admission requires completing the returned authentication flow; creating the URL does not itself grant membership."
        return (await self._raw_resource.begin_organization_sso_admission(input)).data

    async def create_organization_sso_portal_link(
        self, input: CreateOrganizationSsoPortalLinkInput
    ) -> models.CreateOrganizationSsoPortalLinkResponse:
        "Create organization setup portal link\n\nReturns an organization setup portal URL. Supply returnTo and optionally intent, either sso or domain_verification; sso is the default. Open the returned URL to complete the selected setup flow."
        return (await self._raw_resource.create_organization_sso_portal_link(input)).data

    async def disable_organization_sso(
        self, input: DisableOrganizationSsoInput
    ) -> models.OrganizationSsoConfiguration:
        "Disable organization SSO\n\nDeletes the provider connection, releases the SSO requirement once the connection is gone, then unbinds the chosen domains. Retry with the same Idempotency-Key to resume or await the same run."
        return (await self._raw_resource.disable_organization_sso(input)).data

    async def get_organization_connection_status(
        self, input: GetOrganizationConnectionStatusInput
    ) -> models.OrganizationConnectionStatus:
        "Get organization connection status\n\nRequires current human organization membership. Synchronization status does not attest SSO configuration or completed authorization."
        return (await self._raw_resource.get_organization_connection_status(input)).data

    async def get_organization_sso_configuration(
        self, input: GetOrganizationSsoConfigurationInput
    ) -> models.OrganizationSsoConfiguration:
        "Get organization SSO configuration\n\nReturns the selected organization’s SSO connection state, configuration version, and desired and effective policy settings. Read policySyncStatus alongside the enforcement fields to distinguish requested settings from synchronized settings."
        return (await self._raw_resource.get_organization_sso_configuration(input)).data

    async def list_oauth_scopes(
        self, input: ListOauthScopesInput | None = None
    ) -> models.ListOauthScopesResponse:
        "List OAuth scopes\n\nLists the business permissions available to OAuth applications."
        return (await self._raw_resource.list_oauth_scopes(input)).data

    async def refresh_organization_sso_connection(
        self, input: RefreshOrganizationSsoConnectionInput
    ) -> models.OrganizationSsoConfiguration:
        "Refresh organization SSO connection\n\nRefreshes the selected organization’s SSO connection and returns its current connection state, configuration version and policy synchronization status. This operation takes no request body."
        return (await self._raw_resource.refresh_organization_sso_connection(input)).data

    async def retry_organization_connection_sync(
        self, input: RetryOrganizationConnectionSyncInput
    ) -> models.OrganizationConnectionStatus:
        "Retry organization connection sync\n\nReconciles existing local intent. Takes no body and cannot change membership, roles or authentication policy."
        return (await self._raw_resource.retry_organization_connection_sync(input)).data

    async def start_enterprise_login(
        self, input: StartEnterpriseLoginInput
    ) -> models.StartEnterpriseLoginResponse:
        "Start company sign-in\n\nReturns a sign-in URL without requiring an existing account: the company SSO connection when the target has a ready connection, otherwise ordinary account login. Supply one documented enrollment variant: organizationId with returnTo (optionally invitationToken), invitationToken with returnTo, or retryToken. Open the returned URL to continue authentication; receiving a URL does not complete sign-in. This is a browser flow: the request must come from an allowed Origin, and the retryToken variant also needs the retry cookie set by the failed sign-in, so send it with credentials."
        return (await self._raw_resource.start_enterprise_login(input)).data

    async def update_organization_sso_policy(
        self, input: UpdateOrganizationSsoPolicyInput
    ) -> models.OrganizationSsoConfiguration:
        "Update organization SSO policy\n\nUpdates whether SSO can admit new members automatically using ssoJitEnabled and the current expectedVersion. Returns the organization’s SSO configuration and policy synchronization status; a successful response does not mean every desired policy setting has finished synchronizing."
        return (await self._raw_resource.update_organization_sso_policy(input)).data


class AsyncOrganizationsBillingResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawOrganizationsBillingResource(transport)

    async def change_plan(
        self, input: ChangePlanInput
    ) -> models.TerminalBillingOperation | models.PendingBillingOperation:
        "Change plan\n\nPurchases or changes the selected project's plan for the supplied category and planCode. A 202 response means the change is pending: poll the returned operation URL and honor Retry-After until it succeeds or fails. A 200 response means the idempotency key resolved to an operation that is already terminal; inspect that result rather than assuming success from the status code alone. Supply the required Idempotency-Key header. Supply both organizationId and projectId to select the project within its organization."
        return (await self._raw_resource.change_plan(input)).data

    async def create_organization_payment_method_checkout(
        self, input: CreateOrganizationPaymentMethodCheckoutInput
    ) -> models.CreateOrganizationPaymentMethodCheckoutResponse:
        "Create payment method checkout\n\nReturns a hosted payment-method collection URL for the selected organization. An Idempotency-Key header is optional; supply one to make retries safe. Complete the returned checkout flow. Receiving the URL does not mean a card has been saved; check payment-method status afterward."
        return (await self._raw_resource.create_organization_payment_method_checkout(input)).data

    async def create_organization_setup_intent(
        self, input: CreateOrganizationSetupIntentInput
    ) -> models.CreateOrganizationSetupIntentResponse:
        "Create card setup intent\n\nCreates payment-provider configuration for collecting a card for the selected organization and returns clientSecret and publishableKey. Supply the required Idempotency-Key header. Complete the provider’s card-collection flow separately and avoid logging the returned client secret."
        return (await self._raw_resource.create_organization_setup_intent(input)).data

    async def get_effective_terms(
        self, input: GetEffectiveTermsInput
    ) -> models.GetEffectiveTermsResponse:
        "Get the project's effective billing terms\n\nReturns what the selected project is billed on now, per category it holds: the plan as its subscription has it, with any override applied, each fixed charge at the subscription's price and quantity, and resolved entitlements; where the plan comes from; how invoices are paid; the current period and next billing date; and any downgrade or cancellation waiting for the period end. It also returns the credit the paying organization holds on credit notes, such as the unused time of a plan an upgrade replaced; it offsets that organization's next invoices. Supply both organizationId and projectId; the organization must pay for the project. This operation does not change billing."
        return (await self._raw_resource.get_effective_terms(input)).data

    async def get_organization_billing_overview(
        self, input: GetOrganizationBillingOverviewInput
    ) -> models.GetOrganizationBillingOverviewResponse:
        "Get organization billing overview\n\nReturns the selected organization’s billing subscription and entitlementsVersion. The subscription can be null. Read the returned plan, charges and entitlements to inspect organization billing; this operation does not purchase or change a plan."
        return (await self._raw_resource.get_organization_billing_overview(input)).data

    async def get_organization_payment_method(
        self, input: GetOrganizationPaymentMethodInput
    ) -> models.GetOrganizationPaymentMethodResponse:
        "Get organization payment method\n\nReports whether the selected organization has a card on file and returns its documented payment-method metadata. Reading this endpoint does not collect a new card or create a checkout session."
        return (await self._raw_resource.get_organization_payment_method(input)).data

    async def list_invoices(self, input: ListInvoicesInput) -> models.ListInvoicesResponse:
        "List invoices\n\nReturns a single page of the selected organization's invoices; invoices with a zero total are excluded. Use the documented invoice fields to inspect each invoice's billing state. Listing invoices does not make a payment or modify a subscription."
        return (await self._raw_resource.list_invoices(input)).data

    async def preview_organization_change(
        self, input: PreviewOrganizationChangeInput
    ) -> models.PreviewOrganizationChangeResponse:
        "Preview an organization billing change\n\nPreviews a fixed-charge quantity change on the selected organization's own subscription, such as SSO. Prices the change by the billing engine exactly as making it would bill it now: dueNow is that invoice, with taxes and the payer's credits applied. A quantity already paid for this period is not billed again, so a purchase after a release can be free. nextCharge is what is charged in advance at the next period start. For a fixed-charge change, pass quote on with the purchase so it is refused if the price or period no longer hold. This operation does not change billing."
        return (await self._raw_resource.preview_organization_change(input)).data

    async def preview_project_change(
        self, input: PreviewProjectChangeInput
    ) -> models.PreviewProjectChangeResponse:
        "Preview a project billing change\n\nPreviews a change on the selected project's subscription in the supplied category: a fixed-charge quantity change, or a plan change with the held fixed charges it carries over. Prices the change by the billing engine exactly as making it would bill it now: dueNow is that invoice, with taxes and the payer's credits applied. A quantity already paid for this period is not billed again, so a purchase after a release can be free. nextCharge is what is charged in advance at the next period start. For a fixed-charge change, pass quote on with the purchase so it is refused if the price or period no longer hold. This operation does not change billing. An upgrade bills the replaced plan's usage to date and the new plan from now, less the replaced plan's unused time; planChange says when it applies and which held fixed charges the target does not sell: released first for a change that applies now, released with a downgrade when it applies. additions quotes what is added once an upgrade applies, each billed when it is added, in planChange.additions and outside dueNow. Supply both organizationId and projectId; the organization must pay for the project."
        return (await self._raw_resource.preview_project_change(input)).data


class AsyncOrganizationsProjectsResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawOrganizationsProjectsResource(transport)

    async def check_project_slug_availability(
        self, input: CheckProjectSlugAvailabilityInput
    ) -> models.CheckProjectSlugAvailabilityResponse:
        "Check project slug availability\n\nReports whether createProject would accept `slug` right now. Advisory: only the create itself allocates, so a caller must still handle SLUG_TAKEN. A malformed slug is rejected on shape; a reserved slug, a slug held by an active project, and a slug retired with a deleted project each answer `available: false` with a reason."
        return (await self._raw_resource.check_project_slug_availability(input)).data

    async def count(self, input: CountProjectsInput) -> models.ProjectCount:
        "Count projects\n\nCounts the projects the same filter would list. The count is read from the primary, so it is authoritative rather than replica-lagged."
        return (await self._raw_resource.count(input)).data

    async def create(self, input: CreateProjectInput) -> models.Project:
        "Create project\n\nCreates in the authorized organization. In addition to account credentials, explicitly granted Service Identity API keys and M2M tokens may create projects. Project API keys cannot create projects. Creator and private credential evidence come only from the trusted authorization context. The caller-selected slug is immutable, must be 3 to 63 lowercase ASCII alphanumerics separated by single hyphens, and cannot be reserved or held by any active or deleted project."
        return (await self._raw_resource.create(input)).data

    async def get_project_closure_status(
        self, input: GetProjectClosureStatusInput
    ) -> models.GetProjectClosureStatusResponse:
        "Get project closure status\n\nReturns closure progress for projectId within organizationId, including deletionOperationId, domain progress and ready. This read operation does not initiate deletion."
        return (await self._raw_resource.get_project_closure_status(input)).data

    async def list(self, input: ListProjectsInput) -> models.ProjectPage:
        "List projects\n\nReturns a cursor-paginated page of the active projects in organizationId. Filter using query and the documented creation-time bounds, and navigate with pageSize and pageToken. Project roles are not returned and role is not a supported filter."
        return (await self._raw_resource.list(input)).data


class AsyncOrganizationsResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawOrganizationsResource(transport)
        self.billing = AsyncOrganizationsBillingResource(transport)
        self.projects = AsyncOrganizationsProjectsResource(transport)


class AsyncAccountResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawAccountResource(transport)

    async def commit_profile_picture(
        self, input: CommitAccountProfilePictureInput
    ) -> models.Account:
        "Commit profile picture\n\nCommits a profile picture previously uploaded through createAccountProfilePictureUpload. Call this only after the direct multipart upload succeeds, using the uploadId from the same upload session and a stable Idempotency-Key. The service validates the temporary object's ownership, size, content type, image bytes, dimensions, encryption, and age before changing the Account."
        return (await self._raw_resource.commit_profile_picture(input)).data

    async def confirm_phone_verification(
        self, input: ConfirmAccountPhoneVerificationInput
    ) -> models.Account:
        "Confirm phone verification\n\nBinds the number once the code is approved. Repeat calls return the bound Account."
        return (await self._raw_resource.confirm_phone_verification(input)).data

    async def create_account_service_key(
        self, input: CreateAccountServiceKeyInput
    ) -> models.CreateAccountServiceKeyResponse:
        "Create Account Service Key\n\nCreates a service key for the authenticated account with the supplied name and optional expiresAt. Returns key metadata and a one-time credential; store the credential securely because it cannot be retrieved through the listing endpoint. These credentials act as the account and must not be distributed as project-scoped keys. Supply the required Idempotency-Key header."
        return (await self._raw_resource.create_account_service_key(input)).data

    async def create_profile_picture_upload(
        self, input: CreateAccountProfilePictureUploadInput
    ) -> models.ProfilePictureUpload:
        "Create profile picture upload\n\nCreates a ten-minute, Account-bound presigned S3 POST for a JPEG, PNG, or WebP profile picture up to 5 MiB. Copy every returned formFields entry into a multipart/form-data request to uploadUrl, append the local file as the final form part, and upload it directly without sending Photon credentials. After the upload succeeds, call commitAccountProfilePicture with the returned uploadId. Do not cache or log the upload URL or form fields."
        return (await self._raw_resource.create_profile_picture_upload(input)).data

    async def delete(self, input: DeleteAccountInput | None = None) -> models.Account:
        "Delete account\n\nDeletes the authenticated account and returns its account tombstone. The operation is rejected while the account still owns organizations; transfer or close those organizations before retrying. This endpoint acts on the caller's account and does not accept another account's identifier."
        return (await self._raw_resource.delete(input)).data

    async def get(self, input: GetAccountInput | None = None) -> models.Account:
        "Get account\n\nReturns the profile of the authenticated account. The account is selected from the credential rather than a request parameter. A missing or deleted account is reported as an error instead of an empty profile."
        return (await self._raw_resource.get(input)).data

    async def list_account_service_keys(
        self, input: ListAccountServiceKeysInput | None = None
    ) -> models.ListAccountServiceKeysResponse:
        "List Account Service Keys\n\nReturns metadata for the authenticated account's unrevoked service keys, including expired keys, ordered newest first. Secret values are not returned; a key's credential is disclosed only when that key is created."
        return (await self._raw_resource.list_account_service_keys(input)).data

    async def list_authorized_applications(
        self, input: ListAuthorizedApplicationsInput | None = None
    ) -> models.ListAuthorizedApplicationsResponse:
        "List connected applications\n\nLists the OAuth applications authorized by the authenticated user."
        return (await self._raw_resource.list_authorized_applications(input)).data

    async def reset_profile_picture(self, input: ResetAccountProfilePictureInput) -> models.Account:
        "Remove profile picture\n\nRemoves the authenticated account's custom profile picture and returns the account using its default picture. This operation does not upload a replacement; use the upload-and-commit operations when setting a new custom picture. Supply the required Idempotency-Key header."
        return (await self._raw_resource.reset_profile_picture(input)).data

    async def revoke_account_service_key(
        self, input: RevokeAccountServiceKeyInput
    ) -> models.RevokeAccountServiceKeyResponse:
        "Revoke Account Service Key\n\nRevokes the account-owned service key identified by serviceKeyId and returns its revoked metadata. Repeating the revocation is stable. Revocation changes the credential's validity; it does not create a replacement key. Supply the required Idempotency-Key header."
        return (await self._raw_resource.revoke_account_service_key(input)).data

    async def revoke_authorized_application(self, input: RevokeAuthorizedApplicationInput) -> None:
        "Revoke connected application\n\nRevokes the authenticated user's grant for one OAuth application."
        return (await self._raw_resource.revoke_authorized_application(input)).data

    async def start_phone_verification(
        self, input: StartAccountPhoneVerificationInput
    ) -> models.StartAccountPhoneVerificationResponse:
        "Start phone verification\n\nSends an SMS code. Answers CAPTCHA_REQUIRED with the widget to render when no solved challenge accompanies the request; retry with the returned challengeContext and a token. Rate limited per account, per destination number, and globally; a rejection carries Retry-After."
        return (await self._raw_resource.start_phone_verification(input)).data

    async def update(self, input: UpdateAccountInput) -> models.Account:
        "Update account\n\nUpdates the supplied firstName and lastName fields on the authenticated account and returns the updated profile. Only the documented profile fields can be changed through this endpoint; profile-picture uploads and phone-number verification use their dedicated operations. Supply the required Idempotency-Key header."
        return (await self._raw_resource.update(input)).data


class AsyncSystemResource:
    def __init__(self, transport: AsyncTransport) -> None:
        self._raw_resource = AsyncRawSystemResource(transport)

    async def create_app_installation_request(
        self, input: CreateAppInstallationRequestInput
    ) -> models.CreateAppInstallationRequestResponse:
        "Request app installation\n\nAuthenticates a registered app backend using a short-lived signed client assertion. Creates request metadata only; customer approval is still required."
        return (await self._raw_resource.create_app_installation_request(input)).data

    async def redeem_app_installation_delivery(
        self, input: RedeemAppInstallationDeliveryInput
    ) -> models.RedeemAppInstallationDeliveryResponse:
        "Redeem installation credential\n\nThe registered app backend authenticates with a signed client assertion and a single-use code. Plaintext is returned only once; retries return status and never create another credential."
        return (await self._raw_resource.redeem_app_installation_delivery(input)).data


class SyncRawRoot:
    def __init__(self, transport: SyncTransport) -> None:
        self.account = SyncRawAccountResource(transport)
        self.auth = SyncRawAuthResource(transport)
        self.organizations = SyncRawOrganizationsResource(transport)
        self.projects = SyncRawProjectsResource(transport)
        self.system = SyncRawSystemResource(transport)


class SyncRoot:
    def __init__(self, transport: SyncTransport) -> None:
        self.account = SyncAccountResource(transport)
        self.auth = SyncAuthResource(transport)
        self.organizations = SyncOrganizationsResource(transport)
        self.projects = SyncProjectsResource(transport)
        self.system = SyncSystemResource(transport)


class AsyncRawRoot:
    def __init__(self, transport: AsyncTransport) -> None:
        self.account = AsyncRawAccountResource(transport)
        self.auth = AsyncRawAuthResource(transport)
        self.organizations = AsyncRawOrganizationsResource(transport)
        self.projects = AsyncRawProjectsResource(transport)
        self.system = AsyncRawSystemResource(transport)


class AsyncRoot:
    def __init__(self, transport: AsyncTransport) -> None:
        self.account = AsyncAccountResource(transport)
        self.auth = AsyncAuthResource(transport)
        self.organizations = AsyncOrganizationsResource(transport)
        self.projects = AsyncProjectsResource(transport)
        self.system = AsyncSystemResource(transport)
