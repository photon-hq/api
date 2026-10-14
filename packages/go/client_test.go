package photonapi_test

// Tests that use no schema or operation of the contract, so they cannot break
// when it changes. The tests that call operations live in
// tools/conformance/fixtures/tests/go and run against the feature-coverage
// fixture.

import (
	"encoding/json"
	"testing"

	photonapi "github.com/photon-hq/api/packages/go"
)

type shape struct{ photonapi.Union }

func TestUnionKeepsUnknownMembers(t *testing.T) {
	var value shape
	if err := json.Unmarshal([]byte(`{"type":"brand.new","x":1}`), &value); err != nil {
		t.Fatal(err)
	}
	if got := value.Discriminator("type"); got != "brand.new" {
		t.Fatalf("discriminator = %q", got)
	}
	back, err := json.Marshal(value)
	if err != nil || string(back) != `{"type":"brand.new","x":1}` {
		t.Fatalf("round trip = %s, %v", back, err)
	}
}

func TestTimestamp(t *testing.T) {
	var ts photonapi.Timestamp
	if err := ts.UnmarshalJSON([]byte(`"2026-01-01T01:00:00+01:00"`)); err != nil {
		t.Fatal(err)
	}
	if ts.String() != "2026-01-01T00:00:00.000Z" {
		t.Fatalf("timestamp = %s", ts)
	}
}

type update struct {
	Name photonapi.Nullable[string] `json:"name,omitzero"`
}

func TestNullableStates(t *testing.T) {
	cases := []struct {
		name string
		body update
		want string
	}{
		{"absent", update{}, `{}`},
		{"null", update{Name: photonapi.Null[string]()}, `{"name":null}`},
		{"value", update{Name: photonapi.Set("Guo")}, `{"name":"Guo"}`},
	}
	for _, tc := range cases {
		got, err := json.Marshal(tc.body)
		if err != nil || string(got) != tc.want {
			t.Errorf("%s: got %s, %v; want %s", tc.name, got, err, tc.want)
		}
	}
	var back update
	if err := json.Unmarshal([]byte(`{"name":null}`), &back); err != nil || !back.Name.IsNull() {
		t.Fatalf("null did not round-trip: %+v %v", back, err)
	}
}
