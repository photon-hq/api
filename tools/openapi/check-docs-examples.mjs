#!/usr/bin/env node
// Checks the code examples in the guide pages (docs/**/*.mdx.vel) against the
// packages in this repository. Every fenced block whose language is
// `typescript`/`ts`, `python`/`py`, `rust`/`rs` or `go` is a complete program: it
// must type-check (TypeScript `tsc --strict`, Python pyright) or compile (Rust, Go),
// then run to completion against a local mock of the API and send at least
// one request, and only requests the mock serves, each valid against the
// contract. Blocks in other languages
// (`sh`, `json`, ...) are not checked; put `{/* docs-check: skip */}` on the
// line before a block's opening fence to leave out an intentional fragment.
// The generated SDK reference (docs/sdk) is not read here: its signatures are
// copied from the generated clients and its examples are the code samples
// tools/openapi/check-code-samples.mjs compiles and runs.
// An example that receives webhooks defines a handler instead of sending
// requests itself: TypeScript `export const handleDelivery = async (request) =>`,
// Python `def handle_delivery(body, headers)`, Rust `impl Receiver` with
// `from_env()` and `handle(body, headers)`, Go `newReceiver()` returning an
// `http.Handler` (its `main` is not run). The check hands it a `message.received`
// delivery signed with PHOTON_WEBHOOK_SECRET, which it must accept with a 2xx,
// and the same delivery with a changed body, which it must reject with 400.
// For the valid delivery it must read the message and mark it read, with the
// idempotency key `read-<webhook-id>`; for the tampered one it must send nothing.
// Nothing reaches the API: TypeScript examples run with a fetch that sends
// every request to the mock, Python examples with the client's base URL set
// to it, Rust examples with `.base_url(...)` added before `.build()`, and Go
// examples with a `WithBaseURL` option appended after the author's own options.
// TypeScript and Python clients also validate responses strictly, as in the
// packages' own tests, so a mock answer that drifts from the contract fails.
// Usage: node tools/openapi/check-docs-examples.mjs typescript|python|rust|go
// Every language needs `npm ci` and `npm run build:tools` first: the mock
// generates and validates its bodies with tools/openapi/src/contract-values.ts.
// TypeScript also needs `npm run build:typescript` (it uses the
// repository's node_modules); Python needs the package
// installed in the active interpreter (pip install -e packages/python) and
// pyright from tools/python-codegen/requirements-dev.txt.
// `node tools/openapi/check-docs-examples.mjs delivery <contract.json>...`
// checks the receiver examples' delivery against each contract's
// SmsMessageReceivedEvent schema.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "../..");

export const LANGUAGES = {
  typescript: ["typescript", "ts"],
  python: ["python", "py"],
  rust: ["rust", "rs"],
  go: ["go", "golang"],
};
export const SKIP_MARKER = "{/* docs-check: skip */}";

/** Fenced code blocks of one language in an MDX page, with their line numbers. */
export function extractBlocks(text, language) {
  const tags = LANGUAGES[language];
  const lines = text.split("\n");
  const blocks = [];
  for (let index = 0; index < lines.length; index += 1) {
    const open = /^(\s*)(`{3,}|~{3,})\s*([^\s`]*)/.exec(lines[index]);
    if (!open) continue;
    const [, indent, fence, tag] = open;
    const start = index;
    const body = [];
    for (index += 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (line.trim().startsWith(fence[0].repeat(fence.length)) && line.trim().replaceAll(fence[0], "") === "") break;
      body.push(line.startsWith(indent) ? line.slice(indent.length) : line.trimStart());
    }
    assert.ok(index < lines.length, `Unclosed code block at line ${start + 1}`);
    let previous = start - 1;
    while (previous >= 0 && lines[previous].trim() === "") previous -= 1;
    const skipped = previous >= 0 && lines[previous].trim() === SKIP_MARKER;
    if (tags.includes(tag.toLowerCase()) && !skipped) blocks.push({ line: start + 1, code: `${body.join("\n")}\n` });
  }
  return blocks;
}

/** The generated SDK reference, checked through the code samples it shows. */
export const GENERATED_REFERENCE = "sdk";

function pages(directory, top = true) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!(top && entry.name === GENERATED_REFERENCE)) found.push(...pages(path, false));
    }
    else if (entry.name.endsWith(".mdx.vel") || entry.name.endsWith(".mdx")) found.push(path);
  }
  return found.sort();
}

/** Every checked block of one language in docs/, named after its page and line. */
export function collectExamples(docs, language) {
  return pages(docs).flatMap((path) => {
    const page = relative(docs, path).replace(/\.mdx(\.vel)?$/, "");
    return extractBlocks(readFileSync(path, "utf8"), language).map(({ line, code }) => ({
      name: `${page.replace(/[^A-Za-z0-9]+/g, "_")}_l${line}`,
      location: `docs/${relative(docs, path)}:${line}`,
      code,
    }));
  });
}

