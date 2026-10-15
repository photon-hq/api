package photonapi

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// Problem is an RFC 9457 problem document returned for a failed call. Members
// the SDK does not know are kept in Extensions.
type Problem struct {
	Type       string
	Title      string
	Status     int
	Code       string
	Detail     string
	Instance   string
	RequestID  string
	Extensions map[string]any
}

// UnmarshalJSON reads the known members and keeps the rest.
func (p *Problem) UnmarshalJSON(data []byte) error {
	var members map[string]json.RawMessage
	if err := json.Unmarshal(data, &members); err != nil {
		return err
	}
	*p = Problem{}
	known := map[string]any{
		"type": &p.Type, "title": &p.Title, "status": &p.Status, "code": &p.Code,
		"detail": &p.Detail, "instance": &p.Instance, "requestId": &p.RequestID,
	}
	for name, raw := range members {
		if target, ok := known[name]; ok {
			// A member of an unexpected type is left at its zero value.
			_ = json.Unmarshal(raw, target)
			continue
		}
		var value any
		if err := json.Unmarshal(raw, &value); err == nil {
			if p.Extensions == nil {
				p.Extensions = map[string]any{}
			}
			p.Extensions[name] = value
		}
	}
	return nil
}

// APIError is returned when the service answers with a non-2xx status.
type APIError struct {
	OperationID string
	StatusCode  int
	// Problem is nil when the body is not a problem document.
	Problem   *Problem
	Header    http.Header
	RequestID string
	// Body is the response body, capped at 64 KiB.
	Body []byte
}

func newAPIError(operationID string, resp *http.Response, body []byte, requestID string) *APIError {
	e := &APIError{
		OperationID: operationID, StatusCode: resp.StatusCode,
		Header: resp.Header.Clone(), RequestID: requestID, Body: body,
	}
	var problem Problem
	if json.Unmarshal(body, &problem) == nil && (problem.Code != "" || problem.Title != "" || problem.Type != "") {
		e.Problem = &problem
		if e.RequestID == "" {
			e.RequestID = problem.RequestID
		}
	}
	return e
}

func (e *APIError) Error() string {
	msg := fmt.Sprintf("photonapi: %s: HTTP %d", e.OperationID, e.StatusCode)
	if p := e.Problem; p != nil {
		if p.Code != "" {
			msg += " " + p.Code
		}
		if p.Detail != "" {
			msg += ": " + p.Detail
		} else if p.Title != "" {
			msg += ": " + p.Title
		}
	}
	if e.RequestID != "" {
		msg += " (request " + e.RequestID + ")"
	}
	return msg
}

// Code returns the problem code, or "" when the body is not a problem.
func (e *APIError) Code() string {
	if e.Problem == nil {
		return ""
	}
	return e.Problem.Code
}

// TransportError wraps a failure to send a request or read its response.
type TransportError struct {
	OperationID string
	Err         error
}

func (e *TransportError) Error() string {
	return fmt.Sprintf("photonapi: %s: %v", e.OperationID, e.Err)
}

func (e *TransportError) Unwrap() error { return e.Err }

// ResponseDecodeError means a 2xx body did not match the expected shape.
type ResponseDecodeError struct {
	OperationID string
	StatusCode  int
	Body        []byte
	RequestID   string
	Err         error
}

func (e *ResponseDecodeError) Error() string {
	return fmt.Sprintf("photonapi: %s: decode HTTP %d response: %v", e.OperationID, e.StatusCode, e.Err)
}

func (e *ResponseDecodeError) Unwrap() error { return e.Err }
