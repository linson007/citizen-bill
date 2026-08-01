import { describe, expect, it } from "vitest";

import { DEFAULT_APP_URL, getAppUrl } from "@/lib/app-url";

describe("getAppUrl", () => {
  it("falls back to localhost when unset", () => {
    expect(getAppUrl({})).toBe(DEFAULT_APP_URL);
    expect(getAppUrl({ NEXTAUTH_URL: "   " })).toBe(DEFAULT_APP_URL);
  });

  it("keeps absolute URLs and strips a trailing slash", () => {
    expect(getAppUrl({ NEXTAUTH_URL: "https://mattamundo.com/" })).toBe(
      "https://mattamundo.com",
    );
    expect(getAppUrl({ NEXTAUTH_URL: "http://localhost:3000" })).toBe(
      "http://localhost:3000",
    );
  });

  it("prefixes https for bare production hosts", () => {
    expect(getAppUrl({ NEXTAUTH_URL: "mattamundo.com" })).toBe(
      "https://mattamundo.com",
    );
  });

  it("prefixes http for bare localhost hosts", () => {
    expect(getAppUrl({ NEXTAUTH_URL: "localhost:3000" })).toBe(
      "http://localhost:3000",
    );
  });
});
