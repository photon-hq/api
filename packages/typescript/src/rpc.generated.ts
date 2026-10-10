// This file is generated from openapi/rpc-manifest.json. Do not edit.
import type { ZodType } from "zod";
import * as Sdk from "./generated/sdk.gen.js";
import * as Schemas from "./schemas.js";

export const operationMediaTypes: Record<string, { request?: string; rawRequest?: true; responses: string[]; accept: string[]; responseKinds: Record<string, "binary" | "json" | "empty"> }> = {
  "assignSmsLineCampaign": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "202": "json"
    }
  },
  "assignVoiceLineProfile": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "batchUpdateVoiceLineProfileAssignments": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "beginInvitationSso": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "beginOrganizationAuthentication": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "beginOrganizationClosureAuthentication": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "beginOrganizationSsoAdmission": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "cancelOperation": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "changePlan": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "202": "json"
    }
  },
  "checkProjectSlugAvailability": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "commitAccountProfilePicture": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "commitAgentProfileAvatar": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "configureVoiceProfileOutbound": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "201": "json"
    }
  },
  "confirmAccountPhoneVerification": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "connectEmailDomain": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "202": "json"
    }
  },
  "connectTelegramBot": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "202": "json"
    }
  },
  "connectWhatsappBusiness": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "202": "json"
    }
  },
  "countFilteredVerificationCodes": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "countProjects": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "countResourceFilteredVerificationCodes": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "createAccountProfilePictureUpload": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "201": "json"
    }
  },
  "createAccountServiceKey": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "201": "json"
    }
  },
  "createAgentProfileAvatarUpload": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "201": "json"
    }
  },
  "createAppInstallationRequest": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "201": "json"
    }
  },
  "createDefaultVoiceProfile": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "201": "json"
    }
  },
  "createOrganizationPaymentMethodCheckout": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "createOrganizationSetupIntent": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "createOrganizationSsoPortalLink": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "createProject": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "201": "json",
      "202": "json"
    }
  },
  "createProjectApiKey": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "201": "json"
    }
  },
  "createSharedLineAssignment": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "201": "json"
    }
  },
  "createVoiceProfile": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "201": "json"
    }
  },
  "createWebhookDestination": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "201": "json"
    }
  },
  "createWhatsappSharedLineAssignment": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "201": "json"
    }
  },
  "createWhatsappVoipSender": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "202": "json"
    }
  },
  "deleteAccount": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "deleteProject": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "deleteVoiceProfile": {
    "responses": [],
    "accept": [
      "application/problem+json"
    ],
    "responseKinds": {
      "204": "empty"
    }
  },
  "deleteVoiceProfileInbound": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "deleteVoiceProfileOutbound": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "deleteWebhookDestination": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "deviceAuthorize": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "deviceToken": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "disableOrganizationSso": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "disconnectWhatsappBusinessAccount": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "202": "json"
    }
  },
  "downloadAttachment": {
    "responses": [
      "*/*"
    ],
    "accept": [
      "*/*",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "binary"
    }
  },
  "getAccount": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getAgentProfile": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getAttachment": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getBillingOperation": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getBillingOverview": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getDefaultVoiceProfile": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getEffectiveTerms": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getMessageMetricsBackfill": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getMessageMetricsSqlSchema": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getOperation": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getOrganizationBillingOverview": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getOrganizationConnectionStatus": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getOrganizationPaymentMethod": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getOrganizationSsoConfiguration": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getProject": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getProjectClosureStatus": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getProjectImessagePlatform": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getProjectWhatsappPlatform": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getResource": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getSharedLineAssignment": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getSmsLineCampaignAssignment": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getVoiceLineProfileAssignment": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getVoiceProfile": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getWebhookDestination": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getWebhookEventSchema": {
    "responses": [
      "application/schema+json"
    ],
    "accept": [
      "application/schema+json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "304": "empty"
    }
  },
  "getWhatsappBusinessAccount": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getWhatsappBusinessVerificationCode": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getWhatsappSharedLineAssignment": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "getWhatsappSignupConfig": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listAccountServiceKeys": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listAttachments": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listAuthorizedApplications": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listBillingPlans": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listFilteredVerificationCodes": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listInvoices": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listNumberAreaCodes": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listNumberCountries": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listOauthScopes": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listOperations": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listProjectApiKeys": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listProjectPlatforms": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listProjects": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listResourceFilteredVerificationCodes": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listResources": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listSharedLineAssignments": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listVoiceProfiles": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listWebhookApiVersions": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "304": "empty"
    }
  },
  "listWebhookDestinations": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listWebhookEgressAddresses": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "304": "empty"
    }
  },
  "listWebhookEventTypes": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "304": "empty"
    }
  },
  "listWhatsappAccountPhoneNumbers": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "listWhatsappSharedLineAssignments": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "previewOrganizationChange": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "previewProjectChange": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "provisionImessageDedicatedLine": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "202": "json"
    }
  },
  "provisionWhatsappDedicatedLine": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "202": "json"
    }
  },
  "purchaseSmsNumber": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "202": "json"
    }
  },
  "queryMessageMetrics": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "redeemAppInstallationDelivery": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "refreshOrganizationSsoConnection": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "releaseImessageDedicatedLine": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "202": "json"
    }
  },
  "releaseResource": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "202": "json"
    }
  },
  "releaseSharedLineAssignment": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "releaseWhatsappDedicatedLine": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "202": "json"
    }
  },
  "releaseWhatsappSharedLineAssignment": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "replaceVoiceProfileInbound": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "201": "json"
    }
  },
  "resetAccountProfilePicture": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "resetAgentProfileAvatar": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "retryOrganizationConnectionSync": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "retryWebhookDelivery": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "202": "json"
    }
  },
  "revokeAccountServiceKey": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "revokeAuthorizedApplication": {
    "responses": [],
    "accept": [
      "application/problem+json"
    ],
    "responseKinds": {
      "204": "empty"
    }
  },
  "revokeProjectApiKey": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "rotateVoiceProfileOutboundCredential": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "rotateWebhookSigningSecret": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "startAccountPhoneVerification": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "201": "json"
    }
  },
  "startEnterpriseLogin": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "unassignSmsLineCampaign": {
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "202": "json"
    }
  },
  "unassignVoiceLineProfile": {
    "responses": [],
    "accept": [
      "application/problem+json"
    ],
    "responseKinds": {
      "204": "empty"
    }
  },
  "updateAccount": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "updateAgentProfile": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "updateDefaultVoiceProfile": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "updateOrganizationSsoPolicy": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "updateProject": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "updateProjectApiKey": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "updateVoiceProfile": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "updateVoiceProfileInbound": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "updateVoiceProfileOutboundAuthentication": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "updateWebhookDestination": {
    "request": "application/json",
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json"
    }
  },
  "uploadAttachment": {
    "rawRequest": true,
    "responses": [
      "application/json"
    ],
    "accept": [
      "application/json",
      "application/problem+json"
    ],
    "responseKinds": {
      "200": "json",
      "201": "json"
    }
  }
};

export interface RequestOptions {
  signal?: AbortSignal;
  headers?: HeadersInit;
}

export interface RawResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  requestId?: string;
}

export type SdkFunction = (options: any) => any;

// Response schema for each documented success status (`2XX` for a range).
export type OutputSchemas<Output> = Readonly<Record<string, ZodType<Output>>>;

export interface RpcInvokers {
  data<Input, Output>(
    operationId: string,
    sdkFunction: SdkFunction,
    outputSchemas: OutputSchemas<Output>,
    input: Input | undefined,
    options: RequestOptions | undefined,
  ): Promise<Output>;
  raw<Input, Output>(
    operationId: string,
    sdkFunction: SdkFunction,
    outputSchemas: OutputSchemas<Output>,
    input: Input | undefined,
    options: RequestOptions | undefined,
  ): Promise<RawResponse<Output>>;
}

