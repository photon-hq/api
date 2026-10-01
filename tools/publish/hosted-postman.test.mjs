import assert from "node:assert/strict";
import test from "node:test";
import { comparableCollection, compareVersions, hostedVersion, releaseCollection, updateCollection } from "./hosted-postman.mjs";

test("release versions compare numerically", () => {
  assert.equal(compareVersions("0.10.0", "0.9.1"), 1);
  assert.equal(compareVersions("0.1.1", "0.1.1"), 0);
  assert.equal(compareVersions("0.1.0", "1.0.0"), -1);
  assert.throws(() => compareVersions("2026-09-26", "0.1.0"), /Not a release version/);
  assert.deepEqual(releaseCollection({ info: { name: "x" }, item: [] }, "0.2.0").info, {
    name: "x", version: "0.2.0", description: "Photon API 0.2.0. Generated from the OpenAPI contract in https://github.com/photon-hq/api.",
  });
  assert.match(releaseCollection({ info: { description: { content: "About.", type: "text/plain" } } }, "0.2.0").info.description, /^Photon API 0\.2\.0\. .*\n\nAbout\.$/s);
  assert.throws(() => releaseCollection({ info: {} }, "v0.2.0"), /Not a release version/);
});

test("the hosted collection never moves backwards and read-back must match", async () => {
  const uid = `1-${"a".repeat(8)}-${"a".repeat(4)}-${"a".repeat(4)}-${"a".repeat(4)}-${"a".repeat(12)}`;
  const id = uid.slice(2);
  const workspaceId = "b".repeat(8) + "-" + "b".repeat(4) + "-" + "b".repeat(4) + "-" + "b".repeat(4) + "-" + "b".repeat(12);
  let hosted = { info: { _postman_id: id, description: "Photon API 0.3.0. Generated from the OpenAPI contract in https://github.com/photon-hq/api." }, item: [] };
  const api = async (path, { method = "GET", body } = {}) => {
    if (path.startsWith("/workspaces/")) return { workspace: { visibility: "public", collections: [{ id }] } };
    if (method === "PUT") { hosted = body.collection; return {}; }
    return { collection: hosted };
  };
  const desired = releaseCollection({ info: {}, item: [] }, "0.2.0");
  assert.equal(await updateCollection({ desired, uid, workspaceId, api }), "newer-release-preserved");
  hosted = { info: { _postman_id: id, version: "0.1.9" }, item: [] };
  assert.equal(await updateCollection({ desired, uid, workspaceId, api }), "updated-and-verified");
  assert.equal(await updateCollection({ desired, uid, workspaceId, api }), "already-current");
  hosted = { info: { _postman_id: id, description: desired.info.description }, item: [{ name: "edited" }] };
  await assert.rejects(updateCollection({ desired, uid, workspaceId, api }), /unexpected edits/);
});

test("a collection compares equal to Postman's stored copy of it", () => {
  const sent = releaseCollection({
    info: { name: "Photon API", description: { content: "", type: "text/plain" } },
    event: [],
    variable: [{ key: "baseUrl", value: "https://api.example.test", type: "string" }],
    item: [{
      name: "Accounts", description: "", item: [{
        id: "client-id", name: "Get the account", event: [],
        request: {
          name: "Get the account", method: "GET", body: {},
          description: { content: "Returns the account.", type: "text/plain" },
          header: [{ key: "Idempotency-Key", value: "k", disabled: false, description: { content: "(Required) Key.", type: "text/plain" } }],
          url: { host: ["{{baseUrl}}"], path: ["v1", "accounts", ":id"], query: [], variable: [{ key: "id", value: "1", type: "any" }] },
        },
        response: [{ name: "OK", code: 200, body: "{}", originalRequest: { method: "GET", body: {}, url: { host: ["{{baseUrl}}"], path: ["v1"], query: [] } } }],
      }],
    }],
  }, "0.2.0");
  const stored = {
    info: { _postman_id: "p", name: "Photon API", description: sent.info.description, createdAt: "t", updatedAt: "t", lastUpdatedBy: "1", uid: "1-p" },
    variable: [{ key: "baseUrl", value: "https://api.example.test", type: "string" }],
    item: [{
      name: "Accounts", id: "f", uid: "1-f", item: [{
        id: "r", uid: "1-r", createdAt: "t", updatedAt: "t", name: "Get the account",
        request: {
          method: "GET", description: "Returns the account.",
          header: [{ key: "Idempotency-Key", value: "k", description: "(Required) Key." }],
          url: { raw: "{{baseUrl}}/v1/accounts/:id", host: ["{{baseUrl}}"], path: ["v1", "accounts", ":id"], variable: [{ key: "id", value: "1" }] },
        },
        response: [{ id: "x", uid: "1-x", createdAt: "t", updatedAt: "t", responseTime: null, name: "OK", code: 200, body: "{}", originalRequest: { method: "GET", url: { raw: "{{baseUrl}}/v1", host: ["{{baseUrl}}"], path: ["v1"] } } }],
      }],
    }],
  };
  assert.deepEqual(comparableCollection(stored), comparableCollection(sent));
  assert.equal(hostedVersion(stored), "0.2.0");
  const edited = structuredClone(stored);
  edited.item[0].item[0].request.description = "Changed.";
  assert.notDeepEqual(comparableCollection(edited), comparableCollection(sent));
});
