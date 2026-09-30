export { Photon, type PhotonOptions } from "./client.js";
export {
  ApiError,
  PhotonError,
  ResponseValidationError,
  TransportError,
  type ResponseValidationErrorOptions,
} from "./errors.js";
export type {
  HeaderProvider,
  HeaderValues,
  RetryOptions,
} from "./transport.js";
export type {
  PhotonNamespaces,
  PhotonRawNamespaces,
  RawResponse,
  RequestOptions,
} from "./rpc.generated.js";
export * from "./schemas.js";

// Contract types, type-only as Hey API's own entry exposes them: component
// schemas plus each operation's `<Op>Data`, `<Op>Errors`/`<Op>Error` and
// `<Op>Responses`/`<Op>Response`.
export type * from "./generated/types.gen.js";
