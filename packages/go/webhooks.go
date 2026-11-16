package photonapi

import (
	"errors"
	"net/http"
	"strings"

	standardwebhooks "github.com/standard-webhooks/standard-webhooks/libraries/go"
)

// WebhookVerificationError is returned by VerifyWebhook when a delivery fails
// verification: missing or invalid headers, a timestamp more than five minutes
// away, or no matching signature. Answer it with 400 and do not act on it.
type WebhookVerificationError struct {
	reason string
}

func (e *WebhookVerificationError) Error() string {
	return "photonapi: webhook verification failed: " + e.reason
}

// ErrInvalidWebhookSecret is returned by VerifyWebhook when the secret is not a
// webhook signing secret (whsec_...). It is a configuration error, not a bad
// delivery.
var ErrInvalidWebhookSecret = errors.New("photonapi: invalid webhook signing secret")

var webhookReasons = []error{
	standardwebhooks.ErrRequiredHeaders,
	standardwebhooks.ErrInvalidHeaders,
	standardwebhooks.ErrMessageTooOld,
	standardwebhooks.ErrMessageTooNew,
	standardwebhooks.ErrNoMatchingSignature,
}

// VerifyWebhook verifies a webhook delivery's Standard Webhooks signature: one
// of the webhook-signature signatures must be the HMAC-SHA256 of
// "<webhook-id>.<webhook-timestamp>.<payload>" under secret, and
// webhook-timestamp must be within five minutes of the current time. Pass the
// request body exactly as it arrived and the request's Header.
//
// secret is the destination's signing secret (whsec_...). During a rotation
// Photon signs each delivery with the new and the previous secret, so either
// one verifies it.
//
// A delivery that fails verification returns a *WebhookVerificationError; a
// bad secret returns ErrInvalidWebhookSecret.
func VerifyWebhook(payload []byte, header http.Header, secret string) error {
	key, ok := strings.CutPrefix(secret, "whsec_")
	if !ok || key == "" {
		return ErrInvalidWebhookSecret
	}
	verifier, err := standardwebhooks.NewWebhook(key)
	if err != nil {
		return ErrInvalidWebhookSecret
	}
	err = verifier.Verify(payload, header)
	if err == nil {
		return nil
	}
	for _, reason := range webhookReasons {
		if errors.Is(err, reason) {
			return &WebhookVerificationError{reason: reason.Error()}
		}
	}
	return &WebhookVerificationError{reason: err.Error()}
}
