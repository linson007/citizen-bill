import { describe, expect, it } from "vitest";

import {
  countCompletedOnboardingSteps,
  getOnboardingSteps,
  isOnboardingComplete,
  type OnboardingStats,
} from "@/lib/onboarding";

const EMPTY_STATS: OnboardingStats = {
  billCount: 0,
  publishedCount: 0,
  voteCount: 0,
  commentCount: 0,
  followedCount: 0,
};

const FULL_STATS: OnboardingStats = {
  billCount: 2,
  publishedCount: 1,
  voteCount: 3,
  commentCount: 4,
  followedCount: 1,
};

describe("getOnboardingSteps", () => {
  it("returns five steps, all incomplete for a new citizen", () => {
    const steps = getOnboardingSteps(EMPTY_STATS);

    expect(steps).toHaveLength(5);
    expect(steps.every((step) => !step.completed)).toBe(true);
  });

  it("marks the create step complete once a bill exists", () => {
    const steps = getOnboardingSteps({ ...EMPTY_STATS, billCount: 1 });

    expect(steps.find((step) => step.id === "create-bill")?.completed).toBe(
      true,
    );
    expect(countCompletedOnboardingSteps(steps)).toBe(1);
  });

  it("marks each step from its matching stat", () => {
    const stats: OnboardingStats = {
      billCount: 1,
      publishedCount: 1,
      voteCount: 1,
      commentCount: 0,
      followedCount: 1,
    };
    const steps = getOnboardingSteps(stats);

    expect(steps.find((step) => step.id === "publish-bill")?.completed).toBe(
      true,
    );
    expect(steps.find((step) => step.id === "support-bill")?.completed).toBe(
      true,
    );
    expect(steps.find((step) => step.id === "join-discussion")?.completed).toBe(
      false,
    );
    expect(steps.find((step) => step.id === "follow-bill")?.completed).toBe(
      true,
    );
    expect(countCompletedOnboardingSteps(steps)).toBe(4);
  });

  it("links every step somewhere actionable", () => {
    const steps = getOnboardingSteps(EMPTY_STATS);

    expect(steps.every((step) => step.href.startsWith("/") && step.title)).toBe(
      true,
    );
  });
});

describe("isOnboardingComplete", () => {
  it("is false for a new citizen", () => {
    expect(isOnboardingComplete(EMPTY_STATS)).toBe(false);
  });

  it("is false when any step remains", () => {
    expect(isOnboardingComplete({ ...FULL_STATS, commentCount: 0 })).toBe(
      false,
    );
  });

  it("is true when every step is done", () => {
    expect(isOnboardingComplete(FULL_STATS)).toBe(true);
  });
});
