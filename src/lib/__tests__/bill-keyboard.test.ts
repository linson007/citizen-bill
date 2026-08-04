import { describe, expect, it } from "vitest";

import { getNextBillResultIndex } from "@/lib/bill-keyboard";

describe("getNextBillResultIndex", () => {
  it("moves forward and wraps to the first result", () => {
    expect(
      getNextBillResultIndex({ currentIndex: 1, direction: 1, total: 3 }),
    ).toBe(2);
    expect(
      getNextBillResultIndex({ currentIndex: 2, direction: 1, total: 3 }),
    ).toBe(0);
  });

  it("moves backward and wraps to the last result", () => {
    expect(
      getNextBillResultIndex({ currentIndex: 0, direction: -1, total: 3 }),
    ).toBe(2);
  });

  it("has no destination for an empty result set", () => {
    expect(
      getNextBillResultIndex({ currentIndex: 0, direction: 1, total: 0 }),
    ).toBe(-1);
  });
});
