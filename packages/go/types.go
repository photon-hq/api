package photonapi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"time"
)

// Timestamp is an RFC 3339 instant. It is written as UTC with millisecond
// precision (2026-01-01T00:00:00.000Z), the only form the service accepts.
type Timestamp struct{ time.Time }

const timestampLayout = "2006-01-02T15:04:05.000Z"

// String returns the wire form.
func (t Timestamp) String() string { return t.UTC().Format(timestampLayout) }

// MarshalJSON writes the wire form.
func (t Timestamp) MarshalJSON() ([]byte, error) { return json.Marshal(t.String()) }

// UnmarshalJSON accepts any RFC 3339 instant.
func (t *Timestamp) UnmarshalJSON(data []byte) error {
	if bytes.Equal(data, []byte("null")) {
		return nil
	}
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	parsed, err := time.Parse(time.RFC3339Nano, s)
	if err != nil {
		return fmt.Errorf("invalid timestamp %q: %w", s, err)
	}
	t.Time = parsed
	return nil
}

// Union holds the JSON of a value that is one of several shapes. It keeps the
// raw document, so a member added by the service later is never rejected:
// inspect the discriminator, then decode with the As<Member> method of the
// concrete union type or with UnionAs.
type Union struct{ Raw json.RawMessage }

// MarshalJSON writes the raw document.
func (u Union) MarshalJSON() ([]byte, error) {
	if len(u.Raw) == 0 {
		return []byte("null"), nil
	}
	return u.Raw, nil
}

// UnmarshalJSON stores the raw document.
func (u *Union) UnmarshalJSON(data []byte) error {
	u.Raw = append(u.Raw[:0], data...)
	return nil
}

// Discriminator returns the string member field of the document, or "" when it
// is absent.
func (u Union) Discriminator(field string) string {
	var members map[string]json.RawMessage
	if json.Unmarshal(u.Raw, &members) != nil {
		return ""
	}
	var value string
	if json.Unmarshal(members[field], &value) != nil {
		return ""
	}
	return value
}

// UnionAs decodes the union into one of its members.
func UnionAs[T any](u Union) (T, error) {
	var out T
	err := json.Unmarshal(u.Raw, &out)
	return out, err
}

// Ptr returns a pointer to v, for optional request fields.
func Ptr[T any](v T) *T { return &v }

// Nullable is an optional field that may also be JSON null. The zero value is
// absent and is omitted from requests; Null sends an explicit null, which
// clears the field on the server; Set sends a value.
type Nullable[T any] struct {
	// value is a pointer so schemas that refer to themselves stay finite.
	value *T
	state nullableState
}

type nullableState uint8

const (
	nullableAbsent nullableState = iota
	nullableNull
	nullableSet
)

// Set returns a Nullable holding v.
func Set[T any](v T) Nullable[T] { return Nullable[T]{value: &v, state: nullableSet} }

// Null returns a Nullable that is sent as JSON null.
func Null[T any]() Nullable[T] { return Nullable[T]{state: nullableNull} }

// IsZero reports whether the field is absent. encoding/json omits an absent
// field tagged omitzero.
func (n Nullable[T]) IsZero() bool { return n.state == nullableAbsent }

// IsNull reports whether the field is an explicit null.
func (n Nullable[T]) IsNull() bool { return n.state == nullableNull }

// Value returns the value and whether one is set.
func (n Nullable[T]) Value() (T, bool) {
	if n.state != nullableSet || n.value == nil {
		var zero T
		return zero, false
	}
	return *n.value, true
}

// MarshalJSON writes the value, or null when absent or null.
func (n Nullable[T]) MarshalJSON() ([]byte, error) {
	if n.state != nullableSet {
		return []byte("null"), nil
	}
	return json.Marshal(*n.value)
}

// UnmarshalJSON records null or decodes the value.
func (n *Nullable[T]) UnmarshalJSON(data []byte) error {
	if bytes.Equal(bytes.TrimSpace(data), []byte("null")) {
		*n = Null[T]()
		return nil
	}
	var v T
	if err := json.Unmarshal(data, &v); err != nil {
		return err
	}
	*n = Set(v)
	return nil
}
