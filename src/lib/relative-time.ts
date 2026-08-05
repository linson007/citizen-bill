import type { Locale } from "@/lib/locale";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export function formatRelativeTime(
  date: Date,
  locale: Locale,
  now: number = Date.now(),
): string {
  const seconds = Math.round((date.getTime() - now) / 1000);
  const magnitude = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (magnitude < MINUTE) {
    return formatter.format(seconds, "second");
  }
  if (magnitude < HOUR) {
    return formatter.format(Math.round(seconds / MINUTE), "minute");
  }
  if (magnitude < DAY) {
    return formatter.format(Math.round(seconds / HOUR), "hour");
  }
  if (magnitude < WEEK) {
    return formatter.format(Math.round(seconds / DAY), "day");
  }
  if (magnitude < MONTH) {
    return formatter.format(Math.round(seconds / WEEK), "week");
  }
  if (magnitude < YEAR) {
    return formatter.format(Math.round(seconds / MONTH), "month");
  }
  return formatter.format(Math.round(seconds / YEAR), "year");
}
