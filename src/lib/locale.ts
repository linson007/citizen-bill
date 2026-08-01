export const LOCALES = ["en", "ml"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "mattamundo-locale";

export function parseLocale(value: string | undefined | null): Locale {
  return value === "ml" ? "ml" : "en";
}

export function localeHtmlLang(locale: Locale): string {
  return locale === "ml" ? "ml" : "en";
}
