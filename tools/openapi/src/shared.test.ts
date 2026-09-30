import assert from "node:assert/strict";
import test from "node:test";
import { pascalCase, snakeCase } from "./shared.js";

test("snake_case keeps a capital run with a digit together", () => {
  assert.equal(snakeCase("createM2MToken"), "create_m2m_token");
  assert.equal(snakeCase("getServiceIdentityM2MConfiguration"), "get_service_identity_m2m_configuration");
  assert.equal(snakeCase("updateOAuthClient"), "update_oauth_client");
  assert.equal(snakeCase("list10DlcBrands"), "list10_dlc_brands");
  assert.equal(snakeCase("assignSmsLineCampaign"), "assign_sms_line_campaign");
  assert.equal(snakeCase("X-Request-ID"), "x_request_id");
  assert.equal(snakeCase("sha256Hex"), "sha256_hex");
  assert.equal(pascalCase("createM2MToken"), "CreateM2MToken");
});
