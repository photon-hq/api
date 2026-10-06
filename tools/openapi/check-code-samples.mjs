#!/usr/bin/env node
// Checks the SDK code samples in openapi/openapi.mintlify.json against the
// packages in this repository: every sample of the given language must
// type-check (TypeScript, Python) or compile (Rust), validate its input and
// send exactly one request. Requests go to a local server that answers with a
// problem, so nothing reaches the API.
// Usage: node tools/openapi/check-code-samples.mjs typescript|python|rust
// TypeScript needs `npm run build:typescript` first; Python needs the package
// installed in the active interpreter (pip install -e packages/python) and
// pyright from tools/python-codegen/requirements-dev.txt.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const language = process.argv[2];
assert.ok(["typescript", "python", "rust"].includes(language), "Usage: check-code-samples.mjs typescript|python|rust");

const document = JSON.parse(readFileSync(join(root, "openapi/openapi.mintlify.json"), "utf8"));
const samples = [];
for (const item of Object.values(document.paths)) {
  for (const operation of Object.values(item)) {
    const sample = operation?.["x-codeSamples"]?.find((candidate) => candidate.lang === language);
    if (operation?.operationId) {
      assert.ok(sample, `${operation.operationId} has no ${language} sample`);
      samples.push({ operationId: operation.operationId, source: sample.source });
    }
  }
}

const work = mkdtempSync(join(tmpdir(), `photon-samples-${language}-`));
const problem = JSON.stringify({ type: "about:blank", title: "Sample check", status: 418, code: "SAMPLE_CHECK" });
const run = (command, args, options = {}) => execFileSync(command, args, { stdio: "inherit", ...options });

// The scratch projects use the versions this repository's lockfiles pin.
function npmVersion(name) {
  const version = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8")).packages[`node_modules/${name}`]?.version;
  assert.ok(version, `${name} is not in package-lock.json`);
  return version;
}
function crateVersion(name) {
  const version = new RegExp(`^name = "${name}"\\nversion = "([^"]+)"`, "m").exec(readFileSync(join(root, "Cargo.lock"), "utf8"))?.[1];
  assert.ok(version, `${name} is not in Cargo.lock`);
  return version;
}

function checkTypeScript() {
  mkdirSync(join(work, "samples"));
  samples.forEach(({ operationId, source }, index) =>
    writeFileSync(join(work, "samples", `s${index}-${operationId}.ts`), `${source}\nexport {};\n`));
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "samples", private: true, type: "module" }));
  writeFileSync(join(work, "tsconfig.json"), JSON.stringify({
    compilerOptions: { strict: true, module: "nodenext", target: "es2022", noEmit: true, skipLibCheck: true, types: ["node"] },
    include: ["samples/*.ts"],
  }));
  run("npm", ["install", "--no-audit", "--no-fund", "--silent", join(root, "packages/typescript"), `@types/node@${npmVersion("@types/node")}`, `typescript@${npmVersion("typescript")}`], { cwd: work });
  run("npx", ["tsc", "-p", "."], { cwd: work });
  writeFileSync(join(work, "run.mjs"), `
import { readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
process.env.PHOTON_API_TOKEN = "pho_ask_sample";
let sent = 0;
globalThis.fetch = async () => { sent += 1; return new Response(${JSON.stringify(problem)}, { status: 418, headers: { "content-type": "application/problem+json" } }); };
const failures = [];
for (const file of readdirSync("samples").sort()) {
  const before = sent;
  try { await import(pathToFileURL("samples/" + file).href); }
  catch (error) { if (error?.name !== "ApiError") { failures.push(file + ": " + error); continue; } }
  if (sent !== before + 1) failures.push(file + ": sent " + (sent - before) + " requests");
}
if (failures.length) { console.error(failures.join("\\n")); process.exit(1); }
`);
  run(process.execPath, ["--no-warnings", "run.mjs"], { cwd: work });
}

