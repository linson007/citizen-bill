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

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
