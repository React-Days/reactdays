/** Join truthy class names. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Format an ISO-8601 timestamp for display.
 *
 * Uses a fixed `en-US` locale and UTC so server and client render identically
 * (no hydration mismatch). Pass your own formatter to components for i18n.
 */
export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
