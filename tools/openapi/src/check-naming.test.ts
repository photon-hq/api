import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { namingWaiverOf, waiverNotice } from "./check-naming.js";
import { repositoryRoot } from "./shared.js";

const script = fileURLToPath(new URL("./check-naming.js", import.meta.url));
const unnamed = resolve(repositoryRoot, "tools/openapi/fixtures/naming/unnamed.json");
const namingWaiver = { reason: "Preview release", until: "0.2.0" };
const approvedWaiver = { ...namingWaiver, approvedBy: "API owner", approvedOn: "2026-01-15" };
// A production configuration (the public repository has no config/sdk.production.json).
const production = {
  environment: "production",
  schemaPath: "openapi/staging.json",
  defaultBaseUrl: "https://api.example.test",
  authEndpoints: {},
};

function run(config: object): { status: number | null; stdout: string; report: { violations: unknown[] } } {
  const scratch = mkdtempSync(join(tmpdir(), "photon-check-naming-test-"));
  try {
    const configPath = join(scratch, "sdk.json");
    const json = join(scratch, "naming.json");
    writeFileSync(configPath, JSON.stringify(config));
    const result = spawnSync(process.execPath, [script, "--contract", unnamed, "--sdk", "none", "--config", configPath, "--json", json], {
      cwd: repositoryRoot, encoding: "utf8", env: { ...process.env, GITHUB_ACTIONS: "" },
    });
    return { status: result.status, stdout: result.stdout, report: JSON.parse(readFileSync(json, "utf8")) };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

test("the naming gate fails without a waiver and reports without failing under one", () => {
  const strict = run(production);
  assert.equal(strict.status, 1);
  const waived = run({ ...production, namingWaiver });
  assert.equal(waived.status, 0);
  // The same violations are reported either way.
  assert.ok(waived.report.violations.length > 0);
  assert.deepEqual(waived.report.violations, strict.report.violations);
  assert.match(waived.stdout, /Naming not enforced until 0\.2\.0: \d+ violations reported, not failed\. Preview release/);
  assert.doesNotMatch(waived.stdout, /approved/);
});

test("the waiver notice asks for removal once nothing is waived", () => {
  assert.match(waiverNotice(namingWaiver, 0), /remove the naming waiver/);
  assert.equal(waiverNotice(namingWaiver, 3), "Naming not enforced until 0.2.0: 3 violations reported, not failed. Preview release");
  assert.equal(
    waiverNotice(approvedWaiver, 3),
    "Naming not enforced until 0.2.0: 3 violations reported, not failed. Waiver approved by API owner on 2026-01-15. Preview release",
  );
  assert.doesNotMatch(waiverNotice(namingWaiver, 0), /approved/);
  assert.match(waiverNotice(approvedWaiver, 0), /approved by API owner on 2026-01-15/);
  const scratch = mkdtempSync(join(tmpdir(), "photon-check-naming-test-"));
  try {
    const path = join(scratch, "sdk.json");
    writeFileSync(path, JSON.stringify(production));
    assert.equal(namingWaiverOf(path), undefined);
    writeFileSync(path, JSON.stringify({ ...production, namingWaiver }));
    assert.deepEqual(namingWaiverOf(path), namingWaiver);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
