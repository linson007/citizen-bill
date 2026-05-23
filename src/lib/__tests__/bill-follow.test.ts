import { describe, expect, it } from "vitest";

import {
  getBillFollowButtonLabel,
  getBillFollowEmptyMessage,
} from "@/lib/bill-follow";

describe("bill follow helpers", () => {
  it("labels follow button states", () => {
    expect(getBillFollowButtonLabel(false)).toBe("Follow updates");
    expect(getBillFollowButtonLabel(true)).toBe("Unfollow updates");
  });

  it("explains the followed bills empty state", () => {
    expect(getBillFollowEmptyMessage()).toContain("Follow public bills");
  });
});
