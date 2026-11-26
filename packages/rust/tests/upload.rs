//! File uploads: an `UploadFile` goes out as the `multipart/related` body that
//! every Photon SDK builds byte for byte, through a local HTTP server.
use std::{sync::Arc, time::Duration};

use photon_ai_api::{
    Client, Credential, Error, PhotonClientBuilder, SecretString, UploadAttachmentResponse,
    UploadFile,
};
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::TcpListener,
    sync::Mutex,
};

const PROJECT_ID: &str = "pho_prj_00000000000000000000000000";
const BOUNDARY: &str = "photon-b1fa3222fa4bbf605b6f1b976ffac84b";
const BODY: &[u8] = b"--photon-b1fa3222fa4bbf605b6f1b976ffac84b\r\nContent-Type: application/json\r\n\r\n{\"contentType\":\"text/plain\",\"filename\":\"hello.txt\",\"sizeBytes\":19}\r\n--photon-b1fa3222fa4bbf605b6f1b976ffac84b\r\nContent-Type: text/plain\r\n\r\nHello from Photon.\n\r\n--photon-b1fa3222fa4bbf605b6f1b976ffac84b--\r\n";
const BODY_SHA256: &str = "9ff17b4c4556543632ab2ceaa2749f2539ae82c87ed2e3577ed7fcb385d0acd3";
const ATTACHMENT: &str = r#"{"contentType":"text/plain","createdAt":"2026-11-23T00:00:00Z","filename":"hello.txt","id":"pho_att_00000000000000000000000000","projectId":"pho_prj_00000000000000000000000000","sizeBytes":19,"updatedAt":"2026-11-23T00:00:00Z"}"#;

/// Each request's head (lower-cased, each line ending in CRLF) and body.
type Requests = Arc<Mutex<Vec<(String, Vec<u8>)>>>;

