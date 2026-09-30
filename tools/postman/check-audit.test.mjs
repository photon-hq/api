import assert from "node:assert/strict";
import test from "node:test";
import { checkAudit } from "./check-audit.mjs";
const lock = { packages: { "node_modules/openapi-to-postmanv2": { version: "6.3.3" }, "node_modules/@faker-js/faker": { version: "5.5.3" } } };
const report = { auditReportVersion: 2, vulnerabilities: {
  "@faker-js/faker": { nodes: ["node_modules/@faker-js/faker"], via: [{ url: "https://github.com/advisories/GHSA-qxc2-j82w-r537", dependency: "@faker-js/faker" }] },
  "postman-collection": { via: ["@faker-js/faker"] },
  "openapi-to-postmanv2": { via: ["postman-collection"] },
} };
test("audit exception is restricted to one advisory and the inspected versions", () => {
  assert.match(checkAudit(report, lock), /Known Faker/);
  const changed = structuredClone(report);
  changed.vulnerabilities["@faker-js/faker"].via.push({ url: "https://github.com/advisories/NEW", dependency: "@faker-js/faker" });
  assert.throws(() => checkAudit(changed, lock), /Unaccepted/);
  assert.throws(() => checkAudit({ auditReportVersion: 2, error: {} }, lock), /failed/);
  assert.throws(() => checkAudit(report, { packages: { ...lock.packages, "node_modules/@faker-js/faker": { version: "6.0.0" } } }), /Unaccepted/);
});
