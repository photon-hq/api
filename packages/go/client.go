package photonapi

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	mrand "math/rand/v2"
	"net/http"
	"net/url"
	"reflect"
	"strconv"
	"strings"
	"time"
)

// DefaultMaxRetryAfter is the longest server-requested Retry-After delay the
// client honours.
const DefaultMaxRetryAfter = 60 * time.Second

const (
	defaultMaxRetries = 2
	defaultBaseDelay  = 500 * time.Millisecond
	defaultMaxDelay   = 8 * time.Second
	errorBodyCap      = 64 * 1024
	userAgent         = "photon-api-go"

	// maxBufferedBody is the largest one-shot body held in memory for replay.
	maxBufferedBody = 8 << 20
)

var retryableStatuses = map[int]bool{408: true, 429: true, 502: true, 503: true, 504: true}

// HeaderProvider returns headers to add to every request, for example a
// rotating credential.
type HeaderProvider func(ctx context.Context) (http.Header, error)

// TokenSource returns the bearer token for a request.
type TokenSource func(ctx context.Context) (string, error)

// core holds the transport state shared by every service.
type core struct {
	baseURL       string
	httpClient    *http.Client
	token         TokenSource
	headers       http.Header
	headerFn      HeaderProvider
	userAgent     string
	maxRetries    int
	baseDelay     time.Duration
	maxDelay      time.Duration
	maxRetryAfter time.Duration
}

// Option configures a Client.
type Option func(*core)

// WithBaseURL overrides the API origin (default DefaultBaseURL).
func WithBaseURL(baseURL string) Option {
	return func(c *core) { c.baseURL = strings.TrimRight(baseURL, "/") }
}

// WithAPIKey authenticates every request with a static bearer credential, such
// as a project API key or an account service key.
func WithAPIKey(key string) Option {
	return WithTokenSource(func(context.Context) (string, error) { return key, nil })
}

// WithTokenSource authenticates every request with a bearer token fetched per
// request, for OAuth access tokens that refresh.
func WithTokenSource(source TokenSource) Option {
	return func(c *core) { c.token = source }
}

// WithHTTPClient replaces the underlying *http.Client.
func WithHTTPClient(client *http.Client) Option {
	return func(c *core) { c.httpClient = client }
}

// WithHeader adds a static header to every request.
func WithHeader(key, value string) Option {
	return func(c *core) { c.headers.Add(key, value) }
}

// WithHeaderProvider adds headers computed per request.
func WithHeaderProvider(provider HeaderProvider) Option {
	return func(c *core) { c.headerFn = provider }
}

// WithUserAgent sets the User-Agent header.
func WithUserAgent(value string) Option {
	return func(c *core) { c.userAgent = value }
}

// WithMaxRetries sets how many times a retryable request is retried (default 2).
// Zero disables retries.
func WithMaxRetries(n int) Option {
	return func(c *core) { c.maxRetries = max(n, 0) }
}

// WithRetryDelay sets the exponential backoff base and cap (default 500ms, 8s).
func WithRetryDelay(base, maximum time.Duration) Option {
	return func(c *core) { c.baseDelay, c.maxDelay = base, maximum }
}

// WithMaxRetryAfter caps the Retry-After delay the client will wait for.
func WithMaxRetryAfter(d time.Duration) Option {
	return func(c *core) { c.maxRetryAfter = d }
}

// NewClient builds a Client. Without WithBaseURL it targets DefaultBaseURL.
func NewClient(opts ...Option) *Client {
	c := &core{
		baseURL:       DefaultBaseURL,
		httpClient:    http.DefaultClient,
		headers:       http.Header{},
		userAgent:     userAgent,
		maxRetries:    defaultMaxRetries,
		baseDelay:     defaultBaseDelay,
		maxDelay:      defaultMaxDelay,
		maxRetryAfter: DefaultMaxRetryAfter,
	}
	for _, opt := range opts {
		opt(c)
	}
	return newClient(c)
}

// ResponseInfo describes the HTTP response of a call.
type ResponseInfo struct {
	StatusCode int
	Header     http.Header
	RequestID  string
	// Replayed reports an Idempotent-Replayed response.
	Replayed bool
}

// RequestOption customises a single call.
type RequestOption func(*requestConfig)

type requestConfig struct {
	header http.Header
	info   *ResponseInfo
}

// WithRequestHeader sets a header on one call.
func WithRequestHeader(key, value string) RequestOption {
	return func(r *requestConfig) { r.header.Set(key, value) }
}

