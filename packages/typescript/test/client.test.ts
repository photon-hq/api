import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { DEFAULT_BASE_URL } from "../src/config.generated.js";
import { operationMediaTypes } from "../src/rpc.generated.js";
import {
  ApiError,
  Photon,
  ResponseValidationError,
  TransportError,
  type PhotonNamespaces,
} from "../src/index.js";

test("required idempotency headers survive HTTP header normalization", async () => {
  let calls = 0;
  const photon = new Photon({ retry: false, fetch: async (input, init) => {
    const request = new Request(input, init);
    assert.equal(request.headers.get("idempotency-key"), "project-create-test");
    assert.equal(request.headers.get("x-test"), "preserved");
    assert.deepEqual(await request.json(), { name: "SDK test", slug: "sdk-test" });
    calls += 1;
    return Response.json({ code: "SLUG_TAKEN", status: 409, title: "Slug Already Taken",
      type: "https://photon.codes/docs/problems/slug-taken" }, { status: 409 });
  } });
  const input = { path: { organizationId: `pho_org_${"0".repeat(26)}` },
    body: { name: "SDK test", slug: "sdk-test" }, headers: { idempotencyKey: "project-create-test" } };
  for (const projects of [photon.organizations.projects, photon.raw.organizations.projects]) {
    for (const headers of [{ "X-Test": "preserved" }, new Headers({ "X-Test": "preserved" })]) {
      await assert.rejects(projects.create(input, { headers }),
        (error: unknown) => error instanceof ApiError && error.status === 409);
    }
  }
  assert.equal(calls, 4);
});

for (const contentType of ["image/png", "text/plain", "application/json"]) {
  test(`attachment downloads preserve bytes for ${contentType}`, async () => {
    const bytes = new Uint8Array([0, 255, 65, 128]);
    const photon = new Photon({ fetch: async () => new Response(bytes, {
      headers: { "content-type": contentType, "x-request-id": "download-request" },
    }) });
    const input = { path: { id: `pho_prj_${"0".repeat(26)}`, attachmentId: `pho_att_${"0".repeat(26)}` } };
    const data = await photon.projects.downloadAttachment(input);
    assert.deepEqual(new Uint8Array(await data.arrayBuffer()), bytes);
    const raw = await photon.raw.projects.downloadAttachment(input);
    assert.deepEqual(new Uint8Array(await raw.data.arrayBuffer()), bytes);
    assert.equal(raw.requestId, "download-request");
    assert.equal(raw.headers.get("content-type"), contentType);
  });
}

test("attachment uploads preserve raw multipart bytes and required headers across retries", async () => {
  const bytes = new Uint8Array([0, 255, 65, 128]);
  const body = new Blob([bytes]);
  const id = `pho_prj_${"0".repeat(26)}`;
  let attempts = 0;
  const photon = new Photon({
    retry: { baseDelayMs: 1, maximumDelayMs: 1 },
    fetch: async (input, init) => {
      const request = new Request(input, init);
      assert.equal(request.headers.get("content-type"), "multipart/related; boundary=test");
      assert.equal(request.headers.get("content-length"), String(bytes.length));
      assert.equal(request.headers.get("idempotency-key"), "upload-key");
      assert.deepEqual(new Uint8Array(await request.arrayBuffer()), bytes);
      if (++attempts === 1) return Response.json({ detail: "busy" }, { status: 503 });
      return Response.json({
        id: `pho_att_${"0".repeat(26)}`, projectId: id, contentType: "application/octet-stream",
        sizeBytes: 4, createdAt: "2026-09-19T00:00:00.000Z", updatedAt: "2026-09-19T00:00:00.000Z",
      }, { status: 201 });
    },
  });
  const response = await photon.projects.uploadAttachment({ path: { id }, body, headers: {
    "content-type": "multipart/related; boundary=test", "content-length": String(body.size),
    "idempotency-key": "upload-key",
  } });
  assert.equal(response.sizeBytes, 4);
  assert.equal(attempts, 2);
});

