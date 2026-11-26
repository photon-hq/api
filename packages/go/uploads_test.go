package photonapi

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

// The body every Photon SDK sends for hello.txt, byte for byte.
const (
	vectorBoundary = "photon-b1fa3222fa4bbf605b6f1b976ffac84b"
	vectorBody     = "--photon-b1fa3222fa4bbf605b6f1b976ffac84b\r\nContent-Type: application/json\r\n\r\n" +
		`{"contentType":"text/plain","filename":"hello.txt","sizeBytes":19}` +
		"\r\n--photon-b1fa3222fa4bbf605b6f1b976ffac84b\r\nContent-Type: text/plain\r\n\r\n" +
		"Hello from Photon.\n" +
		"\r\n--photon-b1fa3222fa4bbf605b6f1b976ffac84b--\r\n"
	vectorSHA256 = "9ff17b4c4556543632ab2ceaa2749f2539ae82c87ed2e3577ed7fcb385d0acd3"
)

func vectorFile() *UploadFile {
	return &UploadFile{Data: []byte("Hello from Photon.\n"), ContentType: "text/plain", Filename: "hello.txt"}
}

func TestUploadFileEncodesTheSharedVector(t *testing.T) {
	body, contentType, err := vectorFile().encode()
	if err != nil {
		t.Fatal(err)
	}
	sum := sha256.Sum256(body)
	if string(body) != vectorBody || len(body) != 282 || hex.EncodeToString(sum[:]) != vectorSHA256 {
		t.Fatalf("body = %q (%d bytes)", body, len(body))
	}
	if contentType != "multipart/related; boundary="+vectorBoundary {
		t.Fatalf("content type = %q", contentType)
	}
}

func TestUploadFileMetadata(t *testing.T) {
	for name, tc := range map[string]struct {
		file UploadFile
		want string
	}{
		"no filename":      {UploadFile{Data: []byte("x"), ContentType: "text/plain"}, `{"contentType":"text/plain","sizeBytes":1}`},
		"no HTML escaping": {UploadFile{ContentType: "text/html", Filename: "<a>&b.html"}, `{"contentType":"text/html","filename":"<a>&b.html","sizeBytes":0}`},
	} {
		body, _, err := tc.file.encode()
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		_, rest, _ := strings.Cut(string(body), "\r\n\r\n")
		if metadata, _, _ := strings.Cut(rest, "\r\n"); metadata != tc.want {
			t.Errorf("%s: metadata = %s, want %s", name, metadata, tc.want)
		}
	}
}

// A retry, and a new call with the same Idempotency-Key and file, send the
// same request: the body is built once per call and its boundary comes from
// the file.
func TestUploadRetrySendsTheSameRequest(t *testing.T) {
	type sent struct {
		body, contentType, key string
		length                 int64
		chunked                bool
	}
	var requests []sent
	statuses := []int{http.StatusServiceUnavailable, http.StatusCreated, http.StatusOK}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		requests = append(requests, sent{string(raw), r.Header.Get("Content-Type"), r.Header.Get("Idempotency-Key"), r.ContentLength, len(r.TransferEncoding) > 0})
		w.WriteHeader(statuses[min(len(requests), len(statuses))-1])
	}))
	defer server.Close()
	client := NewClient(WithBaseURL(server.URL), WithAPIKey("fixture-key"), WithRetryDelay(time.Millisecond, time.Millisecond))
	for range 2 {
		spec := newSpec("uploadThing", "POST", "/things")
		spec.idempotent = true
		spec.setHeader("idempotency-key", "upload-1")
		spec.setFile(vectorFile())
		if err := client.c.do(context.Background(), spec, nil, nil); err != nil {
			t.Fatal(err)
		}
	}
	want := sent{vectorBody, "multipart/related; boundary=" + vectorBoundary, "upload-1", int64(len(vectorBody)), false}
	if len(requests) != 3 {
		t.Fatalf("requests = %d, want 3", len(requests))
	}
	for i, got := range requests {
		if got != want {
			t.Errorf("request %d = %+v, want %+v", i+1, got, want)
		}
	}
}

func TestUploadRejectsMissingFileContentTypeAndLineBreaks(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { t.Error("request sent") }))
	defer server.Close()
	client := NewClient(WithBaseURL(server.URL))
	for name, file := range map[string]*UploadFile{
		"nil":             nil,
		"no content type": {Data: []byte("x")},
		"blank":           {Data: []byte("x"), ContentType: " "},
		"CR":              {Data: []byte("x"), ContentType: "text/plain\r"},
		"LF":              {Data: []byte("x"), ContentType: "text/plain\nX-Injected: 1"},
	} {
		spec := newSpec("uploadThing", "POST", "/things")
		spec.setFile(file)
		if err := client.c.do(context.Background(), spec, nil, nil); err == nil || !strings.Contains(err.Error(), "uploadThing") {
			t.Errorf("%s: err = %v, want an error naming the operation", name, err)
		}
	}
}
