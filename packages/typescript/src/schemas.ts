// This file is generated from openapi/rpc-manifest.json. Do not edit.
import * as z from "zod";
import * as GeneratedZod from "./generated/zod.gen.js";
import type * as WireTypes from "./generated/types.gen.js";

/** Response schema for each documented success status (`2XX` for a range). */
type OutputSchemas<Output> = Readonly<Record<string, z.ZodType<Output>>>;

export const AcceptOrganizationInvitationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zAcceptOrganizationInvitationBody,
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zAcceptOrganizationInvitationHeaders.shape["Idempotency-Key"],
    }),
}))();
export type AcceptOrganizationInvitationInput = {
    body: WireTypes.AcceptOrganizationInvitationData["body"];
    headers: {
        idempotencyKey: NonNullable<WireTypes.AcceptOrganizationInvitationData["headers"]>["Idempotency-Key"];
    };
};

export const AcceptOrganizationInvitationOutputSchema = GeneratedZod.zAcceptOrganizationInvitationResponse;
export type AcceptOrganizationInvitationOutput = z.output<typeof AcceptOrganizationInvitationOutputSchema>;
export const AcceptOrganizationInvitationOutputSchemas: OutputSchemas<AcceptOrganizationInvitationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAcceptOrganizationInvitationResponse,
}))();

export const AssignSmsLineCampaignInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zAssignSmsLineCampaignBody,
    path: GeneratedZod.zAssignSmsLineCampaignPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zAssignSmsLineCampaignHeaders.shape["Idempotency-Key"],
    }),
}))();
export type AssignSmsLineCampaignInput = {
    body: WireTypes.AssignSmsLineCampaignData["body"];
    path: NonNullable<WireTypes.AssignSmsLineCampaignData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.AssignSmsLineCampaignData["headers"]>["Idempotency-Key"];
    };
};

export const AssignSmsLineCampaignOutputSchema = GeneratedZod.zOperation;
export type AssignSmsLineCampaignOutput = z.output<typeof AssignSmsLineCampaignOutputSchema>;
export const AssignSmsLineCampaignOutputSchemas: OutputSchemas<AssignSmsLineCampaignOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOperation,
    "202": GeneratedZod.zOperation,
}))();

export const AssignVoiceLineProfileInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zAssignVoiceLineProfileBody,
    path: GeneratedZod.zAssignVoiceLineProfilePath.strict(),
}))();
export type AssignVoiceLineProfileInput = {
    body: WireTypes.AssignVoiceLineProfileData["body"];
    path: NonNullable<WireTypes.AssignVoiceLineProfileData["path"]>;
};

export const AssignVoiceLineProfileOutputSchema = GeneratedZod.zVoiceLineProfileAssignment;
export type AssignVoiceLineProfileOutput = z.output<typeof AssignVoiceLineProfileOutputSchema>;
export const AssignVoiceLineProfileOutputSchemas: OutputSchemas<AssignVoiceLineProfileOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zVoiceLineProfileAssignment,
}))();

export const BatchUpdateVoiceLineProfileAssignmentsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zBatchUpdateVoiceLineProfileAssignmentsBody,
    path: GeneratedZod.zBatchUpdateVoiceLineProfileAssignmentsPath.strict(),
}))();
export type BatchUpdateVoiceLineProfileAssignmentsInput = {
    body: WireTypes.BatchUpdateVoiceLineProfileAssignmentsData["body"];
    path: NonNullable<WireTypes.BatchUpdateVoiceLineProfileAssignmentsData["path"]>;
};

export const BatchUpdateVoiceLineProfileAssignmentsOutputSchema = GeneratedZod.zBatchUpdateVoiceLineProfileAssignmentsResponse;
export type BatchUpdateVoiceLineProfileAssignmentsOutput = z.output<typeof BatchUpdateVoiceLineProfileAssignmentsOutputSchema>;
export const BatchUpdateVoiceLineProfileAssignmentsOutputSchemas: OutputSchemas<BatchUpdateVoiceLineProfileAssignmentsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zBatchUpdateVoiceLineProfileAssignmentsResponse,
}))();

export const CancelOperationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zCancelOperationPath.strict(),
}))();
export type CancelOperationInput = {
    path: NonNullable<WireTypes.CancelOperationData["path"]>;
};

export const CancelOperationOutputSchema = GeneratedZod.zOperation;
export type CancelOperationOutput = z.output<typeof CancelOperationOutputSchema>;
export const CancelOperationOutputSchemas: OutputSchemas<CancelOperationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOperation,
}))();

export const CancelSsoSubscriptionInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zCancelSsoSubscriptionPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCancelSsoSubscriptionHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CancelSsoSubscriptionInput = {
    path: NonNullable<WireTypes.CancelSsoSubscriptionData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CancelSsoSubscriptionData["headers"]>["Idempotency-Key"];
    };
};

export const CancelSsoSubscriptionOutputSchema = GeneratedZod.zCancelSsoSubscriptionResponse;
export type CancelSsoSubscriptionOutput = z.output<typeof CancelSsoSubscriptionOutputSchema>;
export const CancelSsoSubscriptionOutputSchemas: OutputSchemas<CancelSsoSubscriptionOutput> = /* @__PURE__ */ (() => ({
    "202": GeneratedZod.zCancelSsoSubscriptionResponse,
}))();

export const ChangePlanInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zChangePlanBody,
    path: GeneratedZod.zChangePlanPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zChangePlanHeaders.shape["Idempotency-Key"],
    }),
}))();
export type ChangePlanInput = {
    body: WireTypes.ChangePlanData["body"];
    path: NonNullable<WireTypes.ChangePlanData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.ChangePlanData["headers"]>["Idempotency-Key"];
    };
};

export const ChangePlanOutputSchema = /* @__PURE__ */ (() => z.union([GeneratedZod.zTerminalBillingOperation, GeneratedZod.zPendingBillingOperation]))();
export type ChangePlanOutput = z.output<typeof ChangePlanOutputSchema>;
export const ChangePlanOutputSchemas: OutputSchemas<ChangePlanOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zTerminalBillingOperation,
    "202": GeneratedZod.zPendingBillingOperation,
}))();

export const CheckOrganizationDeletionInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zCheckOrganizationDeletionPath.strict(),
}))();
export type CheckOrganizationDeletionInput = {
    path: NonNullable<WireTypes.CheckOrganizationDeletionData["path"]>;
};

export const CheckOrganizationDeletionOutputSchema = GeneratedZod.zCheckOrganizationDeletionResponse;
export type CheckOrganizationDeletionOutput = z.output<typeof CheckOrganizationDeletionOutputSchema>;
export const CheckOrganizationDeletionOutputSchemas: OutputSchemas<CheckOrganizationDeletionOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zCheckOrganizationDeletionResponse,
}))();

export const CheckProjectSlugAvailabilityInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zCheckProjectSlugAvailabilityPath.strict(),
    query: GeneratedZod.zCheckProjectSlugAvailabilityQuery.strict(),
}))();
export type CheckProjectSlugAvailabilityInput = {
    path: NonNullable<WireTypes.CheckProjectSlugAvailabilityData["path"]>;
    query: NonNullable<WireTypes.CheckProjectSlugAvailabilityData["query"]>;
};

export const CheckProjectSlugAvailabilityOutputSchema = GeneratedZod.zCheckProjectSlugAvailabilityResponse;
export type CheckProjectSlugAvailabilityOutput = z.output<typeof CheckProjectSlugAvailabilityOutputSchema>;
export const CheckProjectSlugAvailabilityOutputSchemas: OutputSchemas<CheckProjectSlugAvailabilityOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zCheckProjectSlugAvailabilityResponse,
}))();

export const CloseOrganizationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCloseOrganizationBody,
    path: GeneratedZod.zCloseOrganizationPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCloseOrganizationHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CloseOrganizationInput = {
    body: WireTypes.CloseOrganizationData["body"];
    path: NonNullable<WireTypes.CloseOrganizationData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CloseOrganizationData["headers"]>["Idempotency-Key"];
    };
};

export const CloseOrganizationOutputSchema = z.undefined();
export type CloseOrganizationOutput = z.output<typeof CloseOrganizationOutputSchema>;
export const CloseOrganizationOutputSchemas: OutputSchemas<CloseOrganizationOutput> = /* @__PURE__ */ (() => ({
    "204": z.undefined(),
}))();

export const CommitAccountProfilePictureInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCommitAccountProfilePictureBody,
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCommitAccountProfilePictureHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CommitAccountProfilePictureInput = {
    body: WireTypes.CommitAccountProfilePictureData["body"];
    headers: {
        idempotencyKey: NonNullable<WireTypes.CommitAccountProfilePictureData["headers"]>["Idempotency-Key"];
    };
};

export const CommitAccountProfilePictureOutputSchema = GeneratedZod.zAccount;
export type CommitAccountProfilePictureOutput = z.output<typeof CommitAccountProfilePictureOutputSchema>;
export const CommitAccountProfilePictureOutputSchemas: OutputSchemas<CommitAccountProfilePictureOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAccount,
}))();

export const CommitAgentProfileAvatarInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCommitAgentProfileAvatarBody,
    path: GeneratedZod.zCommitAgentProfileAvatarPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCommitAgentProfileAvatarHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CommitAgentProfileAvatarInput = {
    body: WireTypes.CommitAgentProfileAvatarData["body"];
    path: NonNullable<WireTypes.CommitAgentProfileAvatarData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CommitAgentProfileAvatarData["headers"]>["Idempotency-Key"];
    };
};

export const CommitAgentProfileAvatarOutputSchema = GeneratedZod.zAgentProfile;
export type CommitAgentProfileAvatarOutput = z.output<typeof CommitAgentProfileAvatarOutputSchema>;
export const CommitAgentProfileAvatarOutputSchemas: OutputSchemas<CommitAgentProfileAvatarOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAgentProfile,
}))();

export const CommitOrganizationAvatarInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCommitOrganizationAvatarBody,
    path: GeneratedZod.zCommitOrganizationAvatarPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCommitOrganizationAvatarHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CommitOrganizationAvatarInput = {
    body: WireTypes.CommitOrganizationAvatarData["body"];
    path: NonNullable<WireTypes.CommitOrganizationAvatarData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CommitOrganizationAvatarData["headers"]>["Idempotency-Key"];
    };
};

export const CommitOrganizationAvatarOutputSchema = GeneratedZod.zCommitOrganizationAvatarResponse;
export type CommitOrganizationAvatarOutput = z.output<typeof CommitOrganizationAvatarOutputSchema>;
export const CommitOrganizationAvatarOutputSchemas: OutputSchemas<CommitOrganizationAvatarOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zCommitOrganizationAvatarResponse,
}))();

export const ConfigureVoiceProfileOutboundInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zConfigureVoiceProfileOutboundBody,
    path: GeneratedZod.zConfigureVoiceProfileOutboundPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zConfigureVoiceProfileOutboundHeaders.shape["Idempotency-Key"],
    }),
}))();
export type ConfigureVoiceProfileOutboundInput = {
    body: WireTypes.ConfigureVoiceProfileOutboundData["body"];
    path: NonNullable<WireTypes.ConfigureVoiceProfileOutboundData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.ConfigureVoiceProfileOutboundData["headers"]>["Idempotency-Key"];
    };
};

export const ConfigureVoiceProfileOutboundOutputSchema = GeneratedZod.zConfigureVoiceProfileOutboundResponse;
export type ConfigureVoiceProfileOutboundOutput = z.output<typeof ConfigureVoiceProfileOutboundOutputSchema>;
export const ConfigureVoiceProfileOutboundOutputSchemas: OutputSchemas<ConfigureVoiceProfileOutboundOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zConfigureVoiceProfileOutboundResponse,
    "201": GeneratedZod.zConfigureVoiceProfileOutboundResponse,
}))();

export const ConnectEmailDomainInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zConnectEmailDomainBody,
    path: GeneratedZod.zConnectEmailDomainPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zConnectEmailDomainHeaders.shape["Idempotency-Key"],
    }),
}))();
export type ConnectEmailDomainInput = {
    body: WireTypes.ConnectEmailDomainData["body"];
    path: NonNullable<WireTypes.ConnectEmailDomainData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.ConnectEmailDomainData["headers"]>["Idempotency-Key"];
    };
};

export const ConnectEmailDomainOutputSchema = GeneratedZod.zOperation;
export type ConnectEmailDomainOutput = z.output<typeof ConnectEmailDomainOutputSchema>;
export const ConnectEmailDomainOutputSchemas: OutputSchemas<ConnectEmailDomainOutput> = /* @__PURE__ */ (() => ({
    "202": GeneratedZod.zOperation,
}))();

export const ConnectTelegramBotInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zConnectTelegramBotBody,
    path: GeneratedZod.zConnectTelegramBotPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zConnectTelegramBotHeaders.shape["Idempotency-Key"],
    }),
}))();
export type ConnectTelegramBotInput = {
    body: WireTypes.ConnectTelegramBotData["body"];
    path: NonNullable<WireTypes.ConnectTelegramBotData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.ConnectTelegramBotData["headers"]>["Idempotency-Key"];
    };
};

export const ConnectTelegramBotOutputSchema = GeneratedZod.zOperation;
export type ConnectTelegramBotOutput = z.output<typeof ConnectTelegramBotOutputSchema>;
export const ConnectTelegramBotOutputSchemas: OutputSchemas<ConnectTelegramBotOutput> = /* @__PURE__ */ (() => ({
    "202": GeneratedZod.zOperation,
}))();

export const CountFilteredVerificationCodesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zCountFilteredVerificationCodesPath.strict(),
    query: GeneratedZod.zCountFilteredVerificationCodesQuery.strict().optional(),
}))();
export type CountFilteredVerificationCodesInput = {
    path: NonNullable<WireTypes.CountFilteredVerificationCodesData["path"]>;
    query?: NonNullable<WireTypes.CountFilteredVerificationCodesData["query"]>;
};

export const CountFilteredVerificationCodesOutputSchema = GeneratedZod.zFilteredVerificationCodeCount;
export type CountFilteredVerificationCodesOutput = z.output<typeof CountFilteredVerificationCodesOutputSchema>;
export const CountFilteredVerificationCodesOutputSchemas: OutputSchemas<CountFilteredVerificationCodesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zFilteredVerificationCodeCount,
}))();

export const CountMessagesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zCountMessagesPath.strict(),
    query: GeneratedZod.zCountMessagesQuery.strict().optional(),
}))();
export type CountMessagesInput = {
    path: NonNullable<WireTypes.CountMessagesData["path"]>;
    query?: NonNullable<WireTypes.CountMessagesData["query"]>;
};

export const CountMessagesOutputSchema = GeneratedZod.zCountMessagesResponse;
export type CountMessagesOutput = z.output<typeof CountMessagesOutputSchema>;
export const CountMessagesOutputSchemas: OutputSchemas<CountMessagesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zCountMessagesResponse,
}))();

export const CountProjectsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zCountProjectsPath.strict(),
    query: GeneratedZod.zCountProjectsQuery.strict().optional(),
}))();
export type CountProjectsInput = {
    path: NonNullable<WireTypes.CountProjectsData["path"]>;
    query?: NonNullable<WireTypes.CountProjectsData["query"]>;
};

export const CountProjectsOutputSchema = GeneratedZod.zProjectCount;
export type CountProjectsOutput = z.output<typeof CountProjectsOutputSchema>;
export const CountProjectsOutputSchemas: OutputSchemas<CountProjectsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zProjectCount,
}))();

export const CountResourceFilteredVerificationCodesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zCountResourceFilteredVerificationCodesPath.strict(),
    query: GeneratedZod.zCountResourceFilteredVerificationCodesQuery.strict().optional(),
}))();
export type CountResourceFilteredVerificationCodesInput = {
    path: NonNullable<WireTypes.CountResourceFilteredVerificationCodesData["path"]>;
    query?: NonNullable<WireTypes.CountResourceFilteredVerificationCodesData["query"]>;
};

export const CountResourceFilteredVerificationCodesOutputSchema = GeneratedZod.zFilteredVerificationCodeCount;
export type CountResourceFilteredVerificationCodesOutput = z.output<typeof CountResourceFilteredVerificationCodesOutputSchema>;
export const CountResourceFilteredVerificationCodesOutputSchemas: OutputSchemas<CountResourceFilteredVerificationCodesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zFilteredVerificationCodeCount,
}))();

export const CountSpacesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zCountSpacesPath.strict(),
    query: GeneratedZod.zCountSpacesQuery.strict().optional(),
}))();
export type CountSpacesInput = {
    path: NonNullable<WireTypes.CountSpacesData["path"]>;
    query?: NonNullable<WireTypes.CountSpacesData["query"]>;
};

export const CountSpacesOutputSchema = GeneratedZod.zSpaceCount;
export type CountSpacesOutput = z.output<typeof CountSpacesOutputSchema>;
export const CountSpacesOutputSchemas: OutputSchemas<CountSpacesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zSpaceCount,
}))();

export const CountUsersInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zCountUsersPath.strict(),
    query: GeneratedZod.zCountUsersQuery.strict().optional(),
}))();
export type CountUsersInput = {
    path: NonNullable<WireTypes.CountUsersData["path"]>;
    query?: NonNullable<WireTypes.CountUsersData["query"]>;
};

export const CountUsersOutputSchema = GeneratedZod.zUserCount;
export type CountUsersOutput = z.output<typeof CountUsersOutputSchema>;
export const CountUsersOutputSchemas: OutputSchemas<CountUsersOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zUserCount,
}))();

export const CreateAccountProfilePictureUploadInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateAccountProfilePictureUploadBody,
}))();
export type CreateAccountProfilePictureUploadInput = {
    body: WireTypes.CreateAccountProfilePictureUploadData["body"];
};