test("the public client exposes every generated namespace in data and raw modes", () => {
  const photon = new Photon();
  const namespaces: PhotonNamespaces = photon;
  for (const name of Object.keys(photon.raw) as Array<keyof PhotonNamespaces>) {
    assert.ok(namespaces[name], `Missing data namespace: ${name}`);
    assert.deepEqual(Object.keys(namespaces[name]), Object.keys(photon.raw[name]));
  }
});

test("mixed-format operations send the JSON model and matching headers", async () => {
  const body = { grant_type: "refresh_token" as const, refresh_token: "refresh" };
  const response = {
    access_token: "access", refresh_token: "next", expires_in: 3600,
    user: { id: "user", email: "user@example.com", first_name: null, last_name: null },
    futureField: true,
  };
  const photon = new Photon({
    headers: { "content-type": "application/x-protobuf", accept: "application/x-protobuf" },
    fetch: async (input, init) => {
      const request = new Request(input, init);
      assert.equal(new URL(request.url).origin, DEFAULT_BASE_URL);
      assert.equal(request.headers.get("content-type"), "application/json");
      // The contract's declared media, not the caller's protobuf Accept.
      const accept = operationMediaTypes.deviceToken?.accept ?? [];
      assert.equal(accept[0], "application/json");
      assert.equal(request.headers.get("accept"), accept.join(", "));
      assert.equal(request.headers.get("x-test"), "preserved");
      assert.deepEqual(await request.json(), body);
      return Response.json(response);
    },
  });
  const result = await photon.auth.device.token({ body }, {
    headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Test": "preserved" },
  });
  assert.equal(result.access_token, "access");
  assert.equal(result.futureField, true);
});

test("uses an isolated base URL and evaluates headers for each attempt", async () => {
  let attempts = 0;
  const requests: Request[] = [];
  const photon = new Photon({
    baseUrl: "https://first.example",
    headers: async () => ({
      authorization: `Bearer attempt-${attempts + 1}`,
    }),
    fetch: async (request, init) => {
      attempts += 1;
      requests.push(new Request(request, init));
      if (attempts < 3) {
        return new Response(
          JSON.stringify({
            code: "UPSTREAM_UNAVAILABLE",
            status: 503,
            title: "Unavailable",
            type: "urn:test",
          }),
          {
            status: 503,
            headers: { "content-type": "application/problem+json" },
          },
        );
      }
      return Response.json({
        count: 2,
      });
    },
    retry: {
      baseDelayMs: 1,
      maximumDelayMs: 1,
    },
  });

  const result = await photon.organizations.projects.count({ path: { organizationId: "organization" } });
  assert.equal(attempts, 3);
  assert.equal(result.count, 2);
  assert.ok(requests.every((request) => request.url.startsWith("https://first.example/")));
  assert.deepEqual(
    requests.map((request) => request.headers.get("authorization")),
    ["Bearer attempt-1", "Bearer attempt-2", "Bearer attempt-3"],
  );

  const secondRequests: Request[] = [];
  const second = new Photon({
    baseUrl: "https://second.example",
    fetch: async (request, init) => {
      secondRequests.push(new Request(request, init));
      return Response.json({ count: 2 });
    },
  });
  await second.organizations.projects.count({ path: { organizationId: "organization" } });
  assert.equal(secondRequests[0]?.url, "https://second.example/v1/organizations/organization/projects/count");
});

test("request values are sent as given; the service validates them", async () => {
  // Validation-only keywords (pattern, lengths, bounds) are not checked
  // client-side, and members the SDK does not know are sent as they are.
  const sent: unknown[] = [];
  const photon = new Photon({ retry: false, fetch: async (input, init) => {
    sent.push(await new Request(input, init).json());
    return Response.json({ type: "https://photon.codes/docs/problems/validation", title: "Invalid", status: 422 },
      { status: 422 });
  } });
  const bodies = [
    { code: "invalid", phoneNumber: "+15555550123" },
    { code: "123456", phoneNumber: "+15555550123", futureField: true },
  ];
  for (const body of bodies) {
    await assert.rejects(photon.account.confirmPhoneVerification({ body } as never),
      (error: unknown) => error instanceof ApiError && error.status === 422);
  }
  assert.deepEqual(sent, bodies);
});

