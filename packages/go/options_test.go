package photonapi

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

// A nil RequestOption is skipped: Get(ctx, nil) from a release where the
// method took a params pointer keeps working after the method drops it.
func TestNilRequestOptionIsIgnored(t *testing.T) {
	var probe string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		probe = r.Header.Get("X-Probe")
		w.WriteHeader(http.StatusNoContent)
	}))
	defer server.Close()
	client := NewClient(WithBaseURL(server.URL), WithAPIKey("fixture-key"))
	spec := newSpec("probe", "GET", "/probe")
	if err := client.c.do(context.Background(), spec, nil, []RequestOption{nil, WithRequestHeader("X-Probe", "kept")}); err != nil {
		t.Fatal(err)
	}
	if probe != "kept" {
		t.Fatalf("X-Probe = %q, want the option after the nil one applied", probe)
	}
}
