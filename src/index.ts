/**
 * @reactdays/react - Official React SDK for the ReactDays CMS.
 *
 * This entry point is server-component safe: the API client, types, error
 * class, and presentational components have no client-side dependencies.
 *
 * For interactive data fetching (React hooks + provider) import from
 * `@reactdays/react/client`.
 */

export {
  ReactDaysClient,
  createReactDaysClient,
} from "./client";
export type {
  ReactDaysClientOptions,
  RequestOptions,
  FetchLike,
} from "./client";

export { ReactDaysApiError } from "./errors";

export { resolveEnvConfig, getDefaultEnv, ENV_VARS } from "./env";
export type { EnvSource, ResolvedEnvConfig } from "./env";

export * from "./types";

export * from "./components";
