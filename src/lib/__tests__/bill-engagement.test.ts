import { describe, expect, it } from "vitest";

import {
  getSavedBillButtonLabel,
  getSavedBillEmptyMessage,
} from "@/lib/bill-engagement";

describe("bill engagement helpers", () => {
  it("labels saved bill toggle state", () => {
    expect(getSavedBillButtonLabel(false)).toBe("Save bill");
    expect(getSavedBillButtonLabel(true)).toBe("Remove saved bill");
  });

  it("explains the saved bills dashboard empty state", () => {
    expect(getSavedBillEmptyMessage()).toContain("Save public bills");
  });
});
