import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { expectedAssets, formatSums, parseSums, verifyAssets } from "./release-assets.mjs";

const names = { npm: "@example/api", pypi: "example-api", crate: "example-api" };

test("a release has exactly the npm tarball, wheel, sdist and crate of its version", () => {
  assert.deepEqual(expectedAssets(names, "0.2.0"), ["example-api-0.2.0.crate", "example-api-0.2.0.tgz", "example_api-0.2.0-py3-none-any.whl", "example_api-0.2.0.tar.gz"]);
  assert.throws(() => expectedAssets(names, "v0.2.0"), /Not a release version/);
});

test("sums round-trip through a release body", () => {
  const sums = new Map([["b.crate", "b".repeat(64)], ["a.tgz", "a".repeat(64)]]);
  const body = `## 0.2.0\n\nNotes.\n\n\`\`\`text\n${formatSums(sums)}\`\`\`\n`;
  assert.deepEqual([...parseSums(body)], [["a.tgz", "a".repeat(64)], ["b.crate", "b".repeat(64)]]);
  assert.throws(() => parseSums(`${"a".repeat(64)}  x.tgz\n${"b".repeat(64)}  x.tgz\n`), /Conflicting/);
});

test("tampered, missing or extra files are refused", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "release-assets-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const expected = expectedAssets(names, "0.2.0");
  const sums = new Map();
  for (const name of expected) {
    await writeFile(join(directory, name), name);
    sums.set(name, createHash("sha256").update(name).digest("hex"));
  }
  await verifyAssets({ directory, expected, sums });
  await writeFile(join(directory, expected[0]), "tampered");
  await assert.rejects(verifyAssets({ directory, expected, sums }), /SHA-256 mismatch/);
  await writeFile(join(directory, expected[0]), expected[0]);
  await writeFile(join(directory, "extra-0.2.0.tgz"), "x");
  await assert.rejects(verifyAssets({ directory, expected, sums }), /differ from the expected set/);
  await rm(join(directory, "extra-0.2.0.tgz"));
  sums.delete(expected[1]);
  await assert.rejects(verifyAssets({ directory, expected, sums }), /do not cover exactly/);
});