export const CreateAccountProfilePictureUploadOutputSchema = GeneratedZod.zProfilePictureUpload;
export type CreateAccountProfilePictureUploadOutput = z.output<typeof CreateAccountProfilePictureUploadOutputSchema>;
export const CreateAccountProfilePictureUploadOutputSchemas: OutputSchemas<CreateAccountProfilePictureUploadOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zProfilePictureUpload,
}))();

export const CreateAccountServiceKeyInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateAccountServiceKeyBody,
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateAccountServiceKeyHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CreateAccountServiceKeyInput = {
    body: WireTypes.CreateAccountServiceKeyData["body"];
    headers: {
        idempotencyKey: NonNullable<WireTypes.CreateAccountServiceKeyData["headers"]>["Idempotency-Key"];
    };
};

export const CreateAccountServiceKeyOutputSchema = GeneratedZod.zCreateAccountServiceKeyResponse;
export type CreateAccountServiceKeyOutput = z.output<typeof CreateAccountServiceKeyOutputSchema>;
export const CreateAccountServiceKeyOutputSchemas: OutputSchemas<CreateAccountServiceKeyOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zCreateAccountServiceKeyResponse,
}))();

export const CreateAgentProfileAvatarUploadInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateAgentProfileAvatarUploadBody,
    path: GeneratedZod.zCreateAgentProfileAvatarUploadPath.strict(),
}))();
export type CreateAgentProfileAvatarUploadInput = {
    body: WireTypes.CreateAgentProfileAvatarUploadData["body"];
    path: NonNullable<WireTypes.CreateAgentProfileAvatarUploadData["path"]>;
};

export const CreateAgentProfileAvatarUploadOutputSchema = GeneratedZod.zAgentProfileAvatarUpload;
export type CreateAgentProfileAvatarUploadOutput = z.output<typeof CreateAgentProfileAvatarUploadOutputSchema>;
export const CreateAgentProfileAvatarUploadOutputSchemas: OutputSchemas<CreateAgentProfileAvatarUploadOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zAgentProfileAvatarUpload,
}))();

export const CreateAppInstallationRequestInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateAppInstallationRequestBody,
}))();
export type CreateAppInstallationRequestInput = {
    body: WireTypes.CreateAppInstallationRequestData["body"];
};

export const CreateAppInstallationRequestOutputSchema = GeneratedZod.zCreateAppInstallationRequestResponse;
export type CreateAppInstallationRequestOutput = z.output<typeof CreateAppInstallationRequestOutputSchema>;
export const CreateAppInstallationRequestOutputSchemas: OutputSchemas<CreateAppInstallationRequestOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zCreateAppInstallationRequestResponse,
}))();

export const CreateDefaultVoiceProfileInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateDefaultVoiceProfileBody,
    path: GeneratedZod.zCreateDefaultVoiceProfilePath.strict(),
}))();
export type CreateDefaultVoiceProfileInput = {
    body: WireTypes.CreateDefaultVoiceProfileData["body"];
    path: NonNullable<WireTypes.CreateDefaultVoiceProfileData["path"]>;
};

export const CreateDefaultVoiceProfileOutputSchema = GeneratedZod.zVoiceProfile;
export type CreateDefaultVoiceProfileOutput = z.output<typeof CreateDefaultVoiceProfileOutputSchema>;
export const CreateDefaultVoiceProfileOutputSchemas: OutputSchemas<CreateDefaultVoiceProfileOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zVoiceProfile,
    "201": GeneratedZod.zVoiceProfile,
}))();

export const CreateOrganizationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateOrganizationBody,
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateOrganizationHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CreateOrganizationInput = {
    body: WireTypes.CreateOrganizationData["body"];
    headers: {
        idempotencyKey: NonNullable<WireTypes.CreateOrganizationData["headers"]>["Idempotency-Key"];
    };
};

export const CreateOrganizationOutputSchema = GeneratedZod.zCreateOrganizationResponse;
export type CreateOrganizationOutput = z.output<typeof CreateOrganizationOutputSchema>;
export const CreateOrganizationOutputSchemas: OutputSchemas<CreateOrganizationOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zCreateOrganizationResponse,
}))();

export const CreateOrganizationAvatarUploadInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateOrganizationAvatarUploadBody,
    path: GeneratedZod.zCreateOrganizationAvatarUploadPath.strict(),
}))();
export type CreateOrganizationAvatarUploadInput = {
    body: WireTypes.CreateOrganizationAvatarUploadData["body"];
    path: NonNullable<WireTypes.CreateOrganizationAvatarUploadData["path"]>;
};

export const CreateOrganizationAvatarUploadOutputSchema = GeneratedZod.zCreateOrganizationAvatarUploadResponse;
export type CreateOrganizationAvatarUploadOutput = z.output<typeof CreateOrganizationAvatarUploadOutputSchema>;
export const CreateOrganizationAvatarUploadOutputSchemas: OutputSchemas<CreateOrganizationAvatarUploadOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zCreateOrganizationAvatarUploadResponse,
}))();

export const CreateOrganizationInvitationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateOrganizationInvitationBody,
    path: GeneratedZod.zCreateOrganizationInvitationPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateOrganizationInvitationHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CreateOrganizationInvitationInput = {
    body: WireTypes.CreateOrganizationInvitationData["body"];
    path: NonNullable<WireTypes.CreateOrganizationInvitationData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CreateOrganizationInvitationData["headers"]>["Idempotency-Key"];
    };
};

export const CreateOrganizationInvitationOutputSchema = GeneratedZod.zCreateOrganizationInvitationResponse;
export type CreateOrganizationInvitationOutput = z.output<typeof CreateOrganizationInvitationOutputSchema>;
export const CreateOrganizationInvitationOutputSchemas: OutputSchemas<CreateOrganizationInvitationOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zCreateOrganizationInvitationResponse,
}))();

export const CreateOrganizationOauthClientInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateOrganizationOauthClientBody,
    path: GeneratedZod.zCreateOrganizationOauthClientPath.strict(),
    headers: z.strictObject({
        "idempotency-key": GeneratedZod.zCreateOrganizationOauthClientHeaders.shape["idempotency-key"],
    }),
}))();
export type CreateOrganizationOauthClientInput = {
    body: WireTypes.CreateOrganizationOauthClientData["body"];
    path: NonNullable<WireTypes.CreateOrganizationOauthClientData["path"]>;
    headers: {
        "idempotency-key": NonNullable<WireTypes.CreateOrganizationOauthClientData["headers"]>["idempotency-key"];
    };
};

export const CreateOrganizationOauthClientOutputSchema = GeneratedZod.zCreateOrganizationOauthClientResponse;
export type CreateOrganizationOauthClientOutput = z.output<typeof CreateOrganizationOauthClientOutputSchema>;
export const CreateOrganizationOauthClientOutputSchemas: OutputSchemas<CreateOrganizationOauthClientOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zCreateOrganizationOauthClientResponse,
}))();

export const CreateOrganizationPaymentMethodCheckoutInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zCreateOrganizationPaymentMethodCheckoutPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateOrganizationPaymentMethodCheckoutHeaders.shape["Idempotency-Key"],
    }).optional(),
}))();
export type CreateOrganizationPaymentMethodCheckoutInput = {
    path: NonNullable<WireTypes.CreateOrganizationPaymentMethodCheckoutData["path"]>;
    headers?: {
        idempotencyKey?: NonNullable<WireTypes.CreateOrganizationPaymentMethodCheckoutData["headers"]>["Idempotency-Key"];
    };
};

export const CreateOrganizationPaymentMethodCheckoutOutputSchema = GeneratedZod.zCreateOrganizationPaymentMethodCheckoutResponse;
export type CreateOrganizationPaymentMethodCheckoutOutput = z.output<typeof CreateOrganizationPaymentMethodCheckoutOutputSchema>;
export const CreateOrganizationPaymentMethodCheckoutOutputSchemas: OutputSchemas<CreateOrganizationPaymentMethodCheckoutOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zCreateOrganizationPaymentMethodCheckoutResponse,
}))();

export const CreateOrganizationSsoPortalLinkInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateOrganizationSsoPortalLinkBody,
    path: GeneratedZod.zCreateOrganizationSsoPortalLinkPath.strict(),
}))();
export type CreateOrganizationSsoPortalLinkInput = {
    body: WireTypes.CreateOrganizationSsoPortalLinkData["body"];
    path: NonNullable<WireTypes.CreateOrganizationSsoPortalLinkData["path"]>;
};

export const CreateOrganizationSsoPortalLinkOutputSchema = GeneratedZod.zCreateOrganizationSsoPortalLinkResponse;
export type CreateOrganizationSsoPortalLinkOutput = z.output<typeof CreateOrganizationSsoPortalLinkOutputSchema>;
export const CreateOrganizationSsoPortalLinkOutputSchemas: OutputSchemas<CreateOrganizationSsoPortalLinkOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zCreateOrganizationSsoPortalLinkResponse,
}))();

export const CreateOrGetSpaceInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateOrGetSpaceBody,
    path: GeneratedZod.zCreateOrGetSpacePath.strict(),
    headers: z.strictObject({
        "idempotency-key": GeneratedZod.zCreateOrGetSpaceHeaders.shape["idempotency-key"],
    }),
}))();
export type CreateOrGetSpaceInput = {
    body: WireTypes.CreateOrGetSpaceData["body"];
    path: NonNullable<WireTypes.CreateOrGetSpaceData["path"]>;
    headers: {
        "idempotency-key": NonNullable<WireTypes.CreateOrGetSpaceData["headers"]>["idempotency-key"];
    };
};

export const CreateOrGetSpaceOutputSchema = GeneratedZod.zPlatformSpace;
export type CreateOrGetSpaceOutput = z.output<typeof CreateOrGetSpaceOutputSchema>;
export const CreateOrGetSpaceOutputSchemas: OutputSchemas<CreateOrGetSpaceOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zPlatformSpace,
    "201": GeneratedZod.zPlatformSpace,
}))();

export const CreateOrGetUserInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateOrGetUserBody,
    path: GeneratedZod.zCreateOrGetUserPath.strict(),
}))();
export type CreateOrGetUserInput = {
    body: WireTypes.CreateOrGetUserData["body"];
    path: NonNullable<WireTypes.CreateOrGetUserData["path"]>;
};

export const CreateOrGetUserOutputSchema = GeneratedZod.zPlatformUser;
export type CreateOrGetUserOutput = z.output<typeof CreateOrGetUserOutputSchema>;
export const CreateOrGetUserOutputSchemas: OutputSchemas<CreateOrGetUserOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zPlatformUser,
    "201": GeneratedZod.zPlatformUser,
}))();

export const CreateProjectInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateProjectBody,
    path: GeneratedZod.zCreateProjectPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateProjectHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CreateProjectInput = {
    body: WireTypes.CreateProjectData["body"];
    path: NonNullable<WireTypes.CreateProjectData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CreateProjectData["headers"]>["Idempotency-Key"];
    };
};

export const CreateProjectOutputSchema = GeneratedZod.zProject;
export type CreateProjectOutput = z.output<typeof CreateProjectOutputSchema>;
export const CreateProjectOutputSchemas: OutputSchemas<CreateProjectOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zProject,
    "202": GeneratedZod.zProject,
}))();

export const CreateProjectApiKeyInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateProjectApiKeyBody,
    path: GeneratedZod.zCreateProjectApiKeyPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateProjectApiKeyHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CreateProjectApiKeyInput = {
    body: WireTypes.CreateProjectApiKeyData["body"];
    path: NonNullable<WireTypes.CreateProjectApiKeyData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CreateProjectApiKeyData["headers"]>["Idempotency-Key"];
    };
};

export const CreateProjectApiKeyOutputSchema = GeneratedZod.zCreateProjectApiKeyResponse;
export type CreateProjectApiKeyOutput = z.output<typeof CreateProjectApiKeyOutputSchema>;
export const CreateProjectApiKeyOutputSchemas: OutputSchemas<CreateProjectApiKeyOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zCreateProjectApiKeyResponse,
}))();

export const CreateServiceIdentityInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateServiceIdentityBody,
    path: GeneratedZod.zCreateServiceIdentityPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateServiceIdentityHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CreateServiceIdentityInput = {
    body: WireTypes.CreateServiceIdentityData["body"];
    path: NonNullable<WireTypes.CreateServiceIdentityData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CreateServiceIdentityData["headers"]>["Idempotency-Key"];
    };
};

export const CreateServiceIdentityOutputSchema = GeneratedZod.zCreateServiceIdentityResponse;
export type CreateServiceIdentityOutput = z.output<typeof CreateServiceIdentityOutputSchema>;
export const CreateServiceIdentityOutputSchemas: OutputSchemas<CreateServiceIdentityOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zCreateServiceIdentityResponse,
}))();

export const CreateServiceIdentityApiKeyInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateServiceIdentityApiKeyBody,
    path: GeneratedZod.zCreateServiceIdentityApiKeyPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateServiceIdentityApiKeyHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CreateServiceIdentityApiKeyInput = {
    body: WireTypes.CreateServiceIdentityApiKeyData["body"];
    path: NonNullable<WireTypes.CreateServiceIdentityApiKeyData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CreateServiceIdentityApiKeyData["headers"]>["Idempotency-Key"];
    };
};

export const CreateServiceIdentityApiKeyOutputSchema = GeneratedZod.zCreateServiceIdentityApiKeyResponse;
export type CreateServiceIdentityApiKeyOutput = z.output<typeof CreateServiceIdentityApiKeyOutputSchema>;
export const CreateServiceIdentityApiKeyOutputSchemas: OutputSchemas<CreateServiceIdentityApiKeyOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zCreateServiceIdentityApiKeyResponse,
}))();

export const CreateServiceIdentityClientSecretInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateServiceIdentityClientSecretBody,
    path: GeneratedZod.zCreateServiceIdentityClientSecretPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateServiceIdentityClientSecretHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CreateServiceIdentityClientSecretInput = {
    body: WireTypes.CreateServiceIdentityClientSecretData["body"];
    path: NonNullable<WireTypes.CreateServiceIdentityClientSecretData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CreateServiceIdentityClientSecretData["headers"]>["Idempotency-Key"];
    };
};

export const CreateServiceIdentityClientSecretOutputSchema = GeneratedZod.zCreateServiceIdentityClientSecretResponse;
export type CreateServiceIdentityClientSecretOutput = z.output<typeof CreateServiceIdentityClientSecretOutputSchema>;
export const CreateServiceIdentityClientSecretOutputSchemas: OutputSchemas<CreateServiceIdentityClientSecretOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zCreateServiceIdentityClientSecretResponse,
}))();

export const CreateSharedLineAssignmentInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateSharedLineAssignmentBody,
    path: GeneratedZod.zCreateSharedLineAssignmentPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateSharedLineAssignmentHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CreateSharedLineAssignmentInput = {
    body: WireTypes.CreateSharedLineAssignmentData["body"];
    path: NonNullable<WireTypes.CreateSharedLineAssignmentData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CreateSharedLineAssignmentData["headers"]>["Idempotency-Key"];
    };
};

export const CreateSharedLineAssignmentOutputSchema = GeneratedZod.zSharedLineAssignment;
export type CreateSharedLineAssignmentOutput = z.output<typeof CreateSharedLineAssignmentOutputSchema>;
export const CreateSharedLineAssignmentOutputSchemas: OutputSchemas<CreateSharedLineAssignmentOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zSharedLineAssignment,
}))();

export const CreateVoiceProfileInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateVoiceProfileBody,
    path: GeneratedZod.zCreateVoiceProfilePath.strict(),
}))();
export type CreateVoiceProfileInput = {
    body: WireTypes.CreateVoiceProfileData["body"];
    path: NonNullable<WireTypes.CreateVoiceProfileData["path"]>;
};

export const CreateVoiceProfileOutputSchema = GeneratedZod.zVoiceProfile;
export type CreateVoiceProfileOutput = z.output<typeof CreateVoiceProfileOutputSchema>;
export const CreateVoiceProfileOutputSchemas: OutputSchemas<CreateVoiceProfileOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zVoiceProfile,
}))();

export const CreateWebhookDestinationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateWebhookDestinationBody,
    path: GeneratedZod.zCreateWebhookDestinationPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateWebhookDestinationHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CreateWebhookDestinationInput = {
    body: WireTypes.CreateWebhookDestinationData["body"];
    path: NonNullable<WireTypes.CreateWebhookDestinationData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CreateWebhookDestinationData["headers"]>["Idempotency-Key"];
    };
};

export const CreateWebhookDestinationOutputSchema = GeneratedZod.zCreateWebhookDestinationResponse;
export type CreateWebhookDestinationOutput = z.output<typeof CreateWebhookDestinationOutputSchema>;
export const CreateWebhookDestinationOutputSchemas: OutputSchemas<CreateWebhookDestinationOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zCreateWebhookDestinationResponse,
}))();

export const CreateWhatsappSharedLineAssignmentInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateWhatsappSharedLineAssignmentBody,
    path: GeneratedZod.zCreateWhatsappSharedLineAssignmentPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateWhatsappSharedLineAssignmentHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CreateWhatsappSharedLineAssignmentInput = {
    body: WireTypes.CreateWhatsappSharedLineAssignmentData["body"];
    path: NonNullable<WireTypes.CreateWhatsappSharedLineAssignmentData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CreateWhatsappSharedLineAssignmentData["headers"]>["Idempotency-Key"];
    };
};

export const CreateWhatsappSharedLineAssignmentOutputSchema = GeneratedZod.zSharedLineAssignment;
export type CreateWhatsappSharedLineAssignmentOutput = z.output<typeof CreateWhatsappSharedLineAssignmentOutputSchema>;
export const CreateWhatsappSharedLineAssignmentOutputSchemas: OutputSchemas<CreateWhatsappSharedLineAssignmentOutput> = /* @__PURE__ */ (() => ({
    "201": GeneratedZod.zSharedLineAssignment,
}))();

export const CreateWhatsappVoipSenderInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zCreateWhatsappVoipSenderBody,
    path: GeneratedZod.zCreateWhatsappVoipSenderPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zCreateWhatsappVoipSenderHeaders.shape["Idempotency-Key"],
    }),
}))();
export type CreateWhatsappVoipSenderInput = {
    body: WireTypes.CreateWhatsappVoipSenderData["body"];
    path: NonNullable<WireTypes.CreateWhatsappVoipSenderData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.CreateWhatsappVoipSenderData["headers"]>["Idempotency-Key"];
    };
};

export const CreateWhatsappVoipSenderOutputSchema = GeneratedZod.zOperation;
export type CreateWhatsappVoipSenderOutput = z.output<typeof CreateWhatsappVoipSenderOutputSchema>;
export const CreateWhatsappVoipSenderOutputSchemas: OutputSchemas<CreateWhatsappVoipSenderOutput> = /* @__PURE__ */ (() => ({
    "202": GeneratedZod.zOperation,
}))();

export const DeleteAccountInputSchema = /* @__PURE__ */ (() => z.strictObject({

}))();
export type DeleteAccountInput = Record<string, never>;

export const DeleteAccountOutputSchema = GeneratedZod.zAccount;
export type DeleteAccountOutput = z.output<typeof DeleteAccountOutputSchema>;
export const DeleteAccountOutputSchemas: OutputSchemas<DeleteAccountOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAccount,
}))();

export const DeleteOrganizationOauthClientInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zDeleteOrganizationOauthClientPath.strict(),
}))();
export type DeleteOrganizationOauthClientInput = {
    path: NonNullable<WireTypes.DeleteOrganizationOauthClientData["path"]>;
};

export const DeleteOrganizationOauthClientOutputSchema = GeneratedZod.zDeleteOrganizationOauthClientResponse;
export type DeleteOrganizationOauthClientOutput = z.output<typeof DeleteOrganizationOauthClientOutputSchema>;
export const DeleteOrganizationOauthClientOutputSchemas: OutputSchemas<DeleteOrganizationOauthClientOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zDeleteOrganizationOauthClientResponse,
    "202": GeneratedZod.zDeleteOrganizationOauthClientResponse,
}))();

export const DeleteOrganizationOauthClientSecretInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zDeleteOrganizationOauthClientSecretPath.strict(),
}))();
export type DeleteOrganizationOauthClientSecretInput = {
    path: NonNullable<WireTypes.DeleteOrganizationOauthClientSecretData["path"]>;
};

export const DeleteOrganizationOauthClientSecretOutputSchema = z.undefined();
export type DeleteOrganizationOauthClientSecretOutput = z.output<typeof DeleteOrganizationOauthClientSecretOutputSchema>;
export const DeleteOrganizationOauthClientSecretOutputSchemas: OutputSchemas<DeleteOrganizationOauthClientSecretOutput> = /* @__PURE__ */ (() => ({
    "204": z.undefined(),
}))();

export const DeleteProjectInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zDeleteProjectPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zDeleteProjectHeaders.shape["Idempotency-Key"],
    }),
}))();
export type DeleteProjectInput = {
    path: NonNullable<WireTypes.DeleteProjectData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.DeleteProjectData["headers"]>["Idempotency-Key"];
    };
};

export const DeleteProjectOutputSchema = GeneratedZod.zProject;
export type DeleteProjectOutput = z.output<typeof DeleteProjectOutputSchema>;
export const DeleteProjectOutputSchemas: OutputSchemas<DeleteProjectOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zProject,
}))();

export const DeleteVoiceProfileInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zDeleteVoiceProfilePath.strict(),
    query: GeneratedZod.zDeleteVoiceProfileQuery.strict(),
}))();
export type DeleteVoiceProfileInput = {
    path: NonNullable<WireTypes.DeleteVoiceProfileData["path"]>;
    query: NonNullable<WireTypes.DeleteVoiceProfileData["query"]>;
};

export const DeleteVoiceProfileOutputSchema = z.undefined();
export type DeleteVoiceProfileOutput = z.output<typeof DeleteVoiceProfileOutputSchema>;
export const DeleteVoiceProfileOutputSchemas: OutputSchemas<DeleteVoiceProfileOutput> = /* @__PURE__ */ (() => ({
    "204": z.undefined(),
}))();

export const DeleteVoiceProfileInboundInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zDeleteVoiceProfileInboundPath.strict(),
    query: GeneratedZod.zDeleteVoiceProfileInboundQuery.strict(),
}))();
export type DeleteVoiceProfileInboundInput = {
    path: NonNullable<WireTypes.DeleteVoiceProfileInboundData["path"]>;
    query: NonNullable<WireTypes.DeleteVoiceProfileInboundData["query"]>;
};

export const DeleteVoiceProfileInboundOutputSchema = GeneratedZod.zVoiceProfileInboundConfiguration;
export type DeleteVoiceProfileInboundOutput = z.output<typeof DeleteVoiceProfileInboundOutputSchema>;
export const DeleteVoiceProfileInboundOutputSchemas: OutputSchemas<DeleteVoiceProfileInboundOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zVoiceProfileInboundConfiguration,
}))();

export const DeleteVoiceProfileOutboundInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zDeleteVoiceProfileOutboundPath.strict(),
    query: GeneratedZod.zDeleteVoiceProfileOutboundQuery.strict(),
}))();
export type DeleteVoiceProfileOutboundInput = {
    path: NonNullable<WireTypes.DeleteVoiceProfileOutboundData["path"]>;
    query: NonNullable<WireTypes.DeleteVoiceProfileOutboundData["query"]>;
};

export const DeleteVoiceProfileOutboundOutputSchema = GeneratedZod.zDeleteVoiceProfileOutboundResponse;
export type DeleteVoiceProfileOutboundOutput = z.output<typeof DeleteVoiceProfileOutboundOutputSchema>;
export const DeleteVoiceProfileOutboundOutputSchemas: OutputSchemas<DeleteVoiceProfileOutboundOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zDeleteVoiceProfileOutboundResponse,
}))();

export const DeleteWebhookDestinationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zDeleteWebhookDestinationPath.strict(),
}))();
export type DeleteWebhookDestinationInput = {
    path: NonNullable<WireTypes.DeleteWebhookDestinationData["path"]>;
};

export const DeleteWebhookDestinationOutputSchema = GeneratedZod.zWebhookDestination;
export type DeleteWebhookDestinationOutput = z.output<typeof DeleteWebhookDestinationOutputSchema>;
export const DeleteWebhookDestinationOutputSchemas: OutputSchemas<DeleteWebhookDestinationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zWebhookDestination,
}))();

export const DeviceAuthorizeInputSchema = /* @__PURE__ */ (() => z.strictObject({

}))();
export type DeviceAuthorizeInput = Record<string, never>;

export const DeviceAuthorizeOutputSchema = GeneratedZod.zDeviceAuthorizeResponse;
export type DeviceAuthorizeOutput = z.output<typeof DeviceAuthorizeOutputSchema>;
export const DeviceAuthorizeOutputSchemas: OutputSchemas<DeviceAuthorizeOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zDeviceAuthorizeResponse,
}))();

export const DeviceTokenInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zDeviceTokenBody,
}))();
export type DeviceTokenInput = {
    body: WireTypes.DeviceTokenData["body"];
};

export const DeviceTokenOutputSchema = GeneratedZod.zDeviceTokenResponse;
export type DeviceTokenOutput = z.output<typeof DeviceTokenOutputSchema>;
export const DeviceTokenOutputSchemas: OutputSchemas<DeviceTokenOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zDeviceTokenResponse,
}))();

export const DisableOrganizationSsoInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zDisableOrganizationSsoBody,
    path: GeneratedZod.zDisableOrganizationSsoPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zDisableOrganizationSsoHeaders.shape["Idempotency-Key"],
    }),
}))();
export type DisableOrganizationSsoInput = {
    body: WireTypes.DisableOrganizationSsoData["body"];
    path: NonNullable<WireTypes.DisableOrganizationSsoData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.DisableOrganizationSsoData["headers"]>["Idempotency-Key"];
    };
};

export const DisableOrganizationSsoOutputSchema = GeneratedZod.zOrganizationSsoConfiguration;
export type DisableOrganizationSsoOutput = z.output<typeof DisableOrganizationSsoOutputSchema>;
export const DisableOrganizationSsoOutputSchemas: OutputSchemas<DisableOrganizationSsoOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOrganizationSsoConfiguration,
}))();

export const DisconnectWhatsappBusinessAccountInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zDisconnectWhatsappBusinessAccountPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zDisconnectWhatsappBusinessAccountHeaders.shape["Idempotency-Key"],
    }),
}))();
export type DisconnectWhatsappBusinessAccountInput = {
    path: NonNullable<WireTypes.DisconnectWhatsappBusinessAccountData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.DisconnectWhatsappBusinessAccountData["headers"]>["Idempotency-Key"];
    };
};

export const DisconnectWhatsappBusinessAccountOutputSchema = GeneratedZod.zOperation;
export type DisconnectWhatsappBusinessAccountOutput = z.output<typeof DisconnectWhatsappBusinessAccountOutputSchema>;
export const DisconnectWhatsappBusinessAccountOutputSchemas: OutputSchemas<DisconnectWhatsappBusinessAccountOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOperation,
    "202": GeneratedZod.zOperation,
}))();

export const DownloadAttachmentInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zDownloadAttachmentPath.strict(),
}))();
export type DownloadAttachmentInput = {
    path: NonNullable<WireTypes.DownloadAttachmentData["path"]>;
};

export const DownloadAttachmentOutputSchema = z.instanceof(Blob);
export type DownloadAttachmentOutput = z.output<typeof DownloadAttachmentOutputSchema>;
export const DownloadAttachmentOutputSchemas: OutputSchemas<DownloadAttachmentOutput> = /* @__PURE__ */ (() => ({
    "200": z.instanceof(Blob),
}))();

export const EnsureInitialOrganizationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zEnsureInitialOrganizationHeaders.shape["Idempotency-Key"],
    }),
}))();
export type EnsureInitialOrganizationInput = {
    headers: {
        idempotencyKey: NonNullable<WireTypes.EnsureInitialOrganizationData["headers"]>["Idempotency-Key"];
    };
};

export const EnsureInitialOrganizationOutputSchema = GeneratedZod.zEnsureInitialOrganizationResponse;
export type EnsureInitialOrganizationOutput = z.output<typeof EnsureInitialOrganizationOutputSchema>;
export const EnsureInitialOrganizationOutputSchemas: OutputSchemas<EnsureInitialOrganizationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zEnsureInitialOrganizationResponse,
}))();

export const GetAccountInputSchema = /* @__PURE__ */ (() => z.strictObject({

}))();
export type GetAccountInput = Record<string, never>;

export const GetAccountOutputSchema = GeneratedZod.zAccount;
export type GetAccountOutput = z.output<typeof GetAccountOutputSchema>;
export const GetAccountOutputSchemas: OutputSchemas<GetAccountOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAccount,
}))();

export const GetAgentProfileInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetAgentProfilePath.strict(),
}))();
export type GetAgentProfileInput = {
    path: NonNullable<WireTypes.GetAgentProfileData["path"]>;
};

export const GetAgentProfileOutputSchema = GeneratedZod.zAgentProfile;
export type GetAgentProfileOutput = z.output<typeof GetAgentProfileOutputSchema>;
export const GetAgentProfileOutputSchemas: OutputSchemas<GetAgentProfileOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAgentProfile,
}))();

export const GetAttachmentInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetAttachmentPath.strict(),
}))();
export type GetAttachmentInput = {
    path: NonNullable<WireTypes.GetAttachmentData["path"]>;
};

export const GetAttachmentOutputSchema = GeneratedZod.zAttachment;
export type GetAttachmentOutput = z.output<typeof GetAttachmentOutputSchema>;
export const GetAttachmentOutputSchemas: OutputSchemas<GetAttachmentOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAttachment,
}))();

export const GetBillingOperationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetBillingOperationPath.strict(),
}))();
export type GetBillingOperationInput = {
    path: NonNullable<WireTypes.GetBillingOperationData["path"]>;
};

export const GetBillingOperationOutputSchema = GeneratedZod.zBillingOperation;
export type GetBillingOperationOutput = z.output<typeof GetBillingOperationOutputSchema>;
export const GetBillingOperationOutputSchemas: OutputSchemas<GetBillingOperationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zBillingOperation,
}))();

export const GetBillingOverviewInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetBillingOverviewPath.strict(),
}))();
export type GetBillingOverviewInput = {
    path: NonNullable<WireTypes.GetBillingOverviewData["path"]>;
};

export const GetBillingOverviewOutputSchema = GeneratedZod.zGetBillingOverviewResponse;
export type GetBillingOverviewOutput = z.output<typeof GetBillingOverviewOutputSchema>;
export const GetBillingOverviewOutputSchemas: OutputSchemas<GetBillingOverviewOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetBillingOverviewResponse,
}))();

export const GetCurrentOrganizationInputSchema = /* @__PURE__ */ (() => z.strictObject({

}))();
export type GetCurrentOrganizationInput = Record<string, never>;

export const GetCurrentOrganizationOutputSchema = GeneratedZod.zGetCurrentOrganizationResponse;
export type GetCurrentOrganizationOutput = z.output<typeof GetCurrentOrganizationOutputSchema>;
export const GetCurrentOrganizationOutputSchemas: OutputSchemas<GetCurrentOrganizationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetCurrentOrganizationResponse,
}))();

export const GetDefaultVoiceProfileInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetDefaultVoiceProfilePath.strict(),
}))();
export type GetDefaultVoiceProfileInput = {
    path: NonNullable<WireTypes.GetDefaultVoiceProfileData["path"]>;
};

export const GetDefaultVoiceProfileOutputSchema = GeneratedZod.zVoiceProfile;
export type GetDefaultVoiceProfileOutput = z.output<typeof GetDefaultVoiceProfileOutputSchema>;
export const GetDefaultVoiceProfileOutputSchemas: OutputSchemas<GetDefaultVoiceProfileOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zVoiceProfile,
}))();

export const GetEffectiveTermsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetEffectiveTermsPath.strict(),
}))();
export type GetEffectiveTermsInput = {
    path: NonNullable<WireTypes.GetEffectiveTermsData["path"]>;
};

export const GetEffectiveTermsOutputSchema = GeneratedZod.zGetEffectiveTermsResponse;
export type GetEffectiveTermsOutput = z.output<typeof GetEffectiveTermsOutputSchema>;
export const GetEffectiveTermsOutputSchemas: OutputSchemas<GetEffectiveTermsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetEffectiveTermsResponse,
}))();

export const GetEmailDeliveryMetricsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetEmailDeliveryMetricsPath.strict(),
    query: GeneratedZod.zGetEmailDeliveryMetricsQuery.strict().optional(),
}))();
export type GetEmailDeliveryMetricsInput = {
    path: NonNullable<WireTypes.GetEmailDeliveryMetricsData["path"]>;
    query?: NonNullable<WireTypes.GetEmailDeliveryMetricsData["query"]>;
};

export const GetEmailDeliveryMetricsOutputSchema = GeneratedZod.zEmailDeliveryMetrics;
export type GetEmailDeliveryMetricsOutput = z.output<typeof GetEmailDeliveryMetricsOutputSchema>;
export const GetEmailDeliveryMetricsOutputSchemas: OutputSchemas<GetEmailDeliveryMetricsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zEmailDeliveryMetrics,
}))();

export const GetEmailSendingPoliciesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetEmailSendingPoliciesPath.strict(),
}))();
export type GetEmailSendingPoliciesInput = {
    path: NonNullable<WireTypes.GetEmailSendingPoliciesData["path"]>;
};

export const GetEmailSendingPoliciesOutputSchema = GeneratedZod.zEmailSendingPolicies;
export type GetEmailSendingPoliciesOutput = z.output<typeof GetEmailSendingPoliciesOutputSchema>;
export const GetEmailSendingPoliciesOutputSchemas: OutputSchemas<GetEmailSendingPoliciesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zEmailSendingPolicies,
}))();

export const GetMessageInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetMessagePath.strict(),
    headers: z.strictObject({
        "if-none-match": GeneratedZod.zGetMessageHeaders.shape["if-none-match"],
    }).optional(),
}))();
export type GetMessageInput = {
    path: NonNullable<WireTypes.GetMessageData["path"]>;
    headers?: {
        "if-none-match"?: NonNullable<WireTypes.GetMessageData["headers"]>["if-none-match"];
    };
};

export const GetMessageOutputSchema = /* @__PURE__ */ (() => z.union([GeneratedZod.zPlatformMessage, z.undefined()]))();
export type GetMessageOutput = z.output<typeof GetMessageOutputSchema>;
export const GetMessageOutputSchemas: OutputSchemas<GetMessageOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zPlatformMessage,
    "304": z.undefined(),
}))();

export const GetMessageMetricsBackfillInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetMessageMetricsBackfillPath.strict(),
    headers: z.strictObject({
        "x-photon-version": GeneratedZod.zGetMessageMetricsBackfillHeaders.shape["x-photon-version"],
    }).optional(),
}))();
export type GetMessageMetricsBackfillInput = {
    path: NonNullable<WireTypes.GetMessageMetricsBackfillData["path"]>;
    headers?: {
        "x-photon-version"?: NonNullable<WireTypes.GetMessageMetricsBackfillData["headers"]>["x-photon-version"];
    };
};

export const GetMessageMetricsBackfillOutputSchema = GeneratedZod.zGetMessageMetricsBackfillResponse;
export type GetMessageMetricsBackfillOutput = z.output<typeof GetMessageMetricsBackfillOutputSchema>;
export const GetMessageMetricsBackfillOutputSchemas: OutputSchemas<GetMessageMetricsBackfillOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetMessageMetricsBackfillResponse,
}))();

export const GetMessageMetricsSqlSchemaInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetMessageMetricsSqlSchemaPath.strict(),
    headers: z.strictObject({
        "x-photon-version": GeneratedZod.zGetMessageMetricsSqlSchemaHeaders.shape["x-photon-version"],
    }).optional(),
}))();
export type GetMessageMetricsSqlSchemaInput = {
    path: NonNullable<WireTypes.GetMessageMetricsSqlSchemaData["path"]>;
    headers?: {
        "x-photon-version"?: NonNullable<WireTypes.GetMessageMetricsSqlSchemaData["headers"]>["x-photon-version"];
    };
};

export const GetMessageMetricsSqlSchemaOutputSchema = GeneratedZod.zGetMessageMetricsSqlSchemaResponse;
export type GetMessageMetricsSqlSchemaOutput = z.output<typeof GetMessageMetricsSqlSchemaOutputSchema>;
export const GetMessageMetricsSqlSchemaOutputSchemas: OutputSchemas<GetMessageMetricsSqlSchemaOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetMessageMetricsSqlSchemaResponse,
}))();

export const GetOperationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetOperationPath.strict(),
}))();
export type GetOperationInput = {
    path: NonNullable<WireTypes.GetOperationData["path"]>;
};

export const GetOperationOutputSchema = GeneratedZod.zGetOperationResponse;
export type GetOperationOutput = z.output<typeof GetOperationOutputSchema>;
export const GetOperationOutputSchemas: OutputSchemas<GetOperationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetOperationResponse,
}))();

export const GetOrganizationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetOrganizationPath.strict(),
}))();
export type GetOrganizationInput = {
    path: NonNullable<WireTypes.GetOrganizationData["path"]>;
};

export const GetOrganizationOutputSchema = GeneratedZod.zGetOrganizationResponse;
export type GetOrganizationOutput = z.output<typeof GetOrganizationOutputSchema>;
export const GetOrganizationOutputSchemas: OutputSchemas<GetOrganizationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetOrganizationResponse,
}))();

export const GetOrganizationBillingOverviewInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetOrganizationBillingOverviewPath.strict(),
}))();
export type GetOrganizationBillingOverviewInput = {
    path: NonNullable<WireTypes.GetOrganizationBillingOverviewData["path"]>;
};

export const GetOrganizationBillingOverviewOutputSchema = GeneratedZod.zGetOrganizationBillingOverviewResponse;
export type GetOrganizationBillingOverviewOutput = z.output<typeof GetOrganizationBillingOverviewOutputSchema>;
export const GetOrganizationBillingOverviewOutputSchemas: OutputSchemas<GetOrganizationBillingOverviewOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetOrganizationBillingOverviewResponse,
}))();

export const GetOrganizationConnectionStatusInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetOrganizationConnectionStatusPath.strict(),
}))();
export type GetOrganizationConnectionStatusInput = {
    path: NonNullable<WireTypes.GetOrganizationConnectionStatusData["path"]>;
};

export const GetOrganizationConnectionStatusOutputSchema = GeneratedZod.zOrganizationConnectionStatus;
export type GetOrganizationConnectionStatusOutput = z.output<typeof GetOrganizationConnectionStatusOutputSchema>;
export const GetOrganizationConnectionStatusOutputSchemas: OutputSchemas<GetOrganizationConnectionStatusOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOrganizationConnectionStatus,
}))();

export const GetOrganizationCreditInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetOrganizationCreditPath.strict(),
}))();
export type GetOrganizationCreditInput = {
    path: NonNullable<WireTypes.GetOrganizationCreditData["path"]>;
};

export const GetOrganizationCreditOutputSchema = GeneratedZod.zGetOrganizationCreditResponse;
export type GetOrganizationCreditOutput = z.output<typeof GetOrganizationCreditOutputSchema>;
export const GetOrganizationCreditOutputSchemas: OutputSchemas<GetOrganizationCreditOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetOrganizationCreditResponse,
}))();

export const GetOrganizationOauthClientInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetOrganizationOauthClientPath.strict(),
}))();
export type GetOrganizationOauthClientInput = {
    path: NonNullable<WireTypes.GetOrganizationOauthClientData["path"]>;
};

export const GetOrganizationOauthClientOutputSchema = GeneratedZod.zGetOrganizationOauthClientResponse;
export type GetOrganizationOauthClientOutput = z.output<typeof GetOrganizationOauthClientOutputSchema>;
export const GetOrganizationOauthClientOutputSchemas: OutputSchemas<GetOrganizationOauthClientOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetOrganizationOauthClientResponse,
}))();

export const GetOrganizationOauthClientSecretInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetOrganizationOauthClientSecretPath.strict(),
}))();
export type GetOrganizationOauthClientSecretInput = {
    path: NonNullable<WireTypes.GetOrganizationOauthClientSecretData["path"]>;
};

export const GetOrganizationOauthClientSecretOutputSchema = GeneratedZod.zGetOrganizationOauthClientSecretResponse;
export type GetOrganizationOauthClientSecretOutput = z.output<typeof GetOrganizationOauthClientSecretOutputSchema>;
export const GetOrganizationOauthClientSecretOutputSchemas: OutputSchemas<GetOrganizationOauthClientSecretOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetOrganizationOauthClientSecretResponse,
}))();

export const GetOrganizationPaymentMethodInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetOrganizationPaymentMethodPath.strict(),
}))();
export type GetOrganizationPaymentMethodInput = {
    path: NonNullable<WireTypes.GetOrganizationPaymentMethodData["path"]>;
};

export const GetOrganizationPaymentMethodOutputSchema = GeneratedZod.zGetOrganizationPaymentMethodResponse;
export type GetOrganizationPaymentMethodOutput = z.output<typeof GetOrganizationPaymentMethodOutputSchema>;
export const GetOrganizationPaymentMethodOutputSchemas: OutputSchemas<GetOrganizationPaymentMethodOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetOrganizationPaymentMethodResponse,
}))();

export const GetOrganizationSsoConfigurationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetOrganizationSsoConfigurationPath.strict(),
}))();
export type GetOrganizationSsoConfigurationInput = {
    path: NonNullable<WireTypes.GetOrganizationSsoConfigurationData["path"]>;
};

export const GetOrganizationSsoConfigurationOutputSchema = GeneratedZod.zOrganizationSsoConfiguration;
export type GetOrganizationSsoConfigurationOutput = z.output<typeof GetOrganizationSsoConfigurationOutputSchema>;
export const GetOrganizationSsoConfigurationOutputSchemas: OutputSchemas<GetOrganizationSsoConfigurationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOrganizationSsoConfiguration,
}))();

export const GetOrganizationTermsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetOrganizationTermsPath.strict(),
}))();
export type GetOrganizationTermsInput = {
    path: NonNullable<WireTypes.GetOrganizationTermsData["path"]>;
};

export const GetOrganizationTermsOutputSchema = GeneratedZod.zGetOrganizationTermsResponse;
export type GetOrganizationTermsOutput = z.output<typeof GetOrganizationTermsOutputSchema>;
export const GetOrganizationTermsOutputSchemas: OutputSchemas<GetOrganizationTermsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetOrganizationTermsResponse,
}))();

export const GetProjectInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetProjectPath.strict(),
}))();
export type GetProjectInput = {
    path: NonNullable<WireTypes.GetProjectData["path"]>;
};

export const GetProjectOutputSchema = GeneratedZod.zProject;
export type GetProjectOutput = z.output<typeof GetProjectOutputSchema>;
export const GetProjectOutputSchemas: OutputSchemas<GetProjectOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zProject,
}))();

export const GetProjectClosureStatusInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetProjectClosureStatusPath.strict(),
    query: GeneratedZod.zGetProjectClosureStatusQuery.strict(),
}))();
export type GetProjectClosureStatusInput = {
    path: NonNullable<WireTypes.GetProjectClosureStatusData["path"]>;
    query: NonNullable<WireTypes.GetProjectClosureStatusData["query"]>;
};

export const GetProjectClosureStatusOutputSchema = GeneratedZod.zGetProjectClosureStatusResponse;
export type GetProjectClosureStatusOutput = z.output<typeof GetProjectClosureStatusOutputSchema>;
export const GetProjectClosureStatusOutputSchemas: OutputSchemas<GetProjectClosureStatusOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetProjectClosureStatusResponse,
}))();

export const GetProjectImessagePlatformInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetProjectImessagePlatformPath.strict(),
}))();
export type GetProjectImessagePlatformInput = {
    path: NonNullable<WireTypes.GetProjectImessagePlatformData["path"]>;
};

export const GetProjectImessagePlatformOutputSchema = GeneratedZod.zProjectPlatformSettings;
export type GetProjectImessagePlatformOutput = z.output<typeof GetProjectImessagePlatformOutputSchema>;
export const GetProjectImessagePlatformOutputSchemas: OutputSchemas<GetProjectImessagePlatformOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zProjectPlatformSettings,
}))();

export const GetProjectWhatsappPlatformInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetProjectWhatsappPlatformPath.strict(),
}))();
export type GetProjectWhatsappPlatformInput = {
    path: NonNullable<WireTypes.GetProjectWhatsappPlatformData["path"]>;
};

export const GetProjectWhatsappPlatformOutputSchema = GeneratedZod.zProjectPlatformSettings;
export type GetProjectWhatsappPlatformOutput = z.output<typeof GetProjectWhatsappPlatformOutputSchema>;
export const GetProjectWhatsappPlatformOutputSchemas: OutputSchemas<GetProjectWhatsappPlatformOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zProjectPlatformSettings,
}))();

export const GetResourceInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetResourcePath.strict(),
}))();
export type GetResourceInput = {
    path: NonNullable<WireTypes.GetResourceData["path"]>;
};

export const GetResourceOutputSchema = GeneratedZod.zResource;
export type GetResourceOutput = z.output<typeof GetResourceOutputSchema>;
export const GetResourceOutputSchemas: OutputSchemas<GetResourceOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zResource,
}))();

export const GetServiceIdentityInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetServiceIdentityPath.strict(),
}))();
export type GetServiceIdentityInput = {
    path: NonNullable<WireTypes.GetServiceIdentityData["path"]>;
};

export const GetServiceIdentityOutputSchema = GeneratedZod.zGetServiceIdentityResponse;
export type GetServiceIdentityOutput = z.output<typeof GetServiceIdentityOutputSchema>;
export const GetServiceIdentityOutputSchemas: OutputSchemas<GetServiceIdentityOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetServiceIdentityResponse,
}))();

export const GetSharedLineAssignmentInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetSharedLineAssignmentPath.strict(),
}))();
export type GetSharedLineAssignmentInput = {
    path: NonNullable<WireTypes.GetSharedLineAssignmentData["path"]>;
};

export const GetSharedLineAssignmentOutputSchema = GeneratedZod.zSharedLineAssignment;
export type GetSharedLineAssignmentOutput = z.output<typeof GetSharedLineAssignmentOutputSchema>;
export const GetSharedLineAssignmentOutputSchemas: OutputSchemas<GetSharedLineAssignmentOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zSharedLineAssignment,
}))();

export const GetSmsLineCampaignAssignmentInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetSmsLineCampaignAssignmentPath.strict(),
}))();
export type GetSmsLineCampaignAssignmentInput = {
    path: NonNullable<WireTypes.GetSmsLineCampaignAssignmentData["path"]>;
};

export const GetSmsLineCampaignAssignmentOutputSchema = GeneratedZod.zGetSmsLineCampaignAssignmentResponse;
export type GetSmsLineCampaignAssignmentOutput = z.output<typeof GetSmsLineCampaignAssignmentOutputSchema>;
export const GetSmsLineCampaignAssignmentOutputSchemas: OutputSchemas<GetSmsLineCampaignAssignmentOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetSmsLineCampaignAssignmentResponse,
}))();

export const GetSpaceInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetSpacePath.strict(),
    headers: z.strictObject({
        "if-none-match": GeneratedZod.zGetSpaceHeaders.shape["if-none-match"],
    }).optional(),
}))();
export type GetSpaceInput = {
    path: NonNullable<WireTypes.GetSpaceData["path"]>;
    headers?: {
        "if-none-match"?: NonNullable<WireTypes.GetSpaceData["headers"]>["if-none-match"];
    };
};

export const GetSpaceOutputSchema = /* @__PURE__ */ (() => z.union([GeneratedZod.zPlatformSpace, z.undefined()]))();
export type GetSpaceOutput = z.output<typeof GetSpaceOutputSchema>;
export const GetSpaceOutputSchemas: OutputSchemas<GetSpaceOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zPlatformSpace,
    "304": z.undefined(),
}))();

export const GetSsoSubscriptionInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetSsoSubscriptionPath.strict(),
}))();
export type GetSsoSubscriptionInput = {
    path: NonNullable<WireTypes.GetSsoSubscriptionData["path"]>;
};

export const GetSsoSubscriptionOutputSchema = GeneratedZod.zGetSsoSubscriptionResponse;
export type GetSsoSubscriptionOutput = z.output<typeof GetSsoSubscriptionOutputSchema>;
export const GetSsoSubscriptionOutputSchemas: OutputSchemas<GetSsoSubscriptionOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetSsoSubscriptionResponse,
}))();

export const GetUserInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetUserPath.strict(),
    headers: z.strictObject({
        "if-none-match": GeneratedZod.zGetUserHeaders.shape["if-none-match"],
    }).optional(),
}))();
export type GetUserInput = {
    path: NonNullable<WireTypes.GetUserData["path"]>;
    headers?: {
        "if-none-match"?: NonNullable<WireTypes.GetUserData["headers"]>["if-none-match"];
    };
};

export const GetUserOutputSchema = /* @__PURE__ */ (() => z.union([GeneratedZod.zPlatformUser, z.undefined()]))();
export type GetUserOutput = z.output<typeof GetUserOutputSchema>;
export const GetUserOutputSchemas: OutputSchemas<GetUserOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zPlatformUser,
    "304": z.undefined(),
}))();

export const GetVoiceLineProfileAssignmentInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetVoiceLineProfileAssignmentPath.strict(),
}))();
export type GetVoiceLineProfileAssignmentInput = {
    path: NonNullable<WireTypes.GetVoiceLineProfileAssignmentData["path"]>;
};

export const GetVoiceLineProfileAssignmentOutputSchema = GeneratedZod.zVoiceLineProfileAssignment;
export type GetVoiceLineProfileAssignmentOutput = z.output<typeof GetVoiceLineProfileAssignmentOutputSchema>;
export const GetVoiceLineProfileAssignmentOutputSchemas: OutputSchemas<GetVoiceLineProfileAssignmentOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zVoiceLineProfileAssignment,
}))();

export const GetVoiceProfileInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetVoiceProfilePath.strict(),
}))();
export type GetVoiceProfileInput = {
    path: NonNullable<WireTypes.GetVoiceProfileData["path"]>;
};

export const GetVoiceProfileOutputSchema = GeneratedZod.zVoiceProfile;
export type GetVoiceProfileOutput = z.output<typeof GetVoiceProfileOutputSchema>;
export const GetVoiceProfileOutputSchemas: OutputSchemas<GetVoiceProfileOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zVoiceProfile,
}))();

export const GetWebhookDestinationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetWebhookDestinationPath.strict(),
}))();
export type GetWebhookDestinationInput = {
    path: NonNullable<WireTypes.GetWebhookDestinationData["path"]>;
};

export const GetWebhookDestinationOutputSchema = GeneratedZod.zWebhookDestination;
export type GetWebhookDestinationOutput = z.output<typeof GetWebhookDestinationOutputSchema>;
export const GetWebhookDestinationOutputSchemas: OutputSchemas<GetWebhookDestinationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zWebhookDestination,
}))();

export const GetWebhookEventSchemaInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetWebhookEventSchemaPath.strict(),
    query: GeneratedZod.zGetWebhookEventSchemaQuery.strict(),
}))();
export type GetWebhookEventSchemaInput = {
    path: NonNullable<WireTypes.GetWebhookEventSchemaData["path"]>;
    query: NonNullable<WireTypes.GetWebhookEventSchemaData["query"]>;
};

export const GetWebhookEventSchemaOutputSchema = /* @__PURE__ */ (() => z.union([GeneratedZod.zWebhookEventSchema, z.undefined()]))();
export type GetWebhookEventSchemaOutput = z.output<typeof GetWebhookEventSchemaOutputSchema>;
export const GetWebhookEventSchemaOutputSchemas: OutputSchemas<GetWebhookEventSchemaOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zWebhookEventSchema,
    "304": z.undefined(),
}))();

export const GetWhatsappBusinessAccountInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetWhatsappBusinessAccountPath.strict(),
}))();
export type GetWhatsappBusinessAccountInput = {
    path: NonNullable<WireTypes.GetWhatsappBusinessAccountData["path"]>;
};

export const GetWhatsappBusinessAccountOutputSchema = GeneratedZod.zWhatsappBusinessAccount;
export type GetWhatsappBusinessAccountOutput = z.output<typeof GetWhatsappBusinessAccountOutputSchema>;
export const GetWhatsappBusinessAccountOutputSchemas: OutputSchemas<GetWhatsappBusinessAccountOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zWhatsappBusinessAccount,
}))();

export const GetWhatsappBusinessVerificationCodeInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetWhatsappBusinessVerificationCodePath.strict(),
    query: GeneratedZod.zGetWhatsappBusinessVerificationCodeQuery.strict(),
}))();
export type GetWhatsappBusinessVerificationCodeInput = {
    path: NonNullable<WireTypes.GetWhatsappBusinessVerificationCodeData["path"]>;
    query: NonNullable<WireTypes.GetWhatsappBusinessVerificationCodeData["query"]>;
};

