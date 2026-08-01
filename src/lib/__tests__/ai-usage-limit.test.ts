import { describe, expect, it, vi } from "vitest";

import {
  checkAiUsageLimit,
  consumeAiUsage,
  createAiUsageHeaders,
  createAiUsageLimitMessage,
  getAiUsageWindow,
  getDailyAiLimit,
  recordAiUsage,
} from "@/lib/ai-usage-limit";

describe("getDailyAiLimit", () => {
  it("uses the configured positive integer limit", () => {
    vi.stubEnv("AI_DAILY_LIMIT", "7");

    expect(getDailyAiLimit()).toBe(7);

    vi.unstubAllEnvs();
  });

  it("falls back when the configured limit is missing or invalid", () => {
    vi.stubEnv("AI_DAILY_LIMIT", "0");

    expect(getDailyAiLimit()).toBe(20);

    vi.unstubAllEnvs();
  });
});

describe("getAiUsageWindow", () => {
  it("returns the local daily window and next reset time", () => {
    const now = new Date("2026-05-16T10:30:00.000+05:30");
    const window = getAiUsageWindow(now);

    expect(window.start.getHours()).toBe(0);
    expect(window.start.getMinutes()).toBe(0);
    expect(window.resetAt.getTime() - window.start.getTime()).toBe(
      24 * 60 * 60 * 1000,
    );
  });
});

describe("checkAiUsageLimit", () => {
  it("allows users below the daily limit", async () => {
    const store = createStore(3);

    await expect(
      checkAiUsageLimit("user-1", {
        limit: 5,
        now: new Date("2026-05-16T10:30:00.000Z"),
        store,
      }),
    ).resolves.toMatchObject({
      ok: true,
      used: 3,
      remaining: 2,
      limit: 5,
    });
  });

  it("uses the configured daily limit when none is passed", async () => {
    vi.stubEnv("AI_DAILY_LIMIT", "4");
    const store = createStore(1);

    await expect(
      checkAiUsageLimit("user-1", {
        now: new Date("2026-05-16T10:30:00.000Z"),
        store,
      }),
    ).resolves.toMatchObject({
      ok: true,
      used: 1,
      remaining: 3,
      limit: 4,
    });

    vi.unstubAllEnvs();
  });

  it("blocks users at the daily limit", async () => {
    const store = createStore(5);

    await expect(
      checkAiUsageLimit("user-1", {
        limit: 5,
        now: new Date("2026-05-16T10:30:00.000Z"),
        store,
      }),
    ).resolves.toMatchObject({
      ok: false,
      used: 5,
      remaining: 0,
      limit: 5,
    });
  });
});

describe("recordAiUsage", () => {
  it("stores a usage event for the route", async () => {
    const create = vi.fn().mockResolvedValue({});
    const store = {
      aiUsageEvent: {
        count: vi.fn(),
        create,
      },
    };

    await recordAiUsage("user-1", "ai-draft", store);

    expect(create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        route: "ai-draft",
      },
    });
  });
});

describe("consumeAiUsage", () => {
  it("records usage and returns the post-consumption count", async () => {
    const store = createStore(2);

    await expect(
      consumeAiUsage("user-1", "ai-draft", {
        limit: 5,
        now: new Date("2026-05-16T10:30:00.000Z"),
        store,
      }),
    ).resolves.toMatchObject({
      ok: true,
      used: 3,
      remaining: 2,
      limit: 5,
    });
    expect(store.aiUsageEvent.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        route: "ai-draft",
      },
    });
  });

  it("does not record usage when the user is already at the limit", async () => {
    const store = createStore(5);

    await expect(
      consumeAiUsage("user-1", "ai-chat", {
        limit: 5,
        now: new Date("2026-05-16T10:30:00.000Z"),
        store,
      }),
    ).resolves.toMatchObject({
      ok: false,
      used: 5,
      remaining: 0,
      limit: 5,
    });
    expect(store.aiUsageEvent.create).not.toHaveBeenCalled();
  });

  it("uses a serializable transaction when the store supports it", async () => {
    const store = {
      ...createStore(1),
      $transaction: vi.fn(async (callback) => callback(store)),
    };

    await consumeAiUsage("user-1", "ai-draft", {
      limit: 5,
      store,
    });

    expect(store.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        isolationLevel: "Serializable",
      }),
    );
  });
});

describe("createAiUsageLimitMessage", () => {
  it("returns a readable quota message", () => {
    const message = createAiUsageLimitMessage({
      ok: false,
      used: 20,
      remaining: 0,
      limit: 20,
      resetAt: new Date("2026-05-17T00:00:00.000Z"),
    });

    expect(message).toContain("Daily AI limit reached");
  });
});

describe("createAiUsageHeaders", () => {
  it("exposes retry and quota headers", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-16T12:00:00.000Z"));

    expect(
      createAiUsageHeaders({
        ok: false,
        used: 20,
        remaining: 0,
        limit: 20,
        resetAt: new Date("2026-05-17T00:00:00.000Z"),
      }),
    ).toEqual({
      "Retry-After": "43200",
      "X-AI-Limit": "20",
      "X-AI-Remaining": "0",
      "X-AI-Reset": "2026-05-17T00:00:00.000Z",
    });

    vi.useRealTimers();
  });

  it("never reports a zero Retry-After", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-17T00:00:00.500Z"));

    expect(
      createAiUsageHeaders({
        ok: false,
        used: 20,
        remaining: 0,
        limit: 20,
        resetAt: new Date("2026-05-17T00:00:00.000Z"),
      })["Retry-After"],
    ).toBe("1");

    vi.useRealTimers();
  });
});

function createStore(used: number) {
  return {
    aiUsageEvent: {
      count: vi.fn().mockResolvedValue(used),
      create: vi.fn(),
    },
  };
}
