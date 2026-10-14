// Package photonapi is the Go client for the Photon API.
//
// Most of it is generated from openapi/sdk.json and openapi/rpc-manifest.json
// by tools/go-codegen (files named *_generated.go); do not edit those.
//
//	client := photonapi.NewClient(photonapi.WithAPIKey(os.Getenv("PHOTON_API_KEY")))
//	orgs, err := client.Organizations.ListOrganizations(ctx)
//
// Calls are grouped in services that follow the operation namespaces (for
// example client.Projects.Platforms). Failed calls return *APIError; send and
// read failures return *TransportError. Retryable requests are retried with
// backoff: reads, and writes that carry an Idempotency-Key (the client adds
// one when the field is left empty).
package photonapi