export const GetWhatsappBusinessVerificationCodeOutputSchema = GeneratedZod.zGetWhatsappBusinessVerificationCodeResponse;
export type GetWhatsappBusinessVerificationCodeOutput = z.output<typeof GetWhatsappBusinessVerificationCodeOutputSchema>;
export const GetWhatsappBusinessVerificationCodeOutputSchemas: OutputSchemas<GetWhatsappBusinessVerificationCodeOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zGetWhatsappBusinessVerificationCodeResponse,
}))();

export const GetWhatsappSharedLineAssignmentInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zGetWhatsappSharedLineAssignmentPath.strict(),
}))();
export type GetWhatsappSharedLineAssignmentInput = {
    path: NonNullable<WireTypes.GetWhatsappSharedLineAssignmentData["path"]>;
};

export const GetWhatsappSharedLineAssignmentOutputSchema = GeneratedZod.zSharedLineAssignment;
export type GetWhatsappSharedLineAssignmentOutput = z.output<typeof GetWhatsappSharedLineAssignmentOutputSchema>;
export const GetWhatsappSharedLineAssignmentOutputSchemas: OutputSchemas<GetWhatsappSharedLineAssignmentOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zSharedLineAssignment,
}))();

export const LeaveOrganizationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zLeaveOrganizationBody,
    path: GeneratedZod.zLeaveOrganizationPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zLeaveOrganizationHeaders.shape["Idempotency-Key"],
    }),
}))();
export type LeaveOrganizationInput = {
    body: WireTypes.LeaveOrganizationData["body"];
    path: NonNullable<WireTypes.LeaveOrganizationData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.LeaveOrganizationData["headers"]>["Idempotency-Key"];
    };
};

export const LeaveOrganizationOutputSchema = GeneratedZod.zLeaveOrganizationResponse;
export type LeaveOrganizationOutput = z.output<typeof LeaveOrganizationOutputSchema>;
export const LeaveOrganizationOutputSchemas: OutputSchemas<LeaveOrganizationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zLeaveOrganizationResponse,
}))();

export const ListAccountServiceKeysInputSchema = /* @__PURE__ */ (() => z.strictObject({

}))();
export type ListAccountServiceKeysInput = Record<string, never>;

export const ListAccountServiceKeysOutputSchema = GeneratedZod.zListAccountServiceKeysResponse;
export type ListAccountServiceKeysOutput = z.output<typeof ListAccountServiceKeysOutputSchema>;
export const ListAccountServiceKeysOutputSchemas: OutputSchemas<ListAccountServiceKeysOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListAccountServiceKeysResponse,
}))();

export const ListAttachmentsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListAttachmentsPath.strict(),
    query: GeneratedZod.zListAttachmentsQuery.strict().optional(),
}))();
export type ListAttachmentsInput = {
    path: NonNullable<WireTypes.ListAttachmentsData["path"]>;
    query?: NonNullable<WireTypes.ListAttachmentsData["query"]>;
};

export const ListAttachmentsOutputSchema = GeneratedZod.zAttachmentPage;
export type ListAttachmentsOutput = z.output<typeof ListAttachmentsOutputSchema>;
export const ListAttachmentsOutputSchemas: OutputSchemas<ListAttachmentsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAttachmentPage,
}))();

export const ListAuthorizedApplicationsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    query: GeneratedZod.zListAuthorizedApplicationsQuery.strict().optional(),
}))();
export type ListAuthorizedApplicationsInput = {
    query?: NonNullable<WireTypes.ListAuthorizedApplicationsData["query"]>;
};

export const ListAuthorizedApplicationsOutputSchema = GeneratedZod.zListAuthorizedApplicationsResponse;
export type ListAuthorizedApplicationsOutput = z.output<typeof ListAuthorizedApplicationsOutputSchema>;
export const ListAuthorizedApplicationsOutputSchemas: OutputSchemas<ListAuthorizedApplicationsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListAuthorizedApplicationsResponse,
}))();

export const ListBillingPlansInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListBillingPlansPath.strict(),
}))();
export type ListBillingPlansInput = {
    path: NonNullable<WireTypes.ListBillingPlansData["path"]>;
};

export const ListBillingPlansOutputSchema = GeneratedZod.zListBillingPlansResponse;
export type ListBillingPlansOutput = z.output<typeof ListBillingPlansOutputSchema>;
export const ListBillingPlansOutputSchemas: OutputSchemas<ListBillingPlansOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListBillingPlansResponse,
}))();

export const ListCreditActivityInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListCreditActivityPath.strict(),
    query: GeneratedZod.zListCreditActivityQuery.strict().optional(),
}))();
export type ListCreditActivityInput = {
    path: NonNullable<WireTypes.ListCreditActivityData["path"]>;
    query?: NonNullable<WireTypes.ListCreditActivityData["query"]>;
};

export const ListCreditActivityOutputSchema = GeneratedZod.zListCreditActivityResponse;
export type ListCreditActivityOutput = z.output<typeof ListCreditActivityOutputSchema>;
export const ListCreditActivityOutputSchemas: OutputSchemas<ListCreditActivityOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListCreditActivityResponse,
}))();

export const ListEmailRecommendationsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListEmailRecommendationsPath.strict(),
    query: GeneratedZod.zListEmailRecommendationsQuery.strict().optional(),
}))();
export type ListEmailRecommendationsInput = {
    path: NonNullable<WireTypes.ListEmailRecommendationsData["path"]>;
    query?: NonNullable<WireTypes.ListEmailRecommendationsData["query"]>;
};

export const ListEmailRecommendationsOutputSchema = GeneratedZod.zEmailRecommendations;
export type ListEmailRecommendationsOutput = z.output<typeof ListEmailRecommendationsOutputSchema>;
export const ListEmailRecommendationsOutputSchemas: OutputSchemas<ListEmailRecommendationsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zEmailRecommendations,
}))();

export const ListFilteredVerificationCodesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListFilteredVerificationCodesPath.strict(),
    query: GeneratedZod.zListFilteredVerificationCodesQuery.strict().optional(),
}))();
export type ListFilteredVerificationCodesInput = {
    path: NonNullable<WireTypes.ListFilteredVerificationCodesData["path"]>;
    query?: NonNullable<WireTypes.ListFilteredVerificationCodesData["query"]>;
};

export const ListFilteredVerificationCodesOutputSchema = GeneratedZod.zFilteredVerificationCodePage;
export type ListFilteredVerificationCodesOutput = z.output<typeof ListFilteredVerificationCodesOutputSchema>;
export const ListFilteredVerificationCodesOutputSchemas: OutputSchemas<ListFilteredVerificationCodesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zFilteredVerificationCodePage,
}))();

export const ListInvoicesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListInvoicesPath.strict(),
    query: GeneratedZod.zListInvoicesQuery.strict().optional(),
}))();
export type ListInvoicesInput = {
    path: NonNullable<WireTypes.ListInvoicesData["path"]>;
    query?: NonNullable<WireTypes.ListInvoicesData["query"]>;
};

export const ListInvoicesOutputSchema = GeneratedZod.zListInvoicesResponse;
export type ListInvoicesOutput = z.output<typeof ListInvoicesOutputSchema>;
export const ListInvoicesOutputSchemas: OutputSchemas<ListInvoicesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListInvoicesResponse,
}))();

export const ListMessagesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListMessagesPath.strict(),
    query: GeneratedZod.zListMessagesQuery.strict().optional(),
}))();
export type ListMessagesInput = {
    path: NonNullable<WireTypes.ListMessagesData["path"]>;
    query?: NonNullable<WireTypes.ListMessagesData["query"]>;
};

export const ListMessagesOutputSchema = GeneratedZod.zMessagePage;
export type ListMessagesOutput = z.output<typeof ListMessagesOutputSchema>;
export const ListMessagesOutputSchemas: OutputSchemas<ListMessagesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zMessagePage,
}))();

export const ListNumberAreaCodesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListNumberAreaCodesPath.strict(),
    query: GeneratedZod.zListNumberAreaCodesQuery.strict(),
}))();
export type ListNumberAreaCodesInput = {
    path: NonNullable<WireTypes.ListNumberAreaCodesData["path"]>;
    query: NonNullable<WireTypes.ListNumberAreaCodesData["query"]>;
};

export const ListNumberAreaCodesOutputSchema = GeneratedZod.zListNumberAreaCodesResponse;
export type ListNumberAreaCodesOutput = z.output<typeof ListNumberAreaCodesOutputSchema>;
export const ListNumberAreaCodesOutputSchemas: OutputSchemas<ListNumberAreaCodesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListNumberAreaCodesResponse,
}))();

export const ListNumberCountriesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListNumberCountriesPath.strict(),
}))();
export type ListNumberCountriesInput = {
    path: NonNullable<WireTypes.ListNumberCountriesData["path"]>;
};

export const ListNumberCountriesOutputSchema = GeneratedZod.zListNumberCountriesResponse;
export type ListNumberCountriesOutput = z.output<typeof ListNumberCountriesOutputSchema>;
export const ListNumberCountriesOutputSchemas: OutputSchemas<ListNumberCountriesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListNumberCountriesResponse,
}))();

export const ListOauthScopesInputSchema = /* @__PURE__ */ (() => z.strictObject({

}))();
export type ListOauthScopesInput = Record<string, never>;

export const ListOauthScopesOutputSchema = GeneratedZod.zListOauthScopesResponse;
export type ListOauthScopesOutput = z.output<typeof ListOauthScopesOutputSchema>;
export const ListOauthScopesOutputSchemas: OutputSchemas<ListOauthScopesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListOauthScopesResponse,
}))();

export const ListOperationsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListOperationsPath.strict(),
    query: GeneratedZod.zListOperationsQuery.strict().optional(),
}))();
export type ListOperationsInput = {
    path: NonNullable<WireTypes.ListOperationsData["path"]>;
    query?: NonNullable<WireTypes.ListOperationsData["query"]>;
};

export const ListOperationsOutputSchema = GeneratedZod.zOperationPage;
export type ListOperationsOutput = z.output<typeof ListOperationsOutputSchema>;
export const ListOperationsOutputSchemas: OutputSchemas<ListOperationsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOperationPage,
}))();

export const ListOrganizationInvitationsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListOrganizationInvitationsPath.strict(),
}))();
export type ListOrganizationInvitationsInput = {
    path: NonNullable<WireTypes.ListOrganizationInvitationsData["path"]>;
};

export const ListOrganizationInvitationsOutputSchema = GeneratedZod.zListOrganizationInvitationsResponse;
export type ListOrganizationInvitationsOutput = z.output<typeof ListOrganizationInvitationsOutputSchema>;
export const ListOrganizationInvitationsOutputSchemas: OutputSchemas<ListOrganizationInvitationsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListOrganizationInvitationsResponse,
}))();

export const ListOrganizationMembersInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListOrganizationMembersPath.strict(),
}))();
export type ListOrganizationMembersInput = {
    path: NonNullable<WireTypes.ListOrganizationMembersData["path"]>;
};

export const ListOrganizationMembersOutputSchema = GeneratedZod.zListOrganizationMembersResponse;
export type ListOrganizationMembersOutput = z.output<typeof ListOrganizationMembersOutputSchema>;
export const ListOrganizationMembersOutputSchemas: OutputSchemas<ListOrganizationMembersOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListOrganizationMembersResponse,
}))();

export const ListOrganizationOauthClientsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListOrganizationOauthClientsPath.strict(),
}))();
export type ListOrganizationOauthClientsInput = {
    path: NonNullable<WireTypes.ListOrganizationOauthClientsData["path"]>;
};

export const ListOrganizationOauthClientsOutputSchema = GeneratedZod.zListOrganizationOauthClientsResponse;
export type ListOrganizationOauthClientsOutput = z.output<typeof ListOrganizationOauthClientsOutputSchema>;
export const ListOrganizationOauthClientsOutputSchemas: OutputSchemas<ListOrganizationOauthClientsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListOrganizationOauthClientsResponse,
}))();

export const ListOrganizationsInputSchema = /* @__PURE__ */ (() => z.strictObject({

}))();
export type ListOrganizationsInput = Record<string, never>;

export const ListOrganizationsOutputSchema = GeneratedZod.zListOrganizationsResponse;
export type ListOrganizationsOutput = z.output<typeof ListOrganizationsOutputSchema>;
export const ListOrganizationsOutputSchemas: OutputSchemas<ListOrganizationsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListOrganizationsResponse,
}))();

export const ListProjectApiKeysInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListProjectApiKeysPath.strict(),
}))();
export type ListProjectApiKeysInput = {
    path: NonNullable<WireTypes.ListProjectApiKeysData["path"]>;
};

export const ListProjectApiKeysOutputSchema = GeneratedZod.zListProjectApiKeysResponse;
export type ListProjectApiKeysOutput = z.output<typeof ListProjectApiKeysOutputSchema>;
export const ListProjectApiKeysOutputSchemas: OutputSchemas<ListProjectApiKeysOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListProjectApiKeysResponse,
}))();

export const ListProjectPlatformsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListProjectPlatformsPath.strict(),
}))();
export type ListProjectPlatformsInput = {
    path: NonNullable<WireTypes.ListProjectPlatformsData["path"]>;
};

export const ListProjectPlatformsOutputSchema = GeneratedZod.zListProjectPlatformsResponse;
export type ListProjectPlatformsOutput = z.output<typeof ListProjectPlatformsOutputSchema>;
export const ListProjectPlatformsOutputSchemas: OutputSchemas<ListProjectPlatformsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListProjectPlatformsResponse,
}))();

export const ListProjectsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListProjectsPath.strict(),
    query: GeneratedZod.zListProjectsQuery.strict().optional(),
}))();
export type ListProjectsInput = {
    path: NonNullable<WireTypes.ListProjectsData["path"]>;
    query?: NonNullable<WireTypes.ListProjectsData["query"]>;
};

export const ListProjectsOutputSchema = GeneratedZod.zProjectPage;
export type ListProjectsOutput = z.output<typeof ListProjectsOutputSchema>;
export const ListProjectsOutputSchemas: OutputSchemas<ListProjectsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zProjectPage,
}))();

export const ListProjectSubscriptionsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListProjectSubscriptionsPath.strict(),
}))();
export type ListProjectSubscriptionsInput = {
    path: NonNullable<WireTypes.ListProjectSubscriptionsData["path"]>;
};

export const ListProjectSubscriptionsOutputSchema = GeneratedZod.zListProjectSubscriptionsResponse;
export type ListProjectSubscriptionsOutput = z.output<typeof ListProjectSubscriptionsOutputSchema>;
export const ListProjectSubscriptionsOutputSchemas: OutputSchemas<ListProjectSubscriptionsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListProjectSubscriptionsResponse,
}))();

export const ListResourceFilteredVerificationCodesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListResourceFilteredVerificationCodesPath.strict(),
    query: GeneratedZod.zListResourceFilteredVerificationCodesQuery.strict().optional(),
}))();
export type ListResourceFilteredVerificationCodesInput = {
    path: NonNullable<WireTypes.ListResourceFilteredVerificationCodesData["path"]>;
    query?: NonNullable<WireTypes.ListResourceFilteredVerificationCodesData["query"]>;
};

export const ListResourceFilteredVerificationCodesOutputSchema = GeneratedZod.zFilteredVerificationCodePage;
export type ListResourceFilteredVerificationCodesOutput = z.output<typeof ListResourceFilteredVerificationCodesOutputSchema>;
export const ListResourceFilteredVerificationCodesOutputSchemas: OutputSchemas<ListResourceFilteredVerificationCodesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zFilteredVerificationCodePage,
}))();

export const ListResourcesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListResourcesPath.strict(),
    query: GeneratedZod.zListResourcesQuery.strict().optional(),
}))();
export type ListResourcesInput = {
    path: NonNullable<WireTypes.ListResourcesData["path"]>;
    query?: NonNullable<WireTypes.ListResourcesData["query"]>;
};

export const ListResourcesOutputSchema = GeneratedZod.zResourcePage;
export type ListResourcesOutput = z.output<typeof ListResourcesOutputSchema>;
export const ListResourcesOutputSchemas: OutputSchemas<ListResourcesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zResourcePage,
}))();

export const ListServiceIdentitiesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListServiceIdentitiesPath.strict(),
}))();
export type ListServiceIdentitiesInput = {
    path: NonNullable<WireTypes.ListServiceIdentitiesData["path"]>;
};

export const ListServiceIdentitiesOutputSchema = GeneratedZod.zListServiceIdentitiesResponse;
export type ListServiceIdentitiesOutput = z.output<typeof ListServiceIdentitiesOutputSchema>;
export const ListServiceIdentitiesOutputSchemas: OutputSchemas<ListServiceIdentitiesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListServiceIdentitiesResponse,
}))();

export const ListServiceIdentityCredentialsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListServiceIdentityCredentialsPath.strict(),
}))();
export type ListServiceIdentityCredentialsInput = {
    path: NonNullable<WireTypes.ListServiceIdentityCredentialsData["path"]>;
};

export const ListServiceIdentityCredentialsOutputSchema = GeneratedZod.zListServiceIdentityCredentialsResponse;
export type ListServiceIdentityCredentialsOutput = z.output<typeof ListServiceIdentityCredentialsOutputSchema>;
export const ListServiceIdentityCredentialsOutputSchemas: OutputSchemas<ListServiceIdentityCredentialsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListServiceIdentityCredentialsResponse,
}))();

export const ListServiceIdentityPermissionsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListServiceIdentityPermissionsPath.strict(),
}))();
export type ListServiceIdentityPermissionsInput = {
    path: NonNullable<WireTypes.ListServiceIdentityPermissionsData["path"]>;
};

export const ListServiceIdentityPermissionsOutputSchema = GeneratedZod.zListServiceIdentityPermissionsResponse;
export type ListServiceIdentityPermissionsOutput = z.output<typeof ListServiceIdentityPermissionsOutputSchema>;
export const ListServiceIdentityPermissionsOutputSchemas: OutputSchemas<ListServiceIdentityPermissionsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListServiceIdentityPermissionsResponse,
}))();

export const ListSharedLineAssignmentsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListSharedLineAssignmentsPath.strict(),
    query: GeneratedZod.zListSharedLineAssignmentsQuery.strict().optional(),
}))();
export type ListSharedLineAssignmentsInput = {
    path: NonNullable<WireTypes.ListSharedLineAssignmentsData["path"]>;
    query?: NonNullable<WireTypes.ListSharedLineAssignmentsData["query"]>;
};

export const ListSharedLineAssignmentsOutputSchema = GeneratedZod.zSharedLineAssignmentPage;
export type ListSharedLineAssignmentsOutput = z.output<typeof ListSharedLineAssignmentsOutputSchema>;
export const ListSharedLineAssignmentsOutputSchemas: OutputSchemas<ListSharedLineAssignmentsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zSharedLineAssignmentPage,
}))();

export const ListSpacesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListSpacesPath.strict(),
    query: GeneratedZod.zListSpacesQuery.strict().optional(),
}))();
export type ListSpacesInput = {
    path: NonNullable<WireTypes.ListSpacesData["path"]>;
    query?: NonNullable<WireTypes.ListSpacesData["query"]>;
};

export const ListSpacesOutputSchema = GeneratedZod.zSpacePage;
export type ListSpacesOutput = z.output<typeof ListSpacesOutputSchema>;
export const ListSpacesOutputSchemas: OutputSchemas<ListSpacesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zSpacePage,
}))();

export const ListUsersInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListUsersPath.strict(),
    query: GeneratedZod.zListUsersQuery.strict().optional(),
}))();
export type ListUsersInput = {
    path: NonNullable<WireTypes.ListUsersData["path"]>;
    query?: NonNullable<WireTypes.ListUsersData["query"]>;
};

export const ListUsersOutputSchema = GeneratedZod.zUserPage;
export type ListUsersOutput = z.output<typeof ListUsersOutputSchema>;
export const ListUsersOutputSchemas: OutputSchemas<ListUsersOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zUserPage,
}))();

export const ListVoiceProfilesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListVoiceProfilesPath.strict(),
    query: GeneratedZod.zListVoiceProfilesQuery.strict().optional(),
}))();
export type ListVoiceProfilesInput = {
    path: NonNullable<WireTypes.ListVoiceProfilesData["path"]>;
    query?: NonNullable<WireTypes.ListVoiceProfilesData["query"]>;
};

export const ListVoiceProfilesOutputSchema = GeneratedZod.zVoiceProfilePage;
export type ListVoiceProfilesOutput = z.output<typeof ListVoiceProfilesOutputSchema>;
export const ListVoiceProfilesOutputSchemas: OutputSchemas<ListVoiceProfilesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zVoiceProfilePage,
}))();

export const ListWebhookApiVersionsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListWebhookApiVersionsPath.strict(),
}))();
export type ListWebhookApiVersionsInput = {
    path: NonNullable<WireTypes.ListWebhookApiVersionsData["path"]>;
};

export const ListWebhookApiVersionsOutputSchema = /* @__PURE__ */ (() => z.union([GeneratedZod.zListWebhookApiVersionsResponse, z.undefined()]))();
export type ListWebhookApiVersionsOutput = z.output<typeof ListWebhookApiVersionsOutputSchema>;
export const ListWebhookApiVersionsOutputSchemas: OutputSchemas<ListWebhookApiVersionsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListWebhookApiVersionsResponse,
    "304": z.undefined(),
}))();

export const ListWebhookDestinationsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListWebhookDestinationsPath.strict(),
    query: GeneratedZod.zListWebhookDestinationsQuery.strict().optional(),
}))();
export type ListWebhookDestinationsInput = {
    path: NonNullable<WireTypes.ListWebhookDestinationsData["path"]>;
    query?: NonNullable<WireTypes.ListWebhookDestinationsData["query"]>;
};

export const ListWebhookDestinationsOutputSchema = GeneratedZod.zWebhookDestinationPage;
export type ListWebhookDestinationsOutput = z.output<typeof ListWebhookDestinationsOutputSchema>;
export const ListWebhookDestinationsOutputSchemas: OutputSchemas<ListWebhookDestinationsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zWebhookDestinationPage,
}))();

export const ListWebhookEgressAddressesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListWebhookEgressAddressesPath.strict(),
}))();
export type ListWebhookEgressAddressesInput = {
    path: NonNullable<WireTypes.ListWebhookEgressAddressesData["path"]>;
};

export const ListWebhookEgressAddressesOutputSchema = /* @__PURE__ */ (() => z.union([GeneratedZod.zListWebhookEgressAddressesResponse, z.undefined()]))();
export type ListWebhookEgressAddressesOutput = z.output<typeof ListWebhookEgressAddressesOutputSchema>;
export const ListWebhookEgressAddressesOutputSchemas: OutputSchemas<ListWebhookEgressAddressesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListWebhookEgressAddressesResponse,
    "304": z.undefined(),
}))();

export const ListWebhookEventTypesInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListWebhookEventTypesPath.strict(),
    query: GeneratedZod.zListWebhookEventTypesQuery.strict(),
}))();
export type ListWebhookEventTypesInput = {
    path: NonNullable<WireTypes.ListWebhookEventTypesData["path"]>;
    query: NonNullable<WireTypes.ListWebhookEventTypesData["query"]>;
};

export const ListWebhookEventTypesOutputSchema = /* @__PURE__ */ (() => z.union([GeneratedZod.zListWebhookEventTypesResponse, z.undefined()]))();
export type ListWebhookEventTypesOutput = z.output<typeof ListWebhookEventTypesOutputSchema>;
export const ListWebhookEventTypesOutputSchemas: OutputSchemas<ListWebhookEventTypesOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListWebhookEventTypesResponse,
    "304": z.undefined(),
}))();

export const ListWhatsappAccountPhoneNumbersInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListWhatsappAccountPhoneNumbersPath.strict(),
}))();
export type ListWhatsappAccountPhoneNumbersInput = {
    path: NonNullable<WireTypes.ListWhatsappAccountPhoneNumbersData["path"]>;
};

export const ListWhatsappAccountPhoneNumbersOutputSchema = GeneratedZod.zListWhatsappAccountPhoneNumbersResponse;
export type ListWhatsappAccountPhoneNumbersOutput = z.output<typeof ListWhatsappAccountPhoneNumbersOutputSchema>;
export const ListWhatsappAccountPhoneNumbersOutputSchemas: OutputSchemas<ListWhatsappAccountPhoneNumbersOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zListWhatsappAccountPhoneNumbersResponse,
}))();

export const ListWhatsappSharedLineAssignmentsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zListWhatsappSharedLineAssignmentsPath.strict(),
    query: GeneratedZod.zListWhatsappSharedLineAssignmentsQuery.strict().optional(),
}))();
export type ListWhatsappSharedLineAssignmentsInput = {
    path: NonNullable<WireTypes.ListWhatsappSharedLineAssignmentsData["path"]>;
    query?: NonNullable<WireTypes.ListWhatsappSharedLineAssignmentsData["query"]>;
};

export const ListWhatsappSharedLineAssignmentsOutputSchema = GeneratedZod.zSharedLineAssignmentPage;
export type ListWhatsappSharedLineAssignmentsOutput = z.output<typeof ListWhatsappSharedLineAssignmentsOutputSchema>;
export const ListWhatsappSharedLineAssignmentsOutputSchemas: OutputSchemas<ListWhatsappSharedLineAssignmentsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zSharedLineAssignmentPage,
}))();

export const MarkMessageReadInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zMarkMessageReadPath.strict(),
    headers: z.strictObject({
        "idempotency-key": GeneratedZod.zMarkMessageReadHeaders.shape["idempotency-key"],
    }),
}))();
export type MarkMessageReadInput = {
    path: NonNullable<WireTypes.MarkMessageReadData["path"]>;
    headers: {
        "idempotency-key": NonNullable<WireTypes.MarkMessageReadData["headers"]>["idempotency-key"];
    };
};

export const MarkMessageReadOutputSchema = GeneratedZod.zMarkMessageReadResponse;
export type MarkMessageReadOutput = z.output<typeof MarkMessageReadOutputSchema>;
export const MarkMessageReadOutputSchemas: OutputSchemas<MarkMessageReadOutput> = /* @__PURE__ */ (() => ({
    "202": GeneratedZod.zMarkMessageReadResponse,
}))();

export const PreviewOrganizationChangeInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zPreviewOrganizationChangeBody,
    path: GeneratedZod.zPreviewOrganizationChangePath.strict(),
}))();
export type PreviewOrganizationChangeInput = {
    body: WireTypes.PreviewOrganizationChangeData["body"];
    path: NonNullable<WireTypes.PreviewOrganizationChangeData["path"]>;
};

export const PreviewOrganizationChangeOutputSchema = GeneratedZod.zPreviewOrganizationChangeResponse;
export type PreviewOrganizationChangeOutput = z.output<typeof PreviewOrganizationChangeOutputSchema>;
export const PreviewOrganizationChangeOutputSchemas: OutputSchemas<PreviewOrganizationChangeOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zPreviewOrganizationChangeResponse,
}))();

export const PreviewOrganizationInvitationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zPreviewOrganizationInvitationBody,
}))();
export type PreviewOrganizationInvitationInput = {
    body: WireTypes.PreviewOrganizationInvitationData["body"];
};

export const PreviewOrganizationInvitationOutputSchema = GeneratedZod.zPreviewOrganizationInvitationResponse;
export type PreviewOrganizationInvitationOutput = z.output<typeof PreviewOrganizationInvitationOutputSchema>;
export const PreviewOrganizationInvitationOutputSchemas: OutputSchemas<PreviewOrganizationInvitationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zPreviewOrganizationInvitationResponse,
}))();

export const PreviewProjectChangeInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zPreviewProjectChangeBody,
    path: GeneratedZod.zPreviewProjectChangePath.strict(),
}))();
export type PreviewProjectChangeInput = {
    body: WireTypes.PreviewProjectChangeData["body"];
    path: NonNullable<WireTypes.PreviewProjectChangeData["path"]>;
};

export const PreviewProjectChangeOutputSchema = GeneratedZod.zPreviewProjectChangeResponse;
export type PreviewProjectChangeOutput = z.output<typeof PreviewProjectChangeOutputSchema>;
export const PreviewProjectChangeOutputSchemas: OutputSchemas<PreviewProjectChangeOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zPreviewProjectChangeResponse,
}))();

export const ProvisionImessageDedicatedLineInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zProvisionImessageDedicatedLinePath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zProvisionImessageDedicatedLineHeaders.shape["Idempotency-Key"],
    }),
}))();
export type ProvisionImessageDedicatedLineInput = {
    path: NonNullable<WireTypes.ProvisionImessageDedicatedLineData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.ProvisionImessageDedicatedLineData["headers"]>["Idempotency-Key"];
    };
};

export const ProvisionImessageDedicatedLineOutputSchema = GeneratedZod.zOperation;
export type ProvisionImessageDedicatedLineOutput = z.output<typeof ProvisionImessageDedicatedLineOutputSchema>;
export const ProvisionImessageDedicatedLineOutputSchemas: OutputSchemas<ProvisionImessageDedicatedLineOutput> = /* @__PURE__ */ (() => ({
    "202": GeneratedZod.zOperation,
}))();

export const ProvisionWhatsappDedicatedLineInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zProvisionWhatsappDedicatedLinePath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zProvisionWhatsappDedicatedLineHeaders.shape["Idempotency-Key"],
    }),
}))();
export type ProvisionWhatsappDedicatedLineInput = {
    path: NonNullable<WireTypes.ProvisionWhatsappDedicatedLineData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.ProvisionWhatsappDedicatedLineData["headers"]>["Idempotency-Key"];
    };
};

export const ProvisionWhatsappDedicatedLineOutputSchema = GeneratedZod.zOperation;
export type ProvisionWhatsappDedicatedLineOutput = z.output<typeof ProvisionWhatsappDedicatedLineOutputSchema>;
export const ProvisionWhatsappDedicatedLineOutputSchemas: OutputSchemas<ProvisionWhatsappDedicatedLineOutput> = /* @__PURE__ */ (() => ({
    "202": GeneratedZod.zOperation,
}))();

export const PurchaseSmsNumberInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zPurchaseSmsNumberBody,
    path: GeneratedZod.zPurchaseSmsNumberPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zPurchaseSmsNumberHeaders.shape["Idempotency-Key"],
    }),
}))();
export type PurchaseSmsNumberInput = {
    body: WireTypes.PurchaseSmsNumberData["body"];
    path: NonNullable<WireTypes.PurchaseSmsNumberData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.PurchaseSmsNumberData["headers"]>["Idempotency-Key"];
    };
};

export const PurchaseSmsNumberOutputSchema = GeneratedZod.zOperation;
export type PurchaseSmsNumberOutput = z.output<typeof PurchaseSmsNumberOutputSchema>;
export const PurchaseSmsNumberOutputSchemas: OutputSchemas<PurchaseSmsNumberOutput> = /* @__PURE__ */ (() => ({
    "202": GeneratedZod.zOperation,
}))();

export const QueryMessageMetricsInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zQueryMessageMetricsBody,
    path: GeneratedZod.zQueryMessageMetricsPath.strict(),
    headers: z.strictObject({
        "x-photon-version": GeneratedZod.zQueryMessageMetricsHeaders.shape["x-photon-version"],
    }).optional(),
}))();
export type QueryMessageMetricsInput = {
    body: WireTypes.QueryMessageMetricsData["body"];
    path: NonNullable<WireTypes.QueryMessageMetricsData["path"]>;
    headers?: {
        "x-photon-version"?: NonNullable<WireTypes.QueryMessageMetricsData["headers"]>["x-photon-version"];
    };
};

export const QueryMessageMetricsOutputSchema = GeneratedZod.zQueryMessageMetricsResponse;
export type QueryMessageMetricsOutput = z.output<typeof QueryMessageMetricsOutputSchema>;
export const QueryMessageMetricsOutputSchemas: OutputSchemas<QueryMessageMetricsOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zQueryMessageMetricsResponse,
}))();

export const RedeemAppInstallationDeliveryInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zRedeemAppInstallationDeliveryBody,
}))();
export type RedeemAppInstallationDeliveryInput = {
    body: WireTypes.RedeemAppInstallationDeliveryData["body"];
};

export const RedeemAppInstallationDeliveryOutputSchema = GeneratedZod.zRedeemAppInstallationDeliveryResponse;
export type RedeemAppInstallationDeliveryOutput = z.output<typeof RedeemAppInstallationDeliveryOutputSchema>;
export const RedeemAppInstallationDeliveryOutputSchemas: OutputSchemas<RedeemAppInstallationDeliveryOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zRedeemAppInstallationDeliveryResponse,
}))();

export const RefreshOrganizationSsoConnectionInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zRefreshOrganizationSsoConnectionPath.strict(),
}))();
export type RefreshOrganizationSsoConnectionInput = {
    path: NonNullable<WireTypes.RefreshOrganizationSsoConnectionData["path"]>;
};

export const RefreshOrganizationSsoConnectionOutputSchema = GeneratedZod.zOrganizationSsoConfiguration;
export type RefreshOrganizationSsoConnectionOutput = z.output<typeof RefreshOrganizationSsoConnectionOutputSchema>;
export const RefreshOrganizationSsoConnectionOutputSchemas: OutputSchemas<RefreshOrganizationSsoConnectionOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOrganizationSsoConfiguration,
}))();

export const ReleaseImessageDedicatedLineInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zReleaseImessageDedicatedLinePath.strict(),
}))();
export type ReleaseImessageDedicatedLineInput = {
    path: NonNullable<WireTypes.ReleaseImessageDedicatedLineData["path"]>;
};

export const ReleaseImessageDedicatedLineOutputSchema = GeneratedZod.zOperation;
export type ReleaseImessageDedicatedLineOutput = z.output<typeof ReleaseImessageDedicatedLineOutputSchema>;
export const ReleaseImessageDedicatedLineOutputSchemas: OutputSchemas<ReleaseImessageDedicatedLineOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOperation,
    "202": GeneratedZod.zOperation,
}))();

export const ReleaseResourceInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zReleaseResourcePath.strict(),
}))();
export type ReleaseResourceInput = {
    path: NonNullable<WireTypes.ReleaseResourceData["path"]>;
};

export const ReleaseResourceOutputSchema = GeneratedZod.zOperation;
export type ReleaseResourceOutput = z.output<typeof ReleaseResourceOutputSchema>;
export const ReleaseResourceOutputSchemas: OutputSchemas<ReleaseResourceOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOperation,
    "202": GeneratedZod.zOperation,
}))();

export const ReleaseSharedLineAssignmentInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zReleaseSharedLineAssignmentPath.strict(),
}))();
export type ReleaseSharedLineAssignmentInput = {
    path: NonNullable<WireTypes.ReleaseSharedLineAssignmentData["path"]>;
};

export const ReleaseSharedLineAssignmentOutputSchema = GeneratedZod.zSharedLineAssignment;
export type ReleaseSharedLineAssignmentOutput = z.output<typeof ReleaseSharedLineAssignmentOutputSchema>;
export const ReleaseSharedLineAssignmentOutputSchemas: OutputSchemas<ReleaseSharedLineAssignmentOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zSharedLineAssignment,
}))();

export const ReleaseWhatsappDedicatedLineInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zReleaseWhatsappDedicatedLinePath.strict(),
}))();
export type ReleaseWhatsappDedicatedLineInput = {
    path: NonNullable<WireTypes.ReleaseWhatsappDedicatedLineData["path"]>;
};

