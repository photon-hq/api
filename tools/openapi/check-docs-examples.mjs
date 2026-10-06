#!/usr/bin/env node
// Checks the code examples in the guide pages (docs/**/*.mdx.vel) against the
// packages in this repository. Every fenced block whose language is
// `typescript`/`ts`, `python`/`py` or `rust`/`rs` is a complete program: it must
// type-check (TypeScript `tsc --strict`, Python pyright) or compile (Rust),
// then run to completion against a local mock of the API and send at least
// one request, and only requests the mock knows. Blocks in other languages
// (`sh`, `json`, ...) are not checked; put `{/* docs-check: skip */}` on the
// line before a block's opening fence to leave out an intentional fragment.
// The generated SDK reference (docs/sdk) is not read here: its signatures are
// copied from the generated clients and its examples are the code samples
// tools/openapi/check-code-samples.mjs compiles and runs.
// Nothing reaches the API: TypeScript examples run with a fetch that sends
// every request to the mock, Python examples with the client's base URL set
// to it, and Rust examples with `.base_url(...)` added before `.build()`.
// Usage: node tools/openapi/check-docs-examples.mjs typescript|python|rust
// TypeScript needs `npm ci` and `npm run build:typescript` first (it uses the
// repository's node_modules); Python needs the package
// installed in the active interpreter (pip install -e packages/python) and
// pyright from tools/python-codegen/requirements-dev.txt.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
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

// The mock API: the few routes the guide's examples call, answered with
// contract-valid bodies. Any other request is recorded as unexpected.
export const ENVIRONMENT = {
  PHOTON_API_KEY: "pho_ask_docs_example",
  PHOTON_PROJECT_API_KEY: "pho_sk_docs_example",
  PHOTON_ACCESS_TOKEN: "docs_example_access_token",
  PHOTON_ORGANIZATION_ID: "org_docs_example",
  PHOTON_PROJECT_ID: "proj_docs_example",
};
const REQUEST_ID = "req_docs_example";
const TIMESTAMP = "2026-01-01T00:00:00.000Z";

function project(projectId, name, slug) {
  return {
    agentProfile: { avatarUrl: "https://example.com/avatar.png", firstName: "Ada", lastName: null },
    createdAt: TIMESTAMP,
    createdByAccountId: null,
    createdByActorId: null,
    createdByActorKind: null,
    deletedAt: null,
    name,
    organizationId: ENVIRONMENT.PHOTON_ORGANIZATION_ID,
    projectId,
    slug,
    updatedAt: TIMESTAMP,
  };
}

function problem(status, code, title, slug) {
  return { status, body: { type: `https://photon.codes/docs/problems/${slug}`, code, title, status, requestId: REQUEST_ID }, problem: true };
}

/** Answer one request: `{ status, body }`, or `{ unexpected }` for a request the mock does not serve. */
export function answer({ method, url, headers, body }) {
  const { pathname, searchParams } = new URL(url, "http://mock");
  const token = /^Bearer (.+)$/.exec(headers.authorization ?? "")?.[1];
  const tokens = [ENVIRONMENT.PHOTON_API_KEY, ENVIRONMENT.PHOTON_PROJECT_API_KEY, ENVIRONMENT.PHOTON_ACCESS_TOKEN];
  if (!tokens.includes(token)) return problem(401, "NOT_AUTHENTICATED", "Not Authenticated", "not-authenticated");
  const organization = `/v1/organizations/${ENVIRONMENT.PHOTON_ORGANIZATION_ID}/projects`;
  // Which example credential each route accepts, as its security requirement does.
  const accountCredential = token === ENVIRONMENT.PHOTON_API_KEY;
  if (method === "GET" && pathname === "/v1/account" && token !== ENVIRONMENT.PHOTON_PROJECT_API_KEY) {
    return {
      status: 200,
      body: {
        accountId: "acct_docs_example", createdAt: TIMESTAMP, deletedAt: null, email: "ada@example.com", firstName: "Ada",
        lastName: "Lovelace", phoneNumber: null, phoneVerifiedAt: null, pictureUrl: "https://example.com/ada.png", updatedAt: TIMESTAMP,
      },
    };
  }
  if (method === "GET" && pathname === `${organization}/count` && accountCredential) return { status: 200, body: { count: 2 } };
  if (method === "GET" && pathname === organization && accountCredential) {
    const pageSize = searchParams.get("pageSize");
    if (pageSize !== null && !(Number.isInteger(Number(pageSize)) && Number(pageSize) >= 1 && Number(pageSize) <= 100)) {
      return problem(400, "INVALID_ARGUMENT", "Invalid Argument", "invalid-argument");
    }
    const pageToken = searchParams.get("pageToken");
    if (pageToken === null) return { status: 200, body: { projects: [project("proj_docs_example", "Support", "support")], nextPageToken: "page_2" } };
    if (pageToken === "page_2") return { status: 200, body: { projects: [project("proj_docs_example_2", "Sales", "sales")] } };
    return problem(400, "INVALID_ARGUMENT", "Invalid Argument", "invalid-argument");
  }
  if (method === "POST" && pathname === organization && accountCredential) {
    if (!headers["idempotency-key"]) return problem(400, "IDEMPOTENCY_KEY_REQUIRED", "Idempotency Key Required", "idempotency-key-required");
    const input = JSON.parse(body || "{}");
    if (typeof input.name !== "string" || typeof input.slug !== "string") return { unexpected: "createProject without name and slug" };
    return { status: 201, body: project("proj_docs_example_3", input.name, input.slug) };
  }
  const projectPath = /^\/v1\/projects\/([^/]+)$/.exec(pathname);
  if (method === "GET" && projectPath && token !== ENVIRONMENT.PHOTON_ACCESS_TOKEN) {
    return decodeURIComponent(projectPath[1]) === ENVIRONMENT.PHOTON_PROJECT_ID
      ? { status: 200, body: project(ENVIRONMENT.PHOTON_PROJECT_ID, "Support", "support") }
      : problem(404, "PROJECT_NOT_FOUND", "Project Not Found", "project-not-found");
  }
  return { unexpected: `${method} ${pathname}` };
}

