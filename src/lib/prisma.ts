import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
  prismaConnectionString?: string;
};

function createPool(connectionString: string) {
  if (
    globalForPrisma.prismaPool &&
    globalForPrisma.prismaConnectionString !== connectionString
  ) {
    void globalForPrisma.prismaPool.end().catch(() => undefined);
    globalForPrisma.prismaPool = undefined;
  }

  if (globalForPrisma.prismaPool) {
    return globalForPrisma.prismaPool;
  }

  // Cap the pool for serverless (Vercel). Default node-postgres max is 10,
  // which exhausts Supabase session-mode pool slots (often 15) across isolates.
  const pool = new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  globalForPrisma.prismaPool = pool;
  return pool;
}

function createPrismaClient(connectionString: string) {
  return new PrismaClient({
    adapter: new PrismaPg(createPool(connectionString)),
  });
}

const connectionString = getDatabaseUrl();

export const prisma =
  globalForPrisma.prismaConnectionString === connectionString &&
  globalForPrisma.prisma
    ? globalForPrisma.prisma
    : createPrismaClient(connectionString);

// Reuse across hot reloads (dev) and warm serverless isolates (prod).
globalForPrisma.prisma = prisma;
globalForPrisma.prismaConnectionString = connectionString;
