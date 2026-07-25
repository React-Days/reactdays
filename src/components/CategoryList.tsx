import type { Category } from "../types";
import { cx } from "./util";

export interface CategoryListProps {
  categories: Category[];
  /** Build the link for each category, e.g. `(c) => `/blog/category/${c.slug}``. */
  getHref?: (category: Category) => string;
  /** Show each category's description. */
  showDescription?: boolean;
  className?: string;
}

/**
 * Render categories as a list of links or chips. Server-component safe.
 */
export function CategoryList({
  categories,
  getHref,
  showDescription = false,
  className,
}: CategoryListProps) {
  return (
    <ul className={cx("rd-category-list", className)}>
      {categories.map((category) => {
        const href = getHref?.(category);
        const label = (
          <>
            <span className="rd-category-list__name">{category.name}</span>
            {showDescription && category.description ? (
              <span className="rd-category-list__description">
                {category.description}
              </span>
            ) : null}
          </>
        );
        return (
          <li key={category.id} className="rd-category-list__item">
            {href ? (
              <a className="rd-category-list__link" href={href}>
                {label}
              </a>
            ) : (
              label
            )}
          </li>
        );
      })}
    </ul>
  );
}
