package photonapi

import (
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
)

// finish on a redirect operation: a declared 304 is a Redirect, an undeclared
// one an APIError. The feature-coverage fixture has no redirect operation.
func TestRedirectNotModified(t *testing.T) {
	respond := func(declared bool) (Redirect, error) {
		spec := newSpec("followThing", "GET", "/thing")
		spec.redirect, spec.notModified = true, declared
		resp := &http.Response{StatusCode: http.StatusNotModified, Header: http.Header{}, Body: io.NopCloser(strings.NewReader(""))}
		var out Redirect
		err := (&core{}).finish(spec, resp, &out, nil)
		return out, err
	}
	if out, err := respond(true); err != nil || out.StatusCode != http.StatusNotModified {
		t.Fatalf("declared 304: %+v, %v", out, err)
	}
	var apiErr *APIError
	if _, err := respond(false); !errors.As(err, &apiErr) || apiErr.StatusCode != http.StatusNotModified {
		t.Fatalf("undeclared 304: want APIError, got %v", err)
	}
}

// finish stamps the HTTP status into a multi-status response union through
// the setStatus hook. The per-operation decoders that gate on this status are
// generated; their shape is pinned by the go-codegen tests, so this probe
// stays independent of any one operation's contract.
type statusUnionProbe struct {
	Union
	status int
}

func (u *statusUnionProbe) setStatus(code int) { u.status = code }

func TestResponseUnionStatus(t *testing.T) {
	spec := newSpec("changePlan", "POST", "/plan")
	resp := &http.Response{
		StatusCode: 202,
		Header:     http.Header{},
		Body:       io.NopCloser(strings.NewReader(`{"operationId":"op_1"}`)),
	}
	var out statusUnionProbe
	if err := (&core{}).finish(spec, resp, &out, nil); err != nil {
		t.Fatal(err)
	}
	if out.status != 202 {
		t.Fatalf("status = %d", out.status)
	}
	if string(out.Raw) != `{"operationId":"op_1"}` {
		t.Fatalf("raw = %s", out.Raw)
	}
	// A plain model decodes unchanged: the hook only touches carriers.
	var plain struct {
		OperationID string `json:"operationId"`
	}
	resp = &http.Response{StatusCode: 200, Header: http.Header{}, Body: io.NopCloser(strings.NewReader(`{"operationId":"op_2"}`))}
	if err := (&core{}).finish(spec, resp, &plain, nil); err != nil || plain.OperationID != "op_2" {
		t.Fatalf("plain decode: %+v, %v", plain, err)
	}
}
