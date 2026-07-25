import { ReactDaysApiError } from "./errors";
import { getDefaultEnv, resolveEnvConfig } from "./env";
import type { EnvSource } from "./env";
import type {
  ApiErrorBody,
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
  SingleResponse,
} from "./types";

/** Minimal fetch signature so custom fetch implementations can be injected. */
export type FetchLike = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

/**
 * Configuration for a {@link ReactDaysClient}.
 *
 * `apiKey`, `org`, and `project` are required, but each may be supplied either
 * here or via environment variables (`REACTDAYS_API_KEY`, `REACTDAYS_ORG`,
 * `REACTDAYS_PROJECT`, `REACTDAYS_BASE_URL`). Options passed here take
 * precedence over environment variables.
 */
export interface ReactDaysClientOptions {
  /**
   * Your public-read API key (`rd_pk_...`), issued from the org dashboard.
   * Falls back to `REACTDAYS_API_KEY`.
   *
   * Safe to expose to the browser **only** when the org's origin allowlist is
   * configured; otherwise keep it server-side.
   */
  apiKey?: string;
  /** Your org slug. Falls back to `REACTDAYS_ORG`. */
  org?: string;
  /** The project slug within the org. Falls back to `REACTDAYS_PROJECT`. */
  project?: string;
  /**
   * Override the API base URL. Falls back to `REACTDAYS_BASE_URL`, then
   * defaults to `https://api.reactdays.com/v1`.
   */
  baseUrl?: string;
  /** Custom fetch implementation. Defaults to the global `fetch`. */
  fetch?: FetchLike;
  /** Extra headers sent on every request. */
  headers?: Record<string, string>;
  /**
   * Environment source for config fallbacks. Defaults to `process.env`.
   * Pass `false` to disable environment-variable resolution entirely.
   */
  env?: EnvSource | false;
}

/** Per-request overrides, including framework-specific cache hints. */
export interface RequestOptions {
  signal?: AbortSignal;
  /** Standard fetch cache mode. */
  cache?: RequestCache;
  /** Next.js App Router fetch options, e.g. `{ revalidate: 60 }`. */
  next?: { revalidate?: number | false; tags?: string[] };
  /** Additional per-request headers. */
  headers?: Record<string, string>;
}

const DEFAULT_BASE_URL = "https://api.reactdays.com/v1";

/**
 * A typed client for the read-only ReactDays REST API.
 *
 * Works in any runtime with `fetch`: Node 18+, edge, and the browser. In React
 * Server Components, instantiate it and call methods directly; on the client,
 * prefer the hooks from `@reactdays/react/client`.
 *
 * @example
 * ```ts
 * const client = new ReactDaysClient({
 *   apiKey: process.env.REACTDAYS_API_KEY!,
 *   org: "acme",
 *   project: "marketing-site",
 * });
 *
 * const { data: articles } = await client.listArticles({ limit: 10 });
 * ```
 */
export class ReactDaysClient {
  private readonly apiKey: string;
  private readonly org: string;
  private readonly project: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;
  private readonly baseHeaders: Record<string, string>;

  constructor(options: ReactDaysClientOptions = {}) {
    const env =
      options.env === false
        ? {}
        : resolveEnvConfig(options.env ?? getDefaultEnv());

    const apiKey = options.apiKey ?? env.apiKey;
    const org = options.org ?? env.org;
    const project = options.project ?? env.project;
    const baseUrl = options.baseUrl ?? env.baseUrl ?? DEFAULT_BASE_URL;

    if (!apiKey) {
      throw new Error(
        "ReactDaysClient: `apiKey` is required. Pass it as an option or set REACTDAYS_API_KEY.",
      );
    }
    if (!org) {
      throw new Error(
        "ReactDaysClient: `org` is required. Pass it as an option or set REACTDAYS_ORG.",
      );
    }
    if (!project) {
      throw new Error(
        "ReactDaysClient: `project` is required. Pass it as an option or set REACTDAYS_PROJECT.",
      );
    }

    const fetchImpl = options.fetch ?? (globalThis.fetch as FetchLike | undefined);
    if (!fetchImpl) {
      throw new Error(
        "ReactDaysClient: no global `fetch` found. Upgrade to Node 18+ or pass a `fetch` implementation.",
      );
    }

    this.apiKey = apiKey;
    this.org = org;
    this.project = project;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.fetchImpl = fetchImpl;
    this.baseHeaders = { ...options.headers };
  }

  /** Prefix shared by every project-scoped endpoint. */
  private get projectBase(): string {
    return `/orgs/${encodeURIComponent(this.org)}/projects/${encodeURIComponent(
      this.project,
    )}`;
  }

  private buildUrl(path: string, query?: Record<string, unknown>): string {
    const url = new URL(this.baseUrl + path);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private async request<T>(
    path: string,
    query?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<T> {
    const url = this.buildUrl(path, query);

    const init: RequestInit & { next?: RequestOptions["next"] } = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
        ...this.baseHeaders,
        ...options?.headers,
      },
    };
    if (options?.signal) init.signal = options.signal;
    if (options?.cache) init.cache = options.cache;
    if (options?.next) init.next = options.next;

    const res = await this.fetchImpl(url, init);

    if (!res.ok) {
      throw await toApiError(res);
    }

    return (await res.json()) as T;
  }

