/**
 * Type definitions for the ReactDays REST API (v1).
 *
 * These mirror the response shapes documented at https://reactdays.com/docs.
 * All timestamps are ISO-8601 strings. All ids are ULIDs.
 */

/** Content type discriminator. The list/detail article endpoints return `"article"`. */
export type ContentType = "article" | "kb";

/** Published is the only status the public API ever returns. */
export type PublishStatus = "published";

/** Standard envelope for single-resource responses. */
export interface SingleResponse<T> {
  data: T;
}

/** Cursor pagination metadata. `cursor` is `null` on the last page. */
export interface Pagination {
  cursor: string | null;
}

/** Standard envelope for paginated list responses. */
export interface ListResponse<T> {
  data: T[];
  meta: { pagination: Pagination };
}

/** Error body returned by every `/v1/*` endpoint on failure. */
export interface ApiErrorBody {
  code: string;
  message: string;
  /** Present on `rate_limited` (429); also surfaced as the `Retry-After` header. */
  retry_after_seconds?: number;
  /** Optional extra context (e.g. a request id on `internal`). */
  details?: unknown;
}

/** Embedded category reference on an article/KB entry. */
export interface CategoryRef {
  id: string;
  slug: string;
  name: string;
}

/** Embedded author reference on an article. */
export interface AuthorRef {
  id: string;
  /** May be `null` if the user hasn't set a display name. */
  display_name: string | null;
}

/** A tag attached to an article. */
export interface Tag {
  id: string;
  slug: string;
  name: string;
  /** Tag taxonomy bucket, e.g. `topic`, `tech`, `format`. */
  category: string;
}

/** An article as returned by the list endpoint (no body). */
export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  type: "article";
  status: PublishStatus;
  category_id: string | null;
  category: CategoryRef | null;
  author_user_id: string | null;
  author: AuthorRef | null;
  tags: Tag[];
  cover_image_url: string | null;
  reading_time_minutes: number | null;
  published_at: string;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image_url: string | null;
  canonical_url: string | null;
}

/** A full article including the rendered body, from the detail endpoint. */
export interface Article extends ArticleSummary {
  /** Server-rendered, pre-sanitized HTML. Safe to inject via `dangerouslySetInnerHTML`. */
  body_html: string;
  /** Source Markdown, or `null` for legacy rich-text-only articles. */
  body_markdown: string | null;
}

/** A content category. */
export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** A category with its published-article count, from the detail endpoint. */
export interface CategoryDetail extends Category {
  published_article_count: number;
}

/** A FAQ group as returned by the list endpoint (no entries). */
export interface FaqGroupSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** A single question/answer pair. */
export interface FaqEntry {
  id: string;
  question: string;
  /** Pre-sanitized HTML answer. */
  answer_html: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** A FAQ group including its entries, from the detail endpoint. */
export interface FaqGroup extends FaqGroupSummary {
  entries: FaqEntry[];
}

/** A knowledge-base tree node (group or page). */
export interface KbNode {
  id: string;
  parent_id: string | null;
  type: "group" | "page";
  slug: string;
  title: string;
  summary: string | null;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
  published_at: string;
  /** Full slash-joined slug path from the project root, e.g. `/getting-started/installation`. */
  path: string;
  children: KbNode[];
}

/** A breadcrumb entry in a KB page's ancestor chain. */
export interface KbBreadcrumb {
  id: string;
  slug: string;
  title: string;
  type: "group" | "page";
}

/** A single KB page with body content, from the by-path endpoint. */
export interface KbPage {
  id: string;
  parent_id: string | null;
  type: "group" | "page";
  slug: string;
  title: string;
  summary: string | null;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  /** Tiptap ProseMirror JSON document. */
  body_tiptap_json: unknown;
  /** Server-rendered, pre-sanitized HTML. */
  body_html: string;
  /** Source Markdown. */
  body_markdown: string | null;
  updated_at: string;
  published_at: string;
  path: string;
  breadcrumbs: KbBreadcrumb[];
}

/** Options for {@link ReactDaysClient.listArticles}. */
export interface ListArticlesParams {
  /** Content type. Defaults to `article`. */
  type?: ContentType;
  /** Page size, 1-100. Defaults to 20. */
  limit?: number;
  /** Opaque cursor from the previous page. */
  cursor?: string;
  /** Filter to a single category by `category_id`. */
  category?: string;
  /** Only articles published strictly after this ISO-8601 timestamp. */
  published_after?: string;
}

/** Options for {@link ReactDaysClient.listFaqGroups}. */
export interface ListFaqGroupsParams {
  /** Page size, 1-100. Defaults to 20. */
  limit?: number;
  /** Opaque cursor from the previous page. */
  cursor?: string;
}
