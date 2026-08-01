export const DEFAULT_DATABASE_URL =
  "postgresql://citizen_bill:citizen_bill_password@localhost:5432/citizen_bill?schema=public";

type DatabaseEnv = {
  DATABASE_URL?: string;
  NODE_ENV?: string;
  NEXT_PHASE?: string;
  [key: string]: string | undefined;
};

export function getDatabaseUrl(env: DatabaseEnv = process.env) {
  const databaseUrl = env.DATABASE_URL?.trim();

  if (databaseUrl) {
    return databaseUrl;
  }

  if (env.NODE_ENV === "production" && env.NEXT_PHASE !== "phase-production-build") {
    throw new Error(
      "DATABASE_URL is required. Copy .env.example to .env and set a PostgreSQL connection string.",
    );
  }

  return DEFAULT_DATABASE_URL;
}
