"use client";

/**
 * @reactdays/react/client - Interactive React bindings.
 *
 * These are client components (they use React state and context). Import from
 * here in client code; for server components use the client class from the
 * package root instead.
 */

export { ReactDaysProvider, useReactDaysClient } from "./context";
export type { ReactDaysProviderProps } from "./context";

export {
  useArticles,
  useArticle,
  useCategories,
  useCategory,
  useFaqGroups,
  useFaqGroup,
  useKbTree,
  useKbPage,
} from "./hooks";
export type { QueryResult, QueryOptions } from "./hooks";
