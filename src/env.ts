/**
 * Environment-variable configuration for the ReactDays client.
 *
 * Integrators can configure the SDK entirely through a `.env` file instead of
 * passing options in code:
 *
 * ```dotenv
 * REACTDAYS_API_KEY=rd_pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * REACTDAYS_ORG=acme
 * REACTDAYS_PROJECT=marketing-site
 * # optional, defaults to https://api.reactdays.com/v1
 * REACTDAYS_BASE_URL=https://api.reactdays.com/v1
 * ```
 *
 * In browser bundles (e.g. the Next.js App Router client), use the
 * `NEXT_PUBLIC_` variants so the bundler inlines them:
 * `NEXT_PUBLIC_REACTDAYS_API_KEY`, `NEXT_PUBLIC_REACTDAYS_ORG`, etc.
 */

/** A generic environment source (e.g. `process.env`). */
export type EnvSource = Record<string, string | undefined>;

/** The canonical env var names read by the SDK. */
export const ENV_VARS = {
  apiKey: ["REACTDAYS_API_KEY", "NEXT_PUBLIC_REACTDAYS_API_KEY"],
  org: ["REACTDAYS_ORG", "REACTDAYS_ORG_ID", "NEXT_PUBLIC_REACTDAYS_ORG"],
  project: [
    "REACTDAYS_PROJECT",
    "REACTDAYS_PROJECT_ID",
    "NEXT_PUBLIC_REACTDAYS_PROJECT",
  ],
  baseUrl: ["REACTDAYS_BASE_URL", "NEXT_PUBLIC_REACTDAYS_BASE_URL"],
} as const;

/** Config values resolved from an environment source. */
export interface ResolvedEnvConfig {
  apiKey?: string;
  org?: string;
  project?: string;
  baseUrl?: string;
}

/** Safely read `process.env` without throwing in environments where it is absent. */
export function getDefaultEnv(): EnvSource {
  if (typeof process !== "undefined" && process?.env) {
    return process.env as EnvSource;
  }
  return {};
}

function firstDefined(env: EnvSource, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = env[key];
    if (value != null && value !== "") return value;
  }
  return undefined;
}

/** Resolve SDK config from an environment source (defaults to `process.env`). */
export function resolveEnvConfig(env: EnvSource = getDefaultEnv()): ResolvedEnvConfig {
  return {
    apiKey: firstDefined(env, ENV_VARS.apiKey),
    org: firstDefined(env, ENV_VARS.org),
    project: firstDefined(env, ENV_VARS.project),
    baseUrl: firstDefined(env, ENV_VARS.baseUrl),
  };
}
