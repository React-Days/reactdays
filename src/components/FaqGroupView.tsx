import type { FaqGroup } from "../types";
import { cx } from "./util";

export interface FaqGroupViewProps {
  group: FaqGroup;
  /** Render all entries expanded instead of collapsed. */
  defaultOpen?: boolean;
  /** Hide the group title and description. */
  hideHeader?: boolean;
  className?: string;
}

/**
 * Render a FAQ group as an accessible accordion using native `<details>`.
 * Works without JavaScript, so it is fully server-component safe.
 */
export function FaqGroupView({
  group,
  defaultOpen = false,
  hideHeader = false,
  className,
}: FaqGroupViewProps) {
  return (
    <section className={cx("rd-faq-group", className)}>
      {!hideHeader ? (
        <header className="rd-faq-group__header">
          <h2 className="rd-faq-group__title">{group.title}</h2>
          {group.description ? (
            <p className="rd-faq-group__description">{group.description}</p>
          ) : null}
        </header>
      ) : null}
      <div className="rd-faq-group__entries">
        {group.entries.map((entry) => (
          <details key={entry.id} className="rd-faq-entry" open={defaultOpen}>
            <summary className="rd-faq-entry__question">{entry.question}</summary>
            <div
              className="rd-faq-entry__answer"
              dangerouslySetInnerHTML={{ __html: entry.answer_html }}
            />
          </details>
        ))}
      </div>
    </section>
  );
}
