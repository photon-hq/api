import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { registryState, verifyPublished } from "./registry-check.mjs";

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

test("verify: waits for the registry, then fails after the window; different bytes and hard errors fail at once", async () => {
  const artifacts = [{ name: "a-0.1.0.tgz", bytes }];
  const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
  const clock = () => {
    let time = 0;
    const waits = [];
    return { waits, now: () => time, wait: async (ms) => { waits.push(ms); time += ms; }, log: () => {} };
  };
  const sequence = (...responses) => {
    let calls = 0;
    const fetcher = async () => {
      const next = responses[Math.min(calls++, responses.length - 1)];
      if (next instanceof Error) throw next;
      return typeof next === "number" ? new Response(null, { status: next }) : Response.json(next);
    };
    return { fetcher, calls: () => calls };
  };
  const options = { registry: "npm", name: "a", version: "0.1.0", artifacts };

  const later = sequence(404, 503, new TypeError("fetch failed"), { dist: { integrity } });
  const visible = clock();
  await verifyPublished({ ...options, ...visible, fetcher: later.fetcher });
  assert.equal(later.calls(), 4);
  assert.deepEqual(visible.waits, [15000, 22500, 30000]);

  const never = clock();
  await assert.rejects(verifyPublished({ ...options, ...never, timeoutMs: 60000, fetcher: sequence(404).fetcher }), /Not visible on the registry yet: a-0\.1\.0\.tgz; retry the release/);
  assert.equal(never.waits.reduce((total, ms) => total + ms, 0), 60000);

  for (const response of [{ dist: { integrity: "sha512-x" } }, 403]) {
    const immediate = clock();
    const once = sequence(404, response);
    await assert.rejects(verifyPublished({ ...options, ...immediate, fetcher: once.fetcher }), response === 403 ? /HTTP 403/ : /different bytes/);
    assert.equal(once.calls(), 2);
  }
});
