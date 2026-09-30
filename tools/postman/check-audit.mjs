import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const acceptedAdvisory = "https://github.com/advisories/GHSA-qxc2-j82w-r537";

/** A single generation-only exception; every other advisory still fails CI. */
export function checkAudit(report, lock) {
  assert.equal(report.auditReportVersion, 2, "Unexpected npm audit response");
  assert.ok(report.vulnerabilities && !report.error, "npm audit failed");
  assert.equal(lock.packages["node_modules/openapi-to-postmanv2"].version, "6.3.3", "Reassess the exception when upgrading the converter");
  const vulnerabilities = report.vulnerabilities;
  function accepted(name, visited = new Set()) {
    assert.ok(!visited.has(name), "Unexpected advisory dependency cycle");
    const vulnerability = vulnerabilities[name];
    assert.ok(vulnerability?.via?.length, "Incomplete advisory dependency data");
    const next = new Set([...visited, name]);
    return vulnerability.via.every((via) => {
      if (typeof via === "string") return accepted(via, next);
      return name === "@faker-js/faker" && via.url === acceptedAdvisory &&
        via.dependency === "@faker-js/faker" && vulnerability.nodes.length > 0 &&
        vulnerability.nodes.every((path) => lock.packages[path]?.version === "5.5.3");
    });
  }
  for (const name of Object.keys(vulnerabilities)) assert.ok(accepted(name), `Unaccepted Postman dependency advisory: ${name}`);
  return Object.keys(vulnerabilities).length ? "Known Faker advisory only; generation isolation remains required" : "No reported advisories";
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = dirname(fileURLToPath(import.meta.url));
  const result = spawnSync("npm", ["audit", "--json", "--prefix", root], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  assert.ok(!result.error && [0, 1].includes(result.status), "npm audit could not complete");
  const lock = JSON.parse(await readFile(resolve(root, "package-lock.json"), "utf8"));
  console.log(checkAudit(JSON.parse(result.stdout), lock));
}
