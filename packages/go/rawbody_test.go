package photonapi

// The raw request body (requestSpec.rawBody), for a body the contract declares
// as bytes other than a file upload. Neither the contract nor the
// feature-coverage fixture has such an operation, so it is tested here.

import (
	"context"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

func newRawBodyClient(t *testing.T, handler http.HandlerFunc) *Client {
	t.Helper()
	server := httptest.NewServer(handler)
	t.Cleanup(server.Close)
	return NewClient(WithBaseURL(server.URL), WithRetryDelay(time.Millisecond, time.Millisecond))
}

func rawBodySpec(body io.Reader, length int64) *requestSpec {
	spec := newSpec("sendBytes", "POST", "/bytes")
	spec.idempotent = true
	spec.setHeader("Content-Type", "application/octet-stream")
	spec.rawBody, spec.length = body, length
	return spec
}

// closeTracker is a ReaderAt that fails once closed, like a closed *os.File.
type closeTracker struct {
	*strings.Reader
	closed atomic.Bool
}

func (c *closeTracker) Close() error { c.closed.Store(true); return nil }

func (c *closeTracker) ReadAt(p []byte, off int64) (int, error) {
	if c.closed.Load() {
		return 0, errors.New("file already closed")
	}
	return c.Reader.ReadAt(p, off)
}

func TestRetriedRawBodyDoesNotCloseCallerBody(t *testing.T) {
	for name, length := range map[string]int64{"known length": 7, "unknown length": 0} {
		t.Run(name, func(t *testing.T) {
			var calls atomic.Int32
			var bodies []string
			client := newRawBodyClient(t, func(w http.ResponseWriter, r *http.Request) {
				raw, _ := io.ReadAll(r.Body)
				bodies = append(bodies, string(raw))
				if calls.Add(1) == 1 {
					w.WriteHeader(http.StatusServiceUnavailable)
					return
				}
				w.WriteHeader(http.StatusNoContent)
			})
			file := &closeTracker{Reader: strings.NewReader("payload")}
			if err := client.c.do(context.Background(), rawBodySpec(file, length), nil, nil); err != nil {
				t.Fatalf("send failed: %v", err)
			}
			if file.closed.Load() {
				t.Fatal("caller's body was closed")
			}
			if len(bodies) != 2 || bodies[0] != "payload" || bodies[1] != "payload" {
				t.Fatalf("bodies = %q", bodies)
			}
		})
	}
}

type zeroReader struct{}

func (zeroReader) Read(p []byte) (int, error) { clear(p); return len(p), nil }

func TestLargeOneShotRawBodyIsNotRetried(t *testing.T) {
	var calls atomic.Int32
	client := newRawBodyClient(t, func(w http.ResponseWriter, r *http.Request) {
		_, _ = io.Copy(io.Discard, r.Body)
		calls.Add(1)
		w.WriteHeader(http.StatusServiceUnavailable)
	})
	big := io.LimitReader(zeroReader{}, 9<<20) // not seekable, above the buffer cap
	err := client.c.do(context.Background(), rawBodySpec(big, 0), nil, nil)
	var apiErr *APIError
	if !errors.As(err, &apiErr) {
		t.Fatalf("want APIError, got %v", err)
	}
	if calls.Load() != 1 {
		t.Fatalf("calls = %d, want 1", calls.Load())
	}
}
