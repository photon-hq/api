"""Files the client uploads as a multipart/related body (RFC 2387)."""

from __future__ import annotations

import hashlib
import json

from pydantic import BaseModel, ConfigDict


class UploadFile(BaseModel):
    """A file to upload: its bytes, its media type and an optional name.

    The client sends it as the two parts of a ``multipart/related`` body: JSON
    with the file's ``contentType``, ``filename`` and ``sizeBytes``, then the
    bytes. It sets the request's Content-Type and Content-Length itself.
    """

    model_config = ConfigDict(extra="forbid", frozen=True)

    data: bytes
    content_type: str
    filename: str | None = None


def multipart_related(file: UploadFile) -> tuple[bytes, str]:
    """Return the request body for ``file`` and its Content-Type.

    The boundary is derived from the file's bytes, so a retry with the same
    Idempotency-Key sends the same request.
    """
    if not file.content_type.strip():
        raise ValueError(
            "An UploadFile's content_type must be the file's media type, such as image/png"
        )
    if "\r" in file.content_type or "\n" in file.content_type:
        raise ValueError("An UploadFile's content_type must not contain CR or LF")
    boundary = "photon-" + hashlib.sha256(file.data).hexdigest()[:32]
    metadata: dict[str, str | int] = {"contentType": file.content_type}
    if file.filename:
        metadata["filename"] = file.filename
    metadata["sizeBytes"] = len(file.data)
    head = (
        f"--{boundary}\r\nContent-Type: application/json\r\n\r\n"
        f"{json.dumps(metadata, ensure_ascii=False, separators=(',', ':'))}\r\n"
        f"--{boundary}\r\nContent-Type: {file.content_type}\r\n\r\n"
    )
    body = head.encode() + file.data + f"\r\n--{boundary}--\r\n".encode()
    return body, f"multipart/related; boundary={boundary}"
