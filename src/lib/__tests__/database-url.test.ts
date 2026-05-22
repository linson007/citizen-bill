import { describe, expect, it } from "vitest";

import { DEFAULT_DATABASE_URL, getDatabaseUrl } from "@/lib/database-url";

describe("getDatabaseUrl", () => {
  it("uses DATABASE_URL when configured", () => {
    expect(
      getDatabaseUrl({
        DATABASE_URL:
          "postgresql://citizen_bill:secret@localhost:5432/citizen_bill?schema=public",
      }),
    ).toBe("postgresql://citizen_bill:secret@localhost:5432/citizen_bill?schema=public");
  });

  it("trims DATABASE_URL", () => {
    expect(getDatabaseUrl({ DATABASE_URL: "  postgresql://example/db  " })).toBe(
      "postgresql://example/db",
    );
  });

  it("uses a local fallback outside production runtime", () => {
    expect(getDatabaseUrl({ NODE_ENV: "development" })).toBe(DEFAULT_DATABASE_URL);
    expect(getDatabaseUrl({ NODE_ENV: "test" })).toBe(DEFAULT_DATABASE_URL);
    expect(
      getDatabaseUrl({
        NODE_ENV: "production",
        NEXT_PHASE: "phase-production-build",
      }),
    ).toBe(DEFAULT_DATABASE_URL);
  });

  it("throws a helpful error in production runtime when DATABASE_URL is missing", () => {
    expect(() => getDatabaseUrl({ NODE_ENV: "production" })).toThrow(
      /DATABASE_URL/,
    );
    expect(() =>
      getDatabaseUrl({ NODE_ENV: "production", DATABASE_URL: "   " }),
    ).toThrow(/DATABASE_URL/);
  });
});
