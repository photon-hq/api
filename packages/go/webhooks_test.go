package photonapi_test

// Webhook verification against deliveries signed here, independently of the
// library under test: HMAC-SHA256 over "<id>.<timestamp>.<body>", keyed with
// the secret's decoded bytes, as Photon signs them.

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	photonapi "github.com/photon-hq/api/packages/go"
)

const eventID = "pho_evt_00000000000000000000000001"

var body = []byte(`{"id":"pho_evt_00000000000000000000000001","type":"message.received","text":"Hello 🌍"}`)

func newSecret(t *testing.T) string {
	t.Helper()
	key := make([]byte, 32)
	if _, err := rand.Read(key); err != nil {
		t.Fatal(err)
	}
	return "whsec_" + base64.StdEncoding.EncodeToString(key)
}

func sign(secret, id string, timestamp int64, payload []byte) string {
	key, _ := base64.StdEncoding.DecodeString(strings.TrimPrefix(secret, "whsec_"))
	mac := hmac.New(sha256.New, key)
	fmt.Fprintf(mac, "%s.%d.", id, timestamp)
	mac.Write(payload)
	return "v1," + base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

func delivery(secrets []string, timestamp int64, payload []byte) http.Header {
	signatures := make([]string, 0, len(secrets))
	for _, secret := range secrets {
		signatures = append(signatures, sign(secret, eventID, timestamp, payload))
	}
	header := http.Header{}
	header.Set("Webhook-Id", eventID)
	header.Set("Webhook-Timestamp", fmt.Sprint(timestamp))
	header.Set("Webhook-Signature", strings.Join(signatures, " "))
	return header
}

func now() int64 { return time.Now().Unix() }

func rejected(t *testing.T, err error, reason string) {
	t.Helper()
	var verification *photonapi.WebhookVerificationError
	if !errors.As(err, &verification) {
		t.Fatalf("got %v, want a *WebhookVerificationError", err)
	}
	if !strings.Contains(err.Error(), reason) {
		t.Fatalf("got %q, want it to mention %q", err, reason)
	}
	// The Standard Webhooks library's own error stays inside the client.
	if wrapped := errors.Unwrap(err); wrapped != nil {
		t.Fatalf("got %q wrapping %v, want no wrapped error", err, wrapped)
	}
}

func TestVerifyWebhookSignerMatchesTheReferenceVector(t *testing.T) {
	// The known-answer vector of the Standard Webhooks reference libraries' tests.
	got := sign("whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw", "msg_p5jXN8AQM9LWM0D4loKWxJek", 1614265330, []byte(`{"test": 2432232314}`))
	if want := "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE="; got != want {
		t.Fatalf("got %s, want %s", got, want)
	}
}

func TestVerifyWebhookAcceptsTheDestinationSecret(t *testing.T) {
	secret := newSecret(t)
	if err := photonapi.VerifyWebhook(body, delivery([]string{secret}, now(), body), secret); err != nil {
		t.Fatal(err)
	}
}

func TestVerifyWebhookRejectsABadSignature(t *testing.T) {
	secret := newSecret(t)
	header := delivery([]string{secret}, now(), body)
	changed := []byte(strings.Replace(string(body), "Hello", "Hullo", 1))
	rejected(t, photonapi.VerifyWebhook(changed, header, secret), "no matching signature")
	rejected(t, photonapi.VerifyWebhook(body, header, newSecret(t)), "no matching signature")
	forged := header.Clone()
	forged.Set("Webhook-Signature", "v1,"+base64.StdEncoding.EncodeToString(make([]byte, 32)))
	rejected(t, photonapi.VerifyWebhook(body, forged, secret), "no matching signature")
	otherScheme := header.Clone()
	otherScheme.Set("Webhook-Signature", strings.Replace(header.Get("Webhook-Signature"), "v1,", "v2,", 1))
	rejected(t, photonapi.VerifyWebhook(body, otherScheme, secret), "no matching signature")
}

func TestVerifyWebhookRejectsATimestampMoreThanFiveMinutesAway(t *testing.T) {
	secret := newSecret(t)
	rejected(t, photonapi.VerifyWebhook(body, delivery([]string{secret}, now()-301, body), secret), "too old")
	rejected(t, photonapi.VerifyWebhook(body, delivery([]string{secret}, now()+301, body), secret), "too new")
	for _, offset := range []int64{-290, 290} {
		if err := photonapi.VerifyWebhook(body, delivery([]string{secret}, now()+offset, body), secret); err != nil {
			t.Fatal(err)
		}
	}
	unreadable := delivery([]string{secret}, now(), body)
	unreadable.Set("Webhook-Timestamp", "yesterday")
	rejected(t, photonapi.VerifyWebhook(body, unreadable, secret), "invalid signature headers")
}

func TestVerifyWebhookRejectsAnExtremeTimestampWithoutAValidSignature(t *testing.T) {
	secret := newSecret(t)
	for _, timestamp := range []string{"-9223372036854775808", "9223372036854775807"} {
		header := delivery([]string{secret}, now(), body)
		header.Set("Webhook-Timestamp", timestamp)
		header.Set("Webhook-Signature", "v1,"+base64.StdEncoding.EncodeToString(make([]byte, 32)))
		rejected(t, photonapi.VerifyWebhook(body, header, secret), "message timestamp too")
	}
}

func TestVerifyWebhookAcceptsEitherSecretDuringARotationAndOnlyTheNewOneAfterIt(t *testing.T) {
	previous, current := newSecret(t), newSecret(t)
	// While both keys are valid, Photon signs with each of them in one header.
	both := delivery([]string{previous, current}, now(), body)
	for _, secret := range []string{previous, current} {
		if err := photonapi.VerifyWebhook(body, both, secret); err != nil {
			t.Fatal(err)
		}
	}
	// Once the previous key expires, Photon signs with the new one alone.
	rejected(t, photonapi.VerifyWebhook(body, delivery([]string{current}, now(), body), previous), "no matching signature")
	// A timestamp failure is reported as such, not as a signature mismatch.
	rejected(t, photonapi.VerifyWebhook(body, delivery([]string{previous, current}, now()-301, body), current), "too old")
}

func TestVerifyWebhookRejectsMissingHeaders(t *testing.T) {
	secret := newSecret(t)
	for _, name := range []string{"Webhook-Id", "Webhook-Timestamp", "Webhook-Signature"} {
		header := delivery([]string{secret}, now(), body)
		header.Del(name)
		rejected(t, photonapi.VerifyWebhook(body, header, secret), "missing required headers")
	}
}

func TestVerifyWebhookRejectsAMissingOrMalformedSecret(t *testing.T) {
	header := delivery([]string{newSecret(t)}, now(), body)
	for _, secret := range []string{"", "pho_sk_api_key", "whsec_", "whsec_not base64!"} {
		err := photonapi.VerifyWebhook(body, header, secret)
		if err != photonapi.ErrInvalidWebhookSecret {
			t.Fatalf("secret %q: got %v, want ErrInvalidWebhookSecret alone", secret, err)
		}
	}
}