export const ReleaseWhatsappDedicatedLineOutputSchema = GeneratedZod.zOperation;
export type ReleaseWhatsappDedicatedLineOutput = z.output<typeof ReleaseWhatsappDedicatedLineOutputSchema>;
export const ReleaseWhatsappDedicatedLineOutputSchemas: OutputSchemas<ReleaseWhatsappDedicatedLineOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOperation,
    "202": GeneratedZod.zOperation,
}))();

export const ReleaseWhatsappSharedLineAssignmentInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zReleaseWhatsappSharedLineAssignmentPath.strict(),
}))();
export type ReleaseWhatsappSharedLineAssignmentInput = {
    path: NonNullable<WireTypes.ReleaseWhatsappSharedLineAssignmentData["path"]>;
};

export const ReleaseWhatsappSharedLineAssignmentOutputSchema = GeneratedZod.zSharedLineAssignment;
export type ReleaseWhatsappSharedLineAssignmentOutput = z.output<typeof ReleaseWhatsappSharedLineAssignmentOutputSchema>;
export const ReleaseWhatsappSharedLineAssignmentOutputSchemas: OutputSchemas<ReleaseWhatsappSharedLineAssignmentOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zSharedLineAssignment,
}))();

export const RemoveOrganizationAvatarInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zRemoveOrganizationAvatarBody,
    path: GeneratedZod.zRemoveOrganizationAvatarPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zRemoveOrganizationAvatarHeaders.shape["Idempotency-Key"],
    }),
}))();
export type RemoveOrganizationAvatarInput = {
    body: WireTypes.RemoveOrganizationAvatarData["body"];
    path: NonNullable<WireTypes.RemoveOrganizationAvatarData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.RemoveOrganizationAvatarData["headers"]>["Idempotency-Key"];
    };
};

export const RemoveOrganizationAvatarOutputSchema = GeneratedZod.zRemoveOrganizationAvatarResponse;
export type RemoveOrganizationAvatarOutput = z.output<typeof RemoveOrganizationAvatarOutputSchema>;
export const RemoveOrganizationAvatarOutputSchemas: OutputSchemas<RemoveOrganizationAvatarOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zRemoveOrganizationAvatarResponse,
}))();

export const RemoveOrganizationMemberInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zRemoveOrganizationMemberBody,
    path: GeneratedZod.zRemoveOrganizationMemberPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zRemoveOrganizationMemberHeaders.shape["Idempotency-Key"],
    }),
}))();
export type RemoveOrganizationMemberInput = {
    body: WireTypes.RemoveOrganizationMemberData["body"];
    path: NonNullable<WireTypes.RemoveOrganizationMemberData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.RemoveOrganizationMemberData["headers"]>["Idempotency-Key"];
    };
};

export const RemoveOrganizationMemberOutputSchema = GeneratedZod.zRemoveOrganizationMemberResponse;
export type RemoveOrganizationMemberOutput = z.output<typeof RemoveOrganizationMemberOutputSchema>;
export const RemoveOrganizationMemberOutputSchemas: OutputSchemas<RemoveOrganizationMemberOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zRemoveOrganizationMemberResponse,
}))();

export const ReplaceVoiceProfileInboundInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zReplaceVoiceProfileInboundBody,
    path: GeneratedZod.zReplaceVoiceProfileInboundPath.strict(),
}))();
export type ReplaceVoiceProfileInboundInput = {
    body: WireTypes.ReplaceVoiceProfileInboundData["body"];
    path: NonNullable<WireTypes.ReplaceVoiceProfileInboundData["path"]>;
};

export const ReplaceVoiceProfileInboundOutputSchema = GeneratedZod.zVoiceProfileInboundConfiguration;
export type ReplaceVoiceProfileInboundOutput = z.output<typeof ReplaceVoiceProfileInboundOutputSchema>;
export const ReplaceVoiceProfileInboundOutputSchemas: OutputSchemas<ReplaceVoiceProfileInboundOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zVoiceProfileInboundConfiguration,
    "201": GeneratedZod.zVoiceProfileInboundConfiguration,
}))();

export const ResendOrganizationInvitationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zResendOrganizationInvitationPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zResendOrganizationInvitationHeaders.shape["Idempotency-Key"],
    }),
}))();
export type ResendOrganizationInvitationInput = {
    path: NonNullable<WireTypes.ResendOrganizationInvitationData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.ResendOrganizationInvitationData["headers"]>["Idempotency-Key"];
    };
};

export const ResendOrganizationInvitationOutputSchema = GeneratedZod.zResendOrganizationInvitationResponse;
export type ResendOrganizationInvitationOutput = z.output<typeof ResendOrganizationInvitationOutputSchema>;
export const ResendOrganizationInvitationOutputSchemas: OutputSchemas<ResendOrganizationInvitationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zResendOrganizationInvitationResponse,
}))();

export const ResetAccountProfilePictureInputSchema = /* @__PURE__ */ (() => z.strictObject({
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zResetAccountProfilePictureHeaders.shape["Idempotency-Key"],
    }),
}))();
export type ResetAccountProfilePictureInput = {
    headers: {
        idempotencyKey: NonNullable<WireTypes.ResetAccountProfilePictureData["headers"]>["Idempotency-Key"];
    };
};

export const ResetAccountProfilePictureOutputSchema = GeneratedZod.zAccount;
export type ResetAccountProfilePictureOutput = z.output<typeof ResetAccountProfilePictureOutputSchema>;
export const ResetAccountProfilePictureOutputSchemas: OutputSchemas<ResetAccountProfilePictureOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAccount,
}))();

export const ResetAgentProfileAvatarInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zResetAgentProfileAvatarPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zResetAgentProfileAvatarHeaders.shape["Idempotency-Key"],
    }),
}))();
export type ResetAgentProfileAvatarInput = {
    path: NonNullable<WireTypes.ResetAgentProfileAvatarData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.ResetAgentProfileAvatarData["headers"]>["Idempotency-Key"];
    };
};

export const ResetAgentProfileAvatarOutputSchema = GeneratedZod.zAgentProfile;
export type ResetAgentProfileAvatarOutput = z.output<typeof ResetAgentProfileAvatarOutputSchema>;
export const ResetAgentProfileAvatarOutputSchemas: OutputSchemas<ResetAgentProfileAvatarOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAgentProfile,
}))();

export const RetryOrganizationConnectionSyncInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zRetryOrganizationConnectionSyncPath.strict(),
}))();
export type RetryOrganizationConnectionSyncInput = {
    path: NonNullable<WireTypes.RetryOrganizationConnectionSyncData["path"]>;
};

export const RetryOrganizationConnectionSyncOutputSchema = GeneratedZod.zOrganizationConnectionStatus;
export type RetryOrganizationConnectionSyncOutput = z.output<typeof RetryOrganizationConnectionSyncOutputSchema>;
export const RetryOrganizationConnectionSyncOutputSchemas: OutputSchemas<RetryOrganizationConnectionSyncOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOrganizationConnectionStatus,
}))();

export const RetryWebhookDeliveryInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zRetryWebhookDeliveryBody,
    path: GeneratedZod.zRetryWebhookDeliveryPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zRetryWebhookDeliveryHeaders.shape["Idempotency-Key"],
    }),
}))();
export type RetryWebhookDeliveryInput = {
    body: WireTypes.RetryWebhookDeliveryData["body"];
    path: NonNullable<WireTypes.RetryWebhookDeliveryData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.RetryWebhookDeliveryData["headers"]>["Idempotency-Key"];
    };
};

export const RetryWebhookDeliveryOutputSchema = GeneratedZod.zRetryWebhookDeliveryResponse;
export type RetryWebhookDeliveryOutput = z.output<typeof RetryWebhookDeliveryOutputSchema>;
export const RetryWebhookDeliveryOutputSchemas: OutputSchemas<RetryWebhookDeliveryOutput> = /* @__PURE__ */ (() => ({
    "202": GeneratedZod.zRetryWebhookDeliveryResponse,
}))();

export const RevokeAccountServiceKeyInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zRevokeAccountServiceKeyPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zRevokeAccountServiceKeyHeaders.shape["Idempotency-Key"],
    }),
}))();
export type RevokeAccountServiceKeyInput = {
    path: NonNullable<WireTypes.RevokeAccountServiceKeyData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.RevokeAccountServiceKeyData["headers"]>["Idempotency-Key"];
    };
};

export const RevokeAccountServiceKeyOutputSchema = GeneratedZod.zRevokeAccountServiceKeyResponse;
export type RevokeAccountServiceKeyOutput = z.output<typeof RevokeAccountServiceKeyOutputSchema>;
export const RevokeAccountServiceKeyOutputSchemas: OutputSchemas<RevokeAccountServiceKeyOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zRevokeAccountServiceKeyResponse,
}))();

export const RevokeAuthorizedApplicationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zRevokeAuthorizedApplicationPath.strict(),
}))();
export type RevokeAuthorizedApplicationInput = {
    path: NonNullable<WireTypes.RevokeAuthorizedApplicationData["path"]>;
};

export const RevokeAuthorizedApplicationOutputSchema = z.undefined();
export type RevokeAuthorizedApplicationOutput = z.output<typeof RevokeAuthorizedApplicationOutputSchema>;
export const RevokeAuthorizedApplicationOutputSchemas: OutputSchemas<RevokeAuthorizedApplicationOutput> = /* @__PURE__ */ (() => ({
    "204": z.undefined(),
}))();

export const RevokeOrganizationInvitationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zRevokeOrganizationInvitationPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zRevokeOrganizationInvitationHeaders.shape["Idempotency-Key"],
    }),
}))();
export type RevokeOrganizationInvitationInput = {
    path: NonNullable<WireTypes.RevokeOrganizationInvitationData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.RevokeOrganizationInvitationData["headers"]>["Idempotency-Key"];
    };
};

export const RevokeOrganizationInvitationOutputSchema = GeneratedZod.zRevokeOrganizationInvitationResponse;
export type RevokeOrganizationInvitationOutput = z.output<typeof RevokeOrganizationInvitationOutputSchema>;
export const RevokeOrganizationInvitationOutputSchemas: OutputSchemas<RevokeOrganizationInvitationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zRevokeOrganizationInvitationResponse,
}))();

export const RevokeProjectApiKeyInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zRevokeProjectApiKeyPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zRevokeProjectApiKeyHeaders.shape["Idempotency-Key"],
    }),
}))();
export type RevokeProjectApiKeyInput = {
    path: NonNullable<WireTypes.RevokeProjectApiKeyData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.RevokeProjectApiKeyData["headers"]>["Idempotency-Key"];
    };
};

export const RevokeProjectApiKeyOutputSchema = GeneratedZod.zProjectApiKeyResponse;
export type RevokeProjectApiKeyOutput = z.output<typeof RevokeProjectApiKeyOutputSchema>;
export const RevokeProjectApiKeyOutputSchemas: OutputSchemas<RevokeProjectApiKeyOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zProjectApiKeyResponse,
}))();

export const RevokeServiceIdentityCredentialInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zRevokeServiceIdentityCredentialBody,
    path: GeneratedZod.zRevokeServiceIdentityCredentialPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zRevokeServiceIdentityCredentialHeaders.shape["Idempotency-Key"],
    }),
}))();
export type RevokeServiceIdentityCredentialInput = {
    body: WireTypes.RevokeServiceIdentityCredentialData["body"];
    path: NonNullable<WireTypes.RevokeServiceIdentityCredentialData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.RevokeServiceIdentityCredentialData["headers"]>["Idempotency-Key"];
    };
};

export const RevokeServiceIdentityCredentialOutputSchema = GeneratedZod.zRevokeServiceIdentityCredentialResponse;
export type RevokeServiceIdentityCredentialOutput = z.output<typeof RevokeServiceIdentityCredentialOutputSchema>;
export const RevokeServiceIdentityCredentialOutputSchemas: OutputSchemas<RevokeServiceIdentityCredentialOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zRevokeServiceIdentityCredentialResponse,
}))();

export const RotateOrganizationOauthClientSecretInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zRotateOrganizationOauthClientSecretBody,
    path: GeneratedZod.zRotateOrganizationOauthClientSecretPath.strict(),
    headers: z.strictObject({
        "idempotency-key": GeneratedZod.zRotateOrganizationOauthClientSecretHeaders.shape["idempotency-key"],
    }),
}))();
export type RotateOrganizationOauthClientSecretInput = {
    body: WireTypes.RotateOrganizationOauthClientSecretData["body"];
    path: NonNullable<WireTypes.RotateOrganizationOauthClientSecretData["path"]>;
    headers: {
        "idempotency-key": NonNullable<WireTypes.RotateOrganizationOauthClientSecretData["headers"]>["idempotency-key"];
    };
};

export const RotateOrganizationOauthClientSecretOutputSchema = GeneratedZod.zRotateOrganizationOauthClientSecretResponse;
export type RotateOrganizationOauthClientSecretOutput = z.output<typeof RotateOrganizationOauthClientSecretOutputSchema>;
export const RotateOrganizationOauthClientSecretOutputSchemas: OutputSchemas<RotateOrganizationOauthClientSecretOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zRotateOrganizationOauthClientSecretResponse,
}))();

export const RotateVoiceProfileOutboundCredentialInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zRotateVoiceProfileOutboundCredentialBody,
    path: GeneratedZod.zRotateVoiceProfileOutboundCredentialPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zRotateVoiceProfileOutboundCredentialHeaders.shape["Idempotency-Key"],
    }),
}))();
export type RotateVoiceProfileOutboundCredentialInput = {
    body: WireTypes.RotateVoiceProfileOutboundCredentialData["body"];
    path: NonNullable<WireTypes.RotateVoiceProfileOutboundCredentialData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.RotateVoiceProfileOutboundCredentialData["headers"]>["Idempotency-Key"];
    };
};

export const RotateVoiceProfileOutboundCredentialOutputSchema = GeneratedZod.zRotateVoiceProfileOutboundCredentialResponse;
export type RotateVoiceProfileOutboundCredentialOutput = z.output<typeof RotateVoiceProfileOutboundCredentialOutputSchema>;
export const RotateVoiceProfileOutboundCredentialOutputSchemas: OutputSchemas<RotateVoiceProfileOutboundCredentialOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zRotateVoiceProfileOutboundCredentialResponse,
}))();

export const RotateWebhookSigningSecretInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zRotateWebhookSigningSecretBody,
    path: GeneratedZod.zRotateWebhookSigningSecretPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zRotateWebhookSigningSecretHeaders.shape["Idempotency-Key"],
    }),
}))();
export type RotateWebhookSigningSecretInput = {
    body: WireTypes.RotateWebhookSigningSecretData["body"];
    path: NonNullable<WireTypes.RotateWebhookSigningSecretData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.RotateWebhookSigningSecretData["headers"]>["Idempotency-Key"];
    };
};

export const RotateWebhookSigningSecretOutputSchema = GeneratedZod.zRotateWebhookSigningSecretResponse;
export type RotateWebhookSigningSecretOutput = z.output<typeof RotateWebhookSigningSecretOutputSchema>;
export const RotateWebhookSigningSecretOutputSchemas: OutputSchemas<RotateWebhookSigningSecretOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zRotateWebhookSigningSecretResponse,
}))();

export const SendMessageInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zSendMessageBody,
    path: GeneratedZod.zSendMessagePath.strict(),
    headers: z.strictObject({
        "idempotency-key": GeneratedZod.zSendMessageHeaders.shape["idempotency-key"],
    }),
}))();
export type SendMessageInput = {
    body: WireTypes.SendMessageData["body"];
    path: NonNullable<WireTypes.SendMessageData["path"]>;
    headers: {
        "idempotency-key": NonNullable<WireTypes.SendMessageData["headers"]>["idempotency-key"];
    };
};

export const SendMessageOutputSchema = GeneratedZod.zSentMessage;
export type SendMessageOutput = z.output<typeof SendMessageOutputSchema>;
export const SendMessageOutputSchemas: OutputSchemas<SendMessageOutput> = /* @__PURE__ */ (() => ({
    "202": GeneratedZod.zSentMessage,
}))();

export const SetSpaceTypingInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zSetSpaceTypingBody,
    path: GeneratedZod.zSetSpaceTypingPath.strict(),
}))();
export type SetSpaceTypingInput = {
    body: WireTypes.SetSpaceTypingData["body"];
    path: NonNullable<WireTypes.SetSpaceTypingData["path"]>;
};

export const SetSpaceTypingOutputSchema = GeneratedZod.zSetSpaceTypingResponse;
export type SetSpaceTypingOutput = z.output<typeof SetSpaceTypingOutputSchema>;
export const SetSpaceTypingOutputSchemas: OutputSchemas<SetSpaceTypingOutput> = /* @__PURE__ */ (() => ({
    "202": GeneratedZod.zSetSpaceTypingResponse,
}))();

export const SetupOrganizationOauthClientSecretInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zSetupOrganizationOauthClientSecretPath.strict(),
    headers: z.strictObject({
        "idempotency-key": GeneratedZod.zSetupOrganizationOauthClientSecretHeaders.shape["idempotency-key"],
    }),
}))();
export type SetupOrganizationOauthClientSecretInput = {
    path: NonNullable<WireTypes.SetupOrganizationOauthClientSecretData["path"]>;
    headers: {
        "idempotency-key": NonNullable<WireTypes.SetupOrganizationOauthClientSecretData["headers"]>["idempotency-key"];
    };
};

export const SetupOrganizationOauthClientSecretOutputSchema = /* @__PURE__ */ (() => z.union([GeneratedZod.zSetupOrganizationOauthClientSecretResponse, GeneratedZod.zSetupOrganizationOauthClientSecretCreatedResponse]))();
export type SetupOrganizationOauthClientSecretOutput = z.output<typeof SetupOrganizationOauthClientSecretOutputSchema>;
export const SetupOrganizationOauthClientSecretOutputSchemas: OutputSchemas<SetupOrganizationOauthClientSecretOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zSetupOrganizationOauthClientSecretResponse,
    "201": GeneratedZod.zSetupOrganizationOauthClientSecretCreatedResponse,
}))();

