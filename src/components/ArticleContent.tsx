import type { HTMLAttributes } from "react";
import { cx } from "./util";

export interface ArticleContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Pre-sanitized HTML from `article.body_html` or `kbPage.body_html`. */
  html: string;
}

/**
 * Render an article or KB page body.
 *
 * The API returns pre-sanitized HTML, so it is injected via
 * `dangerouslySetInnerHTML`. Apply your own Content-Security-Policy as
 * defense-in-depth. Style the output by targeting `.rd-article-content` (see
 * `@reactdays/react/styles.css`) or your own prose styles.
 */
export function ArticleContent({ html, className, ...rest }: ArticleContentProps) {
  return (
    <div
      className={cx("rd-article-content", className)}
      dangerouslySetInnerHTML={{ __html: html }}
      {...rest}
    />
  );
}
