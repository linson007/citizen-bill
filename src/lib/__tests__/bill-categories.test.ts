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
  });
});
