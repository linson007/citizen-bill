import { describe, expect, it } from "vitest";

import { BillStatus } from "@/generated/prisma/enums";
import { canViewBill, isPublicBillStatus } from "@/lib/bill-visibility";

describe("bill visibility", () => {
  it("treats published bills as public", () => {
    expect(isPublicBillStatus(BillStatus.PUBLISHED)).toBe(true);
  });

  it("does not treat private or moderated statuses as public", () => {
    expect(isPublicBillStatus(BillStatus.DRAFT)).toBe(false);
    expect(isPublicBillStatus(BillStatus.REPORTED)).toBe(false);
    expect(isPublicBillStatus(BillStatus.REMOVED)).toBe(false);
    expect(isPublicBillStatus(BillStatus.ARCHIVED)).toBe(false);
  });

  it("allows authors to view non-public bills", () => {
    expect(
      canViewBill(
        {
          authorId: "author-1",
          status: BillStatus.DRAFT,
        },
        "author-1",
      ),
    ).toBe(true);
  });

  it("blocks non-authors from non-public bills", () => {
    expect(
      canViewBill(
        {
          authorId: "author-1",
          status: BillStatus.REMOVED,
        },
        "user-2",
      ),
    ).toBe(false);
  });
});
