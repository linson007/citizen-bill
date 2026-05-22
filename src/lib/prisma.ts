import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConnectionString?: string;
};

const fallbackConnectionString =
  "postgresql://citizen_bill:citizen_bill@localhost:5432/citizen_bill?schema=public";

function getConnectionString() {
  return process.env.DATABASE_URL ?? fallbackConnectionString;
}

function createPrismaClient(connectionString: string) {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

const connectionString = getConnectionString();

export const prisma =
  globalForPrisma.prismaConnectionString === connectionString &&
  globalForPrisma.prisma
    ? globalForPrisma.prisma
    : createPrismaClient(connectionString);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaConnectionString = connectionString;
}
