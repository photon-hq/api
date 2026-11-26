//! Compiled only with the `blocking` feature; CI type-checks it with
//! `cargo check -p photonhq-api --features blocking --all-targets`.
#![cfg(feature = "blocking")]

use std::{
    io::{Read, Write},
    net::TcpListener,
    thread,
};

use photon_ai_api::{BlockingClient, Credential, SecretString, UploadFile};

#[test]
fn blocking_client_builds_on_a_plain_thread() {
    let client = BlockingClient::new("https://api.example.invalid").unwrap();
    assert_eq!(
        client.inner().core().base_url().as_str(),
        "https://api.example.invalid/"
    );
}

#[test]
fn blocking_upload_sends_the_multipart_related_body() {
    const BODY: &[u8] = b"--photon-b1fa3222fa4bbf605b6f1b976ffac84b\r\nContent-Type: application/json\r\n\r\n{\"contentType\":\"text/plain\",\"filename\":\"hello.txt\",\"sizeBytes\":19}\r\n--photon-b1fa3222fa4bbf605b6f1b976ffac84b\r\nContent-Type: text/plain\r\n\r\nHello from Photon.\n\r\n--photon-b1fa3222fa4bbf605b6f1b976ffac84b--\r\n";
    const ATTACHMENT: &str = r#"{"contentType":"text/plain","createdAt":"2026-11-23T00:00:00Z","filename":"hello.txt","id":"pho_att_00000000000000000000000000","projectId":"pho_prj_00000000000000000000000000","sizeBytes":19,"updatedAt":"2026-11-23T00:00:00Z"}"#;
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let base = format!("http://{}", listener.local_addr().unwrap());
    let server = thread::spawn(move || {
        let (mut stream, _) = listener.accept().unwrap();
        let mut request = Vec::new();
        let mut chunk = [0_u8; 4096];
        let head_end = loop {
            let read = stream.read(&mut chunk).unwrap();
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
        let response = format!(
            "HTTP/1.1 201 Created\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{ATTACHMENT}",
            ATTACHMENT.len()
        );
        stream.write_all(response.as_bytes()).unwrap();
        (
            String::from_utf8_lossy(&request[..head_end + 2]).to_ascii_lowercase(),
            request[head_end + 4..].to_vec(),
        )
    });
    let client = BlockingClient::new(&base).unwrap().with_credential(
        "accountServiceKey",
        Credential::Bearer(SecretString::from("test-key".to_owned())),
    );
    let file =
        UploadFile::new(b"Hello from Photon.\n".to_vec(), "text/plain").filename("hello.txt");

    let response = client
        .upload_attachment(
            "pho_prj_00000000000000000000000000".to_owned(),
            "upload-hello-1".to_owned(),
            &file,
        )
        .unwrap();

    assert_eq!(response.status().as_u16(), 201);
    let (head, body) = server.join().unwrap();
    assert!(
        head.contains(
            "\r\ncontent-type: multipart/related; boundary=photon-b1fa3222fa4bbf605b6f1b976ffac84b\r\n"
        ),
        "{head}"
    );
    assert_eq!(body.as_slice(), BODY);
}