// The mock API: the operations the guide's examples call, answered from the
// contract of the tree under test (config/sdk.json schemaPath). Every body is
// generated from the operation's response schema; the few values only the
// guide knows (the page-2 token, the created project's name and slug, the
// receiver's message) are applied on top, and the result is validated against
// that schema. Every request is first validated against the operation's
// security, parameters, headers and body. A request or body that does not
// match fails the run, as does any request the mock does not serve.
const tools = join(root, "tools/openapi/dist");
assert.ok(existsSync(join(tools, "contract-values.js")), "run npm run build:tools first");
const { childPointer, contractValues, describeIssues, refPointer } = await import(pathToFileURL(join(tools, "contract-values.js")).href);
const { contractPath } = await import(pathToFileURL(join(tools, "shared.js")).href);

/** The contract of the tree under test. */
export function readContract() {
  return JSON.parse(readFileSync(join(root, contractPath(root)), "utf8"));
}

// A fresh synthetic signing secret per run, for the webhook receiver examples.
const WEBHOOK_SECRET = `whsec_${randomBytes(32).toString("base64")}`;
const REQUEST_ID = "req_docs_example";
const TIMESTAMP = "2026-01-01T00:00:00.000Z";
/** The environment variable that holds the example credential of each security scheme. */
const CREDENTIALS = { accountServiceKey: "PHOTON_API_KEY", projectApiKey: "PHOTON_PROJECT_API_KEY", oauth2: "PHOTON_ACCESS_TOKEN" };
const PAGE_2 = "page_2";

// The receiver examples' delivery: a message.received event, written by hand
// until the tree carries the event schemas. CI validates it against
// SmsMessageReceivedEvent (check-docs-examples.mjs delivery <contract>...).
const WEBHOOK_PROJECT_ID = "pho_prj_00000000000000000000000001";
const RECEIVED_MESSAGE = {
  id: "pho_msg_00000000000000000000000001", projectId: WEBHOOK_PROJECT_ID, platform: "sms",
  space: {
    details: {}, id: "pho_spc_00000000000000000000000001", kind: "direct", metadata: {},
    participantIds: ["pho_usr_00000000000000000000000001", "pho_usr_00000000000000000000000002"], platform: "sms", projectId: WEBHOOK_PROJECT_ID,
  },
  sentBy: { details: {}, handle: "+14155550124", id: "pho_usr_00000000000000000000000002", kind: "user", metadata: {}, platform: "sms", projectId: WEBHOOK_PROJECT_ID },
  content: { format: "plain", text: "Is my order on its way?", type: "text" }, metadata: {},
  createdAt: TIMESTAMP, updatedAt: TIMESTAMP, status: "received", timestamps: { receivedAt: TIMESTAMP },
};
const EVENT_ID = "pho_evt_00000000000000000000000001";
const DELIVERY_SCHEMA = "#/components/schemas/SmsMessageReceivedEvent";

/**
 * The deliveries a receiver example is handed: a `message.received` event
 * signed with PHOTON_WEBHOOK_SECRET as Photon signs it, which it must accept,
 * and the same delivery with a changed body, which it must reject.
 */
export function webhookDeliveries(now = Math.floor(Date.now() / 1000)) {
  const event = {
    id: EVENT_ID, type: "message.received", apiVersion: "2026-07-01", source: "sms.photon", timestamp: new Date(now * 1000).toISOString(),
    data: { projectId: WEBHOOK_PROJECT_ID, object: RECEIVED_MESSAGE },
  };
  const body = JSON.stringify(event);
  const key = Buffer.from(WEBHOOK_SECRET.slice("whsec_".length), "base64");
  const signature = createHmac("sha256", key).update(`${EVENT_ID}.${now}.${body}`).digest("base64");
  const headers = { "content-type": "application/json", "webhook-id": EVENT_ID, "webhook-timestamp": String(now), "webhook-signature": `v1,${signature}` };
  return [
    { body, headers, accept: true },
    { body: body.replace("Is my order", "Was my order"), headers, accept: false },
  ];
}

/** Throw unless the valid delivery's event matches the contract's SmsMessageReceivedEvent. */
export function checkDelivery(document) {
  const values = contractValues(document);
  assert.ok(values.node(DELIVERY_SCHEMA), "The contract has no SmsMessageReceivedEvent schema");
  const issues = values.issues(DELIVERY_SCHEMA, JSON.parse(webhookDeliveries()[0].body));
  assert.equal(issues.length, 0, `The receiver examples' delivery does not match SmsMessageReceivedEvent: ${describeIssues(issues)}`);
}

