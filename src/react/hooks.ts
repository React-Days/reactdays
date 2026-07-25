"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactDaysApiError } from "../errors";
import type {
  Article,
  ArticleSummary,
  Category,
  CategoryDetail,
  FaqGroup,
  FaqGroupSummary,
  KbNode,
  KbPage,
  ListArticlesParams,
  ListFaqGroupsParams,
  ListResponse,
} from "../types";
import { useReactDaysClient } from "./context";

/** The state returned by every data hook. */
export interface QueryResult<T> {
  data: T | undefined;
  error: (ReactDaysApiError | Error) | undefined;
  /** True while a request is in flight. */
  loading: boolean;
  /** Re-run the request, bypassing nothing (client caching still applies). */
  refetch: () => void;
}

export interface QueryOptions {
  /** When false, the request is not sent (useful for dependent queries). */
  enabled?: boolean;
}

/** Low-level query hook. Prefer the resource-specific hooks below. */
function useQuery<T>(
  key: unknown[],
  fetcher: (signal: AbortSignal) => Promise<T>,
  options?: QueryOptions,
): QueryResult<T> {
  const { enabled = true } = options ?? {};
  const serializedKey = JSON.stringify(key);

  const [state, setState] = useState<Omit<QueryResult<T>, "refetch">>({
    data: undefined,
    error: undefined,
    loading: enabled,
  });
  const [nonce, setNonce] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) {
      setState({ data: undefined, error: undefined, loading: false });
      return;
    }
    let active = true;
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (active) setState({ data, error: undefined, loading: false });
      })
      .catch((err: unknown) => {
        if (active && !controller.signal.aborted) {
          setState({ data: undefined, error: err as Error, loading: false });
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedKey, enabled, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { ...state, refetch };
}

/** Fetch a page of articles. */
export function useArticles(
  params: ListArticlesParams = {},
  options?: QueryOptions,
): QueryResult<ListResponse<ArticleSummary>> {
  const client = useReactDaysClient();
  return useQuery(
    ["articles", params],
    (signal) => client.listArticles(params, { signal }),
    options,
  );
}

/** Fetch a single article by slug. */
export function useArticle(
  slug: string,
  options?: QueryOptions,
): QueryResult<Article> {
  const client = useReactDaysClient();
  return useQuery(
    ["article", slug],
    (signal) => client.getArticle(slug, { signal }),
    { enabled: Boolean(slug), ...options },
  );
}

/** Fetch all categories for the project. */
export function useCategories(
  options?: QueryOptions,
): QueryResult<Category[]> {
  const client = useReactDaysClient();
  return useQuery(
    ["categories"],
    (signal) => client.listCategories({ signal }),
    options,
  );
}

/** Fetch a single category (with article count) by slug. */
export function useCategory(
  slug: string,
  options?: QueryOptions,
): QueryResult<CategoryDetail> {
  const client = useReactDaysClient();
  return useQuery(
    ["category", slug],
    (signal) => client.getCategory(slug, { signal }),
    { enabled: Boolean(slug), ...options },
  );
}

/** Fetch a page of FAQ groups (metadata only). */
export function useFaqGroups(
  params: ListFaqGroupsParams = {},
  options?: QueryOptions,
): QueryResult<ListResponse<FaqGroupSummary>> {
  const client = useReactDaysClient();
  return useQuery(
    ["faq-groups", params],
    (signal) => client.listFaqGroups(params, { signal }),
    options,
  );
}

/** Fetch a single FAQ group with its entries. */
export function useFaqGroup(
  slug: string,
  options?: QueryOptions,
): QueryResult<FaqGroup> {
  const client = useReactDaysClient();
  return useQuery(
    ["faq-group", slug],
    (signal) => client.getFaqGroup(slug, { signal }),
    { enabled: Boolean(slug), ...options },
  );
}

/** Fetch the full knowledge-base tree. */
export function useKbTree(options?: QueryOptions): QueryResult<KbNode[]> {
  const client = useReactDaysClient();
  return useQuery(
    ["kb-tree"],
    (signal) => client.getKbTree({ signal }),
    options,
  );
}

/** Fetch a single KB page by its slug path. */
export function useKbPage(
  path: string | string[],
  options?: QueryOptions,
): QueryResult<KbPage> {
  const client = useReactDaysClient();
  const normalized = Array.isArray(path) ? path.join("/") : path;
  return useQuery(
    ["kb-page", normalized],
    (signal) => client.getKbPage(path, { signal }),
    { enabled: Boolean(normalized), ...options },
  );
}