test("wraps malformed successful responses as ResponseValidationError", async () => {
  const photon = new Photon({
    fetch: async () => Response.json({ count: "invalid" }),
  });

  await assert.rejects(photon.organizations.projects.count({ path: { organizationId: "organization" } }), ResponseValidationError);
});

test("raw methods preserve response metadata", async () => {
  const photon = new Photon({
    fetch: async () =>
      Response.json(
        { count: 2 },
        {
          headers: {
            "x-request-id": "req_123",
          },
        },
      ),
  });

  const result = await photon.raw.organizations.projects.count({ path: { organizationId: "organization" } });
  assert.equal(result.status, 200);
  assert.equal(result.requestId, "req_123");
  assert.equal(result.data.count, 2);
});

test("does not retry a mutation without an idempotency key", async () => {
  let attempts = 0;
  const photon = new Photon({
    fetch: async () => {
      attempts += 1;
      throw new Error("offline");
    },
    retry: { maxAttempts: 10, baseDelayMs: 1, maximumDelayMs: 1 },
  });

  await assert.rejects(
    photon.account.confirmPhoneVerification({
      body: {
        code: "123456",
        phoneNumber: "+15555550123",
      },
    }),
    TransportError,
  );
  assert.equal(attempts, 1);
});


test("attachment downloads preserve raw bytes regardless of the actual Content-Type", async () => {
  const input = { path: { id: "pho_prj_00000000000000000000000000", attachmentId: "pho_att_00000000000000000000000000" } };
  for (const [contentType, body] of [
    ["image/png", new Uint8Array([0, 255, 128, 10])],
    ["application/json", new TextEncoder().encode('{ "file": true }\n')],
    ["text/plain", new TextEncoder().encode("raw text")],
    ["application/octet-stream", new Uint8Array()],
  ] as const) {
    const photon = new Photon({ fetch: async (input, init) => {
      assert.equal(new Request(input, init).headers.get("accept"), "*/*, application/problem+json");
      return new Response(body, { headers: { "content-type": contentType, "content-disposition": "attachment; filename=test", "x-request-id": "binary-request" } });
    } });
    const blob: Blob = await photon.projects.downloadAttachment(input);
    assert.deepEqual(new Uint8Array(await blob.arrayBuffer()), body);
    const raw = await photon.raw.projects.downloadAttachment(input);
    assert.deepEqual(new Uint8Array(await raw.data.arrayBuffer()), body);
    assert.equal(raw.requestId, "binary-request");
    assert.equal(raw.headers.get("content-disposition"), "attachment; filename=test");
  }
});

test("attachment downloads retain JSON API errors and reject undocumented successful statuses", async () => {
  const input = { path: { id: "pho_prj_00000000000000000000000000", attachmentId: "pho_att_00000000000000000000000000" } };
  const problem = { code: "ATTACHMENT_NOT_FOUND", detail: "No file", status: 404 };
  const photon = new Photon({ retry: false, fetch: async () => Response.json(problem, { status: 404 }) });
  await assert.rejects(photon.projects.downloadAttachment(input), (error: any) => error.status === 404 && error.body.code === problem.code);
  const unexpected = new Photon({ fetch: async () => new Response("bytes", { status: 201 }) });
  await assert.rejects(unexpected.projects.downloadAttachment(input), ResponseValidationError);
});

const countInput = { path: { organizationId: "organization" } };

test("attachment body failures are transport errors and are retried like failures before the headers", async (t) => {
  const input = { path: { id: "pho_prj_00000000000000000000000000", attachmentId: "pho_att_00000000000000000000000000" } };
  for (const mode of ["data", "raw"] as const) {
    for (const cause of [
      new DOMException("Download cancelled", "AbortError"),
      new DOMException("Download timed out", "TimeoutError"),
      new TypeError("Connection closed while downloading"),
    ]) {
      await t.test(`${mode}: ${cause.name}`, async () => {
        let attempts = 0;
        const photon = new Photon({
          retry: { baseDelayMs: 1, maximumDelayMs: 1 },
          fetch: async () => {
            attempts += 1;
            return new Response(new ReadableStream({
              start(controller) { controller.error(cause); },
            }), { headers: { "x-request-id": "failed-download" } });
          },
        });
        const request = mode === "raw"
          ? photon.raw.projects.downloadAttachment(input)
          : photon.projects.downloadAttachment(input);
        await assert.rejects(request, (error: unknown) => {
          assert.ok(error instanceof TransportError);
          assert.equal(error.cause, cause);
          assert.equal(error.operationId, "downloadAttachment");
          assert.equal(error.requestId, "failed-download");
          return true;
        });
        assert.equal(attempts, 3);
      });
    }
  }
});

