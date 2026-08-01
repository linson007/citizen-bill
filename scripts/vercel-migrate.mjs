import { spawnSync } from "node:child_process";

const vercelEnv = process.env.VERCEL_ENV || "development";
const migrationUrl =
  process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();

// Preview/dev builds should not migrate (and often lack Build-time DB env).
if (vercelEnv !== "production") {
  console.log(
    `Skipping prisma migrate deploy (VERCEL_ENV=${vercelEnv}).`,
  );
  process.exit(0);
}

if (!migrationUrl) {
  console.error(
    "Production migrate requires DIRECT_URL or DATABASE_URL at Build time in Vercel.",
  );
  process.exit(1);
}

function runMigrate(env) {
  return spawnSync("npx", ["prisma", "migrate", "deploy"], {
    encoding: "utf8",
    env,
  });
}

// Prefer DIRECT_URL when set; if that host is unreachable from Vercel (common
// with Supabase IPv6-only direct hosts), fall back to DATABASE_URL (pooler).
const primaryEnv = { ...process.env };
const primary = runMigrate(primaryEnv);
const primaryOut = `${primary.stdout ?? ""}${primary.stderr ?? ""}`;

if ((primary.status ?? 1) === 0) {
  if (primary.stdout) process.stdout.write(primary.stdout);
  if (primary.stderr) process.stderr.write(primary.stderr);
  process.exit(0);
}

const canFallback =
  Boolean(process.env.DIRECT_URL?.trim()) &&
  Boolean(process.env.DATABASE_URL?.trim()) &&
  process.env.DIRECT_URL.trim() !== process.env.DATABASE_URL.trim() &&
  /P1001|Can't reach database server/i.test(primaryOut);

if (canFallback) {
  console.warn(
    "Direct DB URL unreachable from Vercel; retrying prisma migrate deploy with DATABASE_URL.",
  );
  const fallbackEnv = { ...process.env, DIRECT_URL: process.env.DATABASE_URL };
  const fallback = runMigrate(fallbackEnv);
  if (fallback.stdout) process.stdout.write(fallback.stdout);
  if (fallback.stderr) process.stderr.write(fallback.stderr);
  if ((fallback.status ?? 1) === 0) {
    process.exit(0);
  }
}

if (primary.stdout) process.stdout.write(primary.stdout);
if (primary.stderr) process.stderr.write(primary.stderr);

// Do not block frontend deploys when the DB is temporarily unreachable.
// Schema-changing PRs should still verify migrate separately.
if (/P1001|Can't reach database server/i.test(primaryOut)) {
  console.warn(
    "Skipping failed prisma migrate deploy due to database connectivity; continuing with next build.",
  );
  process.exit(0);
}

process.exit(primary.status ?? 1);
