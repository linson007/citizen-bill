import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "@/lib/relative-time";

const NOW = Date.parse("2026-08-04T12:00:00Z");

function ago(seconds: number): Date {
  return new Date(NOW - seconds * 1000);
}

describe("formatRelativeTime", () => {
  it("describes the current moment as now", () => {
    expect(formatRelativeTime(ago(0), "en", NOW)).toBe("now");
  });

  it("uses seconds under a minute", () => {
    expect(formatRelativeTime(ago(30), "en", NOW)).toBe("30 seconds ago");
  });

  it("uses minutes under an hour", () => {
    expect(formatRelativeTime(ago(5 * 60), "en", NOW)).toBe("5 minutes ago");
  });

  it("uses hours under a day", () => {
    expect(formatRelativeTime(ago(3 * 60 * 60), "en", NOW)).toBe("3 hours ago");
  });

  it("uses yesterday for a single day", () => {
    expect(formatRelativeTime(ago(24 * 60 * 60), "en", NOW)).toBe("yesterday");
  });

  it("uses days under a week", () => {
    expect(formatRelativeTime(ago(3 * 24 * 60 * 60), "en", NOW)).toBe(
      "3 days ago",
    );
  });

  it("uses weeks under a month", () => {
    expect(formatRelativeTime(ago(14 * 24 * 60 * 60), "en", NOW)).toBe(
      "2 weeks ago",
    );
  });

  it("uses months under a year", () => {
    expect(formatRelativeTime(ago(61 * 24 * 60 * 60), "en", NOW)).toBe(
      "2 months ago",
    );
  });

  it("uses years beyond a year", () => {
    expect(formatRelativeTime(ago(731 * 24 * 60 * 60), "en", NOW)).toBe(
      "2 years ago",
    );
  });

  it("returns a localized string for Malayalam", () => {
    const result = formatRelativeTime(ago(3 * 24 * 60 * 60), "ml", NOW);
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe("3 days ago");
  });
});
