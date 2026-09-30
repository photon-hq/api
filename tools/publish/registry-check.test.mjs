import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { registryState } from "./registry-check.mjs";

const bytes = Buffer.from("artifact");
const respond = (routes) => async (url) => {
  const body = routes[url];
  return body === undefined ? new Response(null, { status: 404 }) : Response.json(body);
};

test("npm: missing versions publish, identical versions skip, different bytes stop", async () => {
  const artifacts = [{ name: "a-0.1.0.tgz", bytes }];
  const url = "https://registry.npmjs.org/@scope%2fa/0.1.0";
  assert.deepEqual((await registryState({ registry: "npm", name: "@scope/a", version: "0.1.0", artifacts, fetcher: respond({}) })).missing, ["a-0.1.0.tgz"]);
  const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
  assert.deepEqual((await registryState({ registry: "npm", name: "@scope/a", version: "0.1.0", artifacts, fetcher: respond({ [url]: { dist: { integrity } } }) })).missing, []);
  await assert.rejects(registryState({ registry: "npm", name: "@scope/a", version: "0.1.0", artifacts, fetcher: respond({ [url]: { dist: { integrity: "sha512-x" } } }) }), /different bytes/);
});

test("pypi: only missing files publish and yanked or unexpected files stop", async () => {
  const artifacts = [{ name: "a-0.1.0-py3-none-any.whl", bytes }, { name: "a-0.1.0.tar.gz", bytes }];
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const url = "https://pypi.org/pypi/a/0.1.0/json";
  const partial = { urls: [{ filename: "a-0.1.0-py3-none-any.whl", digests: { sha256 }, yanked: false }] };
  assert.deepEqual((await registryState({ registry: "pypi", name: "a", version: "0.1.0", artifacts, fetcher: respond({ [url]: partial }) })).missing, ["a-0.1.0.tar.gz"]);
  await assert.rejects(registryState({ registry: "pypi", name: "a", version: "0.1.0", artifacts, fetcher: respond({ [url]: { urls: [{ ...partial.urls[0], yanked: true }] } }) }), /yanked/);
  await assert.rejects(registryState({ registry: "pypi", name: "a", version: "0.1.0", artifacts, fetcher: respond({ [url]: { urls: [...partial.urls, { filename: "other.whl", digests: { sha256 } }] } }) }), /unexpected/);
});

test("crates: a first release needs the bootstrap token path", async () => {
  const artifacts = [{ name: "a-0.1.0.crate", bytes }];
  const state = await registryState({ registry: "crates", name: "a", version: "0.1.0", artifacts, fetcher: respond({}) });
  assert.deepEqual(state, { missing: ["a-0.1.0.crate"], exists: false, crateExists: false });
  const existing = await registryState({ registry: "crates", name: "a", version: "0.1.0", artifacts, fetcher: respond({ "https://crates.io/api/v1/crates/a": { crate: {} } }) });
  assert.equal(existing.crateExists, true);
});
