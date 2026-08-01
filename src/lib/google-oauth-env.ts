type AuthEnv = {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  NODE_ENV?: string;
  NEXT_PHASE?: string;
};

export function getGoogleOAuthEnv(
  name: "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET",
  env: AuthEnv = process.env,
) {
  const value = env[name]?.trim();

  if (value) {
    return value;
  }

  // next build sets NODE_ENV=production while collecting page data.
  // Allow empty placeholders so the build can finish without OAuth secrets.
  if (env.NODE_ENV === "production" && env.NEXT_PHASE !== "phase-production-build") {
    throw new Error(
      `${name} is required in production. Set it in the deployment environment.`,
    );
  }

  return "";
}