/**
 * The fake bodies below end only through a timeout or an abort, and have no
 * socket to keep Node's event loop running; Node 22 would exit while waiting
 * for the unreferenced timeout. Keep the loop alive for the test's duration.
 */
function keepEventLoopAlive(t: TestContext): void {
  const timer = setInterval(() => {}, 1_000);
  t.after(() => clearInterval(timer));
}

test("a timeout while the body arrives is a transport error, retried for safe requests only", async (t) => {
  keepEventLoopAlive(t);
  // The headers arrive at once; the body never does.
  const stalled = (input: RequestInfo | URL, init?: RequestInit) => {
    const signal = new Request(input, init).signal;
    return new Response(new ReadableStream({
      start(body) { signal.addEventListener("abort", () => body.error(signal.reason), { once: true }); },
    }), { headers: { "content-type": "application/json" } });
  };
  await t.test("GET", async () => {
    let attempts = 0;
    const photon = new Photon({ timeoutMs: 20, retry: { baseDelayMs: 1, maximumDelayMs: 1 },
      fetch: async (input, init) => { attempts += 1; return stalled(input, init); } });
    await assert.rejects(photon.organizations.projects.count(countInput), (error: unknown) => {
      assert.ok(error instanceof TransportError);
      assert.equal((error.cause as Error).name, "TimeoutError");
      assert.equal(error.operationId, "countProjects");
      return true;
    });
    assert.equal(attempts, 3);
  });
  await t.test("GET that succeeds on the next attempt", async () => {
    let attempts = 0;
    const photon = new Photon({ timeoutMs: 20, retry: { baseDelayMs: 1, maximumDelayMs: 1 },
      fetch: async (input, init) => (++attempts === 1 ? stalled(input, init) : Response.json({ count: 2 })) });
    assert.deepEqual(await photon.organizations.projects.count(countInput), { count: 2 });
    assert.equal(attempts, 2);
  });
  await t.test("POST without an Idempotency-Key", async () => {
    let attempts = 0;
    const photon = new Photon({ timeoutMs: 20, retry: { baseDelayMs: 1, maximumDelayMs: 1 },
      fetch: async (input, init) => { attempts += 1; return stalled(input, init); } });
    await assert.rejects(photon.account.confirmPhoneVerification({ body: { code: "123456", phoneNumber: "+15555550123" } }),
      (error: unknown) => error instanceof TransportError && (error.cause as Error).name === "TimeoutError");
    assert.equal(attempts, 1);
  });
});

test("a caller's cancellation is a transport error whose cause is the abort reason, before or during the body", async (t) => {
  keepEventLoopAlive(t);
  const input = { path: { id: "pho_prj_00000000000000000000000000", attachmentId: "pho_att_00000000000000000000000000" } };
  for (const phase of ["before the headers", "during the body"] as const) {
    await t.test(phase, async () => {
      const controller = new AbortController();
      const cause = new Error("Caller cancelled the download");
      let attempts = 0;
      const photon = new Photon({
        fetch: async (input, init) => {
          attempts += 1;
          const signal = new Request(input, init).signal;
          if (phase === "before the headers") {
            return new Promise<Response>((_, reject) => {
              signal.addEventListener("abort", () => reject(signal.reason), { once: true });
              controller.abort(cause);
            });
          }
          return new Response(new ReadableStream({
            start(body) {
              signal.addEventListener("abort", () => body.error(signal.reason), { once: true });
            },
            pull() { controller.abort(cause); },
          }));
        },
      });
      await assert.rejects(photon.projects.downloadAttachment(input, { signal: controller.signal }), (error: unknown) => {
        assert.ok(error instanceof TransportError);
        assert.equal(error.cause, cause);
        assert.equal(error.operationId, "downloadAttachment");
        return true;
      });
      assert.equal(attempts, 1);
    });
  }
});