function checkPython() {
  mkdirSync(join(work, "samples"));
  samples.forEach(({ operationId, source }, index) =>
    writeFileSync(join(work, "samples", `s${index}_${operationId}.py`), `${source}\n`));
  const python = process.env.PYTHON_BIN ?? "python";
  const interpreter = execFileSync(python, ["-c", "import sys; print(sys.executable)"], { encoding: "utf8" }).trim();
  run(python, ["-m", "pyright", "--pythonpath", interpreter, "samples"], { cwd: work });
  writeFileSync(join(work, "run.py"), `
import glob, os, runpy, sys
import httpx, photon_api
from photon_api import ApiError

os.environ["PHOTON_API_TOKEN"] = "pho_ask_sample"
sent = []
def handler(request):
    sent.append(request)
    return httpx.Response(418, headers={"content-type": "application/problem+json"}, content=${JSON.stringify(problem)})
original = photon_api.Photon.__init__
def patched(self, *args, **kwargs):
    kwargs["client"] = httpx.Client(transport=httpx.MockTransport(handler))
    kwargs["max_attempts"] = 1
    original(self, *args, **kwargs)
photon_api.Photon.__init__ = patched
failures = []
for path in sorted(glob.glob("samples/*.py")):
    before = len(sent)
    try:
        runpy.run_path(path)
    except ApiError:
        pass
    except Exception as error:
        failures.append(f"{path}: {type(error).__name__}: {error}")
        continue
    if len(sent) != before + 1:
        failures.append(f"{path}: sent {len(sent) - before} requests")
if failures:
    print("\\n".join(failures), file=sys.stderr)
    sys.exit(1)
`);
  run(python, ["run.py"], { cwd: work });
}

async function checkRust() {
  mkdirSync(join(work, "src"));
  const functions = samples.map(({ source }, index) => {
    const body = source.split("\n").filter((line) => !line.startsWith("use ")).join("\n    ")
      .replaceAll("PhotonClientBuilder::new()", "PhotonClientBuilder::new().base_url(base_url())");
    return `async fn sample_${index}() -> Result<(), Box<dyn std::error::Error>> {\n    ${body}\n    Ok(())\n}\n`;
  });
  const calls = samples.map(({ operationId }, index) =>
    `    match sample_${index}().await {\n        Err(error) if error.to_string().contains("418") => {}\n        other => failures.push(format!("${operationId}: {other:?}")),\n    }`);
  writeFileSync(join(work, "src/main.rs"), `#![allow(unused_imports, unused_variables)]
use photon_ai_api::{Credential, PhotonClientBuilder, SecretString};

fn base_url() -> String {
    std::env::var("SAMPLE_BASE_URL").expect("SAMPLE_BASE_URL")
}

${functions.join("\n")}
#[tokio::main]
async fn main() {
    let mut failures: Vec<String> = Vec::new();
${calls.join("\n")}
    if !failures.is_empty() {
        eprintln!("{}", failures.join("\\n"));
        std::process::exit(1);
    }
}
`);
  writeFileSync(join(work, "Cargo.toml"), `[package]
name = "photon-code-samples"
version = "0.0.0"
edition = "2024"
publish = false

[dependencies]
photonhq-api = { path = ${JSON.stringify(join(root, "packages/rust"))} }
serde_json = "=${crateVersion("serde_json")}"
tokio = { version = "=${crateVersion("tokio")}", features = ["macros", "rt-multi-thread"] }

[workspace]
`);
  // Samples run one after another; each must send exactly one request.
  let received = 0;
  const server = createServer((request, response) => {
    received += 1;
    request.resume();
    request.on("end", () => {
      response.writeHead(418, { "content-type": "application/problem+json", "content-length": Buffer.byteLength(problem) });
      response.end(problem);
    });
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const { port } = server.address();
  // Asynchronous, so this process keeps answering the samples' requests.
  const status = await new Promise((done, fail) => {
    const child = spawn("cargo", ["run", "--quiet"], {
      cwd: work,
      stdio: "inherit",
      env: { ...process.env, PHOTON_API_TOKEN: "pho_ask_sample", SAMPLE_BASE_URL: `http://127.0.0.1:${port}` },
    });
    child.on("error", fail);
    child.on("close", done);
  });
  server.close();
  assert.equal(status, 0, "Rust code samples failed");
  assert.equal(received, samples.length, `Rust code samples sent ${received} requests, expected ${samples.length}`);
}

try {
  if (language === "typescript") checkTypeScript();
  if (language === "python") checkPython();
  if (language === "rust") await checkRust();
  console.log(`${samples.length} ${language} code samples compile and send their request.`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
