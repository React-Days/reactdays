import type { ApiErrorBody } from "./types";

/**
 * Thrown when the ReactDays API returns a non-2xx response.
 *
 * Branch on {@link ReactDaysApiError.code} (a stable string), never on
 * {@link ReactDaysApiError.message} (human-readable copy that may change).
 *
 * @example
 * ```ts
 * try {
 *   await client.getArticle("missing-slug");
 * } catch (err) {
 *   if (err instanceof ReactDaysApiError && err.code === "article_not_found") {
 *     notFound();
 *   }
 *   throw err;
 * }
 * ```
 */
export class ReactDaysApiError extends Error {
  /** HTTP status code. */
  readonly status: number;
  /** Stable machine-readable error code, e.g. `article_not_found`. */
  readonly code: string;
  /** Seconds to wait before retrying, present on `rate_limited`. */
  readonly retryAfterSeconds?: number;
  /** The raw parsed error body, when available. */
  readonly body?: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || `ReactDays API error (${status})`);
    this.name = "ReactDaysApiError";
    this.status = status;
    this.code = body.code;
    this.retryAfterSeconds = body.retry_after_seconds;
    this.body = body;
    // Restore prototype chain for instanceof across transpile targets.
    Object.setPrototypeOf(this, ReactDaysApiError.prototype);
  }

  /** True for 429 rate-limit responses. */
  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /** True for 404 not-found responses. */
  get isNotFound(): boolean {
    return this.status === 404;
  }
}