/** A receiver example, in any language: it defines a handler instead of sending requests itself. */
const RECEIVER = /^(export const handleDelivery = |def handle_delivery\(|impl Receiver \{|func newReceiver\()/m;
/** What a receiver sends for the two deliveries: the valid one's message read and marked read, once. */
const RECEIVER_REQUESTS = [
  `GET /v1/projects/${WEBHOOK_PROJECT_ID}/messages/${RECEIVED_MESSAGE.id}`,
  `POST /v1/projects/${WEBHOOK_PROJECT_ID}/messages/${RECEIVED_MESSAGE.id}/read read-${EVENT_ID}`,
];

const otherOrganization = (params, environment) => params.organizationId !== environment.PHOTON_ORGANIZATION_ID
  && { unexpected: `organization ${params.organizationId}` };
const otherMessage = (params) => (params.id !== WEBHOOK_PROJECT_ID || params.messageId !== RECEIVED_MESSAGE.id)
  && { unexpected: `message ${params.messageId} in project ${params.id}` };

/**
 * The operations the guide's examples call, and what only the guide knows
 * about each: which resources exist, and the values it reads back. A handler
 * answers `[status, overlay, problem code]`, or `{ unexpected }` for a resource
 * the guide does not use; the body itself comes from the operation's response schema.
 */
const GUIDE_OPERATIONS = {
  getAccount: () => [200],
  countProjects: ({ params }, environment) => otherOrganization(params, environment) || [200],
  listProjects: ({ params, query }, environment) => {
    const pageToken = query.get("pageToken");
    if (pageToken === null) return otherOrganization(params, environment) || [200, { nextPageToken: PAGE_2 }];
    return otherOrganization(params, environment) || (pageToken === PAGE_2 ? [200] : [400, {}, "INVALID_ARGUMENT"]);
  },
  createProject: ({ params, input }, environment) => otherOrganization(params, environment) || [201, { name: input.name, slug: input.slug }],
  getProject: ({ params }, environment) => (params.projectId === environment.PHOTON_PROJECT_ID
    ? [200, { projectId: params.projectId }] : [404, {}, "PROJECT_NOT_FOUND"]),
  createWebhookDestination: () => [201],
  getMessage: ({ params }) => otherMessage(params) || [200, { id: params.messageId, projectId: params.id }],
  markMessageRead: ({ params }) => otherMessage(params) || [202],
};

/** A path, query or header value as the type its schema names. */
function parameterValue(schema, text) {
  const types = [schema?.type].flat();
  if ((types.includes("integer") || types.includes("number")) && /^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if (types.includes("boolean") && (text === "true" || text === "false")) return text === "true";
  return text;
}

/** The mock API for one contract: the environment its examples run with, `answer`, and the check every body passes. */
export function createMock(document) {
  const values = contractValues(document);
  const resolved = (pointer) => {
    const node = values.node(pointer);
    return typeof node?.$ref === "string" ? resolved(refPointer(node.$ref)) : { pointer, node };
  };
  const operations = new Map();
  for (const [template, item] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(item)) {
      if (!Object.hasOwn(GUIDE_OPERATIONS, operation?.operationId ?? "")) continue;
      const at = childPointer("#/paths", template, method);
      // Operation parameters replace path-item parameters of the same name and location.
      const parameters = new Map();
      for (const owner of [childPointer("#/paths", template), at]) {
        for (const index of (values.node(childPointer(owner, "parameters")) ?? []).keys()) {
          const { pointer, node } = resolved(childPointer(owner, "parameters", index));
          parameters.set(`${node.in} ${node.name}`, { in: node.in, name: node.name, required: node.required === true, schema: childPointer(pointer, "schema") });
        }
      }
      const responses = new Map();
      for (const status of Object.keys(operation.responses)) {
        const { pointer, node } = resolved(childPointer(at, "responses", status));
        const media = Object.keys(node.content ?? {})[0];
        if (media) responses.set(Number(status), { media, schema: childPointer(pointer, "content", media, "schema") });
      }
      const body = operation.requestBody && resolved(childPointer(at, "requestBody"));
      operations.set(operation.operationId, {
        id: operation.operationId,
        method: method.toUpperCase(),
        path: new RegExp(`^${template.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{[^}]+\}/g, "([^/]+)")}$`),
        names: [...template.matchAll(/\{([^}]+)\}/g)].map((name) => name[1]),
        schemes: new Set((operation.security ?? document.security ?? []).flatMap((requirement) => Object.keys(requirement))),
        parameters: [...parameters.values()],
        body: body && {
          required: body.node.required === true,
          media: Object.keys(body.node.content ?? {}),
          schema: childPointer(body.pointer, "content", "application/json", "schema"),
        },
        responses,
      });
    }
  }
  for (const id of Object.keys(GUIDE_OPERATIONS)) assert.ok(operations.has(id), `The contract has no ${id} operation`);

  // Each ID the guide reads from the environment: one value every path parameter of that name accepts.
  const identifier = (parameter, readable) => {
    const schemas = [...operations.values()].flatMap(({ parameters }) => parameters)
      .filter((candidate) => candidate.in === "path" && candidate.name === parameter).map(({ schema }) => schema);
    return values.sample(schemas[0], { key: parameter, name: readable, also: schemas.slice(1) });
  };
  const environment = {
    PHOTON_API_KEY: "pho_ask_docs_example",
    PHOTON_PROJECT_API_KEY: "pho_sk_docs_example",
    PHOTON_ACCESS_TOKEN: "docs_example_access_token",
    PHOTON_ORGANIZATION_ID: identifier("organizationId", "org_docs_example"),
    PHOTON_PROJECT_ID: identifier("projectId", "proj_docs_example"),
    PHOTON_WEBHOOK_SECRET: WEBHOOK_SECRET,
  };

  /** Why a request does not match its operation's parameters and body; empty when it matches. */
  function requestIssues(operation, { params, query, headers, input }) {
    const found = [];
    const check = (where, schema, value) => {
      for (const issue of values.issues(schema, value)) found.push(`${where}${issue.pointer} ${issue.message}`);
    };
    for (const parameter of operation.parameters) {
      if (parameter.in === "query" && query.getAll(parameter.name).length > 1) {
        found.push(`query ${parameter.name} is repeated`);
        continue;
      }
      const text = { path: params[parameter.name], query: query.get(parameter.name) ?? undefined, header: headers[parameter.name.toLowerCase()] }[parameter.in];
      if (text === undefined) {
        if (parameter.required) found.push(`${parameter.in} ${parameter.name} is required`);
      } else {
        check(`${parameter.in} ${parameter.name}`, parameter.schema, parameterValue(resolved(parameter.schema).node, text));
      }
    }
    for (const name of query.keys()) {
      if (!operation.parameters.some((parameter) => parameter.in === "query" && parameter.name === name)) found.push(`query ${name} is not a parameter`);
    }
    if (input === undefined && operation.body?.required) found.push("the body is required");
    if (input !== undefined && !operation.body) found.push("the operation takes no body");
    if (input !== undefined && operation.body) {
      const media = (headers["content-type"] ?? "").split(";")[0].trim().toLowerCase();
      if (operation.body.media.includes(media)) check("body", operation.body.schema, input);
      else found.push(`header Content-Type ${media || "is missing and"} is not one of ${operation.body.media.join(", ")}`);
    }
    return found;
  }

  /** Throw, naming the operation, status and JSON pointer, when `body` does not match the response schema. */
  function checkResponse(id, status, body) {
    const response = operations.get(id)?.responses.get(status);
    assert.ok(response, `${id} declares no ${status} response body`);
    const issues = values.issues(response.schema, body);
    if (issues.length) throw new Error(`${id} ${status}: the mock's body does not match the contract: ${describeIssues(issues)}`);
  }

  /** The branch of a problem schema, through `$ref`s and unions, whose `code` is `code`. */
  function problem(pointer, code) {
    const { pointer: at, node } = resolved(pointer);
    if (node?.properties?.code?.const === code) return at;
    for (const keyword of ["oneOf", "anyOf"]) {
      for (const index of (node?.[keyword] ?? []).keys()) {
        const found = problem(childPointer(at, keyword, index), code);
        if (found) return found;
      }
    }
    return undefined;
  }

  function respond(operation, status, overlay = {}, code = undefined) {
    const response = operation.responses.get(status);
    assert.ok(response, `${operation.id} declares no ${status} response body`);
    const source = code === undefined ? response.schema : problem(response.schema, code);
    assert.ok(source, `${operation.id} ${status} has no ${code} problem`);
    const sample = values.sample(source, { key: `${operation.id} ${status}`, name: operation.id, items: 1 });
    const body = Object.keys(overlay).length === 0 ? sample : { ...sample, ...overlay };
    checkResponse(operation.id, status, body);
    return { status, body, media: response.media };
  }

  /** Answer one request: `{ status, body, media }`, or `{ unexpected }` for a request the mock does not serve. */
  function answer({ method, url, headers, body }) {
    const { pathname, searchParams } = new URL(url, "http://mock");
    const operation = [...operations.values()].find((candidate) => candidate.method === method && candidate.path.test(pathname));
    if (!operation) return { unexpected: `${method} ${pathname}` };
    const values = operation.path.exec(pathname).slice(1);
    const params = Object.fromEntries(operation.names.map((name, index) => [name, decodeURIComponent(values[index])]));
    const token = /^Bearer (.+)$/.exec(headers.authorization ?? "")?.[1];
    const scheme = Object.keys(CREDENTIALS).find((name) => environment[CREDENTIALS[name]] === token);
    if (!scheme) return { ...respond(operation, 401, {}, "NOT_AUTHENTICATED"), rejected: `${operation.id} without a credential it accepts` };
    if (!operation.schemes.has(scheme)) return { unexpected: `${operation.id} with the ${scheme} credential` };
    let input;
    try {
      input = body ? JSON.parse(body) : undefined;
    } catch {
      return { unexpected: `${operation.id} request: the body is not JSON` };
    }
    const issues = requestIssues(operation, { params, query: searchParams, headers, input });
    if (issues.length) return { unexpected: `${operation.id} request: ${issues.join("; ")}` };
    const result = GUIDE_OPERATIONS[operation.id]({ params, query: searchParams, input }, environment);
    return Array.isArray(result) ? respond(operation, ...result) : { unexpected: `${operation.id}: ${result.unexpected}` };
  }

  return { environment, answer, checkResponse };
}

const mock = createMock(readContract());
export const { environment: ENVIRONMENT, answer, checkResponse } = mock;

async function startMock() {
  const state = { requests: 0, unexpected: [], rejected: [], served: [] };
  const server = createServer((request, response) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      state.requests += 1;
      let result;
      try {
        result = answer({ method: request.method, url: request.url, headers: request.headers, body: Buffer.concat(chunks).toString("utf8") });
      } catch (error) {
        result = { unexpected: error.message };
      }
      if (result.rejected) state.rejected.push(result.rejected);
      if (result.unexpected) {
        state.unexpected.push(result.unexpected);
        result = {
          status: 418, media: "application/problem+json",
          body: { type: "https://photon.codes/docs/problems/docs-check", code: "DOCS_CHECK", title: "Unexpected request", status: 418, detail: result.unexpected },
        };
      } else {
        state.served.push(`${request.method} ${new URL(request.url, "http://mock").pathname} ${request.headers["idempotency-key"] ?? ""}`.trim());
      }
      const text = JSON.stringify(result.body);
      response.writeHead(result.status, { "content-type": result.media, "content-length": Buffer.byteLength(text), "x-request-id": REQUEST_ID });
      response.end(text);
    });
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  return { state, server, baseUrl: `http://127.0.0.1:${server.address().port}` };
}

const run = (command, args, options = {}) => execFileSync(command, args, { stdio: "inherit", ...options });

// Longest an example may run; a hung example (a retry loop, a stuck request)
// fails with its location instead of stalling the job.
const EXAMPLE_TIMEOUT_MS = 60_000;

function runAsync(command, args, options) {
  return new Promise((done, fail) => {
    const child = spawn(command, args, { stdio: "inherit", timeout: EXAMPLE_TIMEOUT_MS, killSignal: "SIGKILL", ...options });
    child.on("error", fail);
    child.on("close", (status, signal) => done({ status, signal }));
  });
}

// Each example runs in its own process, one after another, while this process
// serves the mock; each must exit 0 and send only requests the mock serves.
async function runExamples(examples, mock, commandFor) {
  const failures = [];
  for (const example of examples) {
    const before = { requests: mock.state.requests, unexpected: mock.state.unexpected.length, rejected: mock.state.rejected.length, served: mock.state.served.length };
    const [command, args, options] = commandFor(example);
    const { status, signal } = await runAsync(command, args, {
      ...options,
      env: {
        ...process.env, ...ENVIRONMENT, DOCS_CHECK_BASE_URL: mock.baseUrl,
        DOCS_CHECK_DELIVERIES: JSON.stringify(webhookDeliveries()), ...options?.env,
      },
    });
    const unexpected = mock.state.unexpected.slice(before.unexpected);
    const rejected = mock.state.rejected.slice(before.rejected);
    const served = mock.state.served.slice(before.served);
    const recorded = [
      ...(unexpected.length ? [`requests the mock did not serve: ${unexpected.join(", ")}`] : []),
      ...(rejected.length ? [`requests without an accepted credential: ${rejected.join(", ")}`] : []),
    ];
    if (signal === "SIGKILL") failures.push(`${example.location}: timed out after ${EXAMPLE_TIMEOUT_MS / 1000} s`);
    else if (status !== 0) failures.push([`${example.location}: exited with ${status ?? signal}`, ...recorded].join("; "));
    else if (recorded.length) failures.push(`${example.location}: ${recorded.join("; ")}`);
    else if (mock.state.requests === before.requests) failures.push(`${example.location}: sent no request`);
    else if (RECEIVER.test(example.code) && served.join("\n") !== RECEIVER_REQUESTS.join("\n")) {
      failures.push(`${example.location}: the receiver sent [${served.join(", ")}], not [${RECEIVER_REQUESTS.join(", ")}]`);
    }
  }
  return failures;
}

// The Rust scratch project uses the versions this repository's Cargo.lock pins.
function crateVersion(name) {
  const version = new RegExp(`^name = "${name}"\\nversion = "([^"]+)"`, "m").exec(readFileSync(join(root, "Cargo.lock"), "utf8"))?.[1];
  assert.ok(version, `${name} is not in Cargo.lock`);
  return version;
}

async function checkTypeScript(examples, work, mock) {
  mkdirSync(join(work, "examples"));
  for (const { name, location, code } of examples) {
    writeFileSync(join(work, "examples", `${name}.ts`), `${strictClients(code, location)}export {};\n`);
  }
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "docs-examples", private: true, type: "module" }));
  writeFileSync(join(work, "tsconfig.json"), JSON.stringify({
    compilerOptions: {
      strict: true, noUnusedLocals: true, noUnusedParameters: true, module: "nodenext", target: "es2022", noEmit: true, skipLibCheck: true, types: ["node"],
    },
    include: ["examples/*.ts"],
  }));
  // Use the repository's locked install (npm ci, then npm run build:typescript):
  // the workspace package, typescript and @types/node resolve through a link.
  const packageName = JSON.parse(readFileSync(join(root, "packages/typescript/package.json"), "utf8")).name;
  for (const required of [packageName, "typescript", "@types/node"]) {
    assert.ok(existsSync(join(root, "node_modules", required, "package.json")), `${required} is not installed; run npm ci first`);
  }
  assert.ok(existsSync(join(root, "packages/typescript/dist/index.js")), "run npm run build:typescript first");
  symlinkSync(join(root, "node_modules"), join(work, "node_modules"), "dir");
  run(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "-p", "."], { cwd: work });
  // The mocked fetch sends every request to the mock, whatever its URL.
  writeFileSync(join(work, "mock-fetch.mjs"), `
const original = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const request = new Request(input, init);
  const url = new URL(request.url);
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  return original(process.env.DOCS_CHECK_BASE_URL + url.pathname + url.search, { method: request.method, headers: request.headers, body, signal: request.signal });
};
`);
  // A receiver example's handler is handed the check's deliveries.
  writeFileSync(join(work, "deliver.mjs"), `
import { pathToFileURL } from "node:url";
const { handleDelivery } = await import(pathToFileURL(process.argv[2]).href);
for (const { body, headers, accept } of JSON.parse(process.env.DOCS_CHECK_DELIVERIES)) {
  const response = await handleDelivery(new Request("https://receiver.example/webhooks/photon", { method: "POST", headers, body }));
  if (accept ? response.status < 200 || response.status > 299 : response.status !== 400) {
    console.error((accept ? "A valid" : "A tampered") + " delivery was answered " + response.status);
    process.exit(1);
  }
}
`);
  return runExamples(examples, mock, ({ name, code }) => {
    const runner = RECEIVER.test(code) ? ["deliver.mjs"] : [];
    return [process.execPath, ["--no-warnings", "--import", "./mock-fetch.mjs", ...runner, `examples/${name}.ts`], { cwd: work }];
  });
}