  // Articles

  /** List published articles, newest first. Cursor-paginated. */
  listArticles(
    params: ListArticlesParams = {},
    options?: RequestOptions,
  ): Promise<ListResponse<ArticleSummary>> {
    return this.request<ListResponse<ArticleSummary>>(
      `${this.projectBase}/articles`,
      {
        type: params.type,
        limit: params.limit,
        cursor: params.cursor,
        category: params.category,
        published_after: params.published_after,
      },
      options,
    );
  }

  /** Fetch a single article by slug, including its rendered body. */
  async getArticle(
    articleSlug: string,
    options?: RequestOptions,
  ): Promise<Article> {
    const res = await this.request<SingleResponse<Article>>(
      `${this.projectBase}/articles/${encodeURIComponent(articleSlug)}`,
      undefined,
      options,
    );
    return res.data;
  }

  /**
   * Async iterator over every article across all pages.
   *
   * @example
   * ```ts
   * for await (const article of client.listAllArticles()) {
   *   console.log(article.slug);
   * }
   * ```
   */
  async *listAllArticles(
    params: Omit<ListArticlesParams, "cursor"> = {},
    options?: RequestOptions,
  ): AsyncGenerator<ArticleSummary, void, unknown> {
    let cursor: string | undefined;
    do {
      const page = await this.listArticles(
        { ...params, cursor, limit: params.limit ?? 100 },
        options,
      );
      yield* page.data;
      cursor = page.meta.pagination.cursor ?? undefined;
    } while (cursor);
  }

  // Categories

  /** List every category for the project, ordered by `sort_order`. */
  async listCategories(options?: RequestOptions): Promise<Category[]> {
    // The categories list endpoint is the one list endpoint without pagination.
    const res = await this.request<{ data: Category[] }>(
      `${this.projectBase}/categories`,
      undefined,
      options,
    );
    return res.data;
  }

  /** Fetch a single category by slug, including its published-article count. */
  async getCategory(
    categorySlug: string,
    options?: RequestOptions,
  ): Promise<CategoryDetail> {
    const res = await this.request<SingleResponse<CategoryDetail>>(
      `${this.projectBase}/categories/${encodeURIComponent(categorySlug)}`,
      undefined,
      options,
    );
    return res.data;
  }

  // FAQs

  /** List published FAQ groups (metadata only, no entries). */
  listFaqGroups(
    params: ListFaqGroupsParams = {},
    options?: RequestOptions,
  ): Promise<ListResponse<FaqGroupSummary>> {
    return this.request<ListResponse<FaqGroupSummary>>(
      `${this.projectBase}/faq-groups`,
      { limit: params.limit, cursor: params.cursor },
      options,
    );
  }

  /** Fetch a single FAQ group by slug, including its entries. */
  async getFaqGroup(
    groupSlug: string,
    options?: RequestOptions,
  ): Promise<FaqGroup> {
    const res = await this.request<SingleResponse<FaqGroup>>(
      `${this.projectBase}/faq-groups/${encodeURIComponent(groupSlug)}`,
      undefined,
      options,
    );
    return res.data;
  }

  // Knowledge base

  /** Fetch the full published KB tree as a nested array of nodes. */
  async getKbTree(options?: RequestOptions): Promise<KbNode[]> {
    const res = await this.request<{ data: KbNode[] }>(
      `${this.projectBase}/kb`,
      undefined,
      options,
    );
    return res.data;
  }

  /**
   * Fetch a single KB page by its slug path, including body and breadcrumbs.
   *
   * @param path Slash-joined slug path (e.g. `"getting-started/installation"`)
   *   or an array of segments (e.g. `["getting-started", "installation"]`).
   */
  async getKbPage(
    path: string | string[],
    options?: RequestOptions,
  ): Promise<KbPage> {
    const segments = Array.isArray(path)
      ? path
      : path.split("/").filter(Boolean);
    const encoded = segments.map(encodeURIComponent).join("/");
    const res = await this.request<SingleResponse<KbPage>>(
      `${this.projectBase}/kb/by-path/${encoded}`,
      undefined,
      options,
    );
    return res.data;
  }
}

/**
 * Build a client, resolving config from environment variables where options are
 * omitted. Call with no arguments to configure entirely via `.env`.
 *
 * @example
 * ```ts
 * // Reads REACTDAYS_API_KEY / REACTDAYS_ORG / REACTDAYS_PROJECT from the env.
 * const client = createReactDaysClient();
 * ```
 */
export function createReactDaysClient(
  options: ReactDaysClientOptions = {},
): ReactDaysClient {
  return new ReactDaysClient(options);
}

/** Convert a failed Response into a {@link ReactDaysApiError}. */
async function toApiError(res: Response): Promise<ReactDaysApiError> {
  let body: ApiErrorBody;
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    body = {
      code: res.status === 429 ? "rate_limited" : "unknown_error",
      message: res.statusText || `HTTP ${res.status}`,
    };
  }
  if (body.retry_after_seconds === undefined) {
    const header = res.headers.get("Retry-After");
    if (header) {
      const parsed = Number(header);
      if (!Number.isNaN(parsed)) body.retry_after_seconds = parsed;
    }
  }
  return new ReactDaysApiError(res.status, body);
}
