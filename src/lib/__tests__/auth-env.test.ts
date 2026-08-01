import { describe, expect, it } from "vitest";

import { getGoogleOAuthEnv } from "@/lib/google-oauth-env";

describe("getGoogleOAuthEnv", () => {
  it("uses the configured value", () => {
    expect(
      getGoogleOAuthEnv("GOOGLE_CLIENT_ID", {
        GOOGLE_CLIENT_ID: "client-id",
      }),
    ).toBe("client-id");
  });

  it("trims whitespace", () => {
    expect(
      getGoogleOAuthEnv("GOOGLE_CLIENT_SECRET", {
        GOOGLE_CLIENT_SECRET: "  secret  ",
      }),
    ).toBe("secret");
  });

  it("allows empty values outside production runtime", () => {
    expect(getGoogleOAuthEnv("GOOGLE_CLIENT_ID", { NODE_ENV: "development" })).toBe(
      "",
    );
    expect(
      getGoogleOAuthEnv("GOOGLE_CLIENT_ID", {
        NODE_ENV: "production",
        NEXT_PHASE: "phase-production-build",
      }),
    ).toBe("");
  });

  it("throws in production runtime when missing", () => {
    expect(() =>
      getGoogleOAuthEnv("GOOGLE_CLIENT_ID", { NODE_ENV: "production" }),
    ).toThrow(/GOOGLE_CLIENT_ID/);
    expect(() =>
      getGoogleOAuthEnv("GOOGLE_CLIENT_SECRET", {
        NODE_ENV: "production",
        GOOGLE_CLIENT_SECRET: "   ",
      }),
    ).toThrow(/GOOGLE_CLIENT_SECRET/);
  });
});