async function startMock() {
  const state = { requests: 0, unexpected: [] };
  const server = createServer((request, response) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      state.requests += 1;
      const result = answer({ method: request.method, url: request.url, headers: request.headers, body: Buffer.concat(chunks).toString("utf8") });
      if (result.unexpected) {
        state.unexpected.push(result.unexpected);
        Object.assign(result, problem(418, "DOCS_CHECK", "Unexpected request", "docs-check"));
      }
      const text = JSON.stringify(result.body);
      response.writeHead(result.status, {
        "content-type": result.problem ? "application/problem+json" : "application/json",
        "content-length": Buffer.byteLength(text),
        "x-request-id": REQUEST_ID,
      });
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
    const before = { requests: mock.state.requests, unexpected: mock.state.unexpected.length };
    const [command, args, options] = commandFor(example);
    const { status, signal } = await runAsync(command, args, {
      ...options,
      env: { ...process.env, ...ENVIRONMENT, DOCS_CHECK_BASE_URL: mock.baseUrl, ...options?.env },
    });
    const unexpected = mock.state.unexpected.slice(before.unexpected);
    if (signal === "SIGKILL") failures.push(`${example.location}: timed out after ${EXAMPLE_TIMEOUT_MS / 1000} s`);
    else if (status !== 0) failures.push(`${example.location}: exited with ${status ?? signal}`);
    else if (unexpected.length) failures.push(`${example.location}: unexpected requests: ${unexpected.join(", ")}`);
    else if (mock.state.requests === before.requests) failures.push(`${example.location}: sent no request`);
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
  for (const { name, code } of examples) writeFileSync(join(work, "examples", `${name}.ts`), `${code}export {};\n`);
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
  return runExamples(examples, mock, ({ name }) => [process.execPath, ["--no-warnings", "--import", "./mock-fetch.mjs", `examples/${name}.ts`], { cwd: work }]);
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
import os, runpy, sys
import photon_api

for cls in (photon_api.Photon, photon_api.AsyncPhoton):
    def patched(self, *args, __original=cls.__init__, **kwargs):
        kwargs["base_url"] = os.environ["DOCS_CHECK_BASE_URL"]
        __original(self, *args, **kwargs)
    cls.__init__ = patched
runpy.run_path(sys.argv[1], run_name="__main__")
`);
  return runExamples(examples, mock, ({ name }) => [python, ["run.py", `examples/${name}.py`], { cwd: work }]);
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

async function checkRust(examples, work, mock) {
  mkdirSync(join(work, "src/bin"), { recursive: true });
  mkdirSync(join(work, "fmt"));
  for (const { name, code } of examples) writeFileSync(join(work, "fmt", `${name}.rs`), code);
  run("rustfmt", ["--check", "--edition", "2024", ...examples.map(({ name }) => `fmt/${name}.rs`)], { cwd: work });
  for (const { name, location, code } of examples) {
    assert.doesNotMatch(code, /BlockingClient|Client::new\(|with_backend/, `${location}: build Rust clients with PhotonClientBuilder so the check can redirect them`);
    const rewritten = redirectBuilders(code, location);
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

export async function checkDocsExamples(language, { docs = join(root, "docs") } = {}) {
  assert.ok(Object.hasOwn(LANGUAGES, language), "Usage: check-docs-examples.mjs typescript|python|rust");
  const examples = collectExamples(docs, language);
  assert.ok(examples.length > 0, `No ${language} examples in ${docs}`);
  const work = mkdtempSync(join(tmpdir(), `photon-docs-${language}-`));
  const mock = await startMock();
  try {
    const check = { typescript: checkTypeScript, python: checkPython, rust: checkRust }[language];
    const failures = await check(examples, work, mock);
    assert.equal(failures.length, 0, `Documentation examples failed:\n${failures.join("\n")}`);
    return examples.length;
  } finally {
    mock.server.close();
    rmSync(work, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const language = process.argv[2];
  const count = await checkDocsExamples(language);
  console.log(`${count} ${language} documentation examples compile and run against the mock API.`);
}
