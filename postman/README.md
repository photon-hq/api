# Try Photon with Postman

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/58645896-f0273a59-bd8f-4c08-8f76-62b74a7cbdd1?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D58645896-f0273a59-bd8f-4c08-8f76-62b74a7cbdd1%26entityType%3Dcollection%26workspaceId%3D4c8fb23d-a1e6-4292-9475-6696a2618aa8)

The button forks the hosted collection from
[Photon's public Postman workspace](https://www.postman.com/photonhq/photon-api) into your own workspace. You can
instead download [`collection.json`](collection.json) and import it.

1. Paste a supported API key or token as the value of the empty `apiToken`
   collection variable in your own workspace. Postman keeps a variable's value
   on your computer unless you share it, so don't share this one. Where Postman
   shows an initial and a current value, use the current value.
2. Fill required path, query and body values with your own values, review the
   request, and send it. Mutating requests change resources in your account.

The collection sends requests to the API origin in its `baseUrl` variable,
`https://api.photon.codes`. The SDKs do not run OAuth flows,
and neither does the collection: obtain an access token through your
application's authentication flow and use it as `apiToken`.

Every request that takes an `Idempotency-Key` header sends Postman's
`{{$guid}}` dynamic variable, so each Send uses a new key and runs the
operation again. To retry an operation on purpose, for example after a timeout,
open the Postman Console, copy the key that the earlier Send used, and paste it
in place of `{{$guid}}`. Send the same body, then put `{{$guid}}` back.

Optional query parameters and headers, other than `Idempotency-Key`, start
disabled. Enable only the filters you need; for example, use either
created-time or updated-time filters when the endpoint describes them as
alternatives. Pagination tokens come from a previous
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

The collection is released with the client packages; its description names
the release version. A collection you forked into your workspace does not update
automatically; pull the changes into your fork or import the collection again
after a release.
