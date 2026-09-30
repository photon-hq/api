import assert from "node:assert/strict";
import test from "node:test";

import {
  statusVariant,
  successResponses,
  type ManifestResponses,
} from "./success-responses.js";

test("success responses retain exact statuses before a 2XX fallback", () => {
  const responses: ManifestResponses = {
    "2XX": {
      "application/json": "#/components/schemas/FallbackResponse",
    },
    "202": {
      "application/json": "#/components/schemas/PendingResponse",
    },
    "201": {
      "application/json": "#/components/schemas/CompletedResponse",
    },
    "204": {},
    "400": {
      "application/problem+json": "#/components/schemas/Problem",
    },
  };

  assert.deepEqual(successResponses("purchaseNumber", responses), [
    {
      status: "201",
      exactStatus: 201,
      model: "CompletedResponse",
    },
    {
      status: "202",
      exactStatus: 202,
      model: "PendingResponse",
    },
    {
      status: "204",
      exactStatus: 204,
    },
    {
      status: "2XX",
      range: 2,
      model: "FallbackResponse",
    },
  ]);
  assert.equal(statusVariant("201"), "Status201");
  assert.equal(statusVariant("2XX"), "Status2xx");
});

test("a declared 304 Not Modified is a bodiless non-error response; other 3XX are not", () => {
  assert.deepEqual(
    successResponses("getWidget", {
      "200": { "application/json": "#/components/schemas/Widget" },
      "302": {},
      "304": {},
      "404": { "application/problem+json": "#/components/schemas/Problem" },
    }),
    [
      { status: "200", exactStatus: 200, model: "Widget" },
      { status: "304", exactStatus: 304 },
    ],
  );
});

test("success responses select JSON alongside a binary alternative", () => {
  assert.deepEqual(
    successResponses("download", {
      "200": {
        "application/json": "#/components/schemas/JsonResponse",
        "application/octet-stream": "#/components/schemas/BinaryResponse",
      },
    }),
    [{ status: "200", exactStatus: 200, model: "JsonResponse" }],
  );
});

test("binary success responses retain their body separately from empty responses", () => {
  assert.deepEqual(successResponses("download", {
    "200": { "application/octet-stream": "#/components/schemas/BinaryResponse" },
    "204": {},
  }), [
    { status: "200", exactStatus: 200, binary: true },
    { status: "204", exactStatus: 204 },
  ]);
});

test("success responses reject unsupported media", () => {
  assert.throws(
    () =>
      successResponses("download", {
        "200": {
          "application/x-protobuf": "#/components/schemas/BinaryResponse",
        },
      }),
    /no supported JSON media type/,
  );
});

test("success response ranges are canonicalized", () => {
  assert.deepEqual(
    successResponses("fallback", {
      "2xx": {
        "application/json": "#/components/schemas/FallbackResponse",
      },
    }),
    [
      {
        status: "2XX",
        range: 2,
        model: "FallbackResponse",
      },
    ],
  );
});


test("wildcard file responses are binary while JSON errors remain separate", () => {
  assert.deepEqual(successResponses("download", {
    "200": { "*/*": "#/components/schemas/Raw" },
    "204": {},
    "404": { "application/problem+json": "#/components/schemas/Problem" },
  }), [{ status: "200", exactStatus: 200, binary: true }, { status: "204", exactStatus: 204 }]);
});
