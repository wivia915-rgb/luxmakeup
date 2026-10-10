export const locales = ["ar", "fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const LOCALE_COOKIE = "lux-locale";

export function parseLocale(value: string | undefined): Locale {
  if (value === "ar" || value === "fr" || value === "en") return value;
  return "en";
}
