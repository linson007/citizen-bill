import { spawnSync } from "node:child_process";

const vercelEnv = process.env.VERCEL_ENV || "development";
const MIGRATE_TIMEOUT_MS = 20_000;

// Preview/dev builds should not migrate (and often lack Build-time DB env).
if (vercelEnv !== "production") {
  console.log(
    `Skipping prisma migrate deploy (VERCEL_ENV=${vercelEnv}).`,
  );
  process.exit(0);
}

if (!process.env.DIRECT_URL?.trim() && !process.env.DATABASE_URL?.trim()) {
  console.error(
    "Production migrate requires DIRECT_URL or DATABASE_URL at Build time in Vercel.",
  );
  process.exit(1);
}

function runMigrate(env) {
  return spawnSync("npx", ["prisma", "migrate", "deploy"], {
    encoding: "utf8",
    env,
    timeout: MIGRATE_TIMEOUT_MS,
    killSignal: "SIGKILL",
  });
}

function combinedOutput(result) {
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function isConnectivityFailure(result) {
  const output = combinedOutput(result);
  return (
    result.error?.code === "ETIMEDOUT" ||
    Boolean(result.signal) ||
    /P1001|Can't reach database server|timed out|ETIMEDOUT/i.test(output)
  );
}

function printResult(result) {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

// Prefer DIRECT_URL when set; if that host is unreachable from Vercel (common
// with Supabase IPv6-only direct hosts), fall back to DATABASE_URL (pooler).
const primary = runMigrate({ ...process.env });

if ((primary.status ?? 1) === 0) {
  printResult(primary);
  process.exit(0);
}

const canFallback =
  Boolean(process.env.DIRECT_URL?.trim()) &&
  Boolean(process.env.DATABASE_URL?.trim()) &&
  process.env.DIRECT_URL.trim() !== process.env.DATABASE_URL.trim() &&
  isConnectivityFailure(primary);

if (canFallback) {
  console.warn(
    "Direct DB URL unreachable from Vercel; retrying prisma migrate deploy with DATABASE_URL.",
  );
  const fallback = runMigrate({
    ...process.env,
    DIRECT_URL: process.env.DATABASE_URL,
  });
  printResult(fallback);
  if ((fallback.status ?? 1) === 0) {
    process.exit(0);
  }
  if (isConnectivityFailure(fallback)) {
    console.warn(
      "Skipping failed prisma migrate deploy due to database connectivity; continuing with next build.",
    );
    process.exit(0);
  }
  process.exit(fallback.status ?? 1);
}

printResult(primary);

// Do not block frontend deploys when the DB is temporarily unreachable.
if (isConnectivityFailure(primary)) {
  console.warn(
    "Skipping failed prisma migrate deploy due to database connectivity; continuing with next build.",
  );
  process.exit(0);
}

process.exit(primary.status ?? 1);
