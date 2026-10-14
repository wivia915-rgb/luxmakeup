export const themes = ["dark", "light"] as const;
export type Theme = (typeof themes)[number];
export const THEME_COOKIE = "lux-theme";

export function parseTheme(value: string | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}
