import { prisma } from "@/lib/prisma";

export const DEFAULT_DAILY_AI_LIMIT = 20;

export type AiUsageLimitResult = {
  ok: boolean;
  used: number;
  remaining: number;
  limit: number;
  resetAt: Date;
};

type AiUsageStore = {
  aiUsageEvent: {
    count(args: {
      where: {
        userId: string;
        createdAt: {
          gte: Date;
          lt: Date;
        };
      };
    }): Promise<number>;
    create(args: { data: { userId: string; route: string } }): Promise<unknown>;
  };
};

export function getDailyAiLimit() {
  const configuredLimit = Number(process.env.AI_DAILY_LIMIT);

  if (Number.isInteger(configuredLimit) && configuredLimit > 0) {
    return configuredLimit;
  }

  return DEFAULT_DAILY_AI_LIMIT;
}

export function getAiUsageWindow(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const resetAt = new Date(start);
  resetAt.setDate(resetAt.getDate() + 1);

  return { start, resetAt };
}

export async function checkAiUsageLimit(
  userId: string,
  options: {
    limit?: number;
    now?: Date;
    store?: AiUsageStore;
  } = {},
): Promise<AiUsageLimitResult> {
  const limit = options.limit ?? getDailyAiLimit();
  const { start, resetAt } = getAiUsageWindow(options.now);
  const store = options.store ?? prisma;
  const used = await store.aiUsageEvent.count({
    where: {
      userId,
      createdAt: {
        gte: start,
        lt: resetAt,
      },
    },
  });
  const remaining = Math.max(limit - used, 0);

  return {
    ok: used < limit,
    used,
    remaining,
    limit,
    resetAt,
  };
}

export async function recordAiUsage(
  userId: string,
  route: string,
  store: AiUsageStore = prisma,
) {
  await store.aiUsageEvent.create({
    data: {
      userId,
      route,
    },
  });
}

export function createAiUsageLimitMessage(result: AiUsageLimitResult) {
  return `Daily AI limit reached. You can use the AI assistant again after ${result.resetAt.toLocaleString()}.`;
}

export function createAiUsageHeaders(result: AiUsageLimitResult) {
  const retryAfterSeconds = Math.max(
    Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
    1,
  );

  return {
    "Retry-After": retryAfterSeconds.toString(),
    "X-AI-Limit": result.limit.toString(),
    "X-AI-Remaining": result.remaining.toString(),
    "X-AI-Reset": result.resetAt.toISOString(),
  };
}
