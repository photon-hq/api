import assert from "node:assert/strict";
import test from "node:test";
import { multipartRelated } from "../src/uploads.js";

const BOUNDARY = "photon-b1fa3222fa4bbf605b6f1b976ffac84b";

test("a file upload's body is JSON that describes the file, then the file, under a boundary derived from its bytes", async () => {
  const { body, contentType } = await multipartRelated(new File(["Hello from Photon.\n"], "hello.txt", { type: "text/plain" }));
  assert.equal(contentType, `multipart/related; boundary=${BOUNDARY}`);
  assert.equal(
    new TextDecoder().decode(body),
    `--${BOUNDARY}\r\nContent-Type: application/json\r\n\r\n`
      + `{"contentType":"text/plain","filename":"hello.txt","sizeBytes":19}\r\n`
      + `--${BOUNDARY}\r\nContent-Type: text/plain\r\n\r\nHello from Photon.\n\r\n--${BOUNDARY}--\r\n`,
  );
  assert.equal(body.byteLength, 282);
});

test("a Blob has no filename, and the same bytes give the same body", async () => {
  const first = await multipartRelated(new Blob(["Hello from Photon.\n"], { type: "text/plain" }));
  const second = await multipartRelated(new Blob(["Hello from Photon.\n"], { type: "text/plain" }));
  assert.deepEqual(first, second);
  assert.match(new TextDecoder().decode(first.body), /\r\n\{"contentType":"text\/plain","sizeBytes":19\}\r\n/);
});

test("a file upload needs a Blob with a media type", async () => {
  await assert.rejects(multipartRelated(new Blob(["x"])), TypeError);
  await assert.rejects(multipartRelated(new Blob(["x"], { type: " " })), TypeError);
  class InjectedType extends Blob {
    override get type(): string {
      return "text/plain\r\nX-Injected: yes";
    }
  }
  await assert.rejects(multipartRelated(new InjectedType(["x"])), /CR or LF/);
  await assert.rejects(multipartRelated(new TextEncoder().encode("x")), TypeError);
});
