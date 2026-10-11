// Pure theme helpers, shared by the root layout and unit tests.

/** Preset looks. Each one sets fonts and a palette in app/globals.css (`[data-theme=...]`). */
export const THEMES = ["classic", "modern", "garden", "blush"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "classic";

export function resolveTheme(value: string): Theme {
  const v = value.trim().toLowerCase();
  return (THEMES as readonly string[]).includes(v)
    ? (v as Theme)
    : DEFAULT_THEME;
}

/**
 * The accent colour override, or null. Only plain hex colours pass, because the value is written
 * into an inline style attribute.
 */
export function resolveAccent(value: string): string | null {
  const v = value.trim();
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v.toLowerCase() : null;
}