// WithResponseInfo stores the response status, headers and request ID in info.
func WithResponseInfo(info *ResponseInfo) RequestOption {
	return func(r *requestConfig) { r.info = info }
}

// BinaryResponse is a raw response body. The caller must close Body.
type BinaryResponse struct {
	ContentType        string
	ContentDisposition string
	Body               io.ReadCloser
}

// Redirect is a 3xx response the client does not follow, such as the start of
// a browser sign-in.
type Redirect struct {
	StatusCode int
	Location   string
}

// requestSpec is the generated description of one call.
type requestSpec struct {
	operationID string
	method      string
	path        string
	safe        bool
	idempotent  bool // an Idempotency-Key is required
	accept      string
	redirect    bool
	notModified bool // the operation declares 304 Not Modified

	pathValues map[string]string
	query      url.Values
	header     http.Header
	jsonBody   any
	hasJSON    bool
	rawBody    io.Reader
	length     int64
}

func newSpec(operationID, method, path string) *requestSpec {
	return &requestSpec{
		operationID: operationID, method: method, path: path,
		accept: "application/json", pathValues: map[string]string{},
		query: url.Values{}, header: http.Header{},
	}
}

func (r *requestSpec) setPath(name string, v any) { r.pathValues[name] = formatValue(v) }

func (r *requestSpec) setHeader(name string, v any) {
	if s, ok := formatOptional(v); ok {
		r.header.Set(name, s)
	}
}

func (r *requestSpec) addQuery(name string, v any) {
	rv := reflect.ValueOf(v)
	for rv.IsValid() && rv.Kind() == reflect.Pointer {
		if rv.IsNil() {
			return
		}
		rv = rv.Elem()
	}
	if !rv.IsValid() {
		return
	}
	if rv.Kind() == reflect.Slice && rv.Type().Elem().Kind() != reflect.Uint8 {
		for i := range rv.Len() {
			r.query.Add(name, formatValue(rv.Index(i).Interface()))
		}
		return
	}
	r.query.Add(name, formatValue(rv.Interface()))
}

func (r *requestSpec) setJSON(body any) { r.jsonBody, r.hasJSON = body, true }

func formatOptional(v any) (string, bool) {
	rv := reflect.ValueOf(v)
	for rv.IsValid() && rv.Kind() == reflect.Pointer {
		if rv.IsNil() {
			return "", false
		}
		rv = rv.Elem()
	}
	if !rv.IsValid() {
		return "", false
	}
	return formatValue(rv.Interface()), true
}

func formatValue(v any) string {
	switch t := v.(type) {
	case string:
		return t
	case Timestamp:
		return t.String()
	case float64:
		return strconv.FormatFloat(t, 'f', -1, 64)
	}
	rv := reflect.ValueOf(v)
	if rv.Kind() == reflect.String {
		return rv.String()
	}
	return fmt.Sprint(v)
}

