"use client";

import { createContext, createElement, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { ReactDaysClient } from "../client";
import type { ReactDaysClientOptions } from "../client";

const ReactDaysContext = createContext<ReactDaysClient | null>(null);

export type ReactDaysProviderProps = {
  children: ReactNode;
  /** A pre-built client. Takes precedence over `options`. */
  client?: ReactDaysClient;
  /**
   * Options for a client the provider builds. Any omitted field falls back to
   * the matching environment variable (see {@link ReactDaysClientOptions}), so
   * this may be omitted entirely when everything is configured via `.env`.
   */
  options?: ReactDaysClientOptions;
};

/**
 * Provides a {@link ReactDaysClient} to the component tree so hooks from
 * `@reactdays/react/client` can access it.
 *
 * Pass a pre-built `client`, `options` to have the provider build one, or
 * neither to configure entirely from environment variables.
 *
 * @example
 * ```tsx
 * <ReactDaysProvider
 *   options={{ apiKey: "rd_pk_...", org: "acme", project: "marketing-site" }}
 * >
 *   <App />
 * </ReactDaysProvider>
 * ```
 */
export function ReactDaysProvider(props: ReactDaysProviderProps) {
  const { children, client: explicitClient, options } = props;

  const client = useMemo(() => {
    if (explicitClient) return explicitClient;
    return new ReactDaysClient(options ?? {});
    // Rebuild only when the identifying options change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    explicitClient,
    options?.apiKey,
    options?.org,
    options?.project,
    options?.baseUrl,
  ]);

  return createElement(ReactDaysContext.Provider, { value: client }, children);
}

/**
 * Access the {@link ReactDaysClient} from context.
 * Throws if used outside a {@link ReactDaysProvider}.
 */
export function useReactDaysClient(): ReactDaysClient {
  const client = useContext(ReactDaysContext);
  if (!client) {
    throw new Error(
      "useReactDaysClient must be used within a <ReactDaysProvider>.",
    );
  }
  return client;
}
