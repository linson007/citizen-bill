import { describe, expect, it } from "vitest";

import { calculateReputationScore, getReputationLevel } from "@/lib/reputation";

describe("calculateReputationScore", () => {
  it("weights published bills, votes, comments, suggestions, and accepted suggestions", () => {
    expect(
      calculateReputationScore({
        publishedBills: 2,
        votesReceived: 10,
        commentsMade: 5,
        suggestionsMade: 3,
        acceptedSuggestions: 1,
      }),
    ).toBe(82);
  });
});

describe("getReputationLevel", () => {
  it.each([
    [0, "New contributor"],
    [39, "New contributor"],
    [40, "Active citizen"],
    [99, "Active citizen"],
    [100, "Trusted contributor"],
    [249, "Trusted contributor"],
    [250, "Civic leader"],
  ])("maps score %i to %s", (score, level) => {
    expect(getReputationLevel(score)).toBe(level);
  });
});
