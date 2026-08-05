import { describe, expect, it } from "vitest";

import {
  isKnownBillCategory,
  OTHER_BILL_CATEGORY,
  resolveBillCategory,
} from "@/lib/bill-categories";

describe("resolveBillCategory", () => {
  it("uses selected department categories", () => {
    expect(
      resolveBillCategory({
        category: "Health",
        categoryOther: "Custom",
      }),
    ).toBe("Health");
  });

  it("uses the custom category when Other is selected", () => {
    expect(
      resolveBillCategory({
        category: OTHER_BILL_CATEGORY,
        categoryOther: "Disaster Management",
      }),
    ).toBe("Disaster Management");
  });

  it("returns undefined when Other is selected without a custom label", () => {
    expect(
      resolveBillCategory({
        category: OTHER_BILL_CATEGORY,
        categoryOther: "   ",
      }),
    ).toBeUndefined();
  });

  it("returns undefined for blank category input", () => {
    expect(
      resolveBillCategory({ category: "", categoryOther: "" }),
    ).toBeUndefined();
  });
});

describe("isKnownBillCategory", () => {
  it("recognizes configured categories", () => {
    expect(isKnownBillCategory("Health")).toBe(true);
    expect(isKnownBillCategory("Custom")).toBe(false);
    expect(isKnownBillCategory(OTHER_BILL_CATEGORY)).toBe(false);
    expect(isKnownBillCategory(null)).toBe(false);
    expect(isKnownBillCategory(undefined)).toBe(false);
    expect(isKnownBillCategory("")).toBe(false);
  });
});