/// A server answering one request per connection with `responses` in order.
async fn server(responses: Vec<(u16, &'static str)>) -> (String, Requests) {
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let base = format!("http://{}", listener.local_addr().unwrap());
    let requests = Requests::default();
    let recorded = requests.clone();
    tokio::spawn(async move {
        for (status, body) in responses {
            let (mut stream, _) = listener.accept().await.unwrap();
            let mut request = Vec::new();
            let mut chunk = [0_u8; 4096];
            let head_end = loop {
                let read = stream.read(&mut chunk).await.unwrap();
                assert!(read > 0, "the client closed the connection mid-request");
                request.extend_from_slice(&chunk[..read]);
                let Some(end) = request.windows(4).position(|window| window == b"\r\n\r\n") else {
                    continue;
                };
                let head = String::from_utf8_lossy(&request[..end]).to_ascii_lowercase();
                let length = head
                    .lines()
                    .find_map(|line| line.strip_prefix("content-length:"))
                    .map_or(0, |value| value.trim().parse::<usize>().unwrap());
                if request.len() >= end + 4 + length {
                    break end;
                }
            };
            let head = String::from_utf8_lossy(&request[..head_end + 2]).to_ascii_lowercase();
            recorded
                .lock()
                .await
                .push((head, request[head_end + 4..].to_vec()));
            let response = format!(
                "HTTP/1.1 {status} Test\r\nContent-Type: application/json\r\nContent-Length: {}\r\nRetry-After: 0\r\nConnection: close\r\n\r\n{body}",
                body.len()
            );
            stream.write_all(response.as_bytes()).await.unwrap();
        }
    });
    (base, requests)
}

fn client(base: &str) -> Client {
    PhotonClientBuilder::new()
        .base_url(base)
        .credential(
            "accountServiceKey",
            Credential::Bearer(SecretString::from("test-key".to_owned())),
        )
        .build()
        .unwrap()
}

fn hello() -> UploadFile {
    UploadFile::new(b"Hello from Photon.\n".to_vec(), "text/plain").filename("hello.txt")
}

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

#[tokio::test]
async fn upload_sends_the_multipart_related_body() {
    let (base, requests) = server(vec![(201, ATTACHMENT)]).await;
    let response = client(&base)
        .upload_attachment(PROJECT_ID.to_owned(), "upload-hello-1".to_owned(), &hello())
        .await
        .unwrap();

    assert_eq!(response.status().as_u16(), 201);
    let UploadAttachmentResponse::Status201(attachment) = response.into_inner() else {
        panic!("expected the 201 variant");
    };
    assert_eq!(attachment.size_bytes, 19);
    let requests = requests.lock().await;
    let (head, body) = &requests[0];
    assert!(
        head.starts_with(&format!(
            "post /v1/projects/{PROJECT_ID}/attachments http/1.1\r\n"
        )),
        "{head}"
    );
    assert!(
        head.contains(&format!(
            "\r\ncontent-type: multipart/related; boundary={BOUNDARY}\r\n"
        )),
        "{head}"
    );
    assert!(head.contains("\r\ncontent-length: 282\r\n"), "{head}");
    assert!(
        head.contains("\r\nidempotency-key: upload-hello-1\r\n"),
        "{head}"
    );
    assert_eq!(body.as_slice(), BODY);
    assert_eq!(body.len(), 282);
    assert_eq!(hex(&hmac_sha256::Hash::hash(body)), BODY_SHA256);
}

#[tokio::test]
async fn a_retry_and_a_repeated_upload_send_the_same_request() {
    let (base, requests) = server(vec![(503, "{}"), (201, ATTACHMENT), (200, ATTACHMENT)]).await;
    let client = client(&base);
    let first = client
        .upload_attachment(PROJECT_ID.to_owned(), "upload-hello-1".to_owned(), &hello())
        .await
        .unwrap();
    let repeat = client
        .upload_attachment(PROJECT_ID.to_owned(), "upload-hello-1".to_owned(), &hello())
        .await
        .unwrap();

    assert_eq!(first.status().as_u16(), 201);
    assert_eq!(repeat.status().as_u16(), 200);
    let requests = requests.lock().await;
    assert_eq!(requests.len(), 3);
    for (head, body) in requests.iter() {
        assert!(
            head.contains(&format!(
                "\r\ncontent-type: multipart/related; boundary={BOUNDARY}\r\n"
            )),
            "{head}"
        );
        assert_eq!(body.as_slice(), BODY);
    }
}

#[tokio::test]
async fn metadata_leaves_out_an_absent_or_empty_filename() {
    let (base, requests) = server(vec![(201, ATTACHMENT), (201, ATTACHMENT)]).await;
    let client = client(&base);
    for file in [
        UploadFile::new(b"abc".to_vec(), "application/octet-stream"),
        UploadFile::new(b"abc".to_vec(), "application/octet-stream").filename(""),
    ] {
        client
            .upload_attachment(PROJECT_ID.to_owned(), "upload-abc".to_owned(), &file)
            .await
            .unwrap();
    }

    let requests = requests.lock().await;
    let metadata = b"\r\n\r\n{\"contentType\":\"application/octet-stream\",\"sizeBytes\":3}\r\n";
    let (_, body) = &requests[0];
    assert!(
        body.windows(metadata.len())
            .any(|window| window == metadata),
        "{}",
        String::from_utf8_lossy(body)
    );
    assert_eq!(requests[1].1, requests[0].1);
}

#[tokio::test]
async fn an_empty_content_type_or_one_with_cr_or_lf_fails_before_sending() {
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let client = client(&format!("http://{}", listener.local_addr().unwrap()));
    let line_break = "the upload's content type must not contain CR or LF";
    for (content_type, message) in [
        ("", "the upload has no content type"),
        (" ", "the upload has no content type"),
        ("text/plain\r\nX-Injected: 1", line_break),
        ("text/plain\nX-Injected: 1", line_break),
        ("text/plain\r", line_break),
    ] {
        let file = UploadFile::new(b"Hello from Photon.\n".to_vec(), content_type);
        let error = client
            .upload_attachment(PROJECT_ID.to_owned(), "upload-hello-1".to_owned(), &file)
            .await
            .unwrap_err();
        let Error::RequestConstruction(error) = error else {
            panic!("expected a request-construction error, got {error:?}");
        };
        assert_eq!(error.to_string(), message, "{content_type:?}");
    }
    assert!(
        tokio::time::timeout(Duration::from_millis(100), listener.accept())
            .await
            .is_err(),
        "no request may be sent"
    );
}
