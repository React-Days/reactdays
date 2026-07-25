import type { ReactNode } from "react";
import type { ArticleSummary } from "../types";
import { ArticleCard } from "./ArticleCard";
import { cx } from "./util";

export interface ArticleListProps {
  articles: ArticleSummary[];
  /** Build the link for each article, e.g. `(a) => `/blog/${a.slug}``. */
  getHref?: (article: ArticleSummary) => string;
  /** Fully override how each item renders. Takes precedence over `getHref`. */
  renderItem?: (article: ArticleSummary) => ReactNode;
  /** Rendered when `articles` is empty. */
  emptyState?: ReactNode;
  className?: string;
}

/**
 * A responsive grid of {@link ArticleCard}s. Server-component safe.
 */
export function ArticleList({
  articles,
  getHref,
  renderItem,
  emptyState = null,
  className,
}: ArticleListProps) {
  if (articles.length === 0) {
    return <>{emptyState}</>;
  }
  return (
    <div className={cx("rd-article-list", className)}>
      {articles.map((article) =>
        renderItem ? (
          <div key={article.id} className="rd-article-list__item">
            {renderItem(article)}
          </div>
        ) : (
          <ArticleCard
            key={article.id}
            article={article}
            href={getHref?.(article)}
          />
        ),
      )}
    </div>
  );
}
