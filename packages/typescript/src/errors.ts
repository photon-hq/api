import type { ZodIssue } from "zod";

export interface PhotonErrorOptions {
  cause?: unknown;
  operationId?: string;
  requestId?: string;
}

export class PhotonError extends Error {
  readonly operationId?: string;
  readonly requestId?: string;

  constructor(message: string, options: PhotonErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    if (options.operationId !== undefined) {
      this.operationId = options.operationId;
    }
    if (options.requestId !== undefined) {
      this.requestId = options.requestId;
    }
  }
}

export interface ResponseValidationErrorOptions {
  /** The successful HTTP status whose response could not be decoded. */
  status: number;
  cause?: unknown;
  requestId?: string;
}

export class ResponseValidationError extends PhotonError {
  readonly status: number;
  readonly issues: readonly ZodIssue[];

  constructor(
    operationId: string,
    issues: readonly ZodIssue[],
    options: ResponseValidationErrorOptions,
  ) {
    super(`Invalid response for ${operationId}`, {
      cause: options.cause,
      operationId,
      requestId: options.requestId,
    });
    this.status = options.status;
    this.issues = issues;
  }
}

export class TransportError extends PhotonError {}

export interface ApiErrorOptions extends PhotonErrorOptions {
  status: number;
  headers: Headers;
  body: unknown;
  rawBody?: string;
}

export class ApiError extends PhotonError {
  readonly status: number;
  readonly headers: Headers;
  readonly body: unknown;
  readonly rawBody?: string;

  constructor(message: string, options: ApiErrorOptions) {
    super(message, options);
    this.status = options.status;
    this.headers = options.headers;
    this.body = options.body;
    if (options.rawBody !== undefined) {
      this.rawBody = options.rawBody;
    }
  }
}