export function createRpcNamespaces(invokers: RpcInvokers) {
  const data = {
    account: {
        /**
         * Commit profile picture
         *
         * Commits a profile picture previously uploaded through createAccountProfilePictureUpload. Call this only after the direct multipart upload succeeds, using the uploadId from the same upload session and a stable Idempotency-Key. The service validates the temporary object's ownership, size, content type, image bytes, dimensions, encryption, and age before changing the Account.
         */
        commitProfilePicture: (input: Schemas.CommitAccountProfilePictureInput, options?: RequestOptions) => invokers.data<Schemas.CommitAccountProfilePictureInput, Schemas.CommitAccountProfilePictureOutput>(
            "commitAccountProfilePicture",
            Sdk.commitAccountProfilePicture,
            Schemas.CommitAccountProfilePictureOutputSchemas,
            input,
            options,
        ),
        /**
         * Confirm phone verification
         *
         * Binds the number once the code is approved. Repeat calls return the bound Account.
         */
        confirmPhoneVerification: (input: Schemas.ConfirmAccountPhoneVerificationInput, options?: RequestOptions) => invokers.data<Schemas.ConfirmAccountPhoneVerificationInput, Schemas.ConfirmAccountPhoneVerificationOutput>(
            "confirmAccountPhoneVerification",
            Sdk.confirmAccountPhoneVerification,
            Schemas.ConfirmAccountPhoneVerificationOutputSchemas,
            input,
            options,
        ),
        /**
         * Create Account Service Key
         *
         * Creates a service key for the authenticated account with the supplied name and optional expiresAt. Returns key metadata and a one-time credential; store the credential securely because it cannot be retrieved through the listing endpoint. These credentials act as the account and must not be distributed as project-scoped keys. Supply the required Idempotency-Key header.
         */
        createAccountServiceKey: (input: Schemas.CreateAccountServiceKeyInput, options?: RequestOptions) => invokers.data<Schemas.CreateAccountServiceKeyInput, Schemas.CreateAccountServiceKeyOutput>(
            "createAccountServiceKey",
            Sdk.createAccountServiceKey,
            Schemas.CreateAccountServiceKeyOutputSchemas,
            input,
            options,
        ),
        /**
         * Create profile picture upload
         *
         * Creates a ten-minute, Account-bound presigned S3 POST for a JPEG, PNG, or WebP profile picture up to 5 MiB. Copy every returned formFields entry into a multipart/form-data request to uploadUrl, append the local file as the final form part, and upload it directly without sending Photon credentials. After the upload succeeds, call commitAccountProfilePicture with the returned uploadId. Do not cache or log the upload URL or form fields.
         */
        createProfilePictureUpload: (input: Schemas.CreateAccountProfilePictureUploadInput, options?: RequestOptions) => invokers.data<Schemas.CreateAccountProfilePictureUploadInput, Schemas.CreateAccountProfilePictureUploadOutput>(
            "createAccountProfilePictureUpload",
            Sdk.createAccountProfilePictureUpload,
            Schemas.CreateAccountProfilePictureUploadOutputSchemas,
            input,
            options,
        ),
        /**
         * Delete account
         *
         * Deletes the authenticated account and returns its account tombstone. The operation is rejected while the account still owns organizations; transfer or close those organizations before retrying. This endpoint acts on the caller's account and does not accept another account's identifier.
         */
        delete: (input: Schemas.DeleteAccountInput = {}, options?: RequestOptions) => invokers.data<Schemas.DeleteAccountInput, Schemas.DeleteAccountOutput>(
            "deleteAccount",
            Sdk.deleteAccount,
            Schemas.DeleteAccountOutputSchemas,
            input,
            options,
        ),
        /**
         * Get account
         *
         * Returns the profile of the authenticated account. The account is selected from the credential rather than a request parameter. A missing or deleted account is reported as an error instead of an empty profile.
         */
        get: (input: Schemas.GetAccountInput = {}, options?: RequestOptions) => invokers.data<Schemas.GetAccountInput, Schemas.GetAccountOutput>(
            "getAccount",
            Sdk.getAccount,
            Schemas.GetAccountOutputSchemas,
            input,
            options,
        ),
        /**
         * List Account Service Keys
         *
         * Returns metadata for the authenticated account's unrevoked service keys, including expired keys, ordered newest first. Secret values are not returned; a key's credential is disclosed only when that key is created.
         */
        listAccountServiceKeys: (input: Schemas.ListAccountServiceKeysInput = {}, options?: RequestOptions) => invokers.data<Schemas.ListAccountServiceKeysInput, Schemas.ListAccountServiceKeysOutput>(
            "listAccountServiceKeys",
            Sdk.listAccountServiceKeys,
            Schemas.ListAccountServiceKeysOutputSchemas,
            input,
            options,
        ),
        /**
         * List connected applications
         *
         * Lists the OAuth applications authorized by the authenticated user.
         */
        listAuthorizedApplications: (input: Schemas.ListAuthorizedApplicationsInput = {}, options?: RequestOptions) => invokers.data<Schemas.ListAuthorizedApplicationsInput, Schemas.ListAuthorizedApplicationsOutput>(
            "listAuthorizedApplications",
            Sdk.listAuthorizedApplications,
            Schemas.ListAuthorizedApplicationsOutputSchemas,
            input,
            options,
        ),
        /**
         * Remove profile picture
         *
         * Removes the authenticated account's custom profile picture and returns the account using its default picture. This operation does not upload a replacement; use the upload-and-commit operations when setting a new custom picture. Supply the required Idempotency-Key header.
         */
        resetProfilePicture: (input: Schemas.ResetAccountProfilePictureInput, options?: RequestOptions) => invokers.data<Schemas.ResetAccountProfilePictureInput, Schemas.ResetAccountProfilePictureOutput>(
            "resetAccountProfilePicture",
            Sdk.resetAccountProfilePicture,
            Schemas.ResetAccountProfilePictureOutputSchemas,
            input,
            options,
        ),
        /**
         * Revoke Account Service Key
         *
         * Revokes the account-owned service key identified by serviceKeyId and returns its revoked metadata. Repeating the revocation is stable. Revocation changes the credential's validity; it does not create a replacement key. Supply the required Idempotency-Key header.
         */
        revokeAccountServiceKey: (input: Schemas.RevokeAccountServiceKeyInput, options?: RequestOptions) => invokers.data<Schemas.RevokeAccountServiceKeyInput, Schemas.RevokeAccountServiceKeyOutput>(
            "revokeAccountServiceKey",
            Sdk.revokeAccountServiceKey,
            Schemas.RevokeAccountServiceKeyOutputSchemas,
            input,
            options,
        ),
        /**
         * Revoke connected application
         *
         * Revokes the authenticated user's grant for one OAuth application.
         */
        revokeAuthorizedApplication: (input: Schemas.RevokeAuthorizedApplicationInput, options?: RequestOptions) => invokers.data<Schemas.RevokeAuthorizedApplicationInput, Schemas.RevokeAuthorizedApplicationOutput>(
            "revokeAuthorizedApplication",
            Sdk.revokeAuthorizedApplication,
            Schemas.RevokeAuthorizedApplicationOutputSchemas,
            input,
            options,
        ),
        /**
         * Start phone verification
         *
         * Sends an SMS code. Answers CAPTCHA_REQUIRED with the widget to render when no solved challenge accompanies the request; retry with the returned challengeContext and a token. Rate limited per account, per destination number, and globally; a rejection carries Retry-After.
         */
        startPhoneVerification: (input: Schemas.StartAccountPhoneVerificationInput, options?: RequestOptions) => invokers.data<Schemas.StartAccountPhoneVerificationInput, Schemas.StartAccountPhoneVerificationOutput>(
            "startAccountPhoneVerification",
            Sdk.startAccountPhoneVerification,
            Schemas.StartAccountPhoneVerificationOutputSchemas,
            input,
            options,
        ),
        /**
         * Update account
         *
         * Updates the supplied firstName and lastName fields on the authenticated account and returns the updated profile. Only the documented profile fields can be changed through this endpoint; profile-picture uploads and phone-number verification use their dedicated operations. Supply the required Idempotency-Key header.
         */
        update: (input: Schemas.UpdateAccountInput, options?: RequestOptions) => invokers.data<Schemas.UpdateAccountInput, Schemas.UpdateAccountOutput>(
            "updateAccount",
            Sdk.updateAccount,
            Schemas.UpdateAccountOutputSchemas,
            input,
            options,
        ),
    },
    auth: {
        device: {
            /**
             * Start device authorization
             *
             * Starts the device authorization flow for a CLI or another device without a browser. Show the verification URL and user code, then poll the token endpoint at the returned interval. No request fields are required; any supplied body is ignored.
             */
            authorize: (input: Schemas.DeviceAuthorizeInput = {}, options?: RequestOptions) => invokers.data<Schemas.DeviceAuthorizeInput, Schemas.DeviceAuthorizeOutput>(
                "deviceAuthorize",
                Sdk.deviceAuthorize,
                Schemas.DeviceAuthorizeOutputSchemas,
                input,
                options,
            ),
            /**
             * Exchange device code or refresh token
             *
             * Exchanges an authorized device code or a refresh token for an access token and rotating refresh token. Accepts JSON and form-encoded bodies. While polling, wait at least interval seconds and increase the interval on slow_down. Store the new refresh token after every successful grant.
             *
             * This SDK method sends uncompressed JSON (application/json). Other request formats described above apply to direct HTTP requests.
             */
            token: (input: Schemas.DeviceTokenInput, options?: RequestOptions) => invokers.data<Schemas.DeviceTokenInput, Schemas.DeviceTokenOutput>(
                "deviceToken",
                Sdk.deviceToken,
                Schemas.DeviceTokenOutputSchemas,
                input,
                options,
            ),
        },
        /**
         * Sign in with invitation SSO
         *
         * Returns an authentication URL for the organization SSO connection associated with the supplied invitation token. Supply token and returnTo. Complete the returned authentication flow; requesting its URL does not itself accept the invitation.
         */
        beginInvitationSso: (input: Schemas.BeginInvitationSsoInput, options?: RequestOptions) => invokers.data<Schemas.BeginInvitationSsoInput, Schemas.BeginInvitationSsoOutput>(
            "beginInvitationSso",
            Sdk.beginInvitationSso,
            Schemas.BeginInvitationSsoOutputSchemas,
            input,
            options,
        ),
        /**
         * Sign in with organization SSO
         *
         * Returns a URL to authenticate through the selected organization’s current SSO connection. Supply returnTo and open the returned URL to continue the flow. Receiving the URL does not establish an authenticated session.
         */
        beginOrganizationAuthentication: (input: Schemas.BeginOrganizationAuthenticationInput, options?: RequestOptions) => invokers.data<Schemas.BeginOrganizationAuthenticationInput, Schemas.BeginOrganizationAuthenticationOutput>(
            "beginOrganizationAuthentication",
            Sdk.beginOrganizationAuthentication,
            Schemas.BeginOrganizationAuthenticationOutputSchemas,
            input,
            options,
        ),
        /**
         * Sign in to close organization
         *
         * Returns an authentication URL for the current organization owner to inspect organization closure. Supply returnTo and complete the returned flow. This operation initiates authentication and does not close the organization.
         */
        beginOrganizationClosureAuthentication: (input: Schemas.BeginOrganizationClosureAuthenticationInput, options?: RequestOptions) => invokers.data<Schemas.BeginOrganizationClosureAuthenticationInput, Schemas.BeginOrganizationClosureAuthenticationOutput>(
            "beginOrganizationClosureAuthentication",
            Sdk.beginOrganizationClosureAuthentication,
            Schemas.BeginOrganizationClosureAuthenticationOutputSchemas,
            input,
            options,
        ),
        /**
         * Begin organization SSO admission
         *
         * Returns an SSO admission URL for an existing account and the selected organization. Supply returnTo for the continuation URL. Admission requires completing the returned authentication flow; creating the URL does not itself grant membership.
         */
        beginOrganizationSsoAdmission: (input: Schemas.BeginOrganizationSsoAdmissionInput, options?: RequestOptions) => invokers.data<Schemas.BeginOrganizationSsoAdmissionInput, Schemas.BeginOrganizationSsoAdmissionOutput>(
            "beginOrganizationSsoAdmission",
            Sdk.beginOrganizationSsoAdmission,
            Schemas.BeginOrganizationSsoAdmissionOutputSchemas,
            input,
            options,
        ),
        /**
         * Create organization setup portal link
         *
         * Returns an organization setup portal URL. Supply returnTo and optionally intent, either sso or domain_verification; sso is the default. Open the returned URL to complete the selected setup flow.
         */
        createOrganizationSsoPortalLink: (input: Schemas.CreateOrganizationSsoPortalLinkInput, options?: RequestOptions) => invokers.data<Schemas.CreateOrganizationSsoPortalLinkInput, Schemas.CreateOrganizationSsoPortalLinkOutput>(
            "createOrganizationSsoPortalLink",
            Sdk.createOrganizationSsoPortalLink,
            Schemas.CreateOrganizationSsoPortalLinkOutputSchemas,
            input,
            options,
        ),
        /**
         * Disable organization SSO
         *
         * Deletes the provider connection, releases the SSO requirement once the connection is gone, then unbinds the chosen domains. Retry with the same Idempotency-Key to resume or await the same run.
         */
        disableOrganizationSso: (input: Schemas.DisableOrganizationSsoInput, options?: RequestOptions) => invokers.data<Schemas.DisableOrganizationSsoInput, Schemas.DisableOrganizationSsoOutput>(
            "disableOrganizationSso",
            Sdk.disableOrganizationSso,
            Schemas.DisableOrganizationSsoOutputSchemas,
            input,
            options,
        ),
        /**
         * Get organization connection status
         *
         * Requires current human organization membership. Synchronization status does not attest SSO configuration or completed authorization.
         */
        getOrganizationConnectionStatus: (input: Schemas.GetOrganizationConnectionStatusInput, options?: RequestOptions) => invokers.data<Schemas.GetOrganizationConnectionStatusInput, Schemas.GetOrganizationConnectionStatusOutput>(
            "getOrganizationConnectionStatus",
            Sdk.getOrganizationConnectionStatus,
            Schemas.GetOrganizationConnectionStatusOutputSchemas,
            input,
            options,
        ),
        /**
         * Get organization SSO configuration
         *
         * Returns the selected organization’s SSO connection state, configuration version, and desired and effective policy settings. Read policySyncStatus alongside the enforcement fields to distinguish requested settings from synchronized settings.
         */
        getOrganizationSsoConfiguration: (input: Schemas.GetOrganizationSsoConfigurationInput, options?: RequestOptions) => invokers.data<Schemas.GetOrganizationSsoConfigurationInput, Schemas.GetOrganizationSsoConfigurationOutput>(
            "getOrganizationSsoConfiguration",
            Sdk.getOrganizationSsoConfiguration,
            Schemas.GetOrganizationSsoConfigurationOutputSchemas,
            input,
            options,
        ),
        /**
         * List OAuth scopes
         *
         * Lists the business permissions available to OAuth applications.
         */
        listOauthScopes: (input: Schemas.ListOauthScopesInput = {}, options?: RequestOptions) => invokers.data<Schemas.ListOauthScopesInput, Schemas.ListOauthScopesOutput>(
            "listOauthScopes",
            Sdk.listOauthScopes,
            Schemas.ListOauthScopesOutputSchemas,
            input,
            options,
        ),
        /**
         * Refresh organization SSO connection
         *
         * Refreshes the selected organization’s SSO connection and returns its current connection state, configuration version and policy synchronization status. This operation takes no request body.
         */
        refreshOrganizationSsoConnection: (input: Schemas.RefreshOrganizationSsoConnectionInput, options?: RequestOptions) => invokers.data<Schemas.RefreshOrganizationSsoConnectionInput, Schemas.RefreshOrganizationSsoConnectionOutput>(
            "refreshOrganizationSsoConnection",
            Sdk.refreshOrganizationSsoConnection,
            Schemas.RefreshOrganizationSsoConnectionOutputSchemas,
            input,
            options,
        ),
        /**
         * Retry organization connection sync
         *
         * Reconciles existing local intent. Takes no body and cannot change membership, roles or authentication policy.
         */
        retryOrganizationConnectionSync: (input: Schemas.RetryOrganizationConnectionSyncInput, options?: RequestOptions) => invokers.data<Schemas.RetryOrganizationConnectionSyncInput, Schemas.RetryOrganizationConnectionSyncOutput>(
            "retryOrganizationConnectionSync",
            Sdk.retryOrganizationConnectionSync,
            Schemas.RetryOrganizationConnectionSyncOutputSchemas,
            input,
            options,
        ),
        /**
         * Start company sign-in
         *
         * Returns a sign-in URL without requiring an existing account: the company SSO connection when the target has a ready connection, otherwise ordinary account login. Supply one documented enrollment variant: organizationId with returnTo (optionally invitationToken), invitationToken with returnTo, or retryToken. Open the returned URL to continue authentication; receiving a URL does not complete sign-in. This is a browser flow: the request must come from an allowed Origin, and the retryToken variant also needs the retry cookie set by the failed sign-in, so send it with credentials.
         */
        startEnterpriseLogin: (input: Schemas.StartEnterpriseLoginInput, options?: RequestOptions) => invokers.data<Schemas.StartEnterpriseLoginInput, Schemas.StartEnterpriseLoginOutput>(
            "startEnterpriseLogin",
            Sdk.startEnterpriseLogin,
            Schemas.StartEnterpriseLoginOutputSchemas,
            input,
            options,
        ),
        /**
         * Update organization SSO policy
         *
         * Updates whether SSO can admit new members automatically using ssoJitEnabled and the current expectedVersion. Returns the organization’s SSO configuration and policy synchronization status; a successful response does not mean every desired policy setting has finished synchronizing.
         */
        updateOrganizationSsoPolicy: (input: Schemas.UpdateOrganizationSsoPolicyInput, options?: RequestOptions) => invokers.data<Schemas.UpdateOrganizationSsoPolicyInput, Schemas.UpdateOrganizationSsoPolicyOutput>(
            "updateOrganizationSsoPolicy",
            Sdk.updateOrganizationSsoPolicy,
            Schemas.UpdateOrganizationSsoPolicyOutputSchemas,
            input,
            options,
        ),
    },
    organizations: {
        billing: {
            /**
             * Change plan
             *
             * Purchases or changes the selected project's plan for the supplied category and planCode. A 202 response means the change is pending: poll the returned operation URL and honor Retry-After until it succeeds or fails. A 200 response means the idempotency key resolved to an operation that is already terminal; inspect that result rather than assuming success from the status code alone. Supply the required Idempotency-Key header. Supply both organizationId and projectId to select the project within its organization.
             */
            changePlan: (input: Schemas.ChangePlanInput, options?: RequestOptions) => invokers.data<Schemas.ChangePlanInput, Schemas.ChangePlanOutput>(
                "changePlan",
                Sdk.changePlan,
                Schemas.ChangePlanOutputSchemas,
                input,
                options,
            ),
            /**
             * Create payment method checkout
             *
             * Returns a hosted payment-method collection URL for the selected organization. An Idempotency-Key header is optional; supply one to make retries safe. Complete the returned checkout flow. Receiving the URL does not mean a card has been saved; check payment-method status afterward.
             */
            createOrganizationPaymentMethodCheckout: (input: Schemas.CreateOrganizationPaymentMethodCheckoutInput, options?: RequestOptions) => invokers.data<Schemas.CreateOrganizationPaymentMethodCheckoutInput, Schemas.CreateOrganizationPaymentMethodCheckoutOutput>(
                "createOrganizationPaymentMethodCheckout",
                Sdk.createOrganizationPaymentMethodCheckout,
                Schemas.CreateOrganizationPaymentMethodCheckoutOutputSchemas,
                input,
                options,
            ),
            /**
             * Create card setup intent
             *
             * Creates payment-provider configuration for collecting a card for the selected organization and returns clientSecret and publishableKey. Supply the required Idempotency-Key header. Complete the provider’s card-collection flow separately and avoid logging the returned client secret.
             */
            createOrganizationSetupIntent: (input: Schemas.CreateOrganizationSetupIntentInput, options?: RequestOptions) => invokers.data<Schemas.CreateOrganizationSetupIntentInput, Schemas.CreateOrganizationSetupIntentOutput>(
                "createOrganizationSetupIntent",
                Sdk.createOrganizationSetupIntent,
                Schemas.CreateOrganizationSetupIntentOutputSchemas,
                input,
                options,
            ),
            /**
             * Get the project's effective billing terms
             *
             * Returns what the selected project is billed on now, per category it holds: the plan as its subscription has it, with any override applied, each fixed charge at the subscription's price and quantity, and resolved entitlements; where the plan comes from; how invoices are paid; the current period and next billing date; and any downgrade or cancellation waiting for the period end. It also returns the credit the paying organization holds on credit notes, such as the unused time of a plan an upgrade replaced; it offsets that organization's next invoices. Supply both organizationId and projectId; the organization must pay for the project. This operation does not change billing.
             */
            getEffectiveTerms: (input: Schemas.GetEffectiveTermsInput, options?: RequestOptions) => invokers.data<Schemas.GetEffectiveTermsInput, Schemas.GetEffectiveTermsOutput>(
                "getEffectiveTerms",
                Sdk.getEffectiveTerms,
                Schemas.GetEffectiveTermsOutputSchemas,
                input,
                options,
            ),
            /**
             * Get organization billing overview
             *
             * Returns the selected organization’s billing subscription and entitlementsVersion. The subscription can be null. Read the returned plan, charges and entitlements to inspect organization billing; this operation does not purchase or change a plan.
             */
            getOrganizationBillingOverview: (input: Schemas.GetOrganizationBillingOverviewInput, options?: RequestOptions) => invokers.data<Schemas.GetOrganizationBillingOverviewInput, Schemas.GetOrganizationBillingOverviewOutput>(
                "getOrganizationBillingOverview",
                Sdk.getOrganizationBillingOverview,
                Schemas.GetOrganizationBillingOverviewOutputSchemas,
                input,
                options,
            ),
            /**
             * Get organization payment method
             *
             * Reports whether the selected organization has a card on file and returns its documented payment-method metadata. Reading this endpoint does not collect a new card or create a checkout session.
             */
            getOrganizationPaymentMethod: (input: Schemas.GetOrganizationPaymentMethodInput, options?: RequestOptions) => invokers.data<Schemas.GetOrganizationPaymentMethodInput, Schemas.GetOrganizationPaymentMethodOutput>(
                "getOrganizationPaymentMethod",
                Sdk.getOrganizationPaymentMethod,
                Schemas.GetOrganizationPaymentMethodOutputSchemas,
                input,
                options,
            ),
            /**
             * List invoices
             *
             * Returns a single page of the selected organization's invoices; invoices with a zero total are excluded. Use the documented invoice fields to inspect each invoice's billing state. Listing invoices does not make a payment or modify a subscription.
             */
            listInvoices: (input: Schemas.ListInvoicesInput, options?: RequestOptions) => invokers.data<Schemas.ListInvoicesInput, Schemas.ListInvoicesOutput>(
                "listInvoices",
                Sdk.listInvoices,
                Schemas.ListInvoicesOutputSchemas,
                input,
                options,
            ),
            /**
             * Preview an organization billing change
             *
             * Previews a fixed-charge quantity change on the selected organization's own subscription, such as SSO. Prices the change by the billing engine exactly as making it would bill it now: dueNow is that invoice, with taxes and the payer's credits applied. A quantity already paid for this period is not billed again, so a purchase after a release can be free. nextCharge is what is charged in advance at the next period start. For a fixed-charge change, pass quote on with the purchase so it is refused if the price or period no longer hold. This operation does not change billing.
             */
            previewOrganizationChange: (input: Schemas.PreviewOrganizationChangeInput, options?: RequestOptions) => invokers.data<Schemas.PreviewOrganizationChangeInput, Schemas.PreviewOrganizationChangeOutput>(
                "previewOrganizationChange",
                Sdk.previewOrganizationChange,
                Schemas.PreviewOrganizationChangeOutputSchemas,
                input,
                options,
            ),
            /**
             * Preview a project billing change
             *
             * Previews a change on the selected project's subscription in the supplied category: a fixed-charge quantity change, or a plan change with the held fixed charges it carries over. Prices the change by the billing engine exactly as making it would bill it now: dueNow is that invoice, with taxes and the payer's credits applied. A quantity already paid for this period is not billed again, so a purchase after a release can be free. nextCharge is what is charged in advance at the next period start. For a fixed-charge change, pass quote on with the purchase so it is refused if the price or period no longer hold. This operation does not change billing. An upgrade bills the replaced plan's usage to date and the new plan from now, less the replaced plan's unused time; planChange says when it applies and which held fixed charges the target does not sell: released first for a change that applies now, released with a downgrade when it applies. additions quotes what is added once an upgrade applies, each billed when it is added, in planChange.additions and outside dueNow. Supply both organizationId and projectId; the organization must pay for the project.
             */
            previewProjectChange: (input: Schemas.PreviewProjectChangeInput, options?: RequestOptions) => invokers.data<Schemas.PreviewProjectChangeInput, Schemas.PreviewProjectChangeOutput>(
                "previewProjectChange",
                Sdk.previewProjectChange,
                Schemas.PreviewProjectChangeOutputSchemas,
                input,
                options,
            ),
        },
        projects: {
            /**
             * Check project slug availability
             *
             * Reports whether createProject would accept `slug` right now. Advisory: only the create itself allocates, so a caller must still handle SLUG_TAKEN. A malformed slug is rejected on shape; a reserved slug, a slug held by an active project, and a slug retired with a deleted project each answer `available: false` with a reason.
             */
            checkProjectSlugAvailability: (input: Schemas.CheckProjectSlugAvailabilityInput, options?: RequestOptions) => invokers.data<Schemas.CheckProjectSlugAvailabilityInput, Schemas.CheckProjectSlugAvailabilityOutput>(
                "checkProjectSlugAvailability",
                Sdk.checkProjectSlugAvailability,
                Schemas.CheckProjectSlugAvailabilityOutputSchemas,
                input,
                options,
            ),
            /**
             * Count projects
             *
             * Counts the projects the same filter would list. The count is read from the primary, so it is authoritative rather than replica-lagged.
             */
            count: (input: Schemas.CountProjectsInput, options?: RequestOptions) => invokers.data<Schemas.CountProjectsInput, Schemas.CountProjectsOutput>(
                "countProjects",
                Sdk.countProjects,
                Schemas.CountProjectsOutputSchemas,
                input,
                options,
            ),
            /**
             * Create project
             *
             * Creates in the authorized organization. In addition to account credentials, explicitly granted Service Identity API keys and M2M tokens may create projects. Project API keys cannot create projects. Creator and private credential evidence come only from the trusted authorization context. The caller-selected slug is immutable, must be 3 to 63 lowercase ASCII alphanumerics separated by single hyphens, and cannot be reserved or held by any active or deleted project.
             */
            create: (input: Schemas.CreateProjectInput, options?: RequestOptions) => invokers.data<Schemas.CreateProjectInput, Schemas.CreateProjectOutput>(
                "createProject",
                Sdk.createProject,
                Schemas.CreateProjectOutputSchemas,
                input,
                options,
            ),
            /**
             * Get project closure status
             *
             * Returns closure progress for projectId within organizationId, including deletionOperationId, domain progress and ready. This read operation does not initiate deletion.
             */
            getProjectClosureStatus: (input: Schemas.GetProjectClosureStatusInput, options?: RequestOptions) => invokers.data<Schemas.GetProjectClosureStatusInput, Schemas.GetProjectClosureStatusOutput>(
                "getProjectClosureStatus",
                Sdk.getProjectClosureStatus,
                Schemas.GetProjectClosureStatusOutputSchemas,
                input,
                options,
            ),
            /**
             * List projects
             *
             * Returns a cursor-paginated page of the active projects in organizationId. Filter using query and the documented creation-time bounds, and navigate with pageSize and pageToken. Project roles are not returned and role is not a supported filter.
             */
            list: (input: Schemas.ListProjectsInput, options?: RequestOptions) => invokers.data<Schemas.ListProjectsInput, Schemas.ListProjectsOutput>(
                "listProjects",
                Sdk.listProjects,
                Schemas.ListProjectsOutputSchemas,
                input,
                options,
            ),
        },
    },
    projects: {
        agentProfile: {
            /**
             * Commit agent avatar
             *
             * Commits an agent avatar previously uploaded through createAgentProfileAvatarUpload. Call this only after the direct multipart upload succeeds, using the uploadId from the same upload session and a stable Idempotency-Key. The service validates the temporary object's Project ownership, size, content type, image bytes, dimensions, encryption, and age before changing the agent profile.
             */
            commitAvatar: (input: Schemas.CommitAgentProfileAvatarInput, options?: RequestOptions) => invokers.data<Schemas.CommitAgentProfileAvatarInput, Schemas.CommitAgentProfileAvatarOutput>(
                "commitAgentProfileAvatar",
                Sdk.commitAgentProfileAvatar,
                Schemas.CommitAgentProfileAvatarOutputSchemas,
                input,
                options,
            ),
            /**
             * Create agent avatar upload
             *
             * Creates a ten-minute, Project-bound presigned S3 POST for a JPEG, PNG, or WebP agent avatar up to 5 MiB. Copy every returned formFields entry into a multipart/form-data request to uploadUrl, append the local file as the final form part, and upload it directly without sending Photon credentials. After the upload succeeds, call commitAgentProfileAvatar with the returned uploadId. Do not cache or log the upload URL or form fields.
             */
            createAvatarUpload: (input: Schemas.CreateAgentProfileAvatarUploadInput, options?: RequestOptions) => invokers.data<Schemas.CreateAgentProfileAvatarUploadInput, Schemas.CreateAgentProfileAvatarUploadOutput>(
                "createAgentProfileAvatarUpload",
                Sdk.createAgentProfileAvatarUpload,
                Schemas.CreateAgentProfileAvatarUploadOutputSchemas,
                input,
                options,
            ),
            /**
             * Get agent profile
             *
             * Returns the agent profile belonging to the identified project. The profile is project-scoped and is distinct from the authenticated account's personal profile. Use the dedicated avatar operations when uploading or removing an agent avatar.
             */
            get: (input: Schemas.GetAgentProfileInput, options?: RequestOptions) => invokers.data<Schemas.GetAgentProfileInput, Schemas.GetAgentProfileOutput>(
                "getAgentProfile",
                Sdk.getAgentProfile,
                Schemas.GetAgentProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Reset agent avatar
             *
             * Replaces the selected project's agent avatar with the project's default avatar, a generated planet image derived from the project ID, and returns the updated agent profile. The reset does not restore an earlier avatar: a custom avatar it replaces is discarded and must be uploaded and committed again to use it. When the default avatar is already in use, the profile is returned unchanged. This does not change the account's personal profile picture. Supply the required Idempotency-Key header.
             */
            resetAvatar: (input: Schemas.ResetAgentProfileAvatarInput, options?: RequestOptions) => invokers.data<Schemas.ResetAgentProfileAvatarInput, Schemas.ResetAgentProfileAvatarOutput>(
                "resetAgentProfileAvatar",
                Sdk.resetAgentProfileAvatar,
                Schemas.ResetAgentProfileAvatarOutputSchemas,
                input,
                options,
            ),
            /**
             * Update agent profile
             *
             * Updates the supplied firstName and lastName fields in the project's agent profile and returns the updated profile. Avatar upload, commit and reset are separate operations. The caller must be authorized to change configuration for the selected project. Supply the required Idempotency-Key header.
             */
            update: (input: Schemas.UpdateAgentProfileInput, options?: RequestOptions) => invokers.data<Schemas.UpdateAgentProfileInput, Schemas.UpdateAgentProfileOutput>(
                "updateAgentProfile",
                Sdk.updateAgentProfile,
                Schemas.UpdateAgentProfileOutputSchemas,
                input,
                options,
            ),
        },
        billing: {
            /**
             * Get billing operation
             *
             * Returns the authoritative state of a billing operation belonging to the selected project. Use it to recover or poll a plan-change request until the operation reaches success or failure. An accepted request is not evidence that the plan change has completed.
             */
            getOperation: (input: Schemas.GetBillingOperationInput, options?: RequestOptions) => invokers.data<Schemas.GetBillingOperationInput, Schemas.GetBillingOperationOutput>(
                "getBillingOperation",
                Sdk.getBillingOperation,
                Schemas.GetBillingOperationOutputSchemas,
                input,
                options,
            ),
            /**
             * Get project billing overview
             *
             * Returns the selected project's plan information, entitlements and current billing-period usage. This operation reads project billing state; it does not change plans or the payer's payment method. Organization-level plans are available through the organization billing overview.
             */
            getOverview: (input: Schemas.GetBillingOverviewInput, options?: RequestOptions) => invokers.data<Schemas.GetBillingOverviewInput, Schemas.GetBillingOverviewOutput>(
                "getBillingOverview",
                Sdk.getBillingOverview,
                Schemas.GetBillingOverviewOutputSchemas,
                input,
                options,
            ),
            /**
             * List billing plans
             *
             * Lists the billing plan catalog, grouped by their public plan-metadata type. Use the returned plan information when choosing the category and planCode for a plan change. The catalog is the same for every project, and reading it does not purchase a plan.
             */
            listBillingPlans: (input: Schemas.ListBillingPlansInput, options?: RequestOptions) => invokers.data<Schemas.ListBillingPlansInput, Schemas.ListBillingPlansOutput>(
                "listBillingPlans",
                Sdk.listBillingPlans,
                Schemas.ListBillingPlansOutputSchemas,
                input,
                options,
            ),
        },
        platforms: {
            imessage: {
                assignments: {
                    /**
                     * Create shared line assignment
                     *
                     * Maps an end user's iMessage handle — an E.164 phone number or an email address — onto one of the project's pooled shared iMessage lines, consuming a seat from the project's entitlement. The assigned number is allocated by the server. When an email address is supplied in `email` the user is sent an invite asynchronously to that address; it is never inferred from the handle, and the response never reports whether the send succeeded. Requires the platforms:write permission bound to the project resource in the path.
                     */
                    create: (input: Schemas.CreateSharedLineAssignmentInput, options?: RequestOptions) => invokers.data<Schemas.CreateSharedLineAssignmentInput, Schemas.CreateSharedLineAssignmentOutput>(
                        "createSharedLineAssignment",
                        Sdk.createSharedLineAssignment,
                        Schemas.CreateSharedLineAssignmentOutputSchemas,
                        input,
                        options,
                    ),
                    /**
                     * Get shared line assignment
                     *
                     * Reads one shared line assignment. Requires the platforms:read permission bound to the project resource in the path.
                     */
                    get: (input: Schemas.GetSharedLineAssignmentInput, options?: RequestOptions) => invokers.data<Schemas.GetSharedLineAssignmentInput, Schemas.GetSharedLineAssignmentOutput>(
                        "getSharedLineAssignment",
                        Sdk.getSharedLineAssignment,
                        Schemas.GetSharedLineAssignmentOutputSchemas,
                        input,
                        options,
                    ),
                    /**
                     * List shared line assignments
                     *
                     * Lists the project's shared line assignments, oldest first. Released assignments are excluded unless includeReleased is set. Requires the platforms:read permission bound to the project resource in the path.
                     */
                    list: (input: Schemas.ListSharedLineAssignmentsInput, options?: RequestOptions) => invokers.data<Schemas.ListSharedLineAssignmentsInput, Schemas.ListSharedLineAssignmentsOutput>(
                        "listSharedLineAssignments",
                        Sdk.listSharedLineAssignments,
                        Schemas.ListSharedLineAssignmentsOutputSchemas,
                        input,
                        options,
                    ),
                    /**
                     * Release shared line assignment
                     *
                     * Releases a shared line assignment, freeing both its seat and its handle for reassignment. The row is retained for audit and returned with releasedAt set, so repeating the call is safe. Requires the platforms:write permission bound to the project resource in the path.
                     */
                    release: (input: Schemas.ReleaseSharedLineAssignmentInput, options?: RequestOptions) => invokers.data<Schemas.ReleaseSharedLineAssignmentInput, Schemas.ReleaseSharedLineAssignmentOutput>(
                        "releaseSharedLineAssignment",
                        Sdk.releaseSharedLineAssignment,
                        Schemas.ReleaseSharedLineAssignmentOutputSchemas,
                        input,
                        options,
                    ),
                },
            },
            /**
             * Assign or replace SMS line campaign
             *
             * Attach a ready campaign from this project’s organization to its line. Requires platforms:write for the project; human and machine actors retain their authenticated identity. Requires a permanent Idempotency-Key and the current assignment version. Provider provisioning runs asynchronously.
             */
            assignSmsLineCampaign: (input: Schemas.AssignSmsLineCampaignInput, options?: RequestOptions) => invokers.data<Schemas.AssignSmsLineCampaignInput, Schemas.AssignSmsLineCampaignOutput>(
                "assignSmsLineCampaign",
                Sdk.assignSmsLineCampaign,
                Schemas.AssignSmsLineCampaignOutputSchemas,
                input,
                options,
            ),
            /**
             * Assign Voice line profile
             *
             * Assigns or replaces a line's explicit additional-profile override when the resource version matches. The current default cannot be assigned explicitly. The pstn_voice ability remains the admission source of truth. Requires platforms:write bound to the path project.
             */
            assignVoiceLineProfile: (input: Schemas.AssignVoiceLineProfileInput, options?: RequestOptions) => invokers.data<Schemas.AssignVoiceLineProfileInput, Schemas.AssignVoiceLineProfileOutput>(
                "assignVoiceLineProfile",
                Sdk.assignVoiceLineProfile,
                Schemas.AssignVoiceLineProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Batch update Voice line assignments
             *
             * Atomically sets additional-profile overrides or switches lines back to the project default for up to 100 Voice-capable lines. A null profileId means use the default. Every expected resource version must match or no line changes. Requires platforms:write bound to the path project.
             */
            batchUpdateVoiceLineProfileAssignments: (input: Schemas.BatchUpdateVoiceLineProfileAssignmentsInput, options?: RequestOptions) => invokers.data<Schemas.BatchUpdateVoiceLineProfileAssignmentsInput, Schemas.BatchUpdateVoiceLineProfileAssignmentsOutput>(
                "batchUpdateVoiceLineProfileAssignments",
                Sdk.batchUpdateVoiceLineProfileAssignments,
                Schemas.BatchUpdateVoiceLineProfileAssignmentsOutputSchemas,
                input,
                options,
            ),
            /**
             * Cancel operation
             *
             * Withdraws a provision that has not been fulfilled yet. This is an operations action rather than a DELETE, because there is nothing to delete: no resource exists until the work commits. Whether it is accepted depends on the resource type — a dedicated iMessage line may sit waiting on inventory for hours and withdrawing costs nothing, while an SMS number is cancellable during inventory waiting and answers 409 once the workflow commits to its first provider order. Campaign assignment and detachment operations cannot be cancelled in any state. Wait for completion before requesting another change; that new change is not a guaranteed rollback. The output-only `cancellable` field is a snapshot; the cancellation transaction always checks the current phase under a row lock. A cancel that loses the race against the work finishing also answers 409: the resource exists and is billed for, so what you want then is to release it. Nothing is charged for a cancelled provision — billing runs after the work, so there is never anything to refund. Requires the platforms:write permission bound to the project resource in the path.
             */
            cancelOperation: (input: Schemas.CancelOperationInput, options?: RequestOptions) => invokers.data<Schemas.CancelOperationInput, Schemas.CancelOperationOutput>(
                "cancelOperation",
                Sdk.cancelOperation,
                Schemas.CancelOperationOutputSchemas,
                input,
                options,
            ),
            /**
             * Configure Voice outbound credential
             *
             * Configures a SIP credential for outbound calls from a profile when the shared profile version matches. Outbound calls are paid usage, so the organization needs a payment method and no invoices overdue 7 days or more; otherwise this returns 402 ENTITLEMENT_REQUIRED with a reason. authentication.algorithm is required: SHA-256 is recommended, while MD5 is a weaker legacy option supported over UDP, TCP, and TLS; TLS is strongly recommended because UDP and TCP do not encrypt SIP signaling. The profileId may identify the default or an additional profile. The new password is returned once and is never recoverable. Requires platforms:write bound to the path project.
             */
            configureVoiceProfileOutbound: (input: Schemas.ConfigureVoiceProfileOutboundInput, options?: RequestOptions) => invokers.data<Schemas.ConfigureVoiceProfileOutboundInput, Schemas.ConfigureVoiceProfileOutboundOutput>(
                "configureVoiceProfileOutbound",
                Sdk.configureVoiceProfileOutbound,
                Schemas.ConfigureVoiceProfileOutboundOutputSchemas,
                input,
                options,
            ),
            /**
             * Connect email domain
             *
             * Reserves a normalized DNS domain and starts its durable email-provider setup. The accepted provision consumes one email-domain entitlement slot until it fails, is cancelled, or becomes a live resource; the plan's email.max_email_domains value sets the project limit. The customer resource does not exist until provider identity and DNS setup reach READY; poll the returned operation for progress. A domain may have only one unfinished provision or live resource globally. Email domains have no additional per-domain charge. The Idempotency-Key is required and permanent: replaying the same key and canonical domain returns the original operation forever. Requires the platforms:write permission bound to the project resource in the path.
             */
            connectEmailDomain: (input: Schemas.ConnectEmailDomainInput, options?: RequestOptions) => invokers.data<Schemas.ConnectEmailDomainInput, Schemas.ConnectEmailDomainOutput>(
                "connectEmailDomain",
                Sdk.connectEmailDomain,
                Schemas.ConnectEmailDomainOutputSchemas,
                input,
                options,
            ),
            /**
             * Connect Telegram bot
             *
             * Starts a free managed Telegram bot connection. Each project may have one unfinished Telegram provision, including user interaction and failure cleanup. A different Idempotency-Key while one is active returns 409 TELEGRAM_PROVISION_IN_PROGRESS with its operationId and operationUrl; resume it, cancel it while cancellation is available, or wait for it to finish. Rejected keys remain reusable. Open detail.setupUrl to connect an existing managed bot or create a new one with the project's default agent name or a custom display name, then poll Location. The link remains usable while the operation is active and never expires. Replaying the same Idempotency-Key returns the original operation, even after completion or while a newer setup is active. POST, GET and list share the same operation details. The API includes detail.setupUrl only for callers with platforms:write for the project; read-only callers receive the other details unchanged.
             */
            connectTelegramBot: (input: Schemas.ConnectTelegramBotInput, options?: RequestOptions) => invokers.data<Schemas.ConnectTelegramBotInput, Schemas.ConnectTelegramBotOutput>(
                "connectTelegramBot",
                Sdk.connectTelegramBot,
                Schemas.ConnectTelegramBotOutputSchemas,
                input,
                options,
            ),
            /**
             * Connect WhatsApp Business
             *
             * Exchanges the authorization code Embedded Signup returned and connects exactly the selected phone number as one `whatsapp_sender`. Send the WABA id and phone-number id emitted by the same popup attempt; both are treated as selectors and verified against Meta before use. A selected number that matches a non-retired, same-project `voip_line` is linked to it; a number absent from Photon inventory stays unbound; a matching non-retired `cosmos_line`, foreign VoIP line or unassigned VoIP line fails the operation before registration. Connecting is free — no plan requirement — but Billing must report the project's organization as ready with a payment method on file. The Idempotency-Key is required and permanent: replaying the same key returns the original operation forever. Requires the platforms:write permission bound to the project resource in the path.
             */
            connectWhatsappBusiness: (input: Schemas.ConnectWhatsappBusinessInput, options?: RequestOptions) => invokers.data<Schemas.ConnectWhatsappBusinessInput, Schemas.ConnectWhatsappBusinessOutput>(
                "connectWhatsappBusiness",
                Sdk.connectWhatsappBusiness,
                Schemas.ConnectWhatsappBusinessOutputSchemas,
                input,
                options,
            ),
            /**
             * Count filtered verification codes
             *
             * Counts the verification codes Photon kept from this project's dedicated lines and numbers, optionally for one `platform`. Without `receivedAfter` and `receivedBefore` the window is the 30 days before the request; a window longer than 366 days is rejected. The response echoes the window it resolved, so the number always says which period it covers. Requires the platforms:read permission bound to the project resource in the path.
             */
            countFilteredVerificationCodes: (input: Schemas.CountFilteredVerificationCodesInput, options?: RequestOptions) => invokers.data<Schemas.CountFilteredVerificationCodesInput, Schemas.CountFilteredVerificationCodesOutput>(
                "countFilteredVerificationCodes",
                Sdk.countFilteredVerificationCodes,
                Schemas.CountFilteredVerificationCodesOutputSchemas,
                input,
                options,
            ),
            /**
             * Count a line's filtered verification codes
             *
             * Counts the verification codes Photon kept from one dedicated line or number. Without `receivedAfter` and `receivedBefore` the window is the 30 days before the request; a window longer than 366 days is rejected. The response echoes the window it resolved, so the number always says which period it covers. Answers 404 unless the project holds the resource now. Codes from an earlier tenure stay in the project-wide list. Filter by `platform` — a number receives both SMS and WhatsApp. Requires the platforms:read permission bound to the project resource in the path.
             */
            countResourceFilteredVerificationCodes: (input: Schemas.CountResourceFilteredVerificationCodesInput, options?: RequestOptions) => invokers.data<Schemas.CountResourceFilteredVerificationCodesInput, Schemas.CountResourceFilteredVerificationCodesOutput>(
                "countResourceFilteredVerificationCodes",
                Sdk.countResourceFilteredVerificationCodes,
                Schemas.CountResourceFilteredVerificationCodesOutputSchemas,
                input,
                options,
            ),
            /**
             * Create default Voice profile
             *
             * Creates the project default Voice profile when absent. An identical replay returns the existing default without changing its version; a different existing default conflicts. Direction configuration is managed separately. Requires platforms:write bound to the path project.
             */
            createDefaultVoiceProfile: (input: Schemas.CreateDefaultVoiceProfileInput, options?: RequestOptions) => invokers.data<Schemas.CreateDefaultVoiceProfileInput, Schemas.CreateDefaultVoiceProfileOutput>(
                "createDefaultVoiceProfile",
                Sdk.createDefaultVoiceProfile,
                Schemas.CreateDefaultVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Create Voice profile
             *
             * Creates a direction-neutral additional Voice profile. The project default must already exist. Requires platforms:write bound to the path project.
             */
            createVoiceProfile: (input: Schemas.CreateVoiceProfileInput, options?: RequestOptions) => invokers.data<Schemas.CreateVoiceProfileInput, Schemas.CreateVoiceProfileOutput>(
                "createVoiceProfile",
                Sdk.createVoiceProfile,
                Schemas.CreateVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Create WhatsApp shared line assignment
             *
             * Maps an end user's phone number onto one of the project's pooled shared WhatsApp lines, consuming a seat from the project's WhatsApp entitlement. The assigned number is allocated by the server. When an email address is supplied the user is sent an invite asynchronously; the response never reports whether that succeeded. Requires the platforms:write permission bound to the project resource in the path.
             */
            createWhatsappSharedLineAssignment: (input: Schemas.CreateWhatsappSharedLineAssignmentInput, options?: RequestOptions) => invokers.data<Schemas.CreateWhatsappSharedLineAssignmentInput, Schemas.CreateWhatsappSharedLineAssignmentOutput>(
                "createWhatsappSharedLineAssignment",
                Sdk.createWhatsappSharedLineAssignment,
                Schemas.CreateWhatsappSharedLineAssignmentOutputSchemas,
                input,
                options,
            ),
            /**
             * Create WhatsApp VoIP sender
             *
             * Registers an active, SMS-capable Photon VoIP line on this project's connected WhatsApp Business Account. The account is resolved server-side; callers never select a WABA. The platform creates or reuses the Meta number, requests and consumes the SMS ownership code internally, verifies it, and registers the sender. displayName is optional; when omitted the project agent profile name is snapshotted before acceptance. The VoIP line remains a separate resource and never receives the whatsapp_business ability.
             */
            createWhatsappVoipSender: (input: Schemas.CreateWhatsappVoipSenderInput, options?: RequestOptions) => invokers.data<Schemas.CreateWhatsappVoipSenderInput, Schemas.CreateWhatsappVoipSenderOutput>(
                "createWhatsappVoipSender",
                Sdk.createWhatsappVoipSender,
                Schemas.CreateWhatsappVoipSenderOutputSchemas,
                input,
                options,
            ),
            /**
             * Delete Voice profile
             *
             * Deletes an additional profile when expectedVersion matches. Assigned profiles require force=true, which atomically removes every stored override so affected lines follow the default. The default can never be deleted. Requires platforms:write bound to the path project.
             */
            deleteVoiceProfile: (input: Schemas.DeleteVoiceProfileInput, options?: RequestOptions) => invokers.data<Schemas.DeleteVoiceProfileInput, Schemas.DeleteVoiceProfileOutput>(
                "deleteVoiceProfile",
                Sdk.deleteVoiceProfile,
                Schemas.DeleteVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Delete Voice inbound configuration
             *
             * Removes a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. The profile and its line assignments remain. Requires platforms:write bound to the path project.
             */
            deleteVoiceProfileInbound: (input: Schemas.DeleteVoiceProfileInboundInput, options?: RequestOptions) => invokers.data<Schemas.DeleteVoiceProfileInboundInput, Schemas.DeleteVoiceProfileInboundOutput>(
                "deleteVoiceProfileInbound",
                Sdk.deleteVoiceProfileInbound,
                Schemas.DeleteVoiceProfileInboundOutputSchemas,
                input,
                options,
            ),
            /**
             * Revoke Voice outbound credential
             *
             * Revokes outbound calling for a profile when the shared profile version matches. The profileId may identify the default or an additional profile. The profile, inbound destination, and line assignments remain. Requires platforms:write bound to the path project.
             */
            deleteVoiceProfileOutbound: (input: Schemas.DeleteVoiceProfileOutboundInput, options?: RequestOptions) => invokers.data<Schemas.DeleteVoiceProfileOutboundInput, Schemas.DeleteVoiceProfileOutboundOutput>(
                "deleteVoiceProfileOutbound",
                Sdk.deleteVoiceProfileOutbound,
                Schemas.DeleteVoiceProfileOutboundOutputSchemas,
                input,
                options,
            ),
            /**
             * Disconnect WhatsApp Business account
             *
             * Disconnects every attached WhatsApp sender, then unsubscribes our app and removes the project's business account connection. Photon VoIP lines and the numbers in Meta remain. Requires Idempotency-Key. Poll the returned operation; provider refusals appear as operation failures and retain the account for retry with a new key. New signups are blocked while disconnecting, and existing provisions must finish before this request can be accepted.
             */
            disconnectWhatsappBusinessAccount: (input: Schemas.DisconnectWhatsappBusinessAccountInput, options?: RequestOptions) => invokers.data<Schemas.DisconnectWhatsappBusinessAccountInput, Schemas.DisconnectWhatsappBusinessAccountOutput>(
                "disconnectWhatsappBusinessAccount",
                Sdk.disconnectWhatsappBusinessAccount,
                Schemas.DisconnectWhatsappBusinessAccountOutputSchemas,
                input,
                options,
            ),
            /**
             * Get default Voice profile
             *
             * Gets the profile currently selected as the project default, including its optional inbound delivery state. Requires platforms:read bound to the path project.
             */
            getDefaultVoiceProfile: (input: Schemas.GetDefaultVoiceProfileInput, options?: RequestOptions) => invokers.data<Schemas.GetDefaultVoiceProfileInput, Schemas.GetDefaultVoiceProfileOutput>(
                "getDefaultVoiceProfile",
                Sdk.getDefaultVoiceProfile,
                Schemas.GetDefaultVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Get project iMessage platform
             *
             * Reports whether the project is on shared or dedicated iMessage lines, derived from its billing entitlements. Shared mode carries the seat cap. Both say whether a dedicated line requested now would be assigned without waiting. Requires the platforms:read permission bound to the project resource in the path.
             */
            getImessage: (input: Schemas.GetProjectImessagePlatformInput, options?: RequestOptions) => invokers.data<Schemas.GetProjectImessagePlatformInput, Schemas.GetProjectImessagePlatformOutput>(
                "getProjectImessagePlatform",
                Sdk.getProjectImessagePlatform,
                Schemas.GetProjectImessagePlatformOutputSchemas,
                input,
                options,
            ),
            /**
             * Get operation
             *
             * Reads one operation using the same operation representation as creation and list. The API includes detail.setupUrl only with platforms:write for this project. This is the polling endpoint every asynchronous request here points its Location at, and it resolves from the moment that request is accepted — an operation is committed before its work is dispatched, so there is no window in which the URL 404s. Poll until `state` is one of `succeeded`, `failed` or `cancelled`, pacing from the Retry-After the accepting response returned. While an email domain waits for DNS, `detail` always contains the manual records and may additionally contain `automaticSetup` with a signed provider URL to open separately. Once the operation has produced a resource, the response carries that resource too, so the poll that finishes is also the one that tells you what you got. `succeeded` means the work is done; billing runs behind it and is not something the caller waits on. Operations are never purged, so a 404 means the id was never this project's. Requires the platforms:read permission bound to the project resource in the path.
             */
            getOperation: (input: Schemas.GetOperationInput, options?: RequestOptions) => invokers.data<Schemas.GetOperationInput, Schemas.GetOperationOutput>(
                "getOperation",
                Sdk.getOperation,
                Schemas.GetOperationOutputSchemas,
                input,
                options,
            ),
            /**
             * Get project WhatsApp platform
             *
             * Reports whether the project is on shared or dedicated WhatsApp lines, derived from its billing entitlements. Shared mode carries the seat cap. Both say whether a dedicated line requested now would be assigned without waiting. Requires the platforms:read permission bound to the project resource in the path.
             */
            getProjectWhatsappPlatform: (input: Schemas.GetProjectWhatsappPlatformInput, options?: RequestOptions) => invokers.data<Schemas.GetProjectWhatsappPlatformInput, Schemas.GetProjectWhatsappPlatformOutput>(
                "getProjectWhatsappPlatform",
                Sdk.getProjectWhatsappPlatform,
                Schemas.GetProjectWhatsappPlatformOutputSchemas,
                input,
                options,
            ),
            /**
             * Get resource
             *
             * Reads one resource the project holds. A released number stays readable and reads `retired`, because it remains part of this project's history. A dedicated line given back does NOT: returning it to inventory is what makes it claimable by someone else, so it answers 404 and the operation that returned it is the record that this project once held it. Requires the platforms:read permission bound to the project resource in the path.
             */
            getResource: (input: Schemas.GetResourceInput, options?: RequestOptions) => invokers.data<Schemas.GetResourceInput, Schemas.GetResourceOutput>(
                "getResource",
                Sdk.getResource,
                Schemas.GetResourceOutputSchemas,
                input,
                options,
            ),
            /**
             * Get SMS line campaign assignment
             *
             * Read the last confirmed campaign and current eligibility. Follow changes through their operations. Eligibility is a control-plane assessment, not a delivery or recipient-consent guarantee.
             */
            getSmsLineCampaignAssignment: (input: Schemas.GetSmsLineCampaignAssignmentInput, options?: RequestOptions) => invokers.data<Schemas.GetSmsLineCampaignAssignmentInput, Schemas.GetSmsLineCampaignAssignmentOutput>(
                "getSmsLineCampaignAssignment",
                Sdk.getSmsLineCampaignAssignment,
                Schemas.GetSmsLineCampaignAssignmentOutputSchemas,
                input,
                options,
            ),
            /**
             * Get Voice line profile assignment
             *
             * Gets the explicit additional-profile override for an owned Voice-capable line. A line following the project default returns 200 without profileId. Requires platforms:read bound to the path project.
             */
            getVoiceLineProfileAssignment: (input: Schemas.GetVoiceLineProfileAssignmentInput, options?: RequestOptions) => invokers.data<Schemas.GetVoiceLineProfileAssignmentInput, Schemas.GetVoiceLineProfileAssignmentOutput>(
                "getVoiceLineProfileAssignment",
                Sdk.getVoiceLineProfileAssignment,
                Schemas.GetVoiceLineProfileAssignmentOutputSchemas,
                input,
                options,
            ),
            /**
             * Get Voice profile
             *
             * Gets one reusable Voice profile, including its optional inbound delivery state. Requires platforms:read bound to the path project.
             */
            getVoiceProfile: (input: Schemas.GetVoiceProfileInput, options?: RequestOptions) => invokers.data<Schemas.GetVoiceProfileInput, Schemas.GetVoiceProfileOutput>(
                "getVoiceProfile",
                Sdk.getVoiceProfile,
                Schemas.GetVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Get WhatsApp Business account
             *
             * Gets the one WhatsApp Business Account this project has connected, with its number of live senders. Senders are resources and are listed by GET /platforms/resources?ability=whatsapp_business. The account is not a resource and carries no access token. Meta's retained numbers are listed separately by GET /platforms/whatsapp-business/account/phone-numbers. `subscribedAt` is absent until our app is attached to the account's webhooks. Requires the platforms:read permission bound to the project resource in the path.
             */
            getWhatsappBusinessAccount: (input: Schemas.GetWhatsappBusinessAccountInput, options?: RequestOptions) => invokers.data<Schemas.GetWhatsappBusinessAccountInput, Schemas.GetWhatsappBusinessAccountOutput>(
                "getWhatsappBusinessAccount",
                Sdk.getWhatsappBusinessAccount,
                Schemas.GetWhatsappBusinessAccountOutputSchemas,
                input,
                options,
            ),
            /**
             * Get WhatsApp Business verification code
             *
             * Returns the latest six-digit WhatsApp Business ownership code received by SMS for an active Photon VOIP number, but only when its provider timestamp is strictly newer than the required receivedAfter boundary. receivedAfter must be an RFC 3339 timestamp between this request's arrival time and two minutes before it; once it expires, restart Meta's verification flow with a new boundary. A missing newer code is a retryable 404 with Retry-After: 2. Poll after 2, 4, 8, then 10 seconds, applying ±20% jitter and capping later intervals at 10 seconds. Stop when the original boundary is two minutes old. Responses are never cached. Requires the platforms:write permission bound to the project resource in the path.
             */
            getWhatsappBusinessVerificationCode: (input: Schemas.GetWhatsappBusinessVerificationCodeInput, options?: RequestOptions) => invokers.data<Schemas.GetWhatsappBusinessVerificationCodeInput, Schemas.GetWhatsappBusinessVerificationCodeOutput>(
                "getWhatsappBusinessVerificationCode",
                Sdk.getWhatsappBusinessVerificationCode,
                Schemas.GetWhatsappBusinessVerificationCodeOutputSchemas,
                input,
                options,
            ),
            /**
             * Get WhatsApp shared line assignment
             *
             * Reads one WhatsApp shared line assignment. Requires the platforms:read permission bound to the project resource in the path.
             */
            getWhatsappSharedLineAssignment: (input: Schemas.GetWhatsappSharedLineAssignmentInput, options?: RequestOptions) => invokers.data<Schemas.GetWhatsappSharedLineAssignmentInput, Schemas.GetWhatsappSharedLineAssignmentOutput>(
                "getWhatsappSharedLineAssignment",
                Sdk.getWhatsappSharedLineAssignment,
                Schemas.GetWhatsappSharedLineAssignmentOutputSchemas,
                input,
                options,
            ),
            /**
             * Get WhatsApp signup config
             *
             * Returns what the browser needs to open Meta's Embedded Signup popup: the Facebook Login for Business configuration id, the Graph version to run against, and the scopes it will request. Answered in-process rather than forwarded, so the first step of onboarding survives an outage of the private service. Pass `configId` to `FB.login` as `config_id` with `response_type: 'code'` and `override_default_response_type: true`. Do NOT add a `featureType` — omitting it is what keeps the phone-number screen in the flow, and `only_waba_sharing` produces an account with no number that cannot be provisioned. Requires the platforms:read permission bound to the project resource in the path.
             */
            getWhatsappSignupConfig: (input: Schemas.GetWhatsappSignupConfigInput, options?: RequestOptions) => invokers.data<Schemas.GetWhatsappSignupConfigInput, Schemas.GetWhatsappSignupConfigOutput>(
                "getWhatsappSignupConfig",
                Sdk.getWhatsappSignupConfig,
                Schemas.GetWhatsappSignupConfigOutputSchemas,
                input,
                options,
            ),
            /**
             * List filtered verification codes
             *
             * Lists the verification codes Photon kept from this project's dedicated lines and numbers. Inbound messages that carry a one-time code are filtered before delivery; this is the record that they arrived, so a quiet line can be told apart from a broken one. It records the receiving line, its platform and when the code arrived — never the code itself. Each entry names the dedicated line or number (`resourceId`) that received it. Newest first, within an optional inclusive `receivedAfter`/`receivedBefore` window. A page may hold fewer than `pageSize` entries and still return a `nextPageToken`; only its absence means the end. Filter by `platform`; to read one line, use its own filtered-otp path. Requires the platforms:read permission bound to the project resource in the path.
             */
            listFilteredVerificationCodes: (input: Schemas.ListFilteredVerificationCodesInput, options?: RequestOptions) => invokers.data<Schemas.ListFilteredVerificationCodesInput, Schemas.ListFilteredVerificationCodesOutput>(
                "listFilteredVerificationCodes",
                Sdk.listFilteredVerificationCodes,
                Schemas.ListFilteredVerificationCodesOutputSchemas,
                input,
                options,
            ),
            /**
             * List number area codes
             *
             * Lists current provider coverage for US local numbers, sorted and deduplicated. Coverage does not guarantee inventory carrying every required feature. New area-specific purchases must use a listed code; accepted purchases keep waiting if coverage later changes. Requires platforms:read for the path project.
             */
            listNumberAreaCodes: (input: Schemas.ListNumberAreaCodesInput, options?: RequestOptions) => invokers.data<Schemas.ListNumberAreaCodesInput, Schemas.ListNumberAreaCodesOutput>(
                "listNumberAreaCodes",
                Sdk.listNumberAreaCodes,
                Schemas.ListNumberAreaCodesOutputSchemas,
                input,
                options,
            ),
            /**
             * List number countries
             *
             * Lists supported purchase countries independently of current provider inventory. Requires platforms:read for the path project.
             */
            listNumberCountries: (input: Schemas.ListNumberCountriesInput, options?: RequestOptions) => invokers.data<Schemas.ListNumberCountriesInput, Schemas.ListNumberCountriesOutput>(
                "listNumberCountries",
                Sdk.listNumberCountries,
                Schemas.ListNumberCountriesOutputSchemas,
                input,
                options,
            ),
            /**
             * List operations
             *
             * Lists the project's operations using the same operation representation as creation and GET. The API includes detail.setupUrl only with platforms:write for this project. Results are oldest first — every provision and release it has ever asked for, including the ones still running. This is the entire in-flight view: a resource only appears once it is real, so nothing half-built shows up in the resource list and nothing in flight is missing from this one. Filter by `resourceId` to get one resource's whole history, which for a pooled line is every tenure this project has had on it. `state` is comma-separated; `type` accepts one operation type and an absent filter means everything, including failed and cancelled operations. `endedAfter` keeps only operations that finished after that instant, so what failed or was withdrawn recently is one short page. Requires the platforms:read permission bound to the project resource in the path.
             */
            listOperations: (input: Schemas.ListOperationsInput, options?: RequestOptions) => invokers.data<Schemas.ListOperationsInput, Schemas.ListOperationsOutput>(
                "listOperations",
                Sdk.listOperations,
                Schemas.ListOperationsOutputSchemas,
                input,
                options,
            ),
            /**
             * List project platforms
             *
             * Lists the platform types available to this project. Every project currently sees the same fixed public contract, answered in-process rather than forwarded, so the list survives an outage of the private service. The project binding exists so that answer can narrow per project without moving the route. Requires the platforms:read permission bound to the project resource in the path.
             */
            listProjectPlatforms: (input: Schemas.ListProjectPlatformsInput, options?: RequestOptions) => invokers.data<Schemas.ListProjectPlatformsInput, Schemas.ListProjectPlatformsOutput>(
                "listProjectPlatforms",
                Sdk.listProjectPlatforms,
                Schemas.ListProjectPlatformsOutputSchemas,
                input,
                options,
            ),
            /**
             * List a line's filtered verification codes
             *
             * Lists the verification codes Photon kept from one dedicated line or number. Inbound messages that carry a one-time code are filtered before delivery; this is the record that they arrived, so a quiet line can be told apart from a broken one. It records the receiving line, its platform and when the code arrived — never the code itself. Each entry names the dedicated line or number (`resourceId`) that received it. Newest first, within an optional inclusive `receivedAfter`/`receivedBefore` window. A page may hold fewer than `pageSize` entries and still return a `nextPageToken`; only its absence means the end. Answers 404 unless the project holds the resource now. Codes from an earlier tenure stay in the project-wide list. Filter by `platform` — a number receives both SMS and WhatsApp. Requires the platforms:read permission bound to the project resource in the path.
             */
            listResourceFilteredVerificationCodes: (input: Schemas.ListResourceFilteredVerificationCodesInput, options?: RequestOptions) => invokers.data<Schemas.ListResourceFilteredVerificationCodesInput, Schemas.ListResourceFilteredVerificationCodesOutput>(
                "listResourceFilteredVerificationCodes",
                Sdk.listResourceFilteredVerificationCodes,
                Schemas.ListResourceFilteredVerificationCodesOutputSchemas,
                input,
                options,
            ),
            /**
             * List resources
             *
             * Lists everything the project holds, oldest first, whatever kind of thing it is — one endpoint and one id shape for numbers, dedicated lines and whatever ships next. Nothing half-built appears here: a resource exists only once it is real, so anything still being provisioned is an operation rather than a resource with a pending flag. Filter by `type`, by `ability` (which matches only abilities that are currently enabled), and by `state` — comma-separated, and absent means every state, including retired ones. `detail` carries a per-type public view: an SMS number's number, a dedicated line's number and its per-capability health (`imessageHealth`, `whatsappHealth`, each with an `overallStatus` of `available`, `degraded`, `unavailable` or `unknown`; `imessageHealth` also carries `account`, `photonSystemComponents`, `newConversations`, `sms` and `mms`, each a `status` with the `cause` that decided it: `account`, `photonSystemComponents`, or null for the item's own state). Requires the platforms:read permission bound to the project resource in the path.
             */
            listResources: (input: Schemas.ListResourcesInput, options?: RequestOptions) => invokers.data<Schemas.ListResourcesInput, Schemas.ListResourcesOutput>(
                "listResources",
                Sdk.listResources,
                Schemas.ListResourcesOutputSchemas,
                input,
                options,
            ),
            /**
             * List Voice profiles
             *
             * Lists reusable Voice profiles in this project. Requires platforms:read bound to the path project.
             */
            listVoiceProfiles: (input: Schemas.ListVoiceProfilesInput, options?: RequestOptions) => invokers.data<Schemas.ListVoiceProfilesInput, Schemas.ListVoiceProfilesOutput>(
                "listVoiceProfiles",
                Sdk.listVoiceProfiles,
                Schemas.ListVoiceProfilesOutputSchemas,
                input,
                options,
            ),
            /**
             * List WhatsApp account phone numbers
             *
             * Lists the connected WABA's phone numbers directly from Meta, including numbers whose Photon sender was disconnected. Ownership is photon for a number in this project's current Photon inventory and meta otherwise. Match a Photon SMS number by its E.164 phoneNumber and reuse its existing displayName when reconnecting. A null name is unavailable, not permission to choose a new name. A failed lookup returns an error rather than an empty list. Requires platforms:read on the path project.
             */
            listWhatsappAccountPhoneNumbers: (input: Schemas.ListWhatsappAccountPhoneNumbersInput, options?: RequestOptions) => invokers.data<Schemas.ListWhatsappAccountPhoneNumbersInput, Schemas.ListWhatsappAccountPhoneNumbersOutput>(
                "listWhatsappAccountPhoneNumbers",
                Sdk.listWhatsappAccountPhoneNumbers,
                Schemas.ListWhatsappAccountPhoneNumbersOutputSchemas,
                input,
                options,
            ),
            /**
             * List WhatsApp shared line assignments
             *
             * Lists the project's WhatsApp shared line assignments, oldest first. Released assignments are excluded unless includeReleased is set. Requires the platforms:read permission bound to the project resource in the path.
             */
            listWhatsappSharedLineAssignments: (input: Schemas.ListWhatsappSharedLineAssignmentsInput, options?: RequestOptions) => invokers.data<Schemas.ListWhatsappSharedLineAssignmentsInput, Schemas.ListWhatsappSharedLineAssignmentsOutput>(
                "listWhatsappSharedLineAssignments",
                Sdk.listWhatsappSharedLineAssignments,
                Schemas.ListWhatsappSharedLineAssignmentsOutputSchemas,
                input,
                options,
            ),
            /**
             * Provision dedicated iMessage line
             *
             * Claims one dedicated iMessage line for the project and enables iMessage on it. Always answers 202 with an operation: dedicated lines are allocated from available capacity, and unavailable capacity causes a wait rather than a failure — this can legitimately stay `running` for hours, which is exactly why the response is a handle to poll rather than a number. The project's messaging subscription must grant the dedicated iMessage lines entitlement (`imessage_dedicated_lines.can_purchase`), and that is checked before capacity is reserved. The line's own charge starts when a line is claimed; the subscription that grants the entitlement bills on its own terms, which cancelling a request does not change. Waiting requests are served first come, first served. One that is still waiting is cancelled with a `reason` if the project is deleted (`project_deleted`) or its plan stops selling dedicated lines (`entitlement_lost`); while the payer is restricted for overdue payment it keeps waiting. If you no longer want to wait, POST to the operation's cancel endpoint, which charges nothing for the line. The Idempotency-Key is required and permanent: repeating it returns the same operation forever. A further line always needs a NEW key, including while others are still waiting. Requires the platforms:write permission bound to the project resource in the path.
             */
            provisionImessageDedicatedLine: (input: Schemas.ProvisionImessageDedicatedLineInput, options?: RequestOptions) => invokers.data<Schemas.ProvisionImessageDedicatedLineInput, Schemas.ProvisionImessageDedicatedLineOutput>(
                "provisionImessageDedicatedLine",
                Sdk.provisionImessageDedicatedLine,
                Schemas.ProvisionImessageDedicatedLineOutputSchemas,
                input,
                options,
            ),
            /**
             * Provision dedicated WhatsApp line
             *
             * Provisions one dedicated WhatsApp line with WhatsApp and shared Voice enabled. It attaches to an eligible iMessage line the project already owns when possible so both products keep the same number; otherwise it claims healthy, available WhatsApp-capable dedicated-line inventory. Always answers 202, because waiting when no inventory is available is not a failure. The product opens its own charge period after the abilities are enabled; Voice has no separate charge. Waiting requests are served first come, first served, and are cancelled with a `reason` exactly as for a dedicated iMessage line. Cancel the returned operation to stop waiting. The Idempotency-Key is required and permanent.
             */
            provisionWhatsappDedicatedLine: (input: Schemas.ProvisionWhatsappDedicatedLineInput, options?: RequestOptions) => invokers.data<Schemas.ProvisionWhatsappDedicatedLineInput, Schemas.ProvisionWhatsappDedicatedLineOutput>(
                "provisionWhatsappDedicatedLine",
                Sdk.provisionWhatsappDedicatedLine,
                Schemas.ProvisionWhatsappDedicatedLineOutputSchemas,
                input,
                options,
            ),
            /**
             * Purchase SMS number
             *
             * Buys one US local number from the provider and records it as a resource with SMS enabled. Requires countryCode (US) and accepts an optional three-digit geographic areaCode. The server selects an exact matching number. Empty inventory keeps the operation running until a number is available or the caller cancels before ordering begins. Always answers 202 with an operation: the work runs behind the response, and the Location points at the operation to poll. New area-specific requests must appear in current provider coverage; discover it with GET /sms/numbers/area-codes?countryCode=US. Coverage and subscription checks run before operation creation. Billing follows delivery. Replays return the original operation without checking current coverage. The Idempotency-Key is required and permanent: repeating it returns the same operation forever, never a second number. A further number always needs a NEW key, including while others are still running. Requires the platforms:write permission bound to the project resource in the path.
             */
            purchaseSmsNumber: (input: Schemas.PurchaseSmsNumberInput, options?: RequestOptions) => invokers.data<Schemas.PurchaseSmsNumberInput, Schemas.PurchaseSmsNumberOutput>(
                "purchaseSmsNumber",
                Sdk.purchaseSmsNumber,
                Schemas.PurchaseSmsNumberOutputSchemas,
                input,
                options,
            ),
            /**
             * Release dedicated iMessage line
             *
             * Removes only iMessage from one dedicated line. Shared Voice is removed only when WhatsApp is absent; if WhatsApp remains, Voice, the resource, ownership, and phone number are preserved. Usually finishes inside this request and answers 200; a slow workflow answers 202 with an operation to poll. Takes no Idempotency-Key because the open iMessage charge period identifies this product tenure.
             */
            releaseImessageDedicatedLine: (input: Schemas.ReleaseImessageDedicatedLineInput, options?: RequestOptions) => invokers.data<Schemas.ReleaseImessageDedicatedLineInput, Schemas.ReleaseImessageDedicatedLineOutput>(
                "releaseImessageDedicatedLine",
                Sdk.releaseImessageDedicatedLine,
                Schemas.ReleaseImessageDedicatedLineOutputSchemas,
                input,
                options,
            ),
            /**
             * Release resource
             *
             * Gives one resource back, whatever it is. What that means is the resource's own business: an SMS number goes back to the provider and is retired, a dedicated iMessage line goes back to the shared pool and stays in existence for someone else to claim. Either way the provider is contacted first where there is one, then a single transaction disables every ability, ends the project's hold and closes the charge period — so a provider that refuses leaves the resource exactly as it was, still owned and still billed. Usually finishes inside this request and answers 200; if the provider is slow it answers 202 and the Location points at the operation to poll. The decrement runs behind the answer either way, so the resource is gone when you are told it is. Takes no Idempotency-Key — releasing the same resource twice is the same request. Releasing one that is already gone answers 404. Requires the platforms:write permission bound to the project resource in the path.
             */
            releaseResource: (input: Schemas.ReleaseResourceInput, options?: RequestOptions) => invokers.data<Schemas.ReleaseResourceInput, Schemas.ReleaseResourceOutput>(
                "releaseResource",
                Sdk.releaseResource,
                Schemas.ReleaseResourceOutputSchemas,
                input,
                options,
            ),
            /**
             * Release dedicated WhatsApp line
             *
             * Removes only WhatsApp from one dedicated line. Shared Voice is removed only when iMessage is absent; if iMessage remains, Voice, the resource, ownership, and phone number are preserved. Usually finishes inside this request and answers 200; a slow workflow answers 202 with an operation to poll. Takes no Idempotency-Key because the open WhatsApp charge period identifies this product tenure.
             */
            releaseWhatsappDedicatedLine: (input: Schemas.ReleaseWhatsappDedicatedLineInput, options?: RequestOptions) => invokers.data<Schemas.ReleaseWhatsappDedicatedLineInput, Schemas.ReleaseWhatsappDedicatedLineOutput>(
                "releaseWhatsappDedicatedLine",
                Sdk.releaseWhatsappDedicatedLine,
                Schemas.ReleaseWhatsappDedicatedLineOutputSchemas,
                input,
                options,
            ),
            /**
             * Release WhatsApp shared line assignment
             *
             * Releases a WhatsApp shared line assignment, freeing its seat for reassignment. The row is retained for audit and returned with releasedAt set, so repeating the call is safe. Requires the platforms:write permission bound to the project resource in the path.
             */
            releaseWhatsappSharedLineAssignment: (input: Schemas.ReleaseWhatsappSharedLineAssignmentInput, options?: RequestOptions) => invokers.data<Schemas.ReleaseWhatsappSharedLineAssignmentInput, Schemas.ReleaseWhatsappSharedLineAssignmentOutput>(
                "releaseWhatsappSharedLineAssignment",
                Sdk.releaseWhatsappSharedLineAssignment,
                Schemas.ReleaseWhatsappSharedLineAssignmentOutputSchemas,
                input,
                options,
            ),
            /**
             * Replace Voice inbound configuration
             *
             * Creates or fully replaces a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. Credentials are required and nullable; null removes destination authentication. Requires platforms:write bound to the path project.
             */
            replaceVoiceProfileInbound: (input: Schemas.ReplaceVoiceProfileInboundInput, options?: RequestOptions) => invokers.data<Schemas.ReplaceVoiceProfileInboundInput, Schemas.ReplaceVoiceProfileInboundOutput>(
                "replaceVoiceProfileInbound",
                Sdk.replaceVoiceProfileInbound,
                Schemas.ReplaceVoiceProfileInboundOutputSchemas,
                input,
                options,
            ),
            /**
             * Rotate Voice outbound credential
             *
             * Rotates a SIP profile's outbound credential when expectedVersion matches. The profileId may identify the default or an additional profile. Normal rotation gives the previous credential one hour of grace; emergency rotation gives none. The new password is returned once and is never recoverable. Requires platforms:write bound to the path project.
             */
            rotateVoiceProfileOutboundCredential: (input: Schemas.RotateVoiceProfileOutboundCredentialInput, options?: RequestOptions) => invokers.data<Schemas.RotateVoiceProfileOutboundCredentialInput, Schemas.RotateVoiceProfileOutboundCredentialOutput>(
                "rotateVoiceProfileOutboundCredential",
                Sdk.rotateVoiceProfileOutboundCredential,
                Schemas.RotateVoiceProfileOutboundCredentialOutputSchemas,
                input,
                options,
            ),
            /**
             * Unassign SMS line campaign
             *
             * Any project writer, including a scoped API key, may detach the campaign. The number and campaign remain owned. Requires a permanent Idempotency-Key and expectedVersion. Local eligibility is blocked immediately; provider detachment runs asynchronously.
             */
            unassignSmsLineCampaign: (input: Schemas.UnassignSmsLineCampaignInput, options?: RequestOptions) => invokers.data<Schemas.UnassignSmsLineCampaignInput, Schemas.UnassignSmsLineCampaignOutput>(
                "unassignSmsLineCampaign",
                Sdk.unassignSmsLineCampaign,
                Schemas.UnassignSmsLineCampaignOutputSchemas,
                input,
                options,
            ),
            /**
             * Unassign Voice line profile
             *
             * Removes a line's explicit override when the resource version matches so the line follows the project default. Profiles and the pstn_voice ability are unchanged. Requires platforms:write bound to the path project.
             */
            unassignVoiceLineProfile: (input: Schemas.UnassignVoiceLineProfileInput, options?: RequestOptions) => invokers.data<Schemas.UnassignVoiceLineProfileInput, Schemas.UnassignVoiceLineProfileOutput>(
                "unassignVoiceLineProfile",
                Sdk.unassignVoiceLineProfile,
                Schemas.UnassignVoiceLineProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Update default Voice profile
             *
             * Patches the default profile's protocol or mediaEncryption when expectedVersion matches. Omitted fields are preserved. Its server-assigned name is immutable, and directional configuration uses the profileId returned by this resource. Requires platforms:write bound to the path project.
             */
            updateDefaultVoiceProfile: (input: Schemas.UpdateDefaultVoiceProfileInput, options?: RequestOptions) => invokers.data<Schemas.UpdateDefaultVoiceProfileInput, Schemas.UpdateDefaultVoiceProfileOutput>(
                "updateDefaultVoiceProfile",
                Sdk.updateDefaultVoiceProfile,
                Schemas.UpdateDefaultVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Update Voice profile
             *
             * Patches an additional profile's name, protocol, or mediaEncryption when expectedVersion matches. Omitted fields are preserved. Directional configuration is managed through the profile's inbound and outbound endpoints. Requires platforms:write bound to the path project.
             */
            updateVoiceProfile: (input: Schemas.UpdateVoiceProfileInput, options?: RequestOptions) => invokers.data<Schemas.UpdateVoiceProfileInput, Schemas.UpdateVoiceProfileOutput>(
                "updateVoiceProfile",
                Sdk.updateVoiceProfile,
                Schemas.UpdateVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Update Voice inbound configuration
             *
             * Updates selected fields of a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. At least one of destinationUri or credentials is required. Credential omission preserves destination authentication, null removes it, and an object replaces it atomically. Requires platforms:write bound to the path project.
             */
            updateVoiceProfileInbound: (input: Schemas.UpdateVoiceProfileInboundInput, options?: RequestOptions) => invokers.data<Schemas.UpdateVoiceProfileInboundInput, Schemas.UpdateVoiceProfileInboundOutput>(
                "updateVoiceProfileInbound",
                Sdk.updateVoiceProfileInbound,
                Schemas.UpdateVoiceProfileInboundOutputSchemas,
                input,
                options,
            ),
            /**
             * Update Voice outbound authentication
             *
             * Changes a SIP profile's outbound Digest algorithm when expectedVersion matches. The profileId may identify the default or an additional profile. This policy-only change preserves the password, username, and any previous-password grace deadline. SHA-256 is recommended; MD5 is a weaker legacy option. Returns non-secret outbound metadata and the profile version. Requires platforms:write bound to the path project.
             */
            updateVoiceProfileOutboundAuthentication: (input: Schemas.UpdateVoiceProfileOutboundAuthenticationInput, options?: RequestOptions) => invokers.data<Schemas.UpdateVoiceProfileOutboundAuthenticationInput, Schemas.UpdateVoiceProfileOutboundAuthenticationOutput>(
                "updateVoiceProfileOutboundAuthentication",
                Sdk.updateVoiceProfileOutboundAuthentication,
                Schemas.UpdateVoiceProfileOutboundAuthenticationOutputSchemas,
                input,
                options,
            ),
        },
        /**
         * Create project API key
         *
         * Creates a key bound to the selected project using the supplied name, permissions and optional expiry. The secret is returned only in this response and in idempotent replays of it; store it securely because other reads never return it. The key is scoped to this project and does not grant account-level access. Supply the required Idempotency-Key header.
         */
        createProjectApiKey: (input: Schemas.CreateProjectApiKeyInput, options?: RequestOptions) => invokers.data<Schemas.CreateProjectApiKeyInput, Schemas.CreateProjectApiKeyOutput>(
            "createProjectApiKey",
            Sdk.createProjectApiKey,
            Schemas.CreateProjectApiKeyOutputSchemas,
            input,
            options,
        ),
        /**
         * Create webhook destination
         *
         * Creates a webhook destination for the selected project using its URL, payload API version, event selection and other documented settings. The response includes the signing secret, which is returned only in this response and in idempotent replays of it, never by destination reads; store it securely for signature verification. The API version must be selectable and selected event types must belong to that version's catalog. Supply the required Idempotency-Key header.
         */
        createWebhookDestination: (input: Schemas.CreateWebhookDestinationInput, options?: RequestOptions) => invokers.data<Schemas.CreateWebhookDestinationInput, Schemas.CreateWebhookDestinationOutput>(
            "createWebhookDestination",
            Sdk.createWebhookDestination,
            Schemas.CreateWebhookDestinationOutputSchemas,
            input,
            options,
        ),
        /**
         * Delete project
         *
         * Starts deletion of the identified project using a credential authorized for project management. Inspect the documented response and use getProjectClosureStatus with the organization and project identifiers to read closure progress. A project API key is not an accepted credential for this operation.
         */
        delete: (input: Schemas.DeleteProjectInput, options?: RequestOptions) => invokers.data<Schemas.DeleteProjectInput, Schemas.DeleteProjectOutput>(
            "deleteProject",
            Sdk.deleteProject,
            Schemas.DeleteProjectOutputSchemas,
            input,
            options,
        ),
        /**
         * Delete webhook destination
         *
         * Deletes the selected project's destination and returns its stable tombstone. Repeated deletion returns the deletion representation. This operation removes the destination configuration; it is separate from disabling a destination through an update.
         */
        deleteWebhookDestination: (input: Schemas.DeleteWebhookDestinationInput, options?: RequestOptions) => invokers.data<Schemas.DeleteWebhookDestinationInput, Schemas.DeleteWebhookDestinationOutput>(
            "deleteWebhookDestination",
            Sdk.deleteWebhookDestination,
            Schemas.DeleteWebhookDestinationOutputSchemas,
            input,
            options,
        ),
        /**
         * Download attachment
         *
         * Downloads an Attachment's bytes. If unavailable after ten seconds, returns ATTACHMENT_NOT_READY with Retry-After: 5.
         */
        downloadAttachment: (input: Schemas.DownloadAttachmentInput, options?: RequestOptions) => invokers.data<Schemas.DownloadAttachmentInput, Schemas.DownloadAttachmentOutput>(
            "downloadAttachment",
            Sdk.downloadAttachment,
            Schemas.DownloadAttachmentOutputSchemas,
            input,
            options,
        ),
        /**
         * Get project
         *
         * Returns the identified project's settings for an authorized caller. The credential must be allowed to access that project; possession of an unrelated project's key does not provide access. Missing and deleted projects are reported through the documented error responses.
         */
        get: (input: Schemas.GetProjectInput, options?: RequestOptions) => invokers.data<Schemas.GetProjectInput, Schemas.GetProjectOutput>(
            "getProject",
            Sdk.getProject,
            Schemas.GetProjectOutputSchemas,
            input,
            options,
        ),
        /**
         * Get attachment
         *
         * Returns an Attachment's metadata. Use the content endpoint to download its bytes.
         */
        getAttachment: (input: Schemas.GetAttachmentInput, options?: RequestOptions) => invokers.data<Schemas.GetAttachmentInput, Schemas.GetAttachmentOutput>(
            "getAttachment",
            Sdk.getAttachment,
            Schemas.GetAttachmentOutputSchemas,
            input,
            options,
        ),
        /**
         * Get metrics backfill status
         *
         * Returns historical metrics update progress. Completion reflects lastVerifiedAt; queries remain available during updates.
         */
        getMessageMetricsBackfill: (input: Schemas.GetMessageMetricsBackfillInput, options?: RequestOptions) => invokers.data<Schemas.GetMessageMetricsBackfillInput, Schemas.GetMessageMetricsBackfillOutput>(
            "getMessageMetricsBackfill",
            Sdk.getMessageMetricsBackfill,
            Schemas.GetMessageMetricsBackfillOutputSchemas,
            input,
            options,
        ),
        /**
         * Get metrics SQL schema
         *
         * Returns the message_events and call_events SQL schema, supported queries, and limits for the selected API version.
         */
        getMessageMetricsSqlSchema: (input: Schemas.GetMessageMetricsSqlSchemaInput, options?: RequestOptions) => invokers.data<Schemas.GetMessageMetricsSqlSchemaInput, Schemas.GetMessageMetricsSqlSchemaOutput>(
            "getMessageMetricsSqlSchema",
            Sdk.getMessageMetricsSqlSchema,
            Schemas.GetMessageMetricsSqlSchemaOutputSchemas,
            input,
            options,
        ),
        /**
         * Get webhook destination
         *
         * Returns the configuration of one webhook destination belonging to the selected project. Missing or deleted destinations are reported as errors. This read does not disclose the signing secret returned when the destination or a secret rotation was created.
         */
        getWebhookDestination: (input: Schemas.GetWebhookDestinationInput, options?: RequestOptions) => invokers.data<Schemas.GetWebhookDestinationInput, Schemas.GetWebhookDestinationOutput>(
            "getWebhookDestination",
            Sdk.getWebhookDestination,
            Schemas.GetWebhookDestinationOutputSchemas,
            input,
            options,
        ),
        /**
         * Get webhook event schema
         *
         * Returns the published reader JSON Schema for eventType in the requested webhook apiVersion. Use it to interpret events for that exact payload version. The response media type is application/schema+json; an authorized conditional request may return 304 without a body. Unsupported event/version combinations are rejected.
         */
        getWebhookEventSchema: (input: Schemas.GetWebhookEventSchemaInput, options?: RequestOptions) => invokers.data<Schemas.GetWebhookEventSchemaInput, Schemas.GetWebhookEventSchemaOutput>(
            "getWebhookEventSchema",
            Sdk.getWebhookEventSchema,
            Schemas.GetWebhookEventSchemaOutputSchemas,
            input,
            options,
        ),
        /**
         * List attachments
         *
         * Lists the Project's Attachment metadata, with optional time filters.
         */
        listAttachments: (input: Schemas.ListAttachmentsInput, options?: RequestOptions) => invokers.data<Schemas.ListAttachmentsInput, Schemas.ListAttachmentsOutput>(
            "listAttachments",
            Sdk.listAttachments,
            Schemas.ListAttachmentsOutputSchemas,
            input,
            options,
        ),
        /**
         * List project API keys
         *
         * Lists the API keys on the selected project, ordered newest first. Revoked keys are not listed; expired keys stay listed until they are revoked. Entries contain key metadata and permissions, never secret values. Use the returned identifiers to manage an existing key; lost secrets cannot be recovered through this operation.
         */
        listProjectApiKeys: (input: Schemas.ListProjectApiKeysInput, options?: RequestOptions) => invokers.data<Schemas.ListProjectApiKeysInput, Schemas.ListProjectApiKeysOutput>(
            "listProjectApiKeys",
            Sdk.listProjectApiKeys,
            Schemas.ListProjectApiKeysOutputSchemas,
            input,
            options,
        ),
        /**
         * List webhook API versions
         *
         * Lists the published webhook payload API versions and their lifecycle metadata. The list is the same for every project. Use the selectable indicator when choosing a version for a destination. These payload dates are separate from SDK package versions. An authorized conditional request may return 304 without a response body.
         */
        listWebhookApiVersions: (input: Schemas.ListWebhookApiVersionsInput, options?: RequestOptions) => invokers.data<Schemas.ListWebhookApiVersionsInput, Schemas.ListWebhookApiVersionsOutput>(
            "listWebhookApiVersions",
            Sdk.listWebhookApiVersions,
            Schemas.ListWebhookApiVersionsOutputSchemas,
            input,
            options,
        ),
        /**
         * List webhook destinations
         *
         * Returns a cursor-paginated page of active webhook destinations configured for the selected project. Use pageSize and pageToken to navigate it. The listing returns destination configuration, never signing secrets.
         */
        listWebhookDestinations: (input: Schemas.ListWebhookDestinationsInput, options?: RequestOptions) => invokers.data<Schemas.ListWebhookDestinationsInput, Schemas.ListWebhookDestinationsOutput>(
            "listWebhookDestinations",
            Sdk.listWebhookDestinations,
            Schemas.ListWebhookDestinationsOutputSchemas,
            input,
            options,
        ),
        /**
         * List webhook egress addresses
         *
         * Returns the public network addresses from which this environment sends webhook deliveries. Use this information when configuring the receiving system's network allowlist. The result is environment-specific and does not describe the API service's ingress addresses.
         */
        listWebhookEgressAddresses: (input: Schemas.ListWebhookEgressAddressesInput, options?: RequestOptions) => invokers.data<Schemas.ListWebhookEgressAddressesInput, Schemas.ListWebhookEgressAddressesOutput>(
            "listWebhookEgressAddresses",
            Sdk.listWebhookEgressAddresses,
            Schemas.ListWebhookEgressAddressesOutputSchemas,
            input,
            options,
        ),
        /**
         * List webhook event types
         *
         * Lists the webhook event types available in the requested apiVersion, including their descriptions, audiences and reader-schema URLs. Use this versioned catalog when selecting a destination's enabledEvents. The response may include version-retirement information; an authorized conditional request can return 304 without a body.
         */
        listWebhookEventTypes: (input: Schemas.ListWebhookEventTypesInput, options?: RequestOptions) => invokers.data<Schemas.ListWebhookEventTypesInput, Schemas.ListWebhookEventTypesOutput>(
            "listWebhookEventTypes",
            Sdk.listWebhookEventTypes,
            Schemas.ListWebhookEventTypesOutputSchemas,
            input,
            options,
        ),
        /**
         * Query metrics
         *
         * Runs read-only SQL over the Project's message_events or call_events table. Get the SQL schema for supported columns, capabilities, and limits.
         */
        queryMessageMetrics: (input: Schemas.QueryMessageMetricsInput, options?: RequestOptions) => invokers.data<Schemas.QueryMessageMetricsInput, Schemas.QueryMessageMetricsOutput>(
            "queryMessageMetrics",
            Sdk.queryMessageMetrics,
            Schemas.QueryMessageMetricsOutputSchemas,
            input,
            options,
        ),
        /**
         * Retry webhook delivery
         *
         * Requests an immediate attempt of the selected delivery if it is still the waiting head for its destination and event type. expectedAttemptCount is the failed-attempt counter recorded on the delivery and fences stale requests. This overrides the current backoff, including Retry-After, once. It preserves event identity and the retry budget. Delivered, active, disabled and dead-lettered deliveries cannot be retried. A 202 acknowledges the wake-up, not successful delivery. Supply an Idempotency-Key and retain it when retrying an ambiguous failure.
         */
        retryWebhookDelivery: (input: Schemas.RetryWebhookDeliveryInput, options?: RequestOptions) => invokers.data<Schemas.RetryWebhookDeliveryInput, Schemas.RetryWebhookDeliveryOutput>(
            "retryWebhookDelivery",
            Sdk.retryWebhookDelivery,
            Schemas.RetryWebhookDeliveryOutputSchemas,
            input,
            options,
        ),
        /**
         * Revoke project API key
         *
         * Revokes the identified key on the selected project and returns its revoked metadata. Repeating the deletion returns the same revokedAt value. This operation does not rotate the key or return a replacement secret. Supply the required Idempotency-Key header.
         */
        revokeProjectApiKey: (input: Schemas.RevokeProjectApiKeyInput, options?: RequestOptions) => invokers.data<Schemas.RevokeProjectApiKeyInput, Schemas.RevokeProjectApiKeyOutput>(
            "revokeProjectApiKey",
            Sdk.revokeProjectApiKey,
            Schemas.RevokeProjectApiKeyOutputSchemas,
            input,
            options,
        ),
        /**
         * Rotate webhook signing secret
         *
         * Rotates the signing secret for the selected project's webhook destination and returns the new secret. The optional overlapSeconds controls the requested overlap with the previous secret according to the documented request constraints. Store the new secret securely and update the receiver's signature verification configuration; it is returned only in this response and in idempotent replays of it, never by destination reads. Supply the required Idempotency-Key header.
         */
        rotateWebhookSigningSecret: (input: Schemas.RotateWebhookSigningSecretInput, options?: RequestOptions) => invokers.data<Schemas.RotateWebhookSigningSecretInput, Schemas.RotateWebhookSigningSecretOutput>(
            "rotateWebhookSigningSecret",
            Sdk.rotateWebhookSigningSecret,
            Schemas.RotateWebhookSigningSecretOutputSchemas,
            input,
            options,
        ),
        /**
         * Update project
         *
         * Updates the identified project's name and returns the updated project. The project slug is not a mutable field in this request. Use an authorized account or organization service-identity credential; a project API key is not accepted. Supply the required Idempotency-Key header.
         */
        update: (input: Schemas.UpdateProjectInput, options?: RequestOptions) => invokers.data<Schemas.UpdateProjectInput, Schemas.UpdateProjectOutput>(
            "updateProject",
            Sdk.updateProject,
            Schemas.UpdateProjectOutputSchemas,
            input,
            options,
        ),
        /**
         * Update project API key permissions
         *
         * Replaces the identified project key's permission list with the supplied permissions and returns the updated metadata. Sending the permission list the key already has leaves it unchanged. This request does not create a new secret or change the key's project binding. Supply the required Idempotency-Key header.
         */
        updateProjectApiKey: (input: Schemas.UpdateProjectApiKeyInput, options?: RequestOptions) => invokers.data<Schemas.UpdateProjectApiKeyInput, Schemas.UpdateProjectApiKeyOutput>(
            "updateProjectApiKey",
            Sdk.updateProjectApiKey,
            Schemas.UpdateProjectApiKeyOutputSchemas,
            input,
            options,
        ),
        /**
         * Update webhook destination
         *
         * Updates the supplied URL, name, description, status or enabledEvents fields on a project's webhook destination and returns its updated configuration. The payload API version is not a mutable field in this request. Event selections are checked against the destination's versioned catalog; signing-secret rotation is a separate operation. Supply the required Idempotency-Key header.
         */
        updateWebhookDestination: (input: Schemas.UpdateWebhookDestinationInput, options?: RequestOptions) => invokers.data<Schemas.UpdateWebhookDestinationInput, Schemas.UpdateWebhookDestinationOutput>(
            "updateWebhookDestination",
            Sdk.updateWebhookDestination,
            Schemas.UpdateWebhookDestinationOutputSchemas,
            input,
            options,
        ),
        /**
         * Upload attachment
         *
         * Uploads a file and returns its Attachment once ready to download.
         */
        uploadAttachment: (input: Schemas.UploadAttachmentInput, options?: RequestOptions) => invokers.data<Schemas.UploadAttachmentInput, Schemas.UploadAttachmentOutput>(
            "uploadAttachment",
            Sdk.uploadAttachment,
            Schemas.UploadAttachmentOutputSchemas,
            input,
            options,
        ),
    },
    system: {
        /**
         * Request app installation
         *
         * Authenticates a registered app backend using a short-lived signed client assertion. Creates request metadata only; customer approval is still required.
         */
        createAppInstallationRequest: (input: Schemas.CreateAppInstallationRequestInput, options?: RequestOptions) => invokers.data<Schemas.CreateAppInstallationRequestInput, Schemas.CreateAppInstallationRequestOutput>(
            "createAppInstallationRequest",
            Sdk.createAppInstallationRequest,
            Schemas.CreateAppInstallationRequestOutputSchemas,
            input,
            options,
        ),
        /**
         * Redeem installation credential
         *
         * The registered app backend authenticates with a signed client assertion and a single-use code. Plaintext is returned only once; retries return status and never create another credential.
         */
        redeemAppInstallationDelivery: (input: Schemas.RedeemAppInstallationDeliveryInput, options?: RequestOptions) => invokers.data<Schemas.RedeemAppInstallationDeliveryInput, Schemas.RedeemAppInstallationDeliveryOutput>(
            "redeemAppInstallationDelivery",
            Sdk.redeemAppInstallationDelivery,
            Schemas.RedeemAppInstallationDeliveryOutputSchemas,
            input,
            options,
        ),
    },
  };
  const raw = {
    account: {
        /**
         * Commit profile picture
         *
         * Commits a profile picture previously uploaded through createAccountProfilePictureUpload. Call this only after the direct multipart upload succeeds, using the uploadId from the same upload session and a stable Idempotency-Key. The service validates the temporary object's ownership, size, content type, image bytes, dimensions, encryption, and age before changing the Account.
         */
        commitProfilePicture: (input: Schemas.CommitAccountProfilePictureInput, options?: RequestOptions) => invokers.raw<Schemas.CommitAccountProfilePictureInput, Schemas.CommitAccountProfilePictureOutput>(
            "commitAccountProfilePicture",
            Sdk.commitAccountProfilePicture,
            Schemas.CommitAccountProfilePictureOutputSchemas,
            input,
            options,
        ),
        /**
         * Confirm phone verification
         *
         * Binds the number once the code is approved. Repeat calls return the bound Account.
         */
        confirmPhoneVerification: (input: Schemas.ConfirmAccountPhoneVerificationInput, options?: RequestOptions) => invokers.raw<Schemas.ConfirmAccountPhoneVerificationInput, Schemas.ConfirmAccountPhoneVerificationOutput>(
            "confirmAccountPhoneVerification",
            Sdk.confirmAccountPhoneVerification,
            Schemas.ConfirmAccountPhoneVerificationOutputSchemas,
            input,
            options,
        ),
        /**
         * Create Account Service Key
         *
         * Creates a service key for the authenticated account with the supplied name and optional expiresAt. Returns key metadata and a one-time credential; store the credential securely because it cannot be retrieved through the listing endpoint. These credentials act as the account and must not be distributed as project-scoped keys. Supply the required Idempotency-Key header.
         */
        createAccountServiceKey: (input: Schemas.CreateAccountServiceKeyInput, options?: RequestOptions) => invokers.raw<Schemas.CreateAccountServiceKeyInput, Schemas.CreateAccountServiceKeyOutput>(
            "createAccountServiceKey",
            Sdk.createAccountServiceKey,
            Schemas.CreateAccountServiceKeyOutputSchemas,
            input,
            options,
        ),
        /**
         * Create profile picture upload
         *
         * Creates a ten-minute, Account-bound presigned S3 POST for a JPEG, PNG, or WebP profile picture up to 5 MiB. Copy every returned formFields entry into a multipart/form-data request to uploadUrl, append the local file as the final form part, and upload it directly without sending Photon credentials. After the upload succeeds, call commitAccountProfilePicture with the returned uploadId. Do not cache or log the upload URL or form fields.
         */
        createProfilePictureUpload: (input: Schemas.CreateAccountProfilePictureUploadInput, options?: RequestOptions) => invokers.raw<Schemas.CreateAccountProfilePictureUploadInput, Schemas.CreateAccountProfilePictureUploadOutput>(
            "createAccountProfilePictureUpload",
            Sdk.createAccountProfilePictureUpload,
            Schemas.CreateAccountProfilePictureUploadOutputSchemas,
            input,
            options,
        ),
        /**
         * Delete account
         *
         * Deletes the authenticated account and returns its account tombstone. The operation is rejected while the account still owns organizations; transfer or close those organizations before retrying. This endpoint acts on the caller's account and does not accept another account's identifier.
         */
        delete: (input: Schemas.DeleteAccountInput = {}, options?: RequestOptions) => invokers.raw<Schemas.DeleteAccountInput, Schemas.DeleteAccountOutput>(
            "deleteAccount",
            Sdk.deleteAccount,
            Schemas.DeleteAccountOutputSchemas,
            input,
            options,
        ),
        /**
         * Get account
         *
         * Returns the profile of the authenticated account. The account is selected from the credential rather than a request parameter. A missing or deleted account is reported as an error instead of an empty profile.
         */
        get: (input: Schemas.GetAccountInput = {}, options?: RequestOptions) => invokers.raw<Schemas.GetAccountInput, Schemas.GetAccountOutput>(
            "getAccount",
            Sdk.getAccount,
            Schemas.GetAccountOutputSchemas,
            input,
            options,
        ),
        /**
         * List Account Service Keys
         *
         * Returns metadata for the authenticated account's unrevoked service keys, including expired keys, ordered newest first. Secret values are not returned; a key's credential is disclosed only when that key is created.
         */
        listAccountServiceKeys: (input: Schemas.ListAccountServiceKeysInput = {}, options?: RequestOptions) => invokers.raw<Schemas.ListAccountServiceKeysInput, Schemas.ListAccountServiceKeysOutput>(
            "listAccountServiceKeys",
            Sdk.listAccountServiceKeys,
            Schemas.ListAccountServiceKeysOutputSchemas,
            input,
            options,
        ),
        /**
         * List connected applications
         *
         * Lists the OAuth applications authorized by the authenticated user.
         */
        listAuthorizedApplications: (input: Schemas.ListAuthorizedApplicationsInput = {}, options?: RequestOptions) => invokers.raw<Schemas.ListAuthorizedApplicationsInput, Schemas.ListAuthorizedApplicationsOutput>(
            "listAuthorizedApplications",
            Sdk.listAuthorizedApplications,
            Schemas.ListAuthorizedApplicationsOutputSchemas,
            input,
            options,
        ),
        /**
         * Remove profile picture
         *
         * Removes the authenticated account's custom profile picture and returns the account using its default picture. This operation does not upload a replacement; use the upload-and-commit operations when setting a new custom picture. Supply the required Idempotency-Key header.
         */
        resetProfilePicture: (input: Schemas.ResetAccountProfilePictureInput, options?: RequestOptions) => invokers.raw<Schemas.ResetAccountProfilePictureInput, Schemas.ResetAccountProfilePictureOutput>(
            "resetAccountProfilePicture",
            Sdk.resetAccountProfilePicture,
            Schemas.ResetAccountProfilePictureOutputSchemas,
            input,
            options,
        ),
        /**
         * Revoke Account Service Key
         *
         * Revokes the account-owned service key identified by serviceKeyId and returns its revoked metadata. Repeating the revocation is stable. Revocation changes the credential's validity; it does not create a replacement key. Supply the required Idempotency-Key header.
         */
        revokeAccountServiceKey: (input: Schemas.RevokeAccountServiceKeyInput, options?: RequestOptions) => invokers.raw<Schemas.RevokeAccountServiceKeyInput, Schemas.RevokeAccountServiceKeyOutput>(
            "revokeAccountServiceKey",
            Sdk.revokeAccountServiceKey,
            Schemas.RevokeAccountServiceKeyOutputSchemas,
            input,
            options,
        ),
        /**
         * Revoke connected application
         *
         * Revokes the authenticated user's grant for one OAuth application.
         */
        revokeAuthorizedApplication: (input: Schemas.RevokeAuthorizedApplicationInput, options?: RequestOptions) => invokers.raw<Schemas.RevokeAuthorizedApplicationInput, Schemas.RevokeAuthorizedApplicationOutput>(
            "revokeAuthorizedApplication",
            Sdk.revokeAuthorizedApplication,
            Schemas.RevokeAuthorizedApplicationOutputSchemas,
            input,
            options,
        ),
        /**
         * Start phone verification
         *
         * Sends an SMS code. Answers CAPTCHA_REQUIRED with the widget to render when no solved challenge accompanies the request; retry with the returned challengeContext and a token. Rate limited per account, per destination number, and globally; a rejection carries Retry-After.
         */
        startPhoneVerification: (input: Schemas.StartAccountPhoneVerificationInput, options?: RequestOptions) => invokers.raw<Schemas.StartAccountPhoneVerificationInput, Schemas.StartAccountPhoneVerificationOutput>(
            "startAccountPhoneVerification",
            Sdk.startAccountPhoneVerification,
            Schemas.StartAccountPhoneVerificationOutputSchemas,
            input,
            options,
        ),
        /**
         * Update account
         *
         * Updates the supplied firstName and lastName fields on the authenticated account and returns the updated profile. Only the documented profile fields can be changed through this endpoint; profile-picture uploads and phone-number verification use their dedicated operations. Supply the required Idempotency-Key header.
         */
        update: (input: Schemas.UpdateAccountInput, options?: RequestOptions) => invokers.raw<Schemas.UpdateAccountInput, Schemas.UpdateAccountOutput>(
            "updateAccount",
            Sdk.updateAccount,
            Schemas.UpdateAccountOutputSchemas,
            input,
            options,
        ),
    },
    auth: {
        device: {
            /**
             * Start device authorization
             *
             * Starts the device authorization flow for a CLI or another device without a browser. Show the verification URL and user code, then poll the token endpoint at the returned interval. No request fields are required; any supplied body is ignored.
             */
            authorize: (input: Schemas.DeviceAuthorizeInput = {}, options?: RequestOptions) => invokers.raw<Schemas.DeviceAuthorizeInput, Schemas.DeviceAuthorizeOutput>(
                "deviceAuthorize",
                Sdk.deviceAuthorize,
                Schemas.DeviceAuthorizeOutputSchemas,
                input,
                options,
            ),
            /**
             * Exchange device code or refresh token
             *
             * Exchanges an authorized device code or a refresh token for an access token and rotating refresh token. Accepts JSON and form-encoded bodies. While polling, wait at least interval seconds and increase the interval on slow_down. Store the new refresh token after every successful grant.
             *
             * This SDK method sends uncompressed JSON (application/json). Other request formats described above apply to direct HTTP requests.
             */
            token: (input: Schemas.DeviceTokenInput, options?: RequestOptions) => invokers.raw<Schemas.DeviceTokenInput, Schemas.DeviceTokenOutput>(
                "deviceToken",
                Sdk.deviceToken,
                Schemas.DeviceTokenOutputSchemas,
                input,
                options,
            ),
        },
        /**
         * Sign in with invitation SSO
         *
         * Returns an authentication URL for the organization SSO connection associated with the supplied invitation token. Supply token and returnTo. Complete the returned authentication flow; requesting its URL does not itself accept the invitation.
         */
        beginInvitationSso: (input: Schemas.BeginInvitationSsoInput, options?: RequestOptions) => invokers.raw<Schemas.BeginInvitationSsoInput, Schemas.BeginInvitationSsoOutput>(
            "beginInvitationSso",
            Sdk.beginInvitationSso,
            Schemas.BeginInvitationSsoOutputSchemas,
            input,
            options,
        ),
        /**
         * Sign in with organization SSO
         *
         * Returns a URL to authenticate through the selected organization’s current SSO connection. Supply returnTo and open the returned URL to continue the flow. Receiving the URL does not establish an authenticated session.
         */
        beginOrganizationAuthentication: (input: Schemas.BeginOrganizationAuthenticationInput, options?: RequestOptions) => invokers.raw<Schemas.BeginOrganizationAuthenticationInput, Schemas.BeginOrganizationAuthenticationOutput>(
            "beginOrganizationAuthentication",
            Sdk.beginOrganizationAuthentication,
            Schemas.BeginOrganizationAuthenticationOutputSchemas,
            input,
            options,
        ),
        /**
         * Sign in to close organization
         *
         * Returns an authentication URL for the current organization owner to inspect organization closure. Supply returnTo and complete the returned flow. This operation initiates authentication and does not close the organization.
         */
        beginOrganizationClosureAuthentication: (input: Schemas.BeginOrganizationClosureAuthenticationInput, options?: RequestOptions) => invokers.raw<Schemas.BeginOrganizationClosureAuthenticationInput, Schemas.BeginOrganizationClosureAuthenticationOutput>(
            "beginOrganizationClosureAuthentication",
            Sdk.beginOrganizationClosureAuthentication,
            Schemas.BeginOrganizationClosureAuthenticationOutputSchemas,
            input,
            options,
        ),
        /**
         * Begin organization SSO admission
         *
         * Returns an SSO admission URL for an existing account and the selected organization. Supply returnTo for the continuation URL. Admission requires completing the returned authentication flow; creating the URL does not itself grant membership.
         */
        beginOrganizationSsoAdmission: (input: Schemas.BeginOrganizationSsoAdmissionInput, options?: RequestOptions) => invokers.raw<Schemas.BeginOrganizationSsoAdmissionInput, Schemas.BeginOrganizationSsoAdmissionOutput>(
            "beginOrganizationSsoAdmission",
            Sdk.beginOrganizationSsoAdmission,
            Schemas.BeginOrganizationSsoAdmissionOutputSchemas,
            input,
            options,
        ),
        /**
         * Create organization setup portal link
         *
         * Returns an organization setup portal URL. Supply returnTo and optionally intent, either sso or domain_verification; sso is the default. Open the returned URL to complete the selected setup flow.
         */
        createOrganizationSsoPortalLink: (input: Schemas.CreateOrganizationSsoPortalLinkInput, options?: RequestOptions) => invokers.raw<Schemas.CreateOrganizationSsoPortalLinkInput, Schemas.CreateOrganizationSsoPortalLinkOutput>(
            "createOrganizationSsoPortalLink",
            Sdk.createOrganizationSsoPortalLink,
            Schemas.CreateOrganizationSsoPortalLinkOutputSchemas,
            input,
            options,
        ),
        /**
         * Disable organization SSO
         *
         * Deletes the provider connection, releases the SSO requirement once the connection is gone, then unbinds the chosen domains. Retry with the same Idempotency-Key to resume or await the same run.
         */
        disableOrganizationSso: (input: Schemas.DisableOrganizationSsoInput, options?: RequestOptions) => invokers.raw<Schemas.DisableOrganizationSsoInput, Schemas.DisableOrganizationSsoOutput>(
            "disableOrganizationSso",
            Sdk.disableOrganizationSso,
            Schemas.DisableOrganizationSsoOutputSchemas,
            input,
            options,
        ),
        /**
         * Get organization connection status
         *
         * Requires current human organization membership. Synchronization status does not attest SSO configuration or completed authorization.
         */
        getOrganizationConnectionStatus: (input: Schemas.GetOrganizationConnectionStatusInput, options?: RequestOptions) => invokers.raw<Schemas.GetOrganizationConnectionStatusInput, Schemas.GetOrganizationConnectionStatusOutput>(
            "getOrganizationConnectionStatus",
            Sdk.getOrganizationConnectionStatus,
            Schemas.GetOrganizationConnectionStatusOutputSchemas,
            input,
            options,
        ),
        /**
         * Get organization SSO configuration
         *
         * Returns the selected organization’s SSO connection state, configuration version, and desired and effective policy settings. Read policySyncStatus alongside the enforcement fields to distinguish requested settings from synchronized settings.
         */
        getOrganizationSsoConfiguration: (input: Schemas.GetOrganizationSsoConfigurationInput, options?: RequestOptions) => invokers.raw<Schemas.GetOrganizationSsoConfigurationInput, Schemas.GetOrganizationSsoConfigurationOutput>(
            "getOrganizationSsoConfiguration",
            Sdk.getOrganizationSsoConfiguration,
            Schemas.GetOrganizationSsoConfigurationOutputSchemas,
            input,
            options,
        ),
        /**
         * List OAuth scopes
         *
         * Lists the business permissions available to OAuth applications.
         */
        listOauthScopes: (input: Schemas.ListOauthScopesInput = {}, options?: RequestOptions) => invokers.raw<Schemas.ListOauthScopesInput, Schemas.ListOauthScopesOutput>(
            "listOauthScopes",
            Sdk.listOauthScopes,
            Schemas.ListOauthScopesOutputSchemas,
            input,
            options,
        ),
        /**
         * Refresh organization SSO connection
         *
         * Refreshes the selected organization’s SSO connection and returns its current connection state, configuration version and policy synchronization status. This operation takes no request body.
         */
        refreshOrganizationSsoConnection: (input: Schemas.RefreshOrganizationSsoConnectionInput, options?: RequestOptions) => invokers.raw<Schemas.RefreshOrganizationSsoConnectionInput, Schemas.RefreshOrganizationSsoConnectionOutput>(
            "refreshOrganizationSsoConnection",
            Sdk.refreshOrganizationSsoConnection,
            Schemas.RefreshOrganizationSsoConnectionOutputSchemas,
            input,
            options,
        ),
        /**
         * Retry organization connection sync
         *
         * Reconciles existing local intent. Takes no body and cannot change membership, roles or authentication policy.
         */
        retryOrganizationConnectionSync: (input: Schemas.RetryOrganizationConnectionSyncInput, options?: RequestOptions) => invokers.raw<Schemas.RetryOrganizationConnectionSyncInput, Schemas.RetryOrganizationConnectionSyncOutput>(
            "retryOrganizationConnectionSync",
            Sdk.retryOrganizationConnectionSync,
            Schemas.RetryOrganizationConnectionSyncOutputSchemas,
            input,
            options,
        ),
        /**
         * Start company sign-in
         *
         * Returns a sign-in URL without requiring an existing account: the company SSO connection when the target has a ready connection, otherwise ordinary account login. Supply one documented enrollment variant: organizationId with returnTo (optionally invitationToken), invitationToken with returnTo, or retryToken. Open the returned URL to continue authentication; receiving a URL does not complete sign-in. This is a browser flow: the request must come from an allowed Origin, and the retryToken variant also needs the retry cookie set by the failed sign-in, so send it with credentials.
         */
        startEnterpriseLogin: (input: Schemas.StartEnterpriseLoginInput, options?: RequestOptions) => invokers.raw<Schemas.StartEnterpriseLoginInput, Schemas.StartEnterpriseLoginOutput>(
            "startEnterpriseLogin",
            Sdk.startEnterpriseLogin,
            Schemas.StartEnterpriseLoginOutputSchemas,
            input,
            options,
        ),
        /**
         * Update organization SSO policy
         *
         * Updates whether SSO can admit new members automatically using ssoJitEnabled and the current expectedVersion. Returns the organization’s SSO configuration and policy synchronization status; a successful response does not mean every desired policy setting has finished synchronizing.
         */
        updateOrganizationSsoPolicy: (input: Schemas.UpdateOrganizationSsoPolicyInput, options?: RequestOptions) => invokers.raw<Schemas.UpdateOrganizationSsoPolicyInput, Schemas.UpdateOrganizationSsoPolicyOutput>(
            "updateOrganizationSsoPolicy",
            Sdk.updateOrganizationSsoPolicy,
            Schemas.UpdateOrganizationSsoPolicyOutputSchemas,
            input,
            options,
        ),
    },
    organizations: {
        billing: {
            /**
             * Change plan
             *
             * Purchases or changes the selected project's plan for the supplied category and planCode. A 202 response means the change is pending: poll the returned operation URL and honor Retry-After until it succeeds or fails. A 200 response means the idempotency key resolved to an operation that is already terminal; inspect that result rather than assuming success from the status code alone. Supply the required Idempotency-Key header. Supply both organizationId and projectId to select the project within its organization.
             */
            changePlan: (input: Schemas.ChangePlanInput, options?: RequestOptions) => invokers.raw<Schemas.ChangePlanInput, Schemas.ChangePlanOutput>(
                "changePlan",
                Sdk.changePlan,
                Schemas.ChangePlanOutputSchemas,
                input,
                options,
            ),
            /**
             * Create payment method checkout
             *
             * Returns a hosted payment-method collection URL for the selected organization. An Idempotency-Key header is optional; supply one to make retries safe. Complete the returned checkout flow. Receiving the URL does not mean a card has been saved; check payment-method status afterward.
             */
            createOrganizationPaymentMethodCheckout: (input: Schemas.CreateOrganizationPaymentMethodCheckoutInput, options?: RequestOptions) => invokers.raw<Schemas.CreateOrganizationPaymentMethodCheckoutInput, Schemas.CreateOrganizationPaymentMethodCheckoutOutput>(
                "createOrganizationPaymentMethodCheckout",
                Sdk.createOrganizationPaymentMethodCheckout,
                Schemas.CreateOrganizationPaymentMethodCheckoutOutputSchemas,
                input,
                options,
            ),
            /**
             * Create card setup intent
             *
             * Creates payment-provider configuration for collecting a card for the selected organization and returns clientSecret and publishableKey. Supply the required Idempotency-Key header. Complete the provider’s card-collection flow separately and avoid logging the returned client secret.
             */
            createOrganizationSetupIntent: (input: Schemas.CreateOrganizationSetupIntentInput, options?: RequestOptions) => invokers.raw<Schemas.CreateOrganizationSetupIntentInput, Schemas.CreateOrganizationSetupIntentOutput>(
                "createOrganizationSetupIntent",
                Sdk.createOrganizationSetupIntent,
                Schemas.CreateOrganizationSetupIntentOutputSchemas,
                input,
                options,
            ),
            /**
             * Get the project's effective billing terms
             *
             * Returns what the selected project is billed on now, per category it holds: the plan as its subscription has it, with any override applied, each fixed charge at the subscription's price and quantity, and resolved entitlements; where the plan comes from; how invoices are paid; the current period and next billing date; and any downgrade or cancellation waiting for the period end. It also returns the credit the paying organization holds on credit notes, such as the unused time of a plan an upgrade replaced; it offsets that organization's next invoices. Supply both organizationId and projectId; the organization must pay for the project. This operation does not change billing.
             */
            getEffectiveTerms: (input: Schemas.GetEffectiveTermsInput, options?: RequestOptions) => invokers.raw<Schemas.GetEffectiveTermsInput, Schemas.GetEffectiveTermsOutput>(
                "getEffectiveTerms",
                Sdk.getEffectiveTerms,
                Schemas.GetEffectiveTermsOutputSchemas,
                input,
                options,
            ),
            /**
             * Get organization billing overview
             *
             * Returns the selected organization’s billing subscription and entitlementsVersion. The subscription can be null. Read the returned plan, charges and entitlements to inspect organization billing; this operation does not purchase or change a plan.
             */
            getOrganizationBillingOverview: (input: Schemas.GetOrganizationBillingOverviewInput, options?: RequestOptions) => invokers.raw<Schemas.GetOrganizationBillingOverviewInput, Schemas.GetOrganizationBillingOverviewOutput>(
                "getOrganizationBillingOverview",
                Sdk.getOrganizationBillingOverview,
                Schemas.GetOrganizationBillingOverviewOutputSchemas,
                input,
                options,
            ),
            /**
             * Get organization payment method
             *
             * Reports whether the selected organization has a card on file and returns its documented payment-method metadata. Reading this endpoint does not collect a new card or create a checkout session.
             */
            getOrganizationPaymentMethod: (input: Schemas.GetOrganizationPaymentMethodInput, options?: RequestOptions) => invokers.raw<Schemas.GetOrganizationPaymentMethodInput, Schemas.GetOrganizationPaymentMethodOutput>(
                "getOrganizationPaymentMethod",
                Sdk.getOrganizationPaymentMethod,
                Schemas.GetOrganizationPaymentMethodOutputSchemas,
                input,
                options,
            ),
            /**
             * List invoices
             *
             * Returns a single page of the selected organization's invoices; invoices with a zero total are excluded. Use the documented invoice fields to inspect each invoice's billing state. Listing invoices does not make a payment or modify a subscription.
             */
            listInvoices: (input: Schemas.ListInvoicesInput, options?: RequestOptions) => invokers.raw<Schemas.ListInvoicesInput, Schemas.ListInvoicesOutput>(
                "listInvoices",
                Sdk.listInvoices,
                Schemas.ListInvoicesOutputSchemas,
                input,
                options,
            ),
            /**
             * Preview an organization billing change
             *
             * Previews a fixed-charge quantity change on the selected organization's own subscription, such as SSO. Prices the change by the billing engine exactly as making it would bill it now: dueNow is that invoice, with taxes and the payer's credits applied. A quantity already paid for this period is not billed again, so a purchase after a release can be free. nextCharge is what is charged in advance at the next period start. For a fixed-charge change, pass quote on with the purchase so it is refused if the price or period no longer hold. This operation does not change billing.
             */
            previewOrganizationChange: (input: Schemas.PreviewOrganizationChangeInput, options?: RequestOptions) => invokers.raw<Schemas.PreviewOrganizationChangeInput, Schemas.PreviewOrganizationChangeOutput>(
                "previewOrganizationChange",
                Sdk.previewOrganizationChange,
                Schemas.PreviewOrganizationChangeOutputSchemas,
                input,
                options,
            ),
            /**
             * Preview a project billing change
             *
             * Previews a change on the selected project's subscription in the supplied category: a fixed-charge quantity change, or a plan change with the held fixed charges it carries over. Prices the change by the billing engine exactly as making it would bill it now: dueNow is that invoice, with taxes and the payer's credits applied. A quantity already paid for this period is not billed again, so a purchase after a release can be free. nextCharge is what is charged in advance at the next period start. For a fixed-charge change, pass quote on with the purchase so it is refused if the price or period no longer hold. This operation does not change billing. An upgrade bills the replaced plan's usage to date and the new plan from now, less the replaced plan's unused time; planChange says when it applies and which held fixed charges the target does not sell: released first for a change that applies now, released with a downgrade when it applies. additions quotes what is added once an upgrade applies, each billed when it is added, in planChange.additions and outside dueNow. Supply both organizationId and projectId; the organization must pay for the project.
             */
            previewProjectChange: (input: Schemas.PreviewProjectChangeInput, options?: RequestOptions) => invokers.raw<Schemas.PreviewProjectChangeInput, Schemas.PreviewProjectChangeOutput>(
                "previewProjectChange",
                Sdk.previewProjectChange,
                Schemas.PreviewProjectChangeOutputSchemas,
                input,
                options,
            ),
        },
        projects: {
            /**
             * Check project slug availability
             *
             * Reports whether createProject would accept `slug` right now. Advisory: only the create itself allocates, so a caller must still handle SLUG_TAKEN. A malformed slug is rejected on shape; a reserved slug, a slug held by an active project, and a slug retired with a deleted project each answer `available: false` with a reason.
             */
            checkProjectSlugAvailability: (input: Schemas.CheckProjectSlugAvailabilityInput, options?: RequestOptions) => invokers.raw<Schemas.CheckProjectSlugAvailabilityInput, Schemas.CheckProjectSlugAvailabilityOutput>(
                "checkProjectSlugAvailability",
                Sdk.checkProjectSlugAvailability,
                Schemas.CheckProjectSlugAvailabilityOutputSchemas,
                input,
                options,
            ),
            /**
             * Count projects
             *
             * Counts the projects the same filter would list. The count is read from the primary, so it is authoritative rather than replica-lagged.
             */
            count: (input: Schemas.CountProjectsInput, options?: RequestOptions) => invokers.raw<Schemas.CountProjectsInput, Schemas.CountProjectsOutput>(
                "countProjects",
                Sdk.countProjects,
                Schemas.CountProjectsOutputSchemas,
                input,
                options,
            ),
            /**
             * Create project
             *
             * Creates in the authorized organization. In addition to account credentials, explicitly granted Service Identity API keys and M2M tokens may create projects. Project API keys cannot create projects. Creator and private credential evidence come only from the trusted authorization context. The caller-selected slug is immutable, must be 3 to 63 lowercase ASCII alphanumerics separated by single hyphens, and cannot be reserved or held by any active or deleted project.
             */
            create: (input: Schemas.CreateProjectInput, options?: RequestOptions) => invokers.raw<Schemas.CreateProjectInput, Schemas.CreateProjectOutput>(
                "createProject",
                Sdk.createProject,
                Schemas.CreateProjectOutputSchemas,
                input,
                options,
            ),
            /**
             * Get project closure status
             *
             * Returns closure progress for projectId within organizationId, including deletionOperationId, domain progress and ready. This read operation does not initiate deletion.
             */
            getProjectClosureStatus: (input: Schemas.GetProjectClosureStatusInput, options?: RequestOptions) => invokers.raw<Schemas.GetProjectClosureStatusInput, Schemas.GetProjectClosureStatusOutput>(
                "getProjectClosureStatus",
                Sdk.getProjectClosureStatus,
                Schemas.GetProjectClosureStatusOutputSchemas,
                input,
                options,
            ),
            /**
             * List projects
             *
             * Returns a cursor-paginated page of the active projects in organizationId. Filter using query and the documented creation-time bounds, and navigate with pageSize and pageToken. Project roles are not returned and role is not a supported filter.
             */
            list: (input: Schemas.ListProjectsInput, options?: RequestOptions) => invokers.raw<Schemas.ListProjectsInput, Schemas.ListProjectsOutput>(
                "listProjects",
                Sdk.listProjects,
                Schemas.ListProjectsOutputSchemas,
                input,
                options,
            ),
        },
    },
    projects: {
        agentProfile: {
            /**
             * Commit agent avatar
             *
             * Commits an agent avatar previously uploaded through createAgentProfileAvatarUpload. Call this only after the direct multipart upload succeeds, using the uploadId from the same upload session and a stable Idempotency-Key. The service validates the temporary object's Project ownership, size, content type, image bytes, dimensions, encryption, and age before changing the agent profile.
             */
            commitAvatar: (input: Schemas.CommitAgentProfileAvatarInput, options?: RequestOptions) => invokers.raw<Schemas.CommitAgentProfileAvatarInput, Schemas.CommitAgentProfileAvatarOutput>(
                "commitAgentProfileAvatar",
                Sdk.commitAgentProfileAvatar,
                Schemas.CommitAgentProfileAvatarOutputSchemas,
                input,
                options,
            ),
            /**
             * Create agent avatar upload
             *
             * Creates a ten-minute, Project-bound presigned S3 POST for a JPEG, PNG, or WebP agent avatar up to 5 MiB. Copy every returned formFields entry into a multipart/form-data request to uploadUrl, append the local file as the final form part, and upload it directly without sending Photon credentials. After the upload succeeds, call commitAgentProfileAvatar with the returned uploadId. Do not cache or log the upload URL or form fields.
             */
            createAvatarUpload: (input: Schemas.CreateAgentProfileAvatarUploadInput, options?: RequestOptions) => invokers.raw<Schemas.CreateAgentProfileAvatarUploadInput, Schemas.CreateAgentProfileAvatarUploadOutput>(
                "createAgentProfileAvatarUpload",
                Sdk.createAgentProfileAvatarUpload,
                Schemas.CreateAgentProfileAvatarUploadOutputSchemas,
                input,
                options,
            ),
            /**
             * Get agent profile
             *
             * Returns the agent profile belonging to the identified project. The profile is project-scoped and is distinct from the authenticated account's personal profile. Use the dedicated avatar operations when uploading or removing an agent avatar.
             */
            get: (input: Schemas.GetAgentProfileInput, options?: RequestOptions) => invokers.raw<Schemas.GetAgentProfileInput, Schemas.GetAgentProfileOutput>(
                "getAgentProfile",
                Sdk.getAgentProfile,
                Schemas.GetAgentProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Reset agent avatar
             *
             * Replaces the selected project's agent avatar with the project's default avatar, a generated planet image derived from the project ID, and returns the updated agent profile. The reset does not restore an earlier avatar: a custom avatar it replaces is discarded and must be uploaded and committed again to use it. When the default avatar is already in use, the profile is returned unchanged. This does not change the account's personal profile picture. Supply the required Idempotency-Key header.
             */
            resetAvatar: (input: Schemas.ResetAgentProfileAvatarInput, options?: RequestOptions) => invokers.raw<Schemas.ResetAgentProfileAvatarInput, Schemas.ResetAgentProfileAvatarOutput>(
                "resetAgentProfileAvatar",
                Sdk.resetAgentProfileAvatar,
                Schemas.ResetAgentProfileAvatarOutputSchemas,
                input,
                options,
            ),
            /**
             * Update agent profile
             *
             * Updates the supplied firstName and lastName fields in the project's agent profile and returns the updated profile. Avatar upload, commit and reset are separate operations. The caller must be authorized to change configuration for the selected project. Supply the required Idempotency-Key header.
             */
            update: (input: Schemas.UpdateAgentProfileInput, options?: RequestOptions) => invokers.raw<Schemas.UpdateAgentProfileInput, Schemas.UpdateAgentProfileOutput>(
                "updateAgentProfile",
                Sdk.updateAgentProfile,
                Schemas.UpdateAgentProfileOutputSchemas,
                input,
                options,
            ),
        },
        billing: {
            /**
             * Get billing operation
             *
             * Returns the authoritative state of a billing operation belonging to the selected project. Use it to recover or poll a plan-change request until the operation reaches success or failure. An accepted request is not evidence that the plan change has completed.
             */
            getOperation: (input: Schemas.GetBillingOperationInput, options?: RequestOptions) => invokers.raw<Schemas.GetBillingOperationInput, Schemas.GetBillingOperationOutput>(
                "getBillingOperation",
                Sdk.getBillingOperation,
                Schemas.GetBillingOperationOutputSchemas,
                input,
                options,
            ),
            /**
             * Get project billing overview
             *
             * Returns the selected project's plan information, entitlements and current billing-period usage. This operation reads project billing state; it does not change plans or the payer's payment method. Organization-level plans are available through the organization billing overview.
             */
            getOverview: (input: Schemas.GetBillingOverviewInput, options?: RequestOptions) => invokers.raw<Schemas.GetBillingOverviewInput, Schemas.GetBillingOverviewOutput>(
                "getBillingOverview",
                Sdk.getBillingOverview,
                Schemas.GetBillingOverviewOutputSchemas,
                input,
                options,
            ),
            /**
             * List billing plans
             *
             * Lists the billing plan catalog, grouped by their public plan-metadata type. Use the returned plan information when choosing the category and planCode for a plan change. The catalog is the same for every project, and reading it does not purchase a plan.
             */
            listBillingPlans: (input: Schemas.ListBillingPlansInput, options?: RequestOptions) => invokers.raw<Schemas.ListBillingPlansInput, Schemas.ListBillingPlansOutput>(
                "listBillingPlans",
                Sdk.listBillingPlans,
                Schemas.ListBillingPlansOutputSchemas,
                input,
                options,
            ),
        },
        platforms: {
            imessage: {
                assignments: {
                    /**
                     * Create shared line assignment
                     *
                     * Maps an end user's iMessage handle — an E.164 phone number or an email address — onto one of the project's pooled shared iMessage lines, consuming a seat from the project's entitlement. The assigned number is allocated by the server. When an email address is supplied in `email` the user is sent an invite asynchronously to that address; it is never inferred from the handle, and the response never reports whether the send succeeded. Requires the platforms:write permission bound to the project resource in the path.
                     */
                    create: (input: Schemas.CreateSharedLineAssignmentInput, options?: RequestOptions) => invokers.raw<Schemas.CreateSharedLineAssignmentInput, Schemas.CreateSharedLineAssignmentOutput>(
                        "createSharedLineAssignment",
                        Sdk.createSharedLineAssignment,
                        Schemas.CreateSharedLineAssignmentOutputSchemas,
                        input,
                        options,
                    ),
                    /**
                     * Get shared line assignment
                     *
                     * Reads one shared line assignment. Requires the platforms:read permission bound to the project resource in the path.
                     */
                    get: (input: Schemas.GetSharedLineAssignmentInput, options?: RequestOptions) => invokers.raw<Schemas.GetSharedLineAssignmentInput, Schemas.GetSharedLineAssignmentOutput>(
                        "getSharedLineAssignment",
                        Sdk.getSharedLineAssignment,
                        Schemas.GetSharedLineAssignmentOutputSchemas,
                        input,
                        options,
                    ),
                    /**
                     * List shared line assignments
                     *
                     * Lists the project's shared line assignments, oldest first. Released assignments are excluded unless includeReleased is set. Requires the platforms:read permission bound to the project resource in the path.
                     */
                    list: (input: Schemas.ListSharedLineAssignmentsInput, options?: RequestOptions) => invokers.raw<Schemas.ListSharedLineAssignmentsInput, Schemas.ListSharedLineAssignmentsOutput>(
                        "listSharedLineAssignments",
                        Sdk.listSharedLineAssignments,
                        Schemas.ListSharedLineAssignmentsOutputSchemas,
                        input,
                        options,
                    ),
                    /**
                     * Release shared line assignment
                     *
                     * Releases a shared line assignment, freeing both its seat and its handle for reassignment. The row is retained for audit and returned with releasedAt set, so repeating the call is safe. Requires the platforms:write permission bound to the project resource in the path.
                     */
                    release: (input: Schemas.ReleaseSharedLineAssignmentInput, options?: RequestOptions) => invokers.raw<Schemas.ReleaseSharedLineAssignmentInput, Schemas.ReleaseSharedLineAssignmentOutput>(
                        "releaseSharedLineAssignment",
                        Sdk.releaseSharedLineAssignment,
                        Schemas.ReleaseSharedLineAssignmentOutputSchemas,
                        input,
                        options,
                    ),
                },
            },
            /**
             * Assign or replace SMS line campaign
             *
             * Attach a ready campaign from this project’s organization to its line. Requires platforms:write for the project; human and machine actors retain their authenticated identity. Requires a permanent Idempotency-Key and the current assignment version. Provider provisioning runs asynchronously.
             */
            assignSmsLineCampaign: (input: Schemas.AssignSmsLineCampaignInput, options?: RequestOptions) => invokers.raw<Schemas.AssignSmsLineCampaignInput, Schemas.AssignSmsLineCampaignOutput>(
                "assignSmsLineCampaign",
                Sdk.assignSmsLineCampaign,
                Schemas.AssignSmsLineCampaignOutputSchemas,
                input,
                options,
            ),
            /**
             * Assign Voice line profile
             *
             * Assigns or replaces a line's explicit additional-profile override when the resource version matches. The current default cannot be assigned explicitly. The pstn_voice ability remains the admission source of truth. Requires platforms:write bound to the path project.
             */
            assignVoiceLineProfile: (input: Schemas.AssignVoiceLineProfileInput, options?: RequestOptions) => invokers.raw<Schemas.AssignVoiceLineProfileInput, Schemas.AssignVoiceLineProfileOutput>(
                "assignVoiceLineProfile",
                Sdk.assignVoiceLineProfile,
                Schemas.AssignVoiceLineProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Batch update Voice line assignments
             *
             * Atomically sets additional-profile overrides or switches lines back to the project default for up to 100 Voice-capable lines. A null profileId means use the default. Every expected resource version must match or no line changes. Requires platforms:write bound to the path project.
             */
            batchUpdateVoiceLineProfileAssignments: (input: Schemas.BatchUpdateVoiceLineProfileAssignmentsInput, options?: RequestOptions) => invokers.raw<Schemas.BatchUpdateVoiceLineProfileAssignmentsInput, Schemas.BatchUpdateVoiceLineProfileAssignmentsOutput>(
                "batchUpdateVoiceLineProfileAssignments",
                Sdk.batchUpdateVoiceLineProfileAssignments,
                Schemas.BatchUpdateVoiceLineProfileAssignmentsOutputSchemas,
                input,
                options,
            ),
            /**
             * Cancel operation
             *
             * Withdraws a provision that has not been fulfilled yet. This is an operations action rather than a DELETE, because there is nothing to delete: no resource exists until the work commits. Whether it is accepted depends on the resource type — a dedicated iMessage line may sit waiting on inventory for hours and withdrawing costs nothing, while an SMS number is cancellable during inventory waiting and answers 409 once the workflow commits to its first provider order. Campaign assignment and detachment operations cannot be cancelled in any state. Wait for completion before requesting another change; that new change is not a guaranteed rollback. The output-only `cancellable` field is a snapshot; the cancellation transaction always checks the current phase under a row lock. A cancel that loses the race against the work finishing also answers 409: the resource exists and is billed for, so what you want then is to release it. Nothing is charged for a cancelled provision — billing runs after the work, so there is never anything to refund. Requires the platforms:write permission bound to the project resource in the path.
             */
            cancelOperation: (input: Schemas.CancelOperationInput, options?: RequestOptions) => invokers.raw<Schemas.CancelOperationInput, Schemas.CancelOperationOutput>(
                "cancelOperation",
                Sdk.cancelOperation,
                Schemas.CancelOperationOutputSchemas,
                input,
                options,
            ),
            /**
             * Configure Voice outbound credential
             *
             * Configures a SIP credential for outbound calls from a profile when the shared profile version matches. Outbound calls are paid usage, so the organization needs a payment method and no invoices overdue 7 days or more; otherwise this returns 402 ENTITLEMENT_REQUIRED with a reason. authentication.algorithm is required: SHA-256 is recommended, while MD5 is a weaker legacy option supported over UDP, TCP, and TLS; TLS is strongly recommended because UDP and TCP do not encrypt SIP signaling. The profileId may identify the default or an additional profile. The new password is returned once and is never recoverable. Requires platforms:write bound to the path project.
             */
            configureVoiceProfileOutbound: (input: Schemas.ConfigureVoiceProfileOutboundInput, options?: RequestOptions) => invokers.raw<Schemas.ConfigureVoiceProfileOutboundInput, Schemas.ConfigureVoiceProfileOutboundOutput>(
                "configureVoiceProfileOutbound",
                Sdk.configureVoiceProfileOutbound,
                Schemas.ConfigureVoiceProfileOutboundOutputSchemas,
                input,
                options,
            ),
            /**
             * Connect email domain
             *
             * Reserves a normalized DNS domain and starts its durable email-provider setup. The accepted provision consumes one email-domain entitlement slot until it fails, is cancelled, or becomes a live resource; the plan's email.max_email_domains value sets the project limit. The customer resource does not exist until provider identity and DNS setup reach READY; poll the returned operation for progress. A domain may have only one unfinished provision or live resource globally. Email domains have no additional per-domain charge. The Idempotency-Key is required and permanent: replaying the same key and canonical domain returns the original operation forever. Requires the platforms:write permission bound to the project resource in the path.
             */
            connectEmailDomain: (input: Schemas.ConnectEmailDomainInput, options?: RequestOptions) => invokers.raw<Schemas.ConnectEmailDomainInput, Schemas.ConnectEmailDomainOutput>(
                "connectEmailDomain",
                Sdk.connectEmailDomain,
                Schemas.ConnectEmailDomainOutputSchemas,
                input,
                options,
            ),
            /**
             * Connect Telegram bot
             *
             * Starts a free managed Telegram bot connection. Each project may have one unfinished Telegram provision, including user interaction and failure cleanup. A different Idempotency-Key while one is active returns 409 TELEGRAM_PROVISION_IN_PROGRESS with its operationId and operationUrl; resume it, cancel it while cancellation is available, or wait for it to finish. Rejected keys remain reusable. Open detail.setupUrl to connect an existing managed bot or create a new one with the project's default agent name or a custom display name, then poll Location. The link remains usable while the operation is active and never expires. Replaying the same Idempotency-Key returns the original operation, even after completion or while a newer setup is active. POST, GET and list share the same operation details. The API includes detail.setupUrl only for callers with platforms:write for the project; read-only callers receive the other details unchanged.
             */
            connectTelegramBot: (input: Schemas.ConnectTelegramBotInput, options?: RequestOptions) => invokers.raw<Schemas.ConnectTelegramBotInput, Schemas.ConnectTelegramBotOutput>(
                "connectTelegramBot",
                Sdk.connectTelegramBot,
                Schemas.ConnectTelegramBotOutputSchemas,
                input,
                options,
            ),
            /**
             * Connect WhatsApp Business
             *
             * Exchanges the authorization code Embedded Signup returned and connects exactly the selected phone number as one `whatsapp_sender`. Send the WABA id and phone-number id emitted by the same popup attempt; both are treated as selectors and verified against Meta before use. A selected number that matches a non-retired, same-project `voip_line` is linked to it; a number absent from Photon inventory stays unbound; a matching non-retired `cosmos_line`, foreign VoIP line or unassigned VoIP line fails the operation before registration. Connecting is free — no plan requirement — but Billing must report the project's organization as ready with a payment method on file. The Idempotency-Key is required and permanent: replaying the same key returns the original operation forever. Requires the platforms:write permission bound to the project resource in the path.
             */
            connectWhatsappBusiness: (input: Schemas.ConnectWhatsappBusinessInput, options?: RequestOptions) => invokers.raw<Schemas.ConnectWhatsappBusinessInput, Schemas.ConnectWhatsappBusinessOutput>(
                "connectWhatsappBusiness",
                Sdk.connectWhatsappBusiness,
                Schemas.ConnectWhatsappBusinessOutputSchemas,
                input,
                options,
            ),
            /**
             * Count filtered verification codes
             *
             * Counts the verification codes Photon kept from this project's dedicated lines and numbers, optionally for one `platform`. Without `receivedAfter` and `receivedBefore` the window is the 30 days before the request; a window longer than 366 days is rejected. The response echoes the window it resolved, so the number always says which period it covers. Requires the platforms:read permission bound to the project resource in the path.
             */
            countFilteredVerificationCodes: (input: Schemas.CountFilteredVerificationCodesInput, options?: RequestOptions) => invokers.raw<Schemas.CountFilteredVerificationCodesInput, Schemas.CountFilteredVerificationCodesOutput>(
                "countFilteredVerificationCodes",
                Sdk.countFilteredVerificationCodes,
                Schemas.CountFilteredVerificationCodesOutputSchemas,
                input,
                options,
            ),
            /**
             * Count a line's filtered verification codes
             *
             * Counts the verification codes Photon kept from one dedicated line or number. Without `receivedAfter` and `receivedBefore` the window is the 30 days before the request; a window longer than 366 days is rejected. The response echoes the window it resolved, so the number always says which period it covers. Answers 404 unless the project holds the resource now. Codes from an earlier tenure stay in the project-wide list. Filter by `platform` — a number receives both SMS and WhatsApp. Requires the platforms:read permission bound to the project resource in the path.
             */
            countResourceFilteredVerificationCodes: (input: Schemas.CountResourceFilteredVerificationCodesInput, options?: RequestOptions) => invokers.raw<Schemas.CountResourceFilteredVerificationCodesInput, Schemas.CountResourceFilteredVerificationCodesOutput>(
                "countResourceFilteredVerificationCodes",
                Sdk.countResourceFilteredVerificationCodes,
                Schemas.CountResourceFilteredVerificationCodesOutputSchemas,
                input,
                options,
            ),
            /**
             * Create default Voice profile
             *
             * Creates the project default Voice profile when absent. An identical replay returns the existing default without changing its version; a different existing default conflicts. Direction configuration is managed separately. Requires platforms:write bound to the path project.
             */
            createDefaultVoiceProfile: (input: Schemas.CreateDefaultVoiceProfileInput, options?: RequestOptions) => invokers.raw<Schemas.CreateDefaultVoiceProfileInput, Schemas.CreateDefaultVoiceProfileOutput>(
                "createDefaultVoiceProfile",
                Sdk.createDefaultVoiceProfile,
                Schemas.CreateDefaultVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Create Voice profile
             *
             * Creates a direction-neutral additional Voice profile. The project default must already exist. Requires platforms:write bound to the path project.
             */
            createVoiceProfile: (input: Schemas.CreateVoiceProfileInput, options?: RequestOptions) => invokers.raw<Schemas.CreateVoiceProfileInput, Schemas.CreateVoiceProfileOutput>(
                "createVoiceProfile",
                Sdk.createVoiceProfile,
                Schemas.CreateVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Create WhatsApp shared line assignment
             *
             * Maps an end user's phone number onto one of the project's pooled shared WhatsApp lines, consuming a seat from the project's WhatsApp entitlement. The assigned number is allocated by the server. When an email address is supplied the user is sent an invite asynchronously; the response never reports whether that succeeded. Requires the platforms:write permission bound to the project resource in the path.
             */
            createWhatsappSharedLineAssignment: (input: Schemas.CreateWhatsappSharedLineAssignmentInput, options?: RequestOptions) => invokers.raw<Schemas.CreateWhatsappSharedLineAssignmentInput, Schemas.CreateWhatsappSharedLineAssignmentOutput>(
                "createWhatsappSharedLineAssignment",
                Sdk.createWhatsappSharedLineAssignment,
                Schemas.CreateWhatsappSharedLineAssignmentOutputSchemas,
                input,
                options,
            ),
            /**
             * Create WhatsApp VoIP sender
             *
             * Registers an active, SMS-capable Photon VoIP line on this project's connected WhatsApp Business Account. The account is resolved server-side; callers never select a WABA. The platform creates or reuses the Meta number, requests and consumes the SMS ownership code internally, verifies it, and registers the sender. displayName is optional; when omitted the project agent profile name is snapshotted before acceptance. The VoIP line remains a separate resource and never receives the whatsapp_business ability.
             */
            createWhatsappVoipSender: (input: Schemas.CreateWhatsappVoipSenderInput, options?: RequestOptions) => invokers.raw<Schemas.CreateWhatsappVoipSenderInput, Schemas.CreateWhatsappVoipSenderOutput>(
                "createWhatsappVoipSender",
                Sdk.createWhatsappVoipSender,
                Schemas.CreateWhatsappVoipSenderOutputSchemas,
                input,
                options,
            ),
            /**
             * Delete Voice profile
             *
             * Deletes an additional profile when expectedVersion matches. Assigned profiles require force=true, which atomically removes every stored override so affected lines follow the default. The default can never be deleted. Requires platforms:write bound to the path project.
             */
            deleteVoiceProfile: (input: Schemas.DeleteVoiceProfileInput, options?: RequestOptions) => invokers.raw<Schemas.DeleteVoiceProfileInput, Schemas.DeleteVoiceProfileOutput>(
                "deleteVoiceProfile",
                Sdk.deleteVoiceProfile,
                Schemas.DeleteVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Delete Voice inbound configuration
             *
             * Removes a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. The profile and its line assignments remain. Requires platforms:write bound to the path project.
             */
            deleteVoiceProfileInbound: (input: Schemas.DeleteVoiceProfileInboundInput, options?: RequestOptions) => invokers.raw<Schemas.DeleteVoiceProfileInboundInput, Schemas.DeleteVoiceProfileInboundOutput>(
                "deleteVoiceProfileInbound",
                Sdk.deleteVoiceProfileInbound,
                Schemas.DeleteVoiceProfileInboundOutputSchemas,
                input,
                options,
            ),
            /**
             * Revoke Voice outbound credential
             *
             * Revokes outbound calling for a profile when the shared profile version matches. The profileId may identify the default or an additional profile. The profile, inbound destination, and line assignments remain. Requires platforms:write bound to the path project.
             */
            deleteVoiceProfileOutbound: (input: Schemas.DeleteVoiceProfileOutboundInput, options?: RequestOptions) => invokers.raw<Schemas.DeleteVoiceProfileOutboundInput, Schemas.DeleteVoiceProfileOutboundOutput>(
                "deleteVoiceProfileOutbound",
                Sdk.deleteVoiceProfileOutbound,
                Schemas.DeleteVoiceProfileOutboundOutputSchemas,
                input,
                options,
            ),
            /**
             * Disconnect WhatsApp Business account
             *
             * Disconnects every attached WhatsApp sender, then unsubscribes our app and removes the project's business account connection. Photon VoIP lines and the numbers in Meta remain. Requires Idempotency-Key. Poll the returned operation; provider refusals appear as operation failures and retain the account for retry with a new key. New signups are blocked while disconnecting, and existing provisions must finish before this request can be accepted.
             */
            disconnectWhatsappBusinessAccount: (input: Schemas.DisconnectWhatsappBusinessAccountInput, options?: RequestOptions) => invokers.raw<Schemas.DisconnectWhatsappBusinessAccountInput, Schemas.DisconnectWhatsappBusinessAccountOutput>(
                "disconnectWhatsappBusinessAccount",
                Sdk.disconnectWhatsappBusinessAccount,
                Schemas.DisconnectWhatsappBusinessAccountOutputSchemas,
                input,
                options,
            ),
            /**
             * Get default Voice profile
             *
             * Gets the profile currently selected as the project default, including its optional inbound delivery state. Requires platforms:read bound to the path project.
             */
            getDefaultVoiceProfile: (input: Schemas.GetDefaultVoiceProfileInput, options?: RequestOptions) => invokers.raw<Schemas.GetDefaultVoiceProfileInput, Schemas.GetDefaultVoiceProfileOutput>(
                "getDefaultVoiceProfile",
                Sdk.getDefaultVoiceProfile,
                Schemas.GetDefaultVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Get project iMessage platform
             *
             * Reports whether the project is on shared or dedicated iMessage lines, derived from its billing entitlements. Shared mode carries the seat cap. Both say whether a dedicated line requested now would be assigned without waiting. Requires the platforms:read permission bound to the project resource in the path.
             */
            getImessage: (input: Schemas.GetProjectImessagePlatformInput, options?: RequestOptions) => invokers.raw<Schemas.GetProjectImessagePlatformInput, Schemas.GetProjectImessagePlatformOutput>(
                "getProjectImessagePlatform",
                Sdk.getProjectImessagePlatform,
                Schemas.GetProjectImessagePlatformOutputSchemas,
                input,
                options,
            ),
            /**
             * Get operation
             *
             * Reads one operation using the same operation representation as creation and list. The API includes detail.setupUrl only with platforms:write for this project. This is the polling endpoint every asynchronous request here points its Location at, and it resolves from the moment that request is accepted — an operation is committed before its work is dispatched, so there is no window in which the URL 404s. Poll until `state` is one of `succeeded`, `failed` or `cancelled`, pacing from the Retry-After the accepting response returned. While an email domain waits for DNS, `detail` always contains the manual records and may additionally contain `automaticSetup` with a signed provider URL to open separately. Once the operation has produced a resource, the response carries that resource too, so the poll that finishes is also the one that tells you what you got. `succeeded` means the work is done; billing runs behind it and is not something the caller waits on. Operations are never purged, so a 404 means the id was never this project's. Requires the platforms:read permission bound to the project resource in the path.
             */
            getOperation: (input: Schemas.GetOperationInput, options?: RequestOptions) => invokers.raw<Schemas.GetOperationInput, Schemas.GetOperationOutput>(
                "getOperation",
                Sdk.getOperation,
                Schemas.GetOperationOutputSchemas,
                input,
                options,
            ),
            /**
             * Get project WhatsApp platform
             *
             * Reports whether the project is on shared or dedicated WhatsApp lines, derived from its billing entitlements. Shared mode carries the seat cap. Both say whether a dedicated line requested now would be assigned without waiting. Requires the platforms:read permission bound to the project resource in the path.
             */
            getProjectWhatsappPlatform: (input: Schemas.GetProjectWhatsappPlatformInput, options?: RequestOptions) => invokers.raw<Schemas.GetProjectWhatsappPlatformInput, Schemas.GetProjectWhatsappPlatformOutput>(
                "getProjectWhatsappPlatform",
                Sdk.getProjectWhatsappPlatform,
                Schemas.GetProjectWhatsappPlatformOutputSchemas,
                input,
                options,
            ),
            /**
             * Get resource
             *
             * Reads one resource the project holds. A released number stays readable and reads `retired`, because it remains part of this project's history. A dedicated line given back does NOT: returning it to inventory is what makes it claimable by someone else, so it answers 404 and the operation that returned it is the record that this project once held it. Requires the platforms:read permission bound to the project resource in the path.
             */
            getResource: (input: Schemas.GetResourceInput, options?: RequestOptions) => invokers.raw<Schemas.GetResourceInput, Schemas.GetResourceOutput>(
                "getResource",
                Sdk.getResource,
                Schemas.GetResourceOutputSchemas,
                input,
                options,
            ),
            /**
             * Get SMS line campaign assignment
             *
             * Read the last confirmed campaign and current eligibility. Follow changes through their operations. Eligibility is a control-plane assessment, not a delivery or recipient-consent guarantee.
             */
            getSmsLineCampaignAssignment: (input: Schemas.GetSmsLineCampaignAssignmentInput, options?: RequestOptions) => invokers.raw<Schemas.GetSmsLineCampaignAssignmentInput, Schemas.GetSmsLineCampaignAssignmentOutput>(
                "getSmsLineCampaignAssignment",
                Sdk.getSmsLineCampaignAssignment,
                Schemas.GetSmsLineCampaignAssignmentOutputSchemas,
                input,
                options,
            ),
            /**
             * Get Voice line profile assignment
             *
             * Gets the explicit additional-profile override for an owned Voice-capable line. A line following the project default returns 200 without profileId. Requires platforms:read bound to the path project.
             */
            getVoiceLineProfileAssignment: (input: Schemas.GetVoiceLineProfileAssignmentInput, options?: RequestOptions) => invokers.raw<Schemas.GetVoiceLineProfileAssignmentInput, Schemas.GetVoiceLineProfileAssignmentOutput>(
                "getVoiceLineProfileAssignment",
                Sdk.getVoiceLineProfileAssignment,
                Schemas.GetVoiceLineProfileAssignmentOutputSchemas,
                input,
                options,
            ),
            /**
             * Get Voice profile
             *
             * Gets one reusable Voice profile, including its optional inbound delivery state. Requires platforms:read bound to the path project.
             */
            getVoiceProfile: (input: Schemas.GetVoiceProfileInput, options?: RequestOptions) => invokers.raw<Schemas.GetVoiceProfileInput, Schemas.GetVoiceProfileOutput>(
                "getVoiceProfile",
                Sdk.getVoiceProfile,
                Schemas.GetVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Get WhatsApp Business account
             *
             * Gets the one WhatsApp Business Account this project has connected, with its number of live senders. Senders are resources and are listed by GET /platforms/resources?ability=whatsapp_business. The account is not a resource and carries no access token. Meta's retained numbers are listed separately by GET /platforms/whatsapp-business/account/phone-numbers. `subscribedAt` is absent until our app is attached to the account's webhooks. Requires the platforms:read permission bound to the project resource in the path.
             */
            getWhatsappBusinessAccount: (input: Schemas.GetWhatsappBusinessAccountInput, options?: RequestOptions) => invokers.raw<Schemas.GetWhatsappBusinessAccountInput, Schemas.GetWhatsappBusinessAccountOutput>(
                "getWhatsappBusinessAccount",
                Sdk.getWhatsappBusinessAccount,
                Schemas.GetWhatsappBusinessAccountOutputSchemas,
                input,
                options,
            ),
            /**
             * Get WhatsApp Business verification code
             *
             * Returns the latest six-digit WhatsApp Business ownership code received by SMS for an active Photon VOIP number, but only when its provider timestamp is strictly newer than the required receivedAfter boundary. receivedAfter must be an RFC 3339 timestamp between this request's arrival time and two minutes before it; once it expires, restart Meta's verification flow with a new boundary. A missing newer code is a retryable 404 with Retry-After: 2. Poll after 2, 4, 8, then 10 seconds, applying ±20% jitter and capping later intervals at 10 seconds. Stop when the original boundary is two minutes old. Responses are never cached. Requires the platforms:write permission bound to the project resource in the path.
             */
            getWhatsappBusinessVerificationCode: (input: Schemas.GetWhatsappBusinessVerificationCodeInput, options?: RequestOptions) => invokers.raw<Schemas.GetWhatsappBusinessVerificationCodeInput, Schemas.GetWhatsappBusinessVerificationCodeOutput>(
                "getWhatsappBusinessVerificationCode",
                Sdk.getWhatsappBusinessVerificationCode,
                Schemas.GetWhatsappBusinessVerificationCodeOutputSchemas,
                input,
                options,
            ),
            /**
             * Get WhatsApp shared line assignment
             *
             * Reads one WhatsApp shared line assignment. Requires the platforms:read permission bound to the project resource in the path.
             */
            getWhatsappSharedLineAssignment: (input: Schemas.GetWhatsappSharedLineAssignmentInput, options?: RequestOptions) => invokers.raw<Schemas.GetWhatsappSharedLineAssignmentInput, Schemas.GetWhatsappSharedLineAssignmentOutput>(
                "getWhatsappSharedLineAssignment",
                Sdk.getWhatsappSharedLineAssignment,
                Schemas.GetWhatsappSharedLineAssignmentOutputSchemas,
                input,
                options,
            ),
            /**
             * Get WhatsApp signup config
             *
             * Returns what the browser needs to open Meta's Embedded Signup popup: the Facebook Login for Business configuration id, the Graph version to run against, and the scopes it will request. Answered in-process rather than forwarded, so the first step of onboarding survives an outage of the private service. Pass `configId` to `FB.login` as `config_id` with `response_type: 'code'` and `override_default_response_type: true`. Do NOT add a `featureType` — omitting it is what keeps the phone-number screen in the flow, and `only_waba_sharing` produces an account with no number that cannot be provisioned. Requires the platforms:read permission bound to the project resource in the path.
             */
            getWhatsappSignupConfig: (input: Schemas.GetWhatsappSignupConfigInput, options?: RequestOptions) => invokers.raw<Schemas.GetWhatsappSignupConfigInput, Schemas.GetWhatsappSignupConfigOutput>(
                "getWhatsappSignupConfig",
                Sdk.getWhatsappSignupConfig,
                Schemas.GetWhatsappSignupConfigOutputSchemas,
                input,
                options,
            ),
            /**
             * List filtered verification codes
             *
             * Lists the verification codes Photon kept from this project's dedicated lines and numbers. Inbound messages that carry a one-time code are filtered before delivery; this is the record that they arrived, so a quiet line can be told apart from a broken one. It records the receiving line, its platform and when the code arrived — never the code itself. Each entry names the dedicated line or number (`resourceId`) that received it. Newest first, within an optional inclusive `receivedAfter`/`receivedBefore` window. A page may hold fewer than `pageSize` entries and still return a `nextPageToken`; only its absence means the end. Filter by `platform`; to read one line, use its own filtered-otp path. Requires the platforms:read permission bound to the project resource in the path.
             */
            listFilteredVerificationCodes: (input: Schemas.ListFilteredVerificationCodesInput, options?: RequestOptions) => invokers.raw<Schemas.ListFilteredVerificationCodesInput, Schemas.ListFilteredVerificationCodesOutput>(
                "listFilteredVerificationCodes",
                Sdk.listFilteredVerificationCodes,
                Schemas.ListFilteredVerificationCodesOutputSchemas,
                input,
                options,
            ),
            /**
             * List number area codes
             *
             * Lists current provider coverage for US local numbers, sorted and deduplicated. Coverage does not guarantee inventory carrying every required feature. New area-specific purchases must use a listed code; accepted purchases keep waiting if coverage later changes. Requires platforms:read for the path project.
             */
            listNumberAreaCodes: (input: Schemas.ListNumberAreaCodesInput, options?: RequestOptions) => invokers.raw<Schemas.ListNumberAreaCodesInput, Schemas.ListNumberAreaCodesOutput>(
                "listNumberAreaCodes",
                Sdk.listNumberAreaCodes,
                Schemas.ListNumberAreaCodesOutputSchemas,
                input,
                options,
            ),
            /**
             * List number countries
             *
             * Lists supported purchase countries independently of current provider inventory. Requires platforms:read for the path project.
             */
            listNumberCountries: (input: Schemas.ListNumberCountriesInput, options?: RequestOptions) => invokers.raw<Schemas.ListNumberCountriesInput, Schemas.ListNumberCountriesOutput>(
                "listNumberCountries",
                Sdk.listNumberCountries,
                Schemas.ListNumberCountriesOutputSchemas,
                input,
                options,
            ),
            /**
             * List operations
             *
             * Lists the project's operations using the same operation representation as creation and GET. The API includes detail.setupUrl only with platforms:write for this project. Results are oldest first — every provision and release it has ever asked for, including the ones still running. This is the entire in-flight view: a resource only appears once it is real, so nothing half-built shows up in the resource list and nothing in flight is missing from this one. Filter by `resourceId` to get one resource's whole history, which for a pooled line is every tenure this project has had on it. `state` is comma-separated; `type` accepts one operation type and an absent filter means everything, including failed and cancelled operations. `endedAfter` keeps only operations that finished after that instant, so what failed or was withdrawn recently is one short page. Requires the platforms:read permission bound to the project resource in the path.
             */
            listOperations: (input: Schemas.ListOperationsInput, options?: RequestOptions) => invokers.raw<Schemas.ListOperationsInput, Schemas.ListOperationsOutput>(
                "listOperations",
                Sdk.listOperations,
                Schemas.ListOperationsOutputSchemas,
                input,
                options,
            ),
            /**
             * List project platforms
             *
             * Lists the platform types available to this project. Every project currently sees the same fixed public contract, answered in-process rather than forwarded, so the list survives an outage of the private service. The project binding exists so that answer can narrow per project without moving the route. Requires the platforms:read permission bound to the project resource in the path.
             */
            listProjectPlatforms: (input: Schemas.ListProjectPlatformsInput, options?: RequestOptions) => invokers.raw<Schemas.ListProjectPlatformsInput, Schemas.ListProjectPlatformsOutput>(
                "listProjectPlatforms",
                Sdk.listProjectPlatforms,
                Schemas.ListProjectPlatformsOutputSchemas,
                input,
                options,
            ),
            /**
             * List a line's filtered verification codes
             *
             * Lists the verification codes Photon kept from one dedicated line or number. Inbound messages that carry a one-time code are filtered before delivery; this is the record that they arrived, so a quiet line can be told apart from a broken one. It records the receiving line, its platform and when the code arrived — never the code itself. Each entry names the dedicated line or number (`resourceId`) that received it. Newest first, within an optional inclusive `receivedAfter`/`receivedBefore` window. A page may hold fewer than `pageSize` entries and still return a `nextPageToken`; only its absence means the end. Answers 404 unless the project holds the resource now. Codes from an earlier tenure stay in the project-wide list. Filter by `platform` — a number receives both SMS and WhatsApp. Requires the platforms:read permission bound to the project resource in the path.
             */
            listResourceFilteredVerificationCodes: (input: Schemas.ListResourceFilteredVerificationCodesInput, options?: RequestOptions) => invokers.raw<Schemas.ListResourceFilteredVerificationCodesInput, Schemas.ListResourceFilteredVerificationCodesOutput>(
                "listResourceFilteredVerificationCodes",
                Sdk.listResourceFilteredVerificationCodes,
                Schemas.ListResourceFilteredVerificationCodesOutputSchemas,
                input,
                options,
            ),
            /**
             * List resources
             *
             * Lists everything the project holds, oldest first, whatever kind of thing it is — one endpoint and one id shape for numbers, dedicated lines and whatever ships next. Nothing half-built appears here: a resource exists only once it is real, so anything still being provisioned is an operation rather than a resource with a pending flag. Filter by `type`, by `ability` (which matches only abilities that are currently enabled), and by `state` — comma-separated, and absent means every state, including retired ones. `detail` carries a per-type public view: an SMS number's number, a dedicated line's number and its per-capability health (`imessageHealth`, `whatsappHealth`, each with an `overallStatus` of `available`, `degraded`, `unavailable` or `unknown`; `imessageHealth` also carries `account`, `photonSystemComponents`, `newConversations`, `sms` and `mms`, each a `status` with the `cause` that decided it: `account`, `photonSystemComponents`, or null for the item's own state). Requires the platforms:read permission bound to the project resource in the path.
             */
            listResources: (input: Schemas.ListResourcesInput, options?: RequestOptions) => invokers.raw<Schemas.ListResourcesInput, Schemas.ListResourcesOutput>(
                "listResources",
                Sdk.listResources,
                Schemas.ListResourcesOutputSchemas,
                input,
                options,
            ),
            /**
             * List Voice profiles
             *
             * Lists reusable Voice profiles in this project. Requires platforms:read bound to the path project.
             */
            listVoiceProfiles: (input: Schemas.ListVoiceProfilesInput, options?: RequestOptions) => invokers.raw<Schemas.ListVoiceProfilesInput, Schemas.ListVoiceProfilesOutput>(
                "listVoiceProfiles",
                Sdk.listVoiceProfiles,
                Schemas.ListVoiceProfilesOutputSchemas,
                input,
                options,
            ),
            /**
             * List WhatsApp account phone numbers
             *
             * Lists the connected WABA's phone numbers directly from Meta, including numbers whose Photon sender was disconnected. Ownership is photon for a number in this project's current Photon inventory and meta otherwise. Match a Photon SMS number by its E.164 phoneNumber and reuse its existing displayName when reconnecting. A null name is unavailable, not permission to choose a new name. A failed lookup returns an error rather than an empty list. Requires platforms:read on the path project.
             */
            listWhatsappAccountPhoneNumbers: (input: Schemas.ListWhatsappAccountPhoneNumbersInput, options?: RequestOptions) => invokers.raw<Schemas.ListWhatsappAccountPhoneNumbersInput, Schemas.ListWhatsappAccountPhoneNumbersOutput>(
                "listWhatsappAccountPhoneNumbers",
                Sdk.listWhatsappAccountPhoneNumbers,
                Schemas.ListWhatsappAccountPhoneNumbersOutputSchemas,
                input,
                options,
            ),
            /**
             * List WhatsApp shared line assignments
             *
             * Lists the project's WhatsApp shared line assignments, oldest first. Released assignments are excluded unless includeReleased is set. Requires the platforms:read permission bound to the project resource in the path.
             */
            listWhatsappSharedLineAssignments: (input: Schemas.ListWhatsappSharedLineAssignmentsInput, options?: RequestOptions) => invokers.raw<Schemas.ListWhatsappSharedLineAssignmentsInput, Schemas.ListWhatsappSharedLineAssignmentsOutput>(
                "listWhatsappSharedLineAssignments",
                Sdk.listWhatsappSharedLineAssignments,
                Schemas.ListWhatsappSharedLineAssignmentsOutputSchemas,
                input,
                options,
            ),
            /**
             * Provision dedicated iMessage line
             *
             * Claims one dedicated iMessage line for the project and enables iMessage on it. Always answers 202 with an operation: dedicated lines are allocated from available capacity, and unavailable capacity causes a wait rather than a failure — this can legitimately stay `running` for hours, which is exactly why the response is a handle to poll rather than a number. The project's messaging subscription must grant the dedicated iMessage lines entitlement (`imessage_dedicated_lines.can_purchase`), and that is checked before capacity is reserved. The line's own charge starts when a line is claimed; the subscription that grants the entitlement bills on its own terms, which cancelling a request does not change. Waiting requests are served first come, first served. One that is still waiting is cancelled with a `reason` if the project is deleted (`project_deleted`) or its plan stops selling dedicated lines (`entitlement_lost`); while the payer is restricted for overdue payment it keeps waiting. If you no longer want to wait, POST to the operation's cancel endpoint, which charges nothing for the line. The Idempotency-Key is required and permanent: repeating it returns the same operation forever. A further line always needs a NEW key, including while others are still waiting. Requires the platforms:write permission bound to the project resource in the path.
             */
            provisionImessageDedicatedLine: (input: Schemas.ProvisionImessageDedicatedLineInput, options?: RequestOptions) => invokers.raw<Schemas.ProvisionImessageDedicatedLineInput, Schemas.ProvisionImessageDedicatedLineOutput>(
                "provisionImessageDedicatedLine",
                Sdk.provisionImessageDedicatedLine,
                Schemas.ProvisionImessageDedicatedLineOutputSchemas,
                input,
                options,
            ),
            /**
             * Provision dedicated WhatsApp line
             *
             * Provisions one dedicated WhatsApp line with WhatsApp and shared Voice enabled. It attaches to an eligible iMessage line the project already owns when possible so both products keep the same number; otherwise it claims healthy, available WhatsApp-capable dedicated-line inventory. Always answers 202, because waiting when no inventory is available is not a failure. The product opens its own charge period after the abilities are enabled; Voice has no separate charge. Waiting requests are served first come, first served, and are cancelled with a `reason` exactly as for a dedicated iMessage line. Cancel the returned operation to stop waiting. The Idempotency-Key is required and permanent.
             */
            provisionWhatsappDedicatedLine: (input: Schemas.ProvisionWhatsappDedicatedLineInput, options?: RequestOptions) => invokers.raw<Schemas.ProvisionWhatsappDedicatedLineInput, Schemas.ProvisionWhatsappDedicatedLineOutput>(
                "provisionWhatsappDedicatedLine",
                Sdk.provisionWhatsappDedicatedLine,
                Schemas.ProvisionWhatsappDedicatedLineOutputSchemas,
                input,
                options,
            ),
            /**
             * Purchase SMS number
             *
             * Buys one US local number from the provider and records it as a resource with SMS enabled. Requires countryCode (US) and accepts an optional three-digit geographic areaCode. The server selects an exact matching number. Empty inventory keeps the operation running until a number is available or the caller cancels before ordering begins. Always answers 202 with an operation: the work runs behind the response, and the Location points at the operation to poll. New area-specific requests must appear in current provider coverage; discover it with GET /sms/numbers/area-codes?countryCode=US. Coverage and subscription checks run before operation creation. Billing follows delivery. Replays return the original operation without checking current coverage. The Idempotency-Key is required and permanent: repeating it returns the same operation forever, never a second number. A further number always needs a NEW key, including while others are still running. Requires the platforms:write permission bound to the project resource in the path.
             */
            purchaseSmsNumber: (input: Schemas.PurchaseSmsNumberInput, options?: RequestOptions) => invokers.raw<Schemas.PurchaseSmsNumberInput, Schemas.PurchaseSmsNumberOutput>(
                "purchaseSmsNumber",
                Sdk.purchaseSmsNumber,
                Schemas.PurchaseSmsNumberOutputSchemas,
                input,
                options,
            ),
            /**
             * Release dedicated iMessage line
             *
             * Removes only iMessage from one dedicated line. Shared Voice is removed only when WhatsApp is absent; if WhatsApp remains, Voice, the resource, ownership, and phone number are preserved. Usually finishes inside this request and answers 200; a slow workflow answers 202 with an operation to poll. Takes no Idempotency-Key because the open iMessage charge period identifies this product tenure.
             */
            releaseImessageDedicatedLine: (input: Schemas.ReleaseImessageDedicatedLineInput, options?: RequestOptions) => invokers.raw<Schemas.ReleaseImessageDedicatedLineInput, Schemas.ReleaseImessageDedicatedLineOutput>(
                "releaseImessageDedicatedLine",
                Sdk.releaseImessageDedicatedLine,
                Schemas.ReleaseImessageDedicatedLineOutputSchemas,
                input,
                options,
            ),
            /**
             * Release resource
             *
             * Gives one resource back, whatever it is. What that means is the resource's own business: an SMS number goes back to the provider and is retired, a dedicated iMessage line goes back to the shared pool and stays in existence for someone else to claim. Either way the provider is contacted first where there is one, then a single transaction disables every ability, ends the project's hold and closes the charge period — so a provider that refuses leaves the resource exactly as it was, still owned and still billed. Usually finishes inside this request and answers 200; if the provider is slow it answers 202 and the Location points at the operation to poll. The decrement runs behind the answer either way, so the resource is gone when you are told it is. Takes no Idempotency-Key — releasing the same resource twice is the same request. Releasing one that is already gone answers 404. Requires the platforms:write permission bound to the project resource in the path.
             */
            releaseResource: (input: Schemas.ReleaseResourceInput, options?: RequestOptions) => invokers.raw<Schemas.ReleaseResourceInput, Schemas.ReleaseResourceOutput>(
                "releaseResource",
                Sdk.releaseResource,
                Schemas.ReleaseResourceOutputSchemas,
                input,
                options,
            ),
            /**
             * Release dedicated WhatsApp line
             *
             * Removes only WhatsApp from one dedicated line. Shared Voice is removed only when iMessage is absent; if iMessage remains, Voice, the resource, ownership, and phone number are preserved. Usually finishes inside this request and answers 200; a slow workflow answers 202 with an operation to poll. Takes no Idempotency-Key because the open WhatsApp charge period identifies this product tenure.
             */
            releaseWhatsappDedicatedLine: (input: Schemas.ReleaseWhatsappDedicatedLineInput, options?: RequestOptions) => invokers.raw<Schemas.ReleaseWhatsappDedicatedLineInput, Schemas.ReleaseWhatsappDedicatedLineOutput>(
                "releaseWhatsappDedicatedLine",
                Sdk.releaseWhatsappDedicatedLine,
                Schemas.ReleaseWhatsappDedicatedLineOutputSchemas,
                input,
                options,
            ),
            /**
             * Release WhatsApp shared line assignment
             *
             * Releases a WhatsApp shared line assignment, freeing its seat for reassignment. The row is retained for audit and returned with releasedAt set, so repeating the call is safe. Requires the platforms:write permission bound to the project resource in the path.
             */
            releaseWhatsappSharedLineAssignment: (input: Schemas.ReleaseWhatsappSharedLineAssignmentInput, options?: RequestOptions) => invokers.raw<Schemas.ReleaseWhatsappSharedLineAssignmentInput, Schemas.ReleaseWhatsappSharedLineAssignmentOutput>(
                "releaseWhatsappSharedLineAssignment",
                Sdk.releaseWhatsappSharedLineAssignment,
                Schemas.ReleaseWhatsappSharedLineAssignmentOutputSchemas,
                input,
                options,
            ),
            /**
             * Replace Voice inbound configuration
             *
             * Creates or fully replaces a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. Credentials are required and nullable; null removes destination authentication. Requires platforms:write bound to the path project.
             */
            replaceVoiceProfileInbound: (input: Schemas.ReplaceVoiceProfileInboundInput, options?: RequestOptions) => invokers.raw<Schemas.ReplaceVoiceProfileInboundInput, Schemas.ReplaceVoiceProfileInboundOutput>(
                "replaceVoiceProfileInbound",
                Sdk.replaceVoiceProfileInbound,
                Schemas.ReplaceVoiceProfileInboundOutputSchemas,
                input,
                options,
            ),
            /**
             * Rotate Voice outbound credential
             *
             * Rotates a SIP profile's outbound credential when expectedVersion matches. The profileId may identify the default or an additional profile. Normal rotation gives the previous credential one hour of grace; emergency rotation gives none. The new password is returned once and is never recoverable. Requires platforms:write bound to the path project.
             */
            rotateVoiceProfileOutboundCredential: (input: Schemas.RotateVoiceProfileOutboundCredentialInput, options?: RequestOptions) => invokers.raw<Schemas.RotateVoiceProfileOutboundCredentialInput, Schemas.RotateVoiceProfileOutboundCredentialOutput>(
                "rotateVoiceProfileOutboundCredential",
                Sdk.rotateVoiceProfileOutboundCredential,
                Schemas.RotateVoiceProfileOutboundCredentialOutputSchemas,
                input,
                options,
            ),
            /**
             * Unassign SMS line campaign
             *
             * Any project writer, including a scoped API key, may detach the campaign. The number and campaign remain owned. Requires a permanent Idempotency-Key and expectedVersion. Local eligibility is blocked immediately; provider detachment runs asynchronously.
             */
            unassignSmsLineCampaign: (input: Schemas.UnassignSmsLineCampaignInput, options?: RequestOptions) => invokers.raw<Schemas.UnassignSmsLineCampaignInput, Schemas.UnassignSmsLineCampaignOutput>(
                "unassignSmsLineCampaign",
                Sdk.unassignSmsLineCampaign,
                Schemas.UnassignSmsLineCampaignOutputSchemas,
                input,
                options,
            ),
            /**
             * Unassign Voice line profile
             *
             * Removes a line's explicit override when the resource version matches so the line follows the project default. Profiles and the pstn_voice ability are unchanged. Requires platforms:write bound to the path project.
             */
            unassignVoiceLineProfile: (input: Schemas.UnassignVoiceLineProfileInput, options?: RequestOptions) => invokers.raw<Schemas.UnassignVoiceLineProfileInput, Schemas.UnassignVoiceLineProfileOutput>(
                "unassignVoiceLineProfile",
                Sdk.unassignVoiceLineProfile,
                Schemas.UnassignVoiceLineProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Update default Voice profile
             *
             * Patches the default profile's protocol or mediaEncryption when expectedVersion matches. Omitted fields are preserved. Its server-assigned name is immutable, and directional configuration uses the profileId returned by this resource. Requires platforms:write bound to the path project.
             */
            updateDefaultVoiceProfile: (input: Schemas.UpdateDefaultVoiceProfileInput, options?: RequestOptions) => invokers.raw<Schemas.UpdateDefaultVoiceProfileInput, Schemas.UpdateDefaultVoiceProfileOutput>(
                "updateDefaultVoiceProfile",
                Sdk.updateDefaultVoiceProfile,
                Schemas.UpdateDefaultVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Update Voice profile
             *
             * Patches an additional profile's name, protocol, or mediaEncryption when expectedVersion matches. Omitted fields are preserved. Directional configuration is managed through the profile's inbound and outbound endpoints. Requires platforms:write bound to the path project.
             */
            updateVoiceProfile: (input: Schemas.UpdateVoiceProfileInput, options?: RequestOptions) => invokers.raw<Schemas.UpdateVoiceProfileInput, Schemas.UpdateVoiceProfileOutput>(
                "updateVoiceProfile",
                Sdk.updateVoiceProfile,
                Schemas.UpdateVoiceProfileOutputSchemas,
                input,
                options,
            ),
            /**
             * Update Voice inbound configuration
             *
             * Updates selected fields of a profile's inbound destination when the shared profile version matches. The profileId may identify the default or an additional profile. At least one of destinationUri or credentials is required. Credential omission preserves destination authentication, null removes it, and an object replaces it atomically. Requires platforms:write bound to the path project.
             */
            updateVoiceProfileInbound: (input: Schemas.UpdateVoiceProfileInboundInput, options?: RequestOptions) => invokers.raw<Schemas.UpdateVoiceProfileInboundInput, Schemas.UpdateVoiceProfileInboundOutput>(
                "updateVoiceProfileInbound",
                Sdk.updateVoiceProfileInbound,
                Schemas.UpdateVoiceProfileInboundOutputSchemas,
                input,
                options,
            ),
            /**
             * Update Voice outbound authentication
             *
             * Changes a SIP profile's outbound Digest algorithm when expectedVersion matches. The profileId may identify the default or an additional profile. This policy-only change preserves the password, username, and any previous-password grace deadline. SHA-256 is recommended; MD5 is a weaker legacy option. Returns non-secret outbound metadata and the profile version. Requires platforms:write bound to the path project.
             */
            updateVoiceProfileOutboundAuthentication: (input: Schemas.UpdateVoiceProfileOutboundAuthenticationInput, options?: RequestOptions) => invokers.raw<Schemas.UpdateVoiceProfileOutboundAuthenticationInput, Schemas.UpdateVoiceProfileOutboundAuthenticationOutput>(
                "updateVoiceProfileOutboundAuthentication",
                Sdk.updateVoiceProfileOutboundAuthentication,
                Schemas.UpdateVoiceProfileOutboundAuthenticationOutputSchemas,
                input,
                options,
            ),
        },
        /**
         * Create project API key
         *
         * Creates a key bound to the selected project using the supplied name, permissions and optional expiry. The secret is returned only in this response and in idempotent replays of it; store it securely because other reads never return it. The key is scoped to this project and does not grant account-level access. Supply the required Idempotency-Key header.
         */
        createProjectApiKey: (input: Schemas.CreateProjectApiKeyInput, options?: RequestOptions) => invokers.raw<Schemas.CreateProjectApiKeyInput, Schemas.CreateProjectApiKeyOutput>(
            "createProjectApiKey",
            Sdk.createProjectApiKey,
            Schemas.CreateProjectApiKeyOutputSchemas,
            input,
            options,
        ),
        /**
         * Create webhook destination
         *
         * Creates a webhook destination for the selected project using its URL, payload API version, event selection and other documented settings. The response includes the signing secret, which is returned only in this response and in idempotent replays of it, never by destination reads; store it securely for signature verification. The API version must be selectable and selected event types must belong to that version's catalog. Supply the required Idempotency-Key header.
         */
        createWebhookDestination: (input: Schemas.CreateWebhookDestinationInput, options?: RequestOptions) => invokers.raw<Schemas.CreateWebhookDestinationInput, Schemas.CreateWebhookDestinationOutput>(
            "createWebhookDestination",
            Sdk.createWebhookDestination,
            Schemas.CreateWebhookDestinationOutputSchemas,
            input,
            options,
        ),
        /**
         * Delete project
         *
         * Starts deletion of the identified project using a credential authorized for project management. Inspect the documented response and use getProjectClosureStatus with the organization and project identifiers to read closure progress. A project API key is not an accepted credential for this operation.
         */
        delete: (input: Schemas.DeleteProjectInput, options?: RequestOptions) => invokers.raw<Schemas.DeleteProjectInput, Schemas.DeleteProjectOutput>(
            "deleteProject",
            Sdk.deleteProject,
            Schemas.DeleteProjectOutputSchemas,
            input,
            options,
        ),
        /**
         * Delete webhook destination
         *
         * Deletes the selected project's destination and returns its stable tombstone. Repeated deletion returns the deletion representation. This operation removes the destination configuration; it is separate from disabling a destination through an update.
         */
        deleteWebhookDestination: (input: Schemas.DeleteWebhookDestinationInput, options?: RequestOptions) => invokers.raw<Schemas.DeleteWebhookDestinationInput, Schemas.DeleteWebhookDestinationOutput>(
            "deleteWebhookDestination",
            Sdk.deleteWebhookDestination,
            Schemas.DeleteWebhookDestinationOutputSchemas,
            input,
            options,
        ),
        /**
         * Download attachment
         *
         * Downloads an Attachment's bytes. If unavailable after ten seconds, returns ATTACHMENT_NOT_READY with Retry-After: 5.
         */
        downloadAttachment: (input: Schemas.DownloadAttachmentInput, options?: RequestOptions) => invokers.raw<Schemas.DownloadAttachmentInput, Schemas.DownloadAttachmentOutput>(
            "downloadAttachment",
            Sdk.downloadAttachment,
            Schemas.DownloadAttachmentOutputSchemas,
            input,
            options,
        ),
        /**
         * Get project
         *
         * Returns the identified project's settings for an authorized caller. The credential must be allowed to access that project; possession of an unrelated project's key does not provide access. Missing and deleted projects are reported through the documented error responses.
         */
        get: (input: Schemas.GetProjectInput, options?: RequestOptions) => invokers.raw<Schemas.GetProjectInput, Schemas.GetProjectOutput>(
            "getProject",
            Sdk.getProject,
            Schemas.GetProjectOutputSchemas,
            input,
            options,
        ),
        /**
         * Get attachment
         *
         * Returns an Attachment's metadata. Use the content endpoint to download its bytes.
         */
        getAttachment: (input: Schemas.GetAttachmentInput, options?: RequestOptions) => invokers.raw<Schemas.GetAttachmentInput, Schemas.GetAttachmentOutput>(
            "getAttachment",
            Sdk.getAttachment,
            Schemas.GetAttachmentOutputSchemas,
            input,
            options,
        ),
        /**
         * Get metrics backfill status
         *
         * Returns historical metrics update progress. Completion reflects lastVerifiedAt; queries remain available during updates.
         */
        getMessageMetricsBackfill: (input: Schemas.GetMessageMetricsBackfillInput, options?: RequestOptions) => invokers.raw<Schemas.GetMessageMetricsBackfillInput, Schemas.GetMessageMetricsBackfillOutput>(
            "getMessageMetricsBackfill",
            Sdk.getMessageMetricsBackfill,
            Schemas.GetMessageMetricsBackfillOutputSchemas,
            input,
            options,
        ),
        /**
         * Get metrics SQL schema
         *
         * Returns the message_events and call_events SQL schema, supported queries, and limits for the selected API version.
         */
        getMessageMetricsSqlSchema: (input: Schemas.GetMessageMetricsSqlSchemaInput, options?: RequestOptions) => invokers.raw<Schemas.GetMessageMetricsSqlSchemaInput, Schemas.GetMessageMetricsSqlSchemaOutput>(
            "getMessageMetricsSqlSchema",
            Sdk.getMessageMetricsSqlSchema,
            Schemas.GetMessageMetricsSqlSchemaOutputSchemas,
            input,
            options,
        ),
        /**
         * Get webhook destination
         *
         * Returns the configuration of one webhook destination belonging to the selected project. Missing or deleted destinations are reported as errors. This read does not disclose the signing secret returned when the destination or a secret rotation was created.
         */
        getWebhookDestination: (input: Schemas.GetWebhookDestinationInput, options?: RequestOptions) => invokers.raw<Schemas.GetWebhookDestinationInput, Schemas.GetWebhookDestinationOutput>(
            "getWebhookDestination",
            Sdk.getWebhookDestination,
            Schemas.GetWebhookDestinationOutputSchemas,
            input,
            options,
        ),
        /**
         * Get webhook event schema
         *
         * Returns the published reader JSON Schema for eventType in the requested webhook apiVersion. Use it to interpret events for that exact payload version. The response media type is application/schema+json; an authorized conditional request may return 304 without a body. Unsupported event/version combinations are rejected.
         */
        getWebhookEventSchema: (input: Schemas.GetWebhookEventSchemaInput, options?: RequestOptions) => invokers.raw<Schemas.GetWebhookEventSchemaInput, Schemas.GetWebhookEventSchemaOutput>(
            "getWebhookEventSchema",
            Sdk.getWebhookEventSchema,
            Schemas.GetWebhookEventSchemaOutputSchemas,
            input,
            options,
        ),
        /**
         * List attachments
         *
         * Lists the Project's Attachment metadata, with optional time filters.
         */
        listAttachments: (input: Schemas.ListAttachmentsInput, options?: RequestOptions) => invokers.raw<Schemas.ListAttachmentsInput, Schemas.ListAttachmentsOutput>(
            "listAttachments",
            Sdk.listAttachments,
            Schemas.ListAttachmentsOutputSchemas,
            input,
            options,
        ),
        /**
         * List project API keys
         *
         * Lists the API keys on the selected project, ordered newest first. Revoked keys are not listed; expired keys stay listed until they are revoked. Entries contain key metadata and permissions, never secret values. Use the returned identifiers to manage an existing key; lost secrets cannot be recovered through this operation.
         */
        listProjectApiKeys: (input: Schemas.ListProjectApiKeysInput, options?: RequestOptions) => invokers.raw<Schemas.ListProjectApiKeysInput, Schemas.ListProjectApiKeysOutput>(
            "listProjectApiKeys",
            Sdk.listProjectApiKeys,
            Schemas.ListProjectApiKeysOutputSchemas,
            input,
            options,
        ),
        /**
         * List webhook API versions
         *
         * Lists the published webhook payload API versions and their lifecycle metadata. The list is the same for every project. Use the selectable indicator when choosing a version for a destination. These payload dates are separate from SDK package versions. An authorized conditional request may return 304 without a response body.
         */
        listWebhookApiVersions: (input: Schemas.ListWebhookApiVersionsInput, options?: RequestOptions) => invokers.raw<Schemas.ListWebhookApiVersionsInput, Schemas.ListWebhookApiVersionsOutput>(
            "listWebhookApiVersions",
            Sdk.listWebhookApiVersions,
            Schemas.ListWebhookApiVersionsOutputSchemas,
            input,
            options,
        ),
        /**
         * List webhook destinations
         *
         * Returns a cursor-paginated page of active webhook destinations configured for the selected project. Use pageSize and pageToken to navigate it. The listing returns destination configuration, never signing secrets.
         */
        listWebhookDestinations: (input: Schemas.ListWebhookDestinationsInput, options?: RequestOptions) => invokers.raw<Schemas.ListWebhookDestinationsInput, Schemas.ListWebhookDestinationsOutput>(
            "listWebhookDestinations",
            Sdk.listWebhookDestinations,
            Schemas.ListWebhookDestinationsOutputSchemas,
            input,
            options,
        ),
        /**
         * List webhook egress addresses
         *
         * Returns the public network addresses from which this environment sends webhook deliveries. Use this information when configuring the receiving system's network allowlist. The result is environment-specific and does not describe the API service's ingress addresses.
         */
        listWebhookEgressAddresses: (input: Schemas.ListWebhookEgressAddressesInput, options?: RequestOptions) => invokers.raw<Schemas.ListWebhookEgressAddressesInput, Schemas.ListWebhookEgressAddressesOutput>(
            "listWebhookEgressAddresses",
            Sdk.listWebhookEgressAddresses,
            Schemas.ListWebhookEgressAddressesOutputSchemas,
            input,
            options,
        ),
        /**
         * List webhook event types
         *
         * Lists the webhook event types available in the requested apiVersion, including their descriptions, audiences and reader-schema URLs. Use this versioned catalog when selecting a destination's enabledEvents. The response may include version-retirement information; an authorized conditional request can return 304 without a body.
         */
        listWebhookEventTypes: (input: Schemas.ListWebhookEventTypesInput, options?: RequestOptions) => invokers.raw<Schemas.ListWebhookEventTypesInput, Schemas.ListWebhookEventTypesOutput>(
            "listWebhookEventTypes",
            Sdk.listWebhookEventTypes,
            Schemas.ListWebhookEventTypesOutputSchemas,
            input,
            options,
        ),
        /**
         * Query metrics
         *
         * Runs read-only SQL over the Project's message_events or call_events table. Get the SQL schema for supported columns, capabilities, and limits.
         */
        queryMessageMetrics: (input: Schemas.QueryMessageMetricsInput, options?: RequestOptions) => invokers.raw<Schemas.QueryMessageMetricsInput, Schemas.QueryMessageMetricsOutput>(
            "queryMessageMetrics",
            Sdk.queryMessageMetrics,
            Schemas.QueryMessageMetricsOutputSchemas,
            input,
            options,
        ),
        /**
         * Retry webhook delivery
         *
         * Requests an immediate attempt of the selected delivery if it is still the waiting head for its destination and event type. expectedAttemptCount is the failed-attempt counter recorded on the delivery and fences stale requests. This overrides the current backoff, including Retry-After, once. It preserves event identity and the retry budget. Delivered, active, disabled and dead-lettered deliveries cannot be retried. A 202 acknowledges the wake-up, not successful delivery. Supply an Idempotency-Key and retain it when retrying an ambiguous failure.
         */
        retryWebhookDelivery: (input: Schemas.RetryWebhookDeliveryInput, options?: RequestOptions) => invokers.raw<Schemas.RetryWebhookDeliveryInput, Schemas.RetryWebhookDeliveryOutput>(
            "retryWebhookDelivery",
            Sdk.retryWebhookDelivery,
            Schemas.RetryWebhookDeliveryOutputSchemas,
            input,
            options,
        ),
        /**
         * Revoke project API key
         *
         * Revokes the identified key on the selected project and returns its revoked metadata. Repeating the deletion returns the same revokedAt value. This operation does not rotate the key or return a replacement secret. Supply the required Idempotency-Key header.
         */
        revokeProjectApiKey: (input: Schemas.RevokeProjectApiKeyInput, options?: RequestOptions) => invokers.raw<Schemas.RevokeProjectApiKeyInput, Schemas.RevokeProjectApiKeyOutput>(
            "revokeProjectApiKey",
            Sdk.revokeProjectApiKey,
            Schemas.RevokeProjectApiKeyOutputSchemas,
            input,
            options,
        ),
        /**
         * Rotate webhook signing secret
         *
         * Rotates the signing secret for the selected project's webhook destination and returns the new secret. The optional overlapSeconds controls the requested overlap with the previous secret according to the documented request constraints. Store the new secret securely and update the receiver's signature verification configuration; it is returned only in this response and in idempotent replays of it, never by destination reads. Supply the required Idempotency-Key header.
         */
        rotateWebhookSigningSecret: (input: Schemas.RotateWebhookSigningSecretInput, options?: RequestOptions) => invokers.raw<Schemas.RotateWebhookSigningSecretInput, Schemas.RotateWebhookSigningSecretOutput>(
            "rotateWebhookSigningSecret",
            Sdk.rotateWebhookSigningSecret,
            Schemas.RotateWebhookSigningSecretOutputSchemas,
            input,
            options,
        ),
        /**
         * Update project
         *
         * Updates the identified project's name and returns the updated project. The project slug is not a mutable field in this request. Use an authorized account or organization service-identity credential; a project API key is not accepted. Supply the required Idempotency-Key header.
         */
        update: (input: Schemas.UpdateProjectInput, options?: RequestOptions) => invokers.raw<Schemas.UpdateProjectInput, Schemas.UpdateProjectOutput>(
            "updateProject",
            Sdk.updateProject,
            Schemas.UpdateProjectOutputSchemas,
            input,
            options,
        ),
        /**
         * Update project API key permissions
         *
         * Replaces the identified project key's permission list with the supplied permissions and returns the updated metadata. Sending the permission list the key already has leaves it unchanged. This request does not create a new secret or change the key's project binding. Supply the required Idempotency-Key header.
         */
        updateProjectApiKey: (input: Schemas.UpdateProjectApiKeyInput, options?: RequestOptions) => invokers.raw<Schemas.UpdateProjectApiKeyInput, Schemas.UpdateProjectApiKeyOutput>(
            "updateProjectApiKey",
            Sdk.updateProjectApiKey,
            Schemas.UpdateProjectApiKeyOutputSchemas,
            input,
            options,
        ),
        /**
         * Update webhook destination
         *
         * Updates the supplied URL, name, description, status or enabledEvents fields on a project's webhook destination and returns its updated configuration. The payload API version is not a mutable field in this request. Event selections are checked against the destination's versioned catalog; signing-secret rotation is a separate operation. Supply the required Idempotency-Key header.
         */
        updateWebhookDestination: (input: Schemas.UpdateWebhookDestinationInput, options?: RequestOptions) => invokers.raw<Schemas.UpdateWebhookDestinationInput, Schemas.UpdateWebhookDestinationOutput>(
            "updateWebhookDestination",
            Sdk.updateWebhookDestination,
            Schemas.UpdateWebhookDestinationOutputSchemas,
            input,
            options,
        ),
        /**
         * Upload attachment
         *
         * Uploads a file and returns its Attachment once ready to download.
         */
        uploadAttachment: (input: Schemas.UploadAttachmentInput, options?: RequestOptions) => invokers.raw<Schemas.UploadAttachmentInput, Schemas.UploadAttachmentOutput>(
            "uploadAttachment",
            Sdk.uploadAttachment,
            Schemas.UploadAttachmentOutputSchemas,
            input,
            options,
        ),
    },
    system: {
        /**
         * Request app installation
         *
         * Authenticates a registered app backend using a short-lived signed client assertion. Creates request metadata only; customer approval is still required.
         */
        createAppInstallationRequest: (input: Schemas.CreateAppInstallationRequestInput, options?: RequestOptions) => invokers.raw<Schemas.CreateAppInstallationRequestInput, Schemas.CreateAppInstallationRequestOutput>(
            "createAppInstallationRequest",
            Sdk.createAppInstallationRequest,
            Schemas.CreateAppInstallationRequestOutputSchemas,
            input,
            options,
        ),
        /**
         * Redeem installation credential
         *
         * The registered app backend authenticates with a signed client assertion and a single-use code. Plaintext is returned only once; retries return status and never create another credential.
         */
        redeemAppInstallationDelivery: (input: Schemas.RedeemAppInstallationDeliveryInput, options?: RequestOptions) => invokers.raw<Schemas.RedeemAppInstallationDeliveryInput, Schemas.RedeemAppInstallationDeliveryOutput>(
            "redeemAppInstallationDelivery",
            Sdk.redeemAppInstallationDelivery,
            Schemas.RedeemAppInstallationDeliveryOutputSchemas,
            input,
            options,
        ),
    },
  };
  return { data, raw };
}

export type PhotonNamespaces = ReturnType<typeof createRpcNamespaces>["data"];
export type PhotonRawNamespaces = ReturnType<typeof createRpcNamespaces>["raw"];
