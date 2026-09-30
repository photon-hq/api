# Try Photon with Postman

Fork the hosted collection from Photon's public Postman workspace, or download
[`collection.json`](collection.json) and import it into your own workspace.

1. Set the empty `apiToken` variable to a supported API key or token in your
   own workspace. Keep the credential private.
2. Fill required path, query and body values with your own values, review the
   request, and send it. Mutating requests change resources in your account.

The collection sends requests to `https://api.photon.codes`. The SDKs do not run OAuth flows,
and neither does the collection: obtain an access token through your
application's authentication flow and use it as `apiToken`.

Optional query parameters and headers start disabled. Enable only the filters
you need; for example, use either created-time or updated-time filters when the
endpoint describes them as alternatives. Pagination tokens come from a previous
response. Empty credential fields must be filled in locally before sending.

The attachment upload includes a small `hello.txt` file in a complete
`multipart/related` body. Its request description explains how to replace the
payload and keep the metadata, byte size and boundary consistent.

## Updates

The collection is generated from [`openapi/openapi.json`](../openapi/openapi.json)
in this repository by the pinned Postman converter in `tools/postman`. To
regenerate it locally:

```sh
npm ci --prefix tools/postman --ignore-scripts
npm run generate:postman
```

The collection is released with the client packages; its version is the
release version. A collection you forked into your workspace does not update
automatically; pull the changes into your fork or import the collection again
after a release.
