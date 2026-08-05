import { beforeEach, describe, expect, it, vi } from "vitest";

const count = vi.fn();
const create = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    aiUsageEvent: {
      count: (...args: unknown[]) => count(...args),
      create: (...args: unknown[]) => create(...args),
    },
  },
}));

describe("ai usage default prisma store", () => {
  beforeEach(() => {
    count.mockReset().mockResolvedValue(0);
    create.mockReset().mockResolvedValue({});
  });

  it("loads prisma when no store is provided", async () => {
    const {
      checkAiUsageLimit,
      consumeAiUsage,
      recordAiUsage,
    } = await import("@/lib/ai-usage-limit");

    await expect(
      checkAiUsageLimit("user-1", { limit: 5 }),
    ).resolves.toMatchObject({ ok: true, used: 0, remaining: 5 });
    await recordAiUsage("user-1", "ai-chat");
    await expect(
      consumeAiUsage("user-1", "ai-draft", { limit: 5 }),
    ).resolves.toMatchObject({ ok: true, used: 1, remaining: 4 });

    expect(count).toHaveBeenCalled();
    expect(create).toHaveBeenCalled();
  });
});
