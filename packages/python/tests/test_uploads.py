"""The multipart/related body (RFC 2387) the client builds for a file upload."""

from __future__ import annotations

import hashlib

import pytest
from pydantic import ValidationError

from photon_api import UploadFile
from photon_api.uploads import multipart_related

BOUNDARY = "photon-b1fa3222fa4bbf605b6f1b976ffac84b"


def test_body_is_json_describing_the_file_then_the_file_under_a_boundary_from_its_bytes() -> None:
    body, content_type = multipart_related(
        UploadFile(data=b"Hello from Photon.\n", content_type="text/plain", filename="hello.txt")
    )
    assert content_type == f"multipart/related; boundary={BOUNDARY}"
    assert (
        body
        == (
            f"--{BOUNDARY}\r\nContent-Type: application/json\r\n\r\n"
            '{"contentType":"text/plain","filename":"hello.txt","sizeBytes":19}\r\n'
            f"--{BOUNDARY}\r\nContent-Type: text/plain\r\n\r\n"
            f"Hello from Photon.\n\r\n--{BOUNDARY}--\r\n"
        ).encode()
    )
    assert len(body) == 282
    assert hashlib.sha256(body).hexdigest() == (
        "9ff17b4c4556543632ab2ceaa2749f2539ae82c87ed2e3577ed7fcb385d0acd3"
    )


def test_same_file_gives_the_same_body_and_a_file_without_a_name_has_no_filename() -> None:
    file = UploadFile(data=b"\x00\xff\r\n--\x80", content_type="application/octet-stream")
    first, second = multipart_related(file), multipart_related(file)
    assert first == second
    assert b'\r\n{"contentType":"application/octet-stream","sizeBytes":7}\r\n' in first[0]
    assert b"\r\n\r\n\x00\xff\r\n--\x80\r\n--photon-" in first[0]


def test_filename_keeps_non_ascii_characters_as_utf8() -> None:
    body, _ = multipart_related(
        UploadFile(data=b"x", content_type="text/plain", filename="résumé.txt")
    )
    assert '"filename":"résumé.txt"'.encode() in body


@pytest.mark.parametrize(
    "content_type", ["text/plain\r\nX-Injected: 1", "text/plain\nX: 1", "text/\rplain"]
)
def test_content_type_with_a_line_break_is_rejected(content_type: str) -> None:
    with pytest.raises(ValueError, match="CR or LF"):
        multipart_related(UploadFile(data=b"x", content_type=content_type))


@pytest.mark.parametrize("content_type", ["", " ", "\t"])
def test_an_empty_content_type_is_rejected(content_type: str) -> None:
    with pytest.raises(ValueError, match="media type"):
        multipart_related(UploadFile(data=b"x", content_type=content_type))


def test_upload_file_requires_bytes_and_a_content_type() -> None:
    with pytest.raises(ValidationError):
        UploadFile.model_validate({"data": b"x"})
    with pytest.raises(ValidationError):
        UploadFile.model_validate({"data": b"x", "content_type": "text/plain", "size": 1})
