#!/usr/bin/env node
// Update the hosted Postman collection to a release and read it back. Never
// moves it to an older release or overwrites unexpected edits to the same
// release. Usage:
//   POSTMAN_API_KEY=... POSTMAN_COLLECTION_UID=... POSTMAN_WORKSPACE_ID=... \
//     node tools/publish/hosted-postman.mjs postman/collection.json VERSION
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const semver = /^(\d+)\.(\d+)\.(\d+)$/;

export function compareVersions(a, b) {
  const left = semver.exec(a), right = semver.exec(b);
  assert.ok(left && right, `Not a release version: ${left ? b : a}`);
  for (let index = 1; index <= 3; index += 1) {
    const difference = Number(left[index]) - Number(right[index]);
    if (difference) return Math.sign(difference);
  }
  return 0;
}

/** First line of the hosted collection's description; Postman keeps the description but not info.version. */
const releaseLine = (version) => `Photon API ${version}. Generated from the OpenAPI contract in https://github.com/photon-hq/api.`;
const releaseLinePattern = /^Photon API (\d+\.\d+\.\d+)\. /;

const descriptionText = (description) => typeof description === "string" ? description : description?.content ?? "";

/** The release collection: the committed collection labelled with the release version. */
export function releaseCollection(collection, version) {
  assert.match(version, semver, `Not a release version: ${version}`);
  const text = descriptionText(collection.info?.description);
  const description = text ? `${releaseLine(version)}\n\n${text}` : releaseLine(version);
  return { ...collection, info: { ...collection.info, version, description } };
}

/** The release version recorded in a hosted collection, if any. */
export function hostedVersion(collection) {
  if (semver.test(collection.info?.version ?? "")) return collection.info.version;
  return releaseLinePattern.exec(descriptionText(collection.info?.description))?.[1];
}

// Fields Postman adds to a stored collection, or that it drops (info.version).
const serverFields = new Set(["_postman_id", "_exporter_id", "uid", "id", "createdAt", "updatedAt", "lastUpdatedBy", "owner", "version"]);

/**
 * A collection as Postman stores it, so a stored copy compares with what was
 * sent: Postman adds IDs and timestamps, a raw URL beside its parts and
 * `responseTime: null`; drops empty values, `disabled: false`, a request's
 * own name, the default `type: "any"` of URL variables and info.version; and
 * stores a plain-text `{ content, type }` description as its text.
 */
export function comparableCollection(value, key = null) {
  if (Array.isArray(value)) {
    const items = value.map((item) => comparableCollection(item, key)).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }
  if (value !== null && typeof value === "object") {
    if (key === "description" && Object.keys(value).every((name) => name === "content" || name === "type")
      && (value.type ?? "text/plain") === "text/plain") return comparableCollection(value.content);
    const result = {};
    for (const [name, child] of Object.entries(value)) {
      if (serverFields.has(name) || (name === "disabled" && child === false) || (name === "responseTime" && child === null)) continue;
      if (key === "url" && name === "raw") continue;
      if ((key === "request" || key === "originalRequest") && name === "name") continue;
      if (key === "variable" && name === "type" && child === "any") continue;
      const comparable = comparableCollection(child, name);
      if (comparable !== undefined) result[name] = comparable;
    }
    return Object.keys(result).length ? result : undefined;
  }
  return value === "" || value === null ? undefined : value;
}

export async function updateCollection({ desired, uid, workspaceId, api }) {
  assert.match(uid ?? "", /^\d+-[a-f0-9-]{36}$/i, "Postman collection UID required");
  assert.match(workspaceId ?? "", /^[a-f0-9-]{36}$/i, "Postman workspace ID required");
  const workspace = (await api(`/workspaces/${workspaceId}`)).workspace;
  assert.equal(workspace.visibility, "public", "Hosted collection must belong to the configured public workspace");
  const id = uid.slice(uid.indexOf("-") + 1);
  assert.ok(workspace.collections.some((collection) => collection.id === id || collection.uid === uid), "Collection is outside the configured workspace");
  const current = (await api(`/collections/${uid}`)).collection;
  assert.equal(current.info._postman_id, id);
  const currentVersion = hostedVersion(current);
  if (currentVersion && compareVersions(currentVersion, desired.info.version) > 0) return "newer-release-preserved";
  if (isDeepStrictEqual(comparableCollection(current), comparableCollection(desired))) return "already-current";
  if (currentVersion === desired.info.version) throw new Error("Hosted collection has unexpected edits to this release; refusing to overwrite it");
  await api(`/collections/${uid}`, { method: "PUT", body: { collection: { ...desired, info: { ...desired.info, _postman_id: id } } } });
  const actual = (await api(`/collections/${uid}`)).collection;
  assert.deepEqual(comparableCollection(actual), comparableCollection(desired), "Postman read-back differs from the release collection");
  return "updated-and-verified";
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [file, version] = process.argv.slice(2);
  assert.ok(file && version, "Usage: hosted-postman.mjs COLLECTION_FILE VERSION");
  const desired = releaseCollection(JSON.parse(await readFile(file, "utf8")), version);
  const key = process.env.POSTMAN_API_KEY;
  assert.ok(key, "POSTMAN_API_KEY is required");
  const api = async (path, { method = "GET", body } = {}) => {
    const response = await fetch(`https://api.getpostman.com${path}`, {
      method, redirect: "error", signal: AbortSignal.timeout(30000), headers: { "X-Api-Key": key, "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    assert.ok(response.ok, `Postman ${method} failed: HTTP ${response.status}`);
    return response.json();
  };
  console.log(await updateCollection({ desired, uid: process.env.POSTMAN_COLLECTION_UID, workspaceId: process.env.POSTMAN_WORKSPACE_ID, api }));
}
