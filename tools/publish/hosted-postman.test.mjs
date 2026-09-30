import assert from "node:assert/strict";
import test from "node:test";
import { compareVersions, releaseCollection, updateCollection } from "./hosted-postman.mjs";

test("release versions compare numerically", () => {
  assert.equal(compareVersions("0.10.0", "0.9.1"), 1);
  assert.equal(compareVersions("0.1.1", "0.1.1"), 0);
  assert.equal(compareVersions("0.1.0", "1.0.0"), -1);
  assert.throws(() => compareVersions("2026-09-26", "0.1.0"), /Not a release version/);
  assert.deepEqual(releaseCollection({ info: { name: "x" }, item: [] }, "0.2.0").info, { name: "x", version: "0.2.0" });
  assert.throws(() => releaseCollection({ info: {} }, "v0.2.0"), /Not a release version/);
});

test("the hosted collection never moves backwards and read-back must match", async () => {
  const uid = `1-${"a".repeat(8)}-${"a".repeat(4)}-${"a".repeat(4)}-${"a".repeat(4)}-${"a".repeat(12)}`;
  const id = uid.slice(2);
  const workspaceId = "b".repeat(8) + "-" + "b".repeat(4) + "-" + "b".repeat(4) + "-" + "b".repeat(4) + "-" + "b".repeat(12);
  let hosted = { info: { _postman_id: id, version: "0.3.0" }, item: [] };
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
  hosted = { info: { _postman_id: id, version: "0.2.0" }, item: [{ name: "edited" }] };
  await assert.rejects(updateCollection({ desired, uid, workspaceId, api }), /unexpected edits/);
});
