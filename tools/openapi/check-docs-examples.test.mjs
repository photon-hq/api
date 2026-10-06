import assert from "node:assert/strict";
import test from "node:test";
import { answer, ENVIRONMENT, extractBlocks, redirectBuilders, SKIP_MARKER } from "./check-docs-examples.mjs";

const page = `---
title: "Example"
---

<CodeGroup>
\`\`\`typescript TypeScript
console.log("ts");
\`\`\`

\`\`\`python Python
print("py")
\`\`\`
</CodeGroup>

\`\`\`sh
npm install
\`\`\`

${SKIP_MARKER}
\`\`\`ts
fragment(
\`\`\`

  \`\`\`rust Rust
  fn main() {}
  \`\`\`
`;

test("every block of the language is checked, except other languages and skipped fragments", () => {
  assert.deepEqual(extractBlocks(page, "typescript"), [{ line: 6, code: 'console.log("ts");\n' }]);
  assert.deepEqual(extractBlocks(page, "python"), [{ line: 10, code: 'print("py")\n' }]);
  assert.deepEqual(extractBlocks(page, "rust"), [{ line: 24, code: "fn main() {}\n" }]);
  assert.throws(() => extractBlocks("```ts\nopen\n", "typescript"), /Unclosed code block/);
});

test("the mock API requires a known credential and serves only the guide's routes", () => {
  const headers = { authorization: `Bearer ${ENVIRONMENT.PHOTON_API_KEY}` };
  const projects = `/v1/organizations/${ENVIRONMENT.PHOTON_ORGANIZATION_ID}/projects`;
  assert.equal(answer({ method: "GET", url: projects, headers: {} }).status, 401);
  const first = answer({ method: "GET", url: `${projects}?pageSize=100`, headers });
  assert.equal(first.status, 200);
  assert.equal(first.body.nextPageToken, "page_2");
  const last = answer({ method: "GET", url: `${projects}?pageToken=page_2`, headers });
  assert.equal(last.body.nextPageToken, undefined);
  assert.equal(answer({ method: "GET", url: `${projects}?pageSize=0`, headers }).status, 400);
  assert.equal(answer({ method: "POST", url: projects, headers, body: '{"name":"a","slug":"a"}' }).status, 400);
  assert.equal(answer({ method: "POST", url: projects, headers: { ...headers, "idempotency-key": "k" }, body: '{"name":"a","slug":"a"}' }).status, 201);
  assert.equal(answer({ method: "GET", url: "/v1/projects/unknown", headers }).status, 404);
  const projectKey = { authorization: `Bearer ${ENVIRONMENT.PHOTON_PROJECT_API_KEY}` };
  assert.equal(answer({ method: "GET", url: `/v1/projects/${ENVIRONMENT.PHOTON_PROJECT_ID}`, headers: projectKey }).status, 200);
  assert.ok(answer({ method: "GET", url: projects, headers: projectKey }).unexpected);
  const accessToken = { authorization: `Bearer ${ENVIRONMENT.PHOTON_ACCESS_TOKEN}` };
  assert.equal(answer({ method: "GET", url: "/v1/account", headers: accessToken }).status, 200);
  assert.ok(answer({ method: "GET", url: projects, headers: accessToken }).unexpected);
  assert.ok(answer({ method: "DELETE", url: projects, headers }).unexpected);
});

test("only PhotonClientBuilder chains are redirected to the mock", () => {
  const code = "let a = PhotonClientBuilder::new()\n    .build()?;\nlet b = Other::new().build();\nlet c = PhotonClientBuilder::new().max_attempts(1).build()?;\n";
  const result = redirectBuilders(code, "example");
  assert.equal(result.match(/\.base_url\(/g).length, 2);
  assert.match(result, /Other::new\(\)\.build\(\)/);
  assert.throws(() => redirectBuilders("let x = 1;", "example"), /no PhotonClientBuilder/);
  assert.throws(() => redirectBuilders("PhotonClientBuilder::new(); PhotonClientBuilder::new().build()", "example"), /has no \.build\(\)/);
});