test("deferred JSON and empty responses keep body failures separate from invalid content", async (t) => {
  keepEventLoopAlive(t);
  // Model a mixed-success operation with a closed response schema that both
  // the internal and the public contract declare.
  const media = operationMediaTypes.countProjects!;
  const previous = media.responseKinds;
  media.responseKinds = { "200": "json", "202": "empty" };
  t.after(() => {
    media.responseKinds = previous;
  });

  for (const status of [200, 202]) {
    await t.test(`body read failure at status ${status}`, async () => {
      // Even a SyntaxError from the stream is a read failure, not malformed JSON.
      const cause = new SyntaxError("Response stream failed");
      const photon = new Photon({ fetch: async () => new Response(new ReadableStream({
        start(controller) { controller.error(cause); },
      }), { status }) });
      await assert.rejects(photon.organizations.projects.count(countInput), (error: unknown) => {
        assert.ok(error instanceof TransportError);
        assert.equal(error.cause, cause);
        return true;
      });
    });
  }
  const malformed = new Photon({ fetch: async () => new Response("{invalid json") });
  await assert.rejects(malformed.organizations.projects.count(countInput), (error: unknown) => {
    assert.ok(error instanceof ResponseValidationError);
    assert.ok(error.cause instanceof SyntaxError);
    return true;
  });
  const invalid = new Photon({ fetch: async () => Response.json({ count: "2" }) });
  await assert.rejects(invalid.organizations.projects.count(countInput), ResponseValidationError);
  const nonempty = new Photon({ fetch: async () => new Response("unexpected", { status: 202 }) });
  await assert.rejects(nonempty.organizations.projects.count(countInput), (error: unknown) => {
    assert.ok(error instanceof ResponseValidationError);
    assert.equal(error.status, 202);
    assert.ok(error.cause instanceof Error);
    assert.equal(error.cause.message, "Expected an empty response");
    return true;
  });
  const valid = { count: 2 };
  const photon = new Photon({ fetch: async () => Response.json(valid) });
  assert.deepEqual(await photon.organizations.projects.count(countInput), valid);
  // A response may gain members after this SDK was generated: they are kept.
  const extra = new Photon({ fetch: async () => Response.json({ ...valid, futureField: true }) });
  assert.deepEqual(await extra.organizations.projects.count(countInput), { ...valid, futureField: true });
});

test("JSON operations parse and validate the body regardless of Content-Type", async () => {
  const json = new TextEncoder().encode('{"count":2}');
  for (const headers of [{}, { "content-type": "text/plain" }, { "content-type": "application/octet-stream" }] as Record<string, string>[]) {
    const photon = new Photon({ fetch: async () => new Response(json, { headers }) });
    const result: unknown = await photon.organizations.projects.count(countInput);
    assert.deepEqual(result, { count: 2 });
    const invalid = new Photon({ fetch: async () =>
      new Response(new TextEncoder().encode('{"count":"2"}'), { headers }) });
    await assert.rejects(invalid.organizations.projects.count(countInput), (error: unknown) => {
      assert.ok(error instanceof ResponseValidationError);
      assert.ok(error.issues.length > 0);
      return true;
    });
  }
});

test("JSON operations reject empty and non-JSON successful bodies", async () => {
  for (const response of [
    () => new Response(null, { status: 200 }),
    () => new Response(new Uint8Array(), { status: 200, headers: { "content-length": "0" } }),
    () => new Response("", { status: 200, headers: { "content-type": "application/json" } }),
    () => new Response("not json", { headers: { "content-type": "text/plain" } }),
    () => new Response(new Uint8Array([0, 255, 1]), { headers: { "content-type": "application/octet-stream" } }),
    () => new Response(null, { status: 204 }),
  ]) {
    const photon = new Photon({ fetch: async () => response() });
    await assert.rejects(photon.organizations.projects.count(countInput), ResponseValidationError);
    await assert.rejects(photon.raw.organizations.projects.count(countInput), ResponseValidationError);
  }
});

