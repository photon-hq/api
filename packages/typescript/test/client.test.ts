// Contract-dependent client behavior is tested on the feature-coverage fixture
// (tools/conformance/fixtures/tests/typescript), so a schema sync cannot break it.
import assert from "node:assert/strict";
import test from "node:test";
import { Photon, type PhotonNamespaces } from "../src/index.js";

test("the public client exposes every generated namespace in data and raw modes", () => {
  const photon = new Photon();
  const namespaces: PhotonNamespaces = photon;
  for (const name of Object.keys(photon.raw) as Array<keyof PhotonNamespaces>) {
    assert.ok(namespaces[name], `Missing data namespace: ${name}`);
    assert.deepEqual(Object.keys(namespaces[name]), Object.keys(photon.raw[name]));
  }
});
