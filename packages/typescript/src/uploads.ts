const encoder = new TextEncoder();

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * The `multipart/related` body (RFC 2387) of a file upload, built from the
 * file: a JSON root part with the file's `contentType` (the Blob's `type`),
 * `filename` (a File's `name`) and `sizeBytes`, then the file's bytes.
 * The boundary is derived from the bytes, so a retry with the same
 * Idempotency-Key sends the same request.
 */
export async function multipartRelated(file: unknown): Promise<{ body: Uint8Array; contentType: string }> {
  if (!(file instanceof Blob)) throw new TypeError("A file upload's body must be a Blob or a File");
  const type = file.type;
  if (!type.trim()) throw new TypeError("A file upload's body must have a type, the file's media type");
  if (type.includes("\r") || type.includes("\n")) throw new TypeError("A file upload's type must not contain CR or LF");
  const data = new Uint8Array(await file.arrayBuffer());
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
  const boundary = `photon-${hex(digest.subarray(0, 16))}`;
  const filename = file instanceof File && file.name ? file.name : undefined;
  const metadata = JSON.stringify({
    contentType: type,
    ...(filename === undefined ? {} : { filename }),
    sizeBytes: data.byteLength,
  });
  const head = encoder.encode(
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${type}\r\n\r\n`,
  );
  const tail = encoder.encode(`\r\n--${boundary}--\r\n`);
  const body = new Uint8Array(head.byteLength + data.byteLength + tail.byteLength);
  body.set(head, 0);
  body.set(data, head.byteLength);
  body.set(tail, head.byteLength + data.byteLength);
  return { body, contentType: `multipart/related; boundary=${boundary}` };
}
