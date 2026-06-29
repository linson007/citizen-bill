import { describe, expect, it } from "vitest";

import {
  getSignatureButtonLabel,
  normalizeSignatureNote,
} from "@/lib/bill-signatures";

describe("bill signature helpers", () => {
  it("labels signature button states", () => {
    expect(getSignatureButtonLabel(false)).toBe("Sign petition");
    expect(getSignatureButtonLabel(true)).toBe("Update signature");
  });

  it("normalizes optional signature notes", () => {
    expect(normalizeSignatureNote("  I support this reform  ")).toBe(
      "I support this reform",
    );
    expect(normalizeSignatureNote("")).toBeNull();
    expect(normalizeSignatureNote("x".repeat(360))).toHaveLength(280);
  });
});
