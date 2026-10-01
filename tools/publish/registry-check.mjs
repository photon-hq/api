#!/usr/bin/env node
// Registry state for one release. A version is never overwritten: if the
// registry already has it, its bytes must equal the built artifact, and the
// publish step is skipped. `verify` polls until the registry serves every
// file, since registries show a new upload seconds to minutes later. Usage:
//   node tools/publish/registry-check.mjs plan|verify npm|pypi|crates NAME VERSION ARTIFACT_DIRECTORY
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { appendFile, copyFile, mkdir, readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const digest = (algorithm, bytes) => createHash(algorithm).update(bytes).digest();
const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
// Network errors, timeouts, 429 and 5xx may clear up; `verify` retries them.
const transient = (error) => Object.assign(error, { transient: true });

export async function getJson(url, fetcher = fetch) {
  let response;
  try {
    response = await fetcher(url, { redirect: "error", signal: AbortSignal.timeout(30000), headers: { Accept: "application/json", "User-Agent": "photon-api-release" } });
  } catch (error) {
    throw transient(error);
  }
  if (response.status === 404) return null;
  if (response.status === 429 || response.status >= 500) throw transient(new Error(`Registry check failed: HTTP ${response.status} for ${url}`));
  assert.ok(response.ok, `Registry check failed: HTTP ${response.status} for ${url}`);
  return response.json();
}

/** Returns the artifacts still missing from the registry; throws on different bytes. */
export async function registryState({ registry, name, version, artifacts, fetcher = fetch }) {
  if (registry === "npm") {
    const [file] = artifacts.filter((artifact) => artifact.name.endsWith(".tgz"));
    assert.ok(file && artifacts.length === 1, "Expected exactly one npm tarball");
    const published = await getJson(`https://registry.npmjs.org/${name.replace("/", "%2f")}/${version}`, fetcher);
    if (!published) return { missing: [file.name], exists: false };
    assert.equal(published.dist.integrity, `sha512-${digest("sha512", file.bytes).toString("base64")}`, "npm already has this version with different bytes; release a new version instead");
    return { missing: [], exists: true };
  }
  if (registry === "pypi") {
    const published = await getJson(`https://pypi.org/pypi/${name}/${version}/json`, fetcher);
    const missing = [];
    for (const file of artifacts) {
      const entry = published?.urls.find((item) => item.filename === file.name);
      if (!entry) { missing.push(file.name); continue; }
      assert.ok(!entry.yanked, `PyPI ${file.name} is yanked; release a new version instead`);
      assert.equal(entry.digests.sha256, digest("sha256", file.bytes).toString("hex"), `PyPI already has ${file.name} with different bytes`);
    }
    for (const entry of published?.urls ?? []) assert.ok(artifacts.some((file) => file.name === entry.filename), `PyPI has an unexpected file ${entry.filename}`);
    return { missing, exists: published !== null };
  }
  assert.equal(registry, "crates", `Unknown registry ${registry}`);
  const [file] = artifacts.filter((artifact) => artifact.name.endsWith(".crate"));
  assert.ok(file && artifacts.length === 1, "Expected exactly one crate");
  const published = await getJson(`https://crates.io/api/v1/crates/${name}/${version}`, fetcher);
  const crateExists = published !== null || (await getJson(`https://crates.io/api/v1/crates/${name}`, fetcher)) !== null;
  if (!published) return { missing: [file.name], exists: false, crateExists };
  assert.ok(!published.version.yanked, "crates.io version is yanked; release a new version instead");
  assert.equal(published.version.checksum, digest("sha256", file.bytes).toString("hex"), "crates.io already has this version with different bytes");
  return { missing: [], exists: true, crateExists };
}

/**
 * Polls until every artifact is on the registry with the built bytes. Different
 * bytes and non-transient errors fail at once; missing files and transient
 * errors are retried every 15-30 seconds until `timeoutMs` has passed.
 */
export async function verifyPublished({ timeoutMs = 10 * 60 * 1000, intervalMs = 15000, maxIntervalMs = 30000, wait = sleep, now = Date.now, log = console.log, ...options }) {
  const deadline = now() + timeoutMs;
  for (let delay = intervalMs; ; delay = Math.min(delay * 1.5, maxIntervalMs)) {
    let missing;
    let failure;
    try {
      ({ missing } = await registryState(options));
    } catch (error) {
      if (!error.transient) throw error;
      failure = error;
    }
    if (!failure && missing.length === 0) return;
    const remaining = deadline - now();
    if (remaining <= 0) {
      if (failure) throw failure;
      assert.fail(`Not visible on the registry yet: ${missing.join(", ")}; retry the release`);
    }
    log(`Waiting for ${options.registry}: ${failure ? failure.message : `${missing.join(", ")} not visible yet`}`);
    await wait(Math.min(delay, remaining));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [mode, registry, name, version, directory] = process.argv.slice(2);
  assert.ok(["plan", "verify"].includes(mode) && registry && name && /^\d+\.\d+\.\d+$/.test(version ?? "") && directory,
    "Usage: registry-check.mjs plan|verify npm|pypi|crates NAME VERSION ARTIFACT_DIRECTORY");
  const names = (await readdir(directory)).filter((file) => /\.(tgz|whl|tar\.gz|crate)$/.test(file)).sort();
  const artifacts = await Promise.all(names.map(async (file) => ({ name: file, bytes: await readFile(join(directory, file)) })));
  if (mode === "verify") {
    await verifyPublished({ registry, name, version, artifacts });
    console.log(`All ${registry} artifacts for ${name} ${version} match the built files.`);
  } else {
    const state = await registryState({ registry, name, version, artifacts });
    if (registry === "pypi") {
      const pending = join(directory, "pending");
      await mkdir(pending);
      for (const file of state.missing) await copyFile(join(directory, file), join(pending, file));
    }
    const lines = [`publish=${state.missing.length > 0}`, `bootstrap=${registry === "crates" ? !state.crateExists : false}`];
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `${lines.join("\n")}\n`);
    console.log(lines.join("\n"));
  }
}
