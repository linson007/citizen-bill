import { describe, expect, it } from "vitest";

import { hasEstablishedCommunity } from "@/lib/home-community";

describe("hasEstablishedCommunity", () => {
  it("keeps social-proof UI hidden until activity is meaningful", () => {
    expect(
      hasEstablishedCommunity({ publicBills: 1, votes: 8, comments: 2 }),
    ).toBe(false);
  });

  it("shows social-proof UI once bills and engagement meet the threshold", () => {
    expect(
      hasEstablishedCommunity({ publicBills: 3, votes: 7, comments: 3 }),
    ).toBe(true);
  });
});