async function checkPython(examples, work, mock) {
  mkdirSync(join(work, "examples"));
  for (const { name, code } of examples) writeFileSync(join(work, "examples", `${name}.py`), code);
  const python = process.env.PYTHON_BIN ?? "python";
  const interpreter = execFileSync(python, ["-c", "import sys; print(sys.executable)"], { encoding: "utf8" }).trim();
  run(python, ["-m", "pyright", "--pythonpath", interpreter, "examples"], { cwd: work });
  // The package's own lint and format rules.
  const config = join(root, "packages/python/pyproject.toml");
  run(python, ["-m", "ruff", "check", "--config", config, "examples"], { cwd: work });
  run(python, ["-m", "ruff", "format", "--check", "--config", config, "examples"], { cwd: work });
  // Every client the example creates talks to the mock.
  writeFileSync(join(work, "run.py"), `
import json, os, runpy, sys
import photon_api

for cls in (photon_api.Photon, photon_api.AsyncPhoton):
    def patched(self, *args, __original=cls.__init__, **kwargs):
        kwargs["base_url"] = os.environ["DOCS_CHECK_BASE_URL"]
        kwargs["strict_response_validation"] = True
        __original(self, *args, **kwargs)
    cls.__init__ = patched
namespace = runpy.run_path(sys.argv[1], run_name="__main__")
# A receiver example's handler is handed the check's deliveries.
handle = namespace.get("handle_delivery")
for delivery in json.loads(os.environ["DOCS_CHECK_DELIVERIES"]) if handle else []:
    status = handle(delivery["body"].encode(), delivery["headers"])
    if not (200 <= status < 300 if delivery["accept"] else status == 400):
        kind = "valid" if delivery["accept"] else "tampered"
        sys.exit(f"A {kind} delivery was answered {status}")
`);
  return runExamples(examples, mock, ({ name }) => [python, ["run.py", `examples/${name}.py`], { cwd: work }]);
}