// do runs a request with retries and decodes a 2xx response into out, which is
// nil (discard), *BinaryResponse, *Redirect or a JSON target.
func (c *core) do(ctx context.Context, spec *requestSpec, out any, opts []RequestOption) error {
	cfg := requestConfig{header: http.Header{}}
	for _, opt := range opts {
		opt(&cfg)
	}

	target := c.baseURL + spec.path
	for name, value := range spec.pathValues {
		if value == "" {
			return fmt.Errorf("photonapi: %s: empty path parameter %q", spec.operationID, name)
		}
		// PathEscape leaves dot segments alone, and a proxy or server may
		// normalise them into a different route.
		if value == "." || value == ".." {
			return fmt.Errorf("photonapi: %s: invalid path parameter %q: %q", spec.operationID, name, value)
		}
		target = strings.ReplaceAll(target, "{"+name+"}", url.PathEscape(value))
	}
	if strings.ContainsAny(strings.TrimPrefix(target, c.baseURL), "{}") {
		return fmt.Errorf("photonapi: %s: missing path parameter for %s", spec.operationID, spec.path)
	}
	if len(spec.query) > 0 {
		target += "?" + spec.query.Encode()
	}

	var payload []byte
	switch {
	case spec.hasJSON:
		var err error
		if payload, err = json.Marshal(spec.jsonBody); err != nil {
			return fmt.Errorf("photonapi: %s: encode request body: %w", spec.operationID, err)
		}
	}

	header := http.Header{}
	header.Set("Accept", spec.accept)
	header.Set("User-Agent", c.userAgent)
	if spec.hasJSON {
		header.Set("Content-Type", "application/json")
	}
	for k, v := range c.headers {
		header[k] = append([]string(nil), v...)
	}
	if c.headerFn != nil {
		extra, err := c.headerFn(ctx)
		if err != nil {
			return &TransportError{OperationID: spec.operationID, Err: err}
		}
		for k, v := range extra {
			header[http.CanonicalHeaderKey(k)] = append([]string(nil), v...)
		}
	}
	for k, v := range spec.header {
		header[http.CanonicalHeaderKey(k)] = append([]string(nil), v...)
	}
	for k, v := range cfg.header {
		header[k] = append([]string(nil), v...)
	}
	if spec.idempotent && header.Get("Idempotency-Key") == "" {
		header.Set("Idempotency-Key", newIdempotencyKey())
	}

	retryable := spec.safe || header.Get("Idempotency-Key") != ""
	attempts := 1
	if retryable {
		attempts += c.maxRetries
	}
	// replay returns a fresh body per attempt, without a Close method so the
	// transport never closes the caller's reader.
	var replay func() (io.Reader, error)
	switch {
	case payload != nil:
		replay = func() (io.Reader, error) { return bytes.NewReader(payload), nil }
	case spec.rawBody != nil:
		// Sections start at the reader's current offset, matching what a plain
		// Read would send, and each attempt gets a fresh one so a transport
		// still reading the previous attempt cannot race with the replay.
		if r, ok := spec.rawBody.(io.ReaderAt); ok {
			if seeker, ok := spec.rawBody.(io.Seeker); ok {
				start, err := seeker.Seek(0, io.SeekCurrent)
				if err != nil {
					return &TransportError{OperationID: spec.operationID, Err: err}
				}
				n := spec.length
				if n <= 0 {
					// Unknown length: size it by seeking, then restore the offset.
					if end, err := seeker.Seek(0, io.SeekEnd); err == nil && end >= start {
						n = end - start
					}
					if _, err := seeker.Seek(start, io.SeekStart); err != nil {
						return &TransportError{OperationID: spec.operationID, Err: err}
					}
				}
				if n > 0 {
					replay = func() (io.Reader, error) { return io.NewSectionReader(r, start, n), nil }
				}
			} else if spec.length > 0 {
				replay = func() (io.Reader, error) { return io.NewSectionReader(r, 0, spec.length), nil }
			}
		}
		if replay == nil {
			// A one-shot stream cannot be replayed. Buffer it, up to a cap,
			// only when the request may be retried.
			once := struct{ io.Reader }{spec.rawBody}
			replay = func() (io.Reader, error) { return once, nil }
			if attempts > 1 {
				buffered, err := io.ReadAll(io.LimitReader(spec.rawBody, maxBufferedBody+1))
				if err != nil {
					return fmt.Errorf("photonapi: %s: read request body: %w", spec.operationID, err)
				}
				if int64(len(buffered)) > maxBufferedBody {
					// Too large to hold for a replay: send it once.
					rest := io.MultiReader(bytes.NewReader(buffered), spec.rawBody)
					once = struct{ io.Reader }{rest}
					attempts = 1
				} else {
					replay = func() (io.Reader, error) { return bytes.NewReader(buffered), nil }
				}
			} else {
				attempts = 1
			}
		}
	}

	httpClient := c.httpClient
	if spec.redirect {
		clone := *httpClient
		clone.CheckRedirect = func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }
		httpClient = &clone
	}

	var lastErr error
	for attempt := 1; attempt <= attempts; attempt++ {
		var body io.Reader
		if replay != nil {
			var err error
			if body, err = replay(); err != nil {
				return &TransportError{OperationID: spec.operationID, Err: err}
			}
		}
		req, err := http.NewRequestWithContext(ctx, spec.method, target, body)
		if err != nil {
			return &TransportError{OperationID: spec.operationID, Err: err}
		}
		req.Header = header.Clone()
		if spec.length > 0 {
			req.ContentLength = spec.length
		}
		// An explicit Authorization header wins over the token source.
		if c.token != nil && req.Header.Get("Authorization") == "" {
			token, err := c.token(ctx)
			if err != nil {
				return &TransportError{OperationID: spec.operationID, Err: err}
			}
			req.Header.Set("Authorization", "Bearer "+token)
		}

		resp, err := httpClient.Do(req)
		if err != nil {
			lastErr = &TransportError{OperationID: spec.operationID, Err: err}
			if attempt < attempts && ctx.Err() == nil {
				delay, _ := c.backoff(attempt, nil)
				if sleepErr := sleep(ctx, delay); sleepErr != nil {
					return lastErr
				}
				continue
			}
			return lastErr
		}
		if retryableStatuses[resp.StatusCode] && attempt < attempts {
			delay, ok := c.backoff(attempt, resp)
			if !ok {
				// The server asked for longer than we will wait: retrying
				// sooner would only hit the same limit.
				return c.finish(spec, resp, out, cfg.info)
			}
			_, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, errorBodyCap))
			resp.Body.Close()
			if sleepErr := sleep(ctx, delay); sleepErr != nil {
				return &TransportError{OperationID: spec.operationID, Err: sleepErr}
			}
			continue
		}
		return c.finish(spec, resp, out, cfg.info)
	}
	return lastErr
}

