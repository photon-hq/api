#!/usr/bin/env node
// The four files of a release: the npm tarball, the wheel, the sdist and the
// crate. They are built once from the release candidate, tested, attached to
// the GitHub release with their SHA-256s in the release body, and published
// unchanged. Usage:
//   node tools/publish/release-assets.mjs hash DIRECTORY VERSION        print sha256sum lines
//   node tools/publish/release-assets.mjs verify DIRECTORY VERSION SUMS  check files against sums
//   node tools/publish/release-assets.mjs sums RELEASE_BODY_FILE         extract sums from a release body
// SUMS is a file of `sha256sum` lines (a release body works too).
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Package names from the repository's manifests. */
export async function packageNames(root = ".") {
  const text = (path) => readFile(join(root, path), "utf8");
  const npm = JSON.parse(await text("packages/typescript/package.json")).name;
  const pypi = /^name = "([^"]+)"$/m.exec(await text("packages/python/pyproject.toml"))?.[1];
  const crate = /^name = "([^"]+)"$/m.exec(await text("packages/rust/Cargo.toml"))?.[1];
  assert.ok(npm && pypi && crate, "Package names not found");
  return { npm, pypi, crate };
}

/** The exact file names a release of VERSION carries. */
export function expectedAssets({ npm, pypi, crate }, version) {
  assert.match(version, /^\d+\.\d+\.\d+$/, `Not a release version: ${version}`);
  const wheelName = pypi.replace(/[-_.]+/g, "_").toLowerCase();
  return [
    `${npm.replace(/^@/, "").replace("/", "-")}-${version}.tgz`,
    `${wheelName}-${version}-py3-none-any.whl`,
    `${wheelName}-${version}.tar.gz`,
    `${crate}-${version}.crate`,
  ].sort();
}

export const formatSums = (sums) => [...sums].sort(([a], [b]) => a.localeCompare(b)).map(([name, hash]) => `${hash}  ${name}`).join("\n") + "\n";

/** `sha256sum` lines anywhere in a text (for example inside a release body). */
export function parseSums(text) {
  const sums = new Map();
  for (const [, hash, name] of text.matchAll(/^([a-f0-9]{64}) {2}([A-Za-z0-9@._+-]+)$/gm)) {
    assert.ok(!sums.has(name) || sums.get(name) === hash, `Conflicting SHA-256 for ${name}`);
    sums.set(name, hash);
  }
  return sums;
}

export async function hashDirectory(directory) {
  const sums = new Map();
  for (const name of (await readdir(directory)).filter((file) => /\.(tgz|whl|tar\.gz|crate)$/.test(file)).sort()) {
    sums.set(name, sha256(await readFile(join(directory, name))));
  }
  return sums;
}

/** The directory holds exactly the expected files, and each matches its recorded SHA-256. */
export async function verifyAssets({ directory, expected, sums }) {
  const actual = await hashDirectory(directory);
  assert.deepEqual([...actual.keys()].sort(), expected, `Release files differ from the expected set: ${[...actual.keys()].join(", ")}`);
  assert.deepEqual([...sums.keys()].sort(), expected, `Recorded SHA-256s do not cover exactly the release files: ${[...sums.keys()].join(", ")}`);
  for (const name of expected) assert.equal(actual.get(name), sums.get(name), `SHA-256 mismatch for ${name}; refusing to publish a file that was not tested`);
  return actual;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [command, ...args] = process.argv.slice(2);
  if (command === "hash") {
    const [directory, version] = args;
    const expected = expectedAssets(await packageNames(), version);
    const sums = await hashDirectory(directory);
    assert.deepEqual([...sums.keys()].sort(), expected, `Built files differ from the expected set: ${[...sums.keys()].join(", ")}`);
    process.stdout.write(formatSums(sums));
  } else if (command === "verify") {
    const [directory, version, sumsFile] = args;
    await verifyAssets({ directory, expected: expectedAssets(await packageNames(), version), sums: parseSums(await readFile(sumsFile, "utf8")) });
    console.log(`All ${version} release files match their recorded SHA-256s.`);
  } else {
    assert.equal(command, "sums", "Usage: release-assets.mjs hash|verify|sums ...");
    process.stdout.write(formatSums(parseSums(await readFile(args[0], "utf8"))));
  }
}