/** Make every `new Photon(...)` validate responses strictly: `strictResponseValidation: true` leads its options. */
export function strictClients(code, location) {
  assert.ok(!code.includes("strictResponseValidation"), `${location}: set strictResponseValidation only through the check, which makes every client strict`);
  return code.replace(/new Photon\(\s*([{)])?/g, (_, next) => {
    assert.ok(next, `${location}: pass new Photon an object literal or nothing, so the check can make it strict`);
    return next === "{" ? "new Photon({ strictResponseValidation: true," : "new Photon({ strictResponseValidation: true })";
  });
}

/** Add `.base_url(<mock>)` before the `.build()` that ends each `PhotonClientBuilder::new()` chain. */
export function redirectBuilders(code, location) {
  const builders = [...code.matchAll(/PhotonClientBuilder::new\(\)/g)];
  assert.ok(builders.length > 0, `${location}: no PhotonClientBuilder::new() to redirect`);
  let result = "";
  let from = 0;
  for (const builder of builders) {
    const build = code.indexOf(".build()", builder.index);
    const next = builders.find((other) => other.index > builder.index)?.index ?? Infinity;
    assert.ok(build >= 0 && build < next, `${location}: a PhotonClientBuilder chain has no .build()`);
    result += `${code.slice(from, build)}.base_url(std::env::var("DOCS_CHECK_BASE_URL").expect("DOCS_CHECK_BASE_URL"))`;
    from = build;
  }
  return result + code.slice(from);
}

// A Rust receiver example defines `impl Receiver` with `from_env()` and
// `handle(body, headers)` and no `main`; this one hands it the check's deliveries.
const RUST_RECEIVER_MAIN = `
#[tokio::main]
async fn main() {
    let receiver = Receiver::from_env().expect("Receiver::from_env");
    let deliveries: serde_json::Value =
        serde_json::from_str(&std::env::var("DOCS_CHECK_DELIVERIES").unwrap()).unwrap();
    for delivery in deliveries.as_array().unwrap() {
        let mut headers = http::HeaderMap::new();
        for (name, value) in delivery["headers"].as_object().unwrap() {
            headers.insert(
                http::HeaderName::from_bytes(name.as_bytes()).unwrap(),
                http::HeaderValue::from_str(value.as_str().unwrap()).unwrap(),
            );
        }
        let body = delivery["body"].as_str().unwrap().as_bytes();
        let status = receiver.handle(body, &headers).await;
        let accept = delivery["accept"].as_bool().unwrap();
        let kind = if accept { "valid" } else { "tampered" };
        let answered = if accept { (200..300).contains(&status) } else { status == 400 };
        assert!(answered, "A {kind} delivery was answered {status}");
    }
}
`;

async function checkRust(examples, work, mock) {
  mkdirSync(join(work, "src/bin"), { recursive: true });
  mkdirSync(join(work, "fmt"));
  for (const { name, code } of examples) writeFileSync(join(work, "fmt", `${name}.rs`), code);
  run("rustfmt", ["--check", "--edition", "2024", ...examples.map(({ name }) => `fmt/${name}.rs`)], { cwd: work });
  for (const { name, location, code } of examples) {
    assert.doesNotMatch(code, /BlockingClient|Client::new\(|with_backend/, `${location}: build Rust clients with PhotonClientBuilder so the check can redirect them`);
    const receiver = RECEIVER.test(code) ? RUST_RECEIVER_MAIN : "";
    const rewritten = redirectBuilders(code, location) + receiver;
    // Examples compile without warnings, such as unused imports.
    writeFileSync(join(work, "src/bin", `${name}.rs`), `#![deny(warnings)]\n${rewritten}`);
  }
  writeFileSync(join(work, "src/lib.rs"), "");
  writeFileSync(join(work, "Cargo.toml"), `[package]
name = "photon-docs-examples"
version = "0.0.0"
edition = "2024"
publish = false

[dependencies]
photonhq-api = { path = ${JSON.stringify(join(root, "packages/rust"))} }
http = "=${crateVersion("http")}"
rand = "=${crateVersion("rand")}"
serde_json = "=${crateVersion("serde_json")}"
tokio = { version = "=${crateVersion("tokio")}", features = ["macros", "rt-multi-thread"] }

[workspace]
`);
  // Start from this repository's lockfile so dependencies resolve to the tested versions.
  copyFileSync(join(root, "Cargo.lock"), join(work, "Cargo.lock"));
  const targetDir = process.env.CARGO_TARGET_DIR ?? join(root, "target");
  run("cargo", ["build", "--quiet", "--bins"], { cwd: work, env: { ...process.env, CARGO_TARGET_DIR: targetDir } });
  return runExamples(examples, mock, ({ name }) => [join(targetDir, "debug", name), [], { cwd: work }]);
}

/**
 * Append a `WithBaseURL(<mock>)` option to each `photonapi.NewClient(...)` call,
 * after the author's own options, so a base URL an example sets never wins over
 * the mock. Needs `"os"` imported, which every example's env reads already do.
 */
export function redirectClients(code, location) {
  const marker = "photonapi.NewClient(";
  assert.ok(code.includes(marker), `${location}: no photonapi.NewClient( to redirect`);
  assert.match(code, /^\t"os"$/m, `${location}: import "os" so the check can redirect the client`);
  const override = 'photonapi.WithBaseURL(os.Getenv("DOCS_CHECK_BASE_URL"))';
  let result = "";
  let from = 0;
  for (let start = code.indexOf(marker); start >= 0; start = code.indexOf(marker, from)) {
    let index = start + marker.length;
    for (let depth = 1; depth > 0; index += 1) {
      assert.ok(index < code.length, `${location}: an unbalanced photonapi.NewClient call`);
      if (code[index] === "(") depth += 1;
      else if (code[index] === ")") depth -= 1;
    }
    const close = index - 1;
    let previous = close - 1;
    while (previous > start && /\s/.test(code[previous])) previous -= 1;
    const insertion = code[previous] === "(" ? override : code[previous] === "," ? ` ${override},` : `, ${override}`;
    result += code.slice(from, close) + insertion;
    from = close;
  }
  return result + code.slice(from);
}

// A Go receiver example defines `newReceiver()`, which returns its
// `http.Handler`; its own `main` is renamed, and this one hands the handler
// the check's deliveries.
const GO_RECEIVER_MAIN = `package main

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
)

func main() {
	handler, err := newReceiver()
	if err != nil {
		log.Fatal(err)
	}
	var deliveries []struct {
		Body    string
		Headers map[string]string
		Accept  bool
	}
	if err := json.Unmarshal([]byte(os.Getenv("DOCS_CHECK_DELIVERIES")), &deliveries); err != nil {
		log.Fatal(err)
	}
	for _, delivery := range deliveries {
		request := httptest.NewRequest(http.MethodPost, "/webhooks/photon", strings.NewReader(delivery.Body))
		for name, value := range delivery.Headers {
			request.Header.Set(name, value)
		}
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, request)
		if ok := recorder.Code >= 200 && recorder.Code < 300; ok != delivery.Accept || (!ok && recorder.Code != http.StatusBadRequest) {
			log.Fatalf("A delivery (accept: %v) was answered %d", delivery.Accept, recorder.Code)
		}
	}
}
`;

async function checkGo(examples, work, mock) {
  const module = /^module (\S+)$/m.exec(readFileSync(join(root, "packages/go/go.mod"), "utf8"))?.[1];
  assert.ok(module, "packages/go/go.mod has no module line");
  mkdirSync(join(work, "examples"));
  mkdirSync(join(work, "fmt"));
  for (const { name, location, code } of examples) {
    mkdirSync(join(work, "examples", name));
    const redirected = redirectClients(code, location);
    if (RECEIVER.test(code)) {
      writeFileSync(join(work, "examples", name, "main.go"), redirected.replace(/^func main\(\) \{$/m, "func exampleMain() {"));
      writeFileSync(join(work, "examples", name, "docs_check_main.go"), GO_RECEIVER_MAIN);
    } else {
      writeFileSync(join(work, "examples", name, "main.go"), redirected);
    }
    // Formatting is checked on the block as written, not the redirected copy.
    writeFileSync(join(work, "fmt", `${name}.go`), code);
  }
  const unformatted = execFileSync("gofmt", ["-l", "fmt"], { cwd: work, encoding: "utf8" }).trim();
  assert.equal(unformatted, "", `Go examples are not gofmt-formatted:\n${unformatted}`);
  writeFileSync(join(work, "go.mod"), `module photon-docs-examples\n\ngo 1.25\n\nrequire ${module} v0.0.0-00010101000000-000000000000\n\nreplace ${module} => ${join(root, "packages/go")}\n`);
  // Start from the client's go.sum so its dependencies are verified against the committed checksums.
  copyFileSync(join(root, "packages/go/go.sum"), join(work, "go.sum"));
  run("go", ["get", `${module}@v0.0.0-00010101000000-000000000000`], { cwd: work });
  for (const { name } of examples) run("go", ["build", `./examples/${name}`], { cwd: work });
  return runExamples(examples, mock, ({ name }) => ["go", ["run", `./examples/${name}`], { cwd: work }]);
}

export async function checkDocsExamples(language, { docs = join(root, "docs") } = {}) {
  assert.ok(Object.hasOwn(LANGUAGES, language), "Usage: check-docs-examples.mjs typescript|python|rust|go");
  const examples = collectExamples(docs, language);
  assert.ok(examples.length > 0, `No ${language} examples in ${docs}`);
  const work = mkdtempSync(join(tmpdir(), `photon-docs-${language}-`));
  const mock = await startMock();
  try {
    const check = { typescript: checkTypeScript, python: checkPython, rust: checkRust, go: checkGo }[language];
    const failures = await check(examples, work, mock);
    assert.equal(failures.length, 0, `Documentation examples failed:\n${failures.join("\n")}`);
    return examples.length;
  } finally {
    mock.server.close();
    rmSync(work, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [command, ...contracts] = process.argv.slice(2);
  if (command === "delivery") {
    assert.ok(contracts.length > 0, "Usage: check-docs-examples.mjs delivery <contract.json>...");
    for (const contract of contracts) {
      try {
        checkDelivery(JSON.parse(readFileSync(resolve(contract), "utf8")));
      } catch (error) {
        throw new Error(`${contract}: ${error.message}`, { cause: error });
      }
    }
    console.log(`The receiver examples' delivery matches SmsMessageReceivedEvent in ${contracts.join(", ")}.`);
  } else {
    const count = await checkDocsExamples(command);
    console.log(`${count} ${command} documentation examples compile and run against the mock API.`);
  }
}
