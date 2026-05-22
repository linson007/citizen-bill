import { describe, expect, it, vi } from "vitest";

import { createUniqueSlug, slugify } from "@/lib/slug";

describe("slugify", () => {
  it("normalizes titles into URL-safe slugs", () => {
    expect(slugify("  Kerala Water Service Bill, 2026!  ")).toBe(
      "kerala-water-service-bill-2026",
    );
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("!!!Public Transport!!!")).toBe("public-transport");
  });

  it("limits slugs to 80 characters", () => {
    expect(slugify("a".repeat(100))).toHaveLength(80);
  });
});

describe("createUniqueSlug", () => {
  it("adds a stable suffix and falls back when title has no slug content", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);

    expect(createUniqueSlug("!!!")).toBe("bill-loyw3v28");
    expect(createUniqueSlug("Public Health Bill")).toBe(
      "public-health-bill-loyw3v28",
    );
  });
});