func (c *core) finish(spec *requestSpec, resp *http.Response, out any, info *ResponseInfo) error {
	requestID := resp.Header.Get("X-Request-ID")
	if info != nil {
		*info = ResponseInfo{
			StatusCode: resp.StatusCode,
			Header:     resp.Header.Clone(),
			RequestID:  requestID,
			Replayed:   strings.EqualFold(resp.Header.Get("Idempotent-Replayed"), "true"),
		}
	}

	// A 304 the operation does not declare is an error, as in the other clients.
	undeclared304 := resp.StatusCode == http.StatusNotModified && !spec.notModified
	if redirect, ok := out.(*Redirect); ok && resp.StatusCode >= 300 && resp.StatusCode < 400 && !undeclared304 {
		resp.Body.Close()
		*redirect = Redirect{StatusCode: resp.StatusCode, Location: resp.Header.Get("Location")}
		return nil
	}

	// A conditional request that hits the cache is a success with no body when
	// the operation declares 304; ResponseInfo carries the status.
	if resp.StatusCode == http.StatusNotModified && spec.notModified {
		resp.Body.Close()
		return nil
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		defer resp.Body.Close()
		raw, _ := io.ReadAll(io.LimitReader(resp.Body, errorBodyCap))
		return newAPIError(spec.operationID, resp, raw, requestID)
	}

	if binary, ok := out.(*BinaryResponse); ok {
		*binary = BinaryResponse{
			ContentType:        resp.Header.Get("Content-Type"),
			ContentDisposition: resp.Header.Get("Content-Disposition"),
			Body:               resp.Body,
		}
		return nil
	}

	defer resp.Body.Close()
	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return &TransportError{OperationID: spec.operationID, Err: err}
	}
	if out == nil || resp.StatusCode == http.StatusNoContent || len(bytes.TrimSpace(raw)) == 0 {
		return nil
	}
	if err := json.Unmarshal(raw, out); err != nil {
		return &ResponseDecodeError{
			OperationID: spec.operationID, StatusCode: resp.StatusCode,
			Body: raw, RequestID: requestID, Err: err,
		}
	}
	return nil
}

// backoff returns the wait before the next attempt: the server's Retry-After
// when present, otherwise exponential backoff with jitter. ok is false when
// Retry-After exceeds the cap, in which case the caller should stop retrying.
func (c *core) backoff(attempt int, resp *http.Response) (time.Duration, bool) {
	if resp != nil {
		if d, ok := retryAfter(resp.Header.Get("Retry-After")); ok {
			return d, d <= c.maxRetryAfter
		}
	}
	d := min(time.Duration(float64(c.baseDelay)*math.Pow(2, float64(attempt-1))), c.maxDelay)
	return time.Duration(mrand.Float64() * float64(d)), true
}

func retryAfter(value string) (time.Duration, bool) {
	value = strings.TrimSpace(value)
	if value == "" {
		return 0, false
	}
	if seconds, err := strconv.ParseFloat(value, 64); err == nil {
		if math.IsNaN(seconds) || math.IsInf(seconds, 0) || seconds < 0 {
			return 0, false
		}
		return time.Duration(seconds * float64(time.Second)), true
	}
	if at, err := http.ParseTime(value); err == nil {
		return max(0, time.Until(at)), true
	}
	return 0, false
}

func sleep(ctx context.Context, d time.Duration) error {
	if d <= 0 {
		return ctx.Err()
	}
	timer := time.NewTimer(d)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-timer.C:
		return nil
	}
}

func newIdempotencyKey() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(errors.New("photonapi: random source unavailable: " + err.Error()))
	}
	b[6] = b[6]&0x0f | 0x40
	b[8] = b[8]&0x3f | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