export const StartEnterpriseLoginInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zStartEnterpriseLoginBody,
}))();
export type StartEnterpriseLoginInput = {
    body: WireTypes.StartEnterpriseLoginData["body"];
};

export const StartEnterpriseLoginOutputSchema = GeneratedZod.zStartEnterpriseLoginResponse;
export type StartEnterpriseLoginOutput = z.output<typeof StartEnterpriseLoginOutputSchema>;
export const StartEnterpriseLoginOutputSchemas: OutputSchemas<StartEnterpriseLoginOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zStartEnterpriseLoginResponse,
}))();

export const SubscribeSsoInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zSubscribeSsoBody,
    path: GeneratedZod.zSubscribeSsoPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zSubscribeSsoHeaders.shape["Idempotency-Key"],
    }),
}))();
export type SubscribeSsoInput = {
    body: WireTypes.SubscribeSsoData["body"];
    path: NonNullable<WireTypes.SubscribeSsoData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.SubscribeSsoData["headers"]>["Idempotency-Key"];
    };
};

export const SubscribeSsoOutputSchema = GeneratedZod.zSubscribeSsoResponse;
export type SubscribeSsoOutput = z.output<typeof SubscribeSsoOutputSchema>;
export const SubscribeSsoOutputSchemas: OutputSchemas<SubscribeSsoOutput> = /* @__PURE__ */ (() => ({
    "202": GeneratedZod.zSubscribeSsoResponse,
}))();

export const TransferOrganizationOwnershipInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zTransferOrganizationOwnershipBody,
    path: GeneratedZod.zTransferOrganizationOwnershipPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zTransferOrganizationOwnershipHeaders.shape["Idempotency-Key"],
    }),
}))();
export type TransferOrganizationOwnershipInput = {
    body: WireTypes.TransferOrganizationOwnershipData["body"];
    path: NonNullable<WireTypes.TransferOrganizationOwnershipData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.TransferOrganizationOwnershipData["headers"]>["Idempotency-Key"];
    };
};

export const TransferOrganizationOwnershipOutputSchema = GeneratedZod.zTransferOrganizationOwnershipResponse;
export type TransferOrganizationOwnershipOutput = z.output<typeof TransferOrganizationOwnershipOutputSchema>;
export const TransferOrganizationOwnershipOutputSchemas: OutputSchemas<TransferOrganizationOwnershipOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zTransferOrganizationOwnershipResponse,
}))();

export const UnassignSmsLineCampaignInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zUnassignSmsLineCampaignPath.strict(),
    query: GeneratedZod.zUnassignSmsLineCampaignQuery.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zUnassignSmsLineCampaignHeaders.shape["Idempotency-Key"],
    }),
}))();
export type UnassignSmsLineCampaignInput = {
    path: NonNullable<WireTypes.UnassignSmsLineCampaignData["path"]>;
    query: NonNullable<WireTypes.UnassignSmsLineCampaignData["query"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.UnassignSmsLineCampaignData["headers"]>["Idempotency-Key"];
    };
};

export const UnassignSmsLineCampaignOutputSchema = GeneratedZod.zOperation;
export type UnassignSmsLineCampaignOutput = z.output<typeof UnassignSmsLineCampaignOutputSchema>;
export const UnassignSmsLineCampaignOutputSchemas: OutputSchemas<UnassignSmsLineCampaignOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOperation,
    "202": GeneratedZod.zOperation,
}))();

export const UnassignVoiceLineProfileInputSchema = /* @__PURE__ */ (() => z.strictObject({
    path: GeneratedZod.zUnassignVoiceLineProfilePath.strict(),
    query: GeneratedZod.zUnassignVoiceLineProfileQuery.strict(),
}))();
export type UnassignVoiceLineProfileInput = {
    path: NonNullable<WireTypes.UnassignVoiceLineProfileData["path"]>;
    query: NonNullable<WireTypes.UnassignVoiceLineProfileData["query"]>;
};

export const UnassignVoiceLineProfileOutputSchema = z.undefined();
export type UnassignVoiceLineProfileOutput = z.output<typeof UnassignVoiceLineProfileOutputSchema>;
export const UnassignVoiceLineProfileOutputSchemas: OutputSchemas<UnassignVoiceLineProfileOutput> = /* @__PURE__ */ (() => ({
    "204": z.undefined(),
}))();

export const UpdateAccountInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateAccountBody,
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zUpdateAccountHeaders.shape["Idempotency-Key"],
    }),
}))();
export type UpdateAccountInput = {
    body: WireTypes.UpdateAccountData["body"];
    headers: {
        idempotencyKey: NonNullable<WireTypes.UpdateAccountData["headers"]>["Idempotency-Key"];
    };
};

export const UpdateAccountOutputSchema = GeneratedZod.zAccount;
export type UpdateAccountOutput = z.output<typeof UpdateAccountOutputSchema>;
export const UpdateAccountOutputSchemas: OutputSchemas<UpdateAccountOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAccount,
}))();

export const UpdateAgentProfileInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateAgentProfileBody,
    path: GeneratedZod.zUpdateAgentProfilePath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zUpdateAgentProfileHeaders.shape["Idempotency-Key"],
    }),
}))();
export type UpdateAgentProfileInput = {
    body: WireTypes.UpdateAgentProfileData["body"];
    path: NonNullable<WireTypes.UpdateAgentProfileData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.UpdateAgentProfileData["headers"]>["Idempotency-Key"];
    };
};

export const UpdateAgentProfileOutputSchema = GeneratedZod.zAgentProfile;
export type UpdateAgentProfileOutput = z.output<typeof UpdateAgentProfileOutputSchema>;
export const UpdateAgentProfileOutputSchemas: OutputSchemas<UpdateAgentProfileOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAgentProfile,
}))();

export const UpdateDefaultVoiceProfileInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateDefaultVoiceProfileBody,
    path: GeneratedZod.zUpdateDefaultVoiceProfilePath.strict(),
}))();
export type UpdateDefaultVoiceProfileInput = {
    body: WireTypes.UpdateDefaultVoiceProfileData["body"];
    path: NonNullable<WireTypes.UpdateDefaultVoiceProfileData["path"]>;
};

export const UpdateDefaultVoiceProfileOutputSchema = GeneratedZod.zVoiceProfile;
export type UpdateDefaultVoiceProfileOutput = z.output<typeof UpdateDefaultVoiceProfileOutputSchema>;
export const UpdateDefaultVoiceProfileOutputSchemas: OutputSchemas<UpdateDefaultVoiceProfileOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zVoiceProfile,
}))();

export const UpdateOrganizationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateOrganizationBody,
    path: GeneratedZod.zUpdateOrganizationPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zUpdateOrganizationHeaders.shape["Idempotency-Key"],
    }),
}))();
export type UpdateOrganizationInput = {
    body: WireTypes.UpdateOrganizationData["body"];
    path: NonNullable<WireTypes.UpdateOrganizationData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.UpdateOrganizationData["headers"]>["Idempotency-Key"];
    };
};

export const UpdateOrganizationOutputSchema = GeneratedZod.zUpdateOrganizationResponse;
export type UpdateOrganizationOutput = z.output<typeof UpdateOrganizationOutputSchema>;
export const UpdateOrganizationOutputSchemas: OutputSchemas<UpdateOrganizationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zUpdateOrganizationResponse,
}))();

export const UpdateOrganizationMemberRoleInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateOrganizationMemberRoleBody,
    path: GeneratedZod.zUpdateOrganizationMemberRolePath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zUpdateOrganizationMemberRoleHeaders.shape["Idempotency-Key"],
    }),
}))();
export type UpdateOrganizationMemberRoleInput = {
    body: WireTypes.UpdateOrganizationMemberRoleData["body"];
    path: NonNullable<WireTypes.UpdateOrganizationMemberRoleData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.UpdateOrganizationMemberRoleData["headers"]>["Idempotency-Key"];
    };
};

export const UpdateOrganizationMemberRoleOutputSchema = GeneratedZod.zUpdateOrganizationMemberRoleResponse;
export type UpdateOrganizationMemberRoleOutput = z.output<typeof UpdateOrganizationMemberRoleOutputSchema>;
export const UpdateOrganizationMemberRoleOutputSchemas: OutputSchemas<UpdateOrganizationMemberRoleOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zUpdateOrganizationMemberRoleResponse,
}))();

export const UpdateOrganizationOauthClientInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateOrganizationOauthClientBody,
    path: GeneratedZod.zUpdateOrganizationOauthClientPath.strict(),
    headers: z.strictObject({
        "if-match": GeneratedZod.zUpdateOrganizationOauthClientHeaders.shape["if-match"],
    }),
}))();
export type UpdateOrganizationOauthClientInput = {
    body: WireTypes.UpdateOrganizationOauthClientData["body"];
    path: NonNullable<WireTypes.UpdateOrganizationOauthClientData["path"]>;
    headers: {
        "if-match": NonNullable<WireTypes.UpdateOrganizationOauthClientData["headers"]>["if-match"];
    };
};

export const UpdateOrganizationOauthClientOutputSchema = GeneratedZod.zUpdateOrganizationOauthClientResponse;
export type UpdateOrganizationOauthClientOutput = z.output<typeof UpdateOrganizationOauthClientOutputSchema>;
export const UpdateOrganizationOauthClientOutputSchemas: OutputSchemas<UpdateOrganizationOauthClientOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zUpdateOrganizationOauthClientResponse,
}))();

export const UpdateOrganizationSsoPolicyInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateOrganizationSsoPolicyBody,
    path: GeneratedZod.zUpdateOrganizationSsoPolicyPath.strict(),
}))();
export type UpdateOrganizationSsoPolicyInput = {
    body: WireTypes.UpdateOrganizationSsoPolicyData["body"];
    path: NonNullable<WireTypes.UpdateOrganizationSsoPolicyData["path"]>;
};

export const UpdateOrganizationSsoPolicyOutputSchema = GeneratedZod.zOrganizationSsoConfiguration;
export type UpdateOrganizationSsoPolicyOutput = z.output<typeof UpdateOrganizationSsoPolicyOutputSchema>;
export const UpdateOrganizationSsoPolicyOutputSchemas: OutputSchemas<UpdateOrganizationSsoPolicyOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zOrganizationSsoConfiguration,
}))();

export const UpdateProjectInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateProjectBody,
    path: GeneratedZod.zUpdateProjectPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zUpdateProjectHeaders.shape["Idempotency-Key"],
    }),
}))();
export type UpdateProjectInput = {
    body: WireTypes.UpdateProjectData["body"];
    path: NonNullable<WireTypes.UpdateProjectData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.UpdateProjectData["headers"]>["Idempotency-Key"];
    };
};

export const UpdateProjectOutputSchema = GeneratedZod.zProject;
export type UpdateProjectOutput = z.output<typeof UpdateProjectOutputSchema>;
export const UpdateProjectOutputSchemas: OutputSchemas<UpdateProjectOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zProject,
}))();

export const UpdateProjectApiKeyInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateProjectApiKeyBody,
    path: GeneratedZod.zUpdateProjectApiKeyPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zUpdateProjectApiKeyHeaders.shape["Idempotency-Key"],
    }),
}))();
export type UpdateProjectApiKeyInput = {
    body: WireTypes.UpdateProjectApiKeyData["body"];
    path: NonNullable<WireTypes.UpdateProjectApiKeyData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.UpdateProjectApiKeyData["headers"]>["Idempotency-Key"];
    };
};

export const UpdateProjectApiKeyOutputSchema = GeneratedZod.zProjectApiKeyResponse;
export type UpdateProjectApiKeyOutput = z.output<typeof UpdateProjectApiKeyOutputSchema>;
export const UpdateProjectApiKeyOutputSchemas: OutputSchemas<UpdateProjectApiKeyOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zProjectApiKeyResponse,
}))();

export const UpdateServiceIdentityInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateServiceIdentityBody,
    path: GeneratedZod.zUpdateServiceIdentityPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zUpdateServiceIdentityHeaders.shape["Idempotency-Key"],
    }),
}))();
export type UpdateServiceIdentityInput = {
    body: WireTypes.UpdateServiceIdentityData["body"];
    path: NonNullable<WireTypes.UpdateServiceIdentityData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.UpdateServiceIdentityData["headers"]>["Idempotency-Key"];
    };
};

export const UpdateServiceIdentityOutputSchema = GeneratedZod.zUpdateServiceIdentityResponse;
export type UpdateServiceIdentityOutput = z.output<typeof UpdateServiceIdentityOutputSchema>;
export const UpdateServiceIdentityOutputSchemas: OutputSchemas<UpdateServiceIdentityOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zUpdateServiceIdentityResponse,
}))();

export const UpdateVoiceProfileInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateVoiceProfileBody,
    path: GeneratedZod.zUpdateVoiceProfilePath.strict(),
}))();
export type UpdateVoiceProfileInput = {
    body: WireTypes.UpdateVoiceProfileData["body"];
    path: NonNullable<WireTypes.UpdateVoiceProfileData["path"]>;
};

export const UpdateVoiceProfileOutputSchema = GeneratedZod.zVoiceProfile;
export type UpdateVoiceProfileOutput = z.output<typeof UpdateVoiceProfileOutputSchema>;
export const UpdateVoiceProfileOutputSchemas: OutputSchemas<UpdateVoiceProfileOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zVoiceProfile,
}))();

export const UpdateVoiceProfileInboundInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateVoiceProfileInboundBody,
    path: GeneratedZod.zUpdateVoiceProfileInboundPath.strict(),
}))();
export type UpdateVoiceProfileInboundInput = {
    body: WireTypes.UpdateVoiceProfileInboundData["body"];
    path: NonNullable<WireTypes.UpdateVoiceProfileInboundData["path"]>;
};

export const UpdateVoiceProfileInboundOutputSchema = GeneratedZod.zVoiceProfileInboundConfiguration;
export type UpdateVoiceProfileInboundOutput = z.output<typeof UpdateVoiceProfileInboundOutputSchema>;
export const UpdateVoiceProfileInboundOutputSchemas: OutputSchemas<UpdateVoiceProfileInboundOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zVoiceProfileInboundConfiguration,
}))();

export const UpdateVoiceProfileOutboundAuthenticationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateVoiceProfileOutboundAuthenticationBody,
    path: GeneratedZod.zUpdateVoiceProfileOutboundAuthenticationPath.strict(),
}))();
export type UpdateVoiceProfileOutboundAuthenticationInput = {
    body: WireTypes.UpdateVoiceProfileOutboundAuthenticationData["body"];
    path: NonNullable<WireTypes.UpdateVoiceProfileOutboundAuthenticationData["path"]>;
};

export const UpdateVoiceProfileOutboundAuthenticationOutputSchema = GeneratedZod.zUpdateVoiceProfileOutboundAuthenticationResponse;
export type UpdateVoiceProfileOutboundAuthenticationOutput = z.output<typeof UpdateVoiceProfileOutboundAuthenticationOutputSchema>;
export const UpdateVoiceProfileOutboundAuthenticationOutputSchemas: OutputSchemas<UpdateVoiceProfileOutboundAuthenticationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zUpdateVoiceProfileOutboundAuthenticationResponse,
}))();

export const UpdateWebhookDestinationInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUpdateWebhookDestinationBody,
    path: GeneratedZod.zUpdateWebhookDestinationPath.strict(),
    headers: z.strictObject({
        idempotencyKey: GeneratedZod.zUpdateWebhookDestinationHeaders.shape["Idempotency-Key"],
    }),
}))();
export type UpdateWebhookDestinationInput = {
    body: WireTypes.UpdateWebhookDestinationData["body"];
    path: NonNullable<WireTypes.UpdateWebhookDestinationData["path"]>;
    headers: {
        idempotencyKey: NonNullable<WireTypes.UpdateWebhookDestinationData["headers"]>["Idempotency-Key"];
    };
};

export const UpdateWebhookDestinationOutputSchema = GeneratedZod.zWebhookDestination;
export type UpdateWebhookDestinationOutput = z.output<typeof UpdateWebhookDestinationOutputSchema>;
export const UpdateWebhookDestinationOutputSchemas: OutputSchemas<UpdateWebhookDestinationOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zWebhookDestination,
}))();

export const UploadAttachmentInputSchema = /* @__PURE__ */ (() => z.strictObject({
    body: GeneratedZod.zUploadAttachmentBody,
    path: GeneratedZod.zUploadAttachmentPath.strict(),
    headers: z.strictObject({
        "content-length": GeneratedZod.zUploadAttachmentHeaders.shape["content-length"],
        "content-type": GeneratedZod.zUploadAttachmentHeaders.shape["content-type"],
        "idempotency-key": GeneratedZod.zUploadAttachmentHeaders.shape["idempotency-key"],
    }),
}))();
export type UploadAttachmentInput = {
    body: WireTypes.UploadAttachmentData["body"];
    path: NonNullable<WireTypes.UploadAttachmentData["path"]>;
    headers: {
        "content-length": NonNullable<WireTypes.UploadAttachmentData["headers"]>["content-length"];
        "content-type": NonNullable<WireTypes.UploadAttachmentData["headers"]>["content-type"];
        "idempotency-key": NonNullable<WireTypes.UploadAttachmentData["headers"]>["idempotency-key"];
    };
};

export const UploadAttachmentOutputSchema = GeneratedZod.zAttachment;
export type UploadAttachmentOutput = z.output<typeof UploadAttachmentOutputSchema>;
export const UploadAttachmentOutputSchemas: OutputSchemas<UploadAttachmentOutput> = /* @__PURE__ */ (() => ({
    "200": GeneratedZod.zAttachment,
    "201": GeneratedZod.zAttachment,
}))();
