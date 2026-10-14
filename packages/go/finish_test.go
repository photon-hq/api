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