test("Accept lists the declared success and error media types", async () => {
  const accept = operationMediaTypes.countProjects!.accept;
  assert.ok(accept.includes("application/json"));
  assert.ok(accept.includes("application/problem+json"));
  let observed: string | null = null;
  const photon = new Photon({ fetch: async (input, init) => {
    observed = new Request(input, init).headers.get("accept");
    return Response.json({ count: 1 });
  } });
  await photon.organizations.projects.count(countInput);
  assert.equal(observed, accept.join(", "));
});

test("Retry-After beyond the cap is not waited for and returns the response", async () => {
  for (const [retryAfter, retry] of [
    ["3600", undefined],
    ["2", { maximumRetryAfterMs: 1_000 }],
  ] as const) {
    let attempts = 0;
    const photon = new Photon({
      ...(retry ? { retry } : {}),
      fetch: async () => {
        attempts += 1;
        return Response.json({ detail: "busy" }, { status: 503, headers: { "retry-after": retryAfter } });
      },
    });
    const started = Date.now();
    await assert.rejects(photon.organizations.projects.count(countInput),
      (error: unknown) => error instanceof ApiError && error.status === 503 &&
        error.headers.get("retry-after") === retryAfter);
    assert.equal(attempts, 1);
    assert.ok(Date.now() - started < 1_000);
  }
  let attempts = 0;
  const within = new Photon({
    retry: { maximumRetryAfterMs: 1_000 },
    fetch: async () => ++attempts === 1
      ? Response.json({ detail: "busy" }, { status: 503, headers: { "retry-after": "0" } })
      : Response.json({ count: 3 }),
  });
  assert.deepEqual(await within.organizations.projects.count(countInput), { count: 3 });
  assert.equal(attempts, 2);
});

test("an Idempotency-Key from the client-wide headers enables mutation retries", async () => {
  const body = { code: "123456", phoneNumber: "+15555550123" };
  for (const headers of [{ "Idempotency-Key": "global-key" }, async () => ({ "idempotency-key": "global-key" })]) {
    let attempts = 0;
    const photon = new Photon({
      headers,
      retry: { baseDelayMs: 1, maximumDelayMs: 1 },
      fetch: async (input, init) => {
        assert.equal(new Request(input, init).headers.get("idempotency-key"), "global-key");
        attempts += 1;
        throw new Error("offline");
      },
    });
    await assert.rejects(photon.account.confirmPhoneVerification({ body }), TransportError);
    assert.equal(attempts, 3);
  }
});

test("a problem response listing issues is an ApiError, not a response validation failure", async () => {
  const problem = {
    type: "https://photon.codes/docs/problems/validation-failed",
    title: "Request Validation Failed",
    status: 422,
    code: "VALIDATION_FAILED",
    detail: "pageSize must be at most 100",
    issues: [{ code: "too_big", location: "query", message: "Too big", path: ["pageSize"] }],
  };
  const photon = new Photon({ retry: false, fetch: async () => new Response(JSON.stringify(problem), {
    status: 422, headers: { "content-type": "application/problem+json", "x-request-id": "validation-request" },
  }) });
  for (const count of [photon.organizations.projects.count, photon.raw.organizations.projects.count]) {
    await assert.rejects(count(countInput), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 422);
      assert.equal(error.requestId, "validation-request");
      assert.equal(error.message, problem.detail);
      assert.deepEqual(error.body, problem);
      return true;
    });
  }
});

test("a response validation failure carries the request ID", async () => {
  const photon = new Photon({ fetch: async () =>
    Response.json({ count: "invalid" }, { headers: { "x-request-id": "invalid-request" } }) });
  await assert.rejects(photon.organizations.projects.count(countInput), (error: unknown) => {
    assert.ok(error instanceof ResponseValidationError);
    assert.equal(error.requestId, "invalid-request");
    assert.equal(error.status, 200);
    assert.ok(error.issues.length > 0);
    return true;
  });
});

test("an undeclared 304 stays an ApiError", async () => {
  const photon = new Photon({ retry: false, fetch: async () => new Response(null, { status: 304 }) });
  await assert.rejects(photon.organizations.projects.count(countInput),
    (error: unknown) => error instanceof ApiError && error.status === 304);
});
