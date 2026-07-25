import type { ReactNode } from "react";
import type { ArticleSummary } from "../types";
import { cx, formatDate } from "./util";

export interface ArticleCardProps {
  article: ArticleSummary;
  /** If provided, the card links here. */
  href?: string;
  /** Override the date formatter. */
  formatDate?: (iso: string) => string;
  /** Hide the cover image even when present. */
  hideImage?: boolean;
  className?: string;
}

/**
 * A presentational card for a single article summary. Server-component safe.
 *
 * Bring your own routing by passing `href` (e.g. `/blog/${article.slug}`).
 */
export function ArticleCard({
  article,
  href,
  formatDate: fmt = formatDate,
  hideImage = false,
  className,
}: ArticleCardProps) {
  const body: ReactNode = (
    <>
      {!hideImage && article.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="rd-article-card__image"
          src={article.cover_image_url}
          alt=""
          loading="lazy"
        />
      ) : null}
      <div className="rd-article-card__body">
        {article.category ? (
          <span className="rd-article-card__category">{article.category.name}</span>
        ) : null}
        <h3 className="rd-article-card__title">{article.title}</h3>
        {article.summary ? (
          <p className="rd-article-card__summary">{article.summary}</p>
        ) : null}
        <div className="rd-article-card__meta">
          {article.author?.display_name ? (
            <span className="rd-article-card__author">
              {article.author.display_name}
            </span>
          ) : null}
          <time className="rd-article-card__date" dateTime={article.published_at}>
            {fmt(article.published_at)}
          </time>
          {article.reading_time_minutes != null ? (
            <span className="rd-article-card__reading-time">
              {article.reading_time_minutes} min read
            </span>
          ) : null}
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <a className={cx("rd-article-card", "rd-article-card--link", className)} href={href}>
        {body}
      </a>
    );
  }
  return <article className={cx("rd-article-card", className)}>{body}</article>;
}
