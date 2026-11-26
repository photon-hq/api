//! File uploads: the bytes, media type and name of a file, sent as a
//! `multipart/related` body (RFC 2387).

use std::fmt::{self, Write as _};

use bytes::Bytes;
use serde::Serialize;

/// A file for an upload method, such as `Client::upload_attachment`: its bytes,
/// media type and optional name.
///
/// The method sends it as a `multipart/related` body of two parts: a JSON part
/// that describes the file (`contentType`, `filename` when set, and
/// `sizeBytes`), then the file's bytes. The boundary comes from the file's
/// SHA-256, so a retry with the same `Idempotency-Key` sends the same request.
///
/// ```rust,ignore
/// let file = UploadFile::new(b"Hello from Photon.\n".to_vec(), "text/plain").filename("hello.txt");
/// let response = client
///     .upload_attachment(project_id, "upload-hello-1".to_owned(), &file)
///     .await?;
/// ```
#[derive(Clone)]
pub struct UploadFile {
    data: Bytes,
    content_type: String,
    filename: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Metadata<'a> {
    content_type: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    filename: Option<&'a str>,
    size_bytes: usize,
}

impl UploadFile {
    /// A file with these bytes and this media type, such as `image/png`.
    #[must_use]
    pub fn new(data: impl Into<Bytes>, content_type: impl Into<String>) -> Self {
        Self {
            data: data.into(),
            content_type: content_type.into(),
            filename: None,
        }
    }

    /// The file's name, such as `report.pdf`. An empty name is not sent.
    #[must_use]
    pub fn filename(mut self, filename: impl Into<String>) -> Self {
        self.filename = Some(filename.into());
        self
    }

    /// The request's Content-Type and its `multipart/related` body. An empty
    /// media type is an error, and so is one with CR or LF, which would add
    /// part headers.
    pub(crate) fn multipart_related(&self) -> Result<(String, Bytes), &'static str> {
        if self.content_type.trim().is_empty() {
            return Err("the upload has no content type");
        }
        if self.content_type.contains(['\r', '\n']) {
            return Err("the upload's content type must not contain CR or LF");
        }
        let mut boundary = String::from("photon-");
        for byte in &hmac_sha256::Hash::hash(&self.data)[..16] {
            let _ = write!(boundary, "{byte:02x}");
        }
        let metadata = serde_json::to_string(&Metadata {
            content_type: &self.content_type,
            filename: self.filename.as_deref().filter(|name| !name.is_empty()),
            size_bytes: self.data.len(),
        })
        .expect("upload metadata serializes to JSON");
        let head = format!(
            "--{boundary}\r\nContent-Type: application/json\r\n\r\n{metadata}\r\n--{boundary}\r\nContent-Type: {}\r\n\r\n",
            self.content_type
        );
        let tail = format!("\r\n--{boundary}--\r\n");
        let body = [head.as_bytes(), &self.data, tail.as_bytes()].concat();
        Ok((
            format!("multipart/related; boundary={boundary}"),
            Bytes::from(body),
        ))
    }
}

impl fmt::Debug for UploadFile {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter
            .debug_struct("UploadFile")
            .field("content_type", &self.content_type)
            .field("filename", &self.filename)
            .field("size_bytes", &self.data.len())
            .finish()
    }
}
