export const DEFAULT_APP_URL = "http://localhost:3000";

type AppUrlEnv = {
  NEXTAUTH_URL?: string;
};

/** Returns an absolute app origin. Bare hosts get an https:// prefix. */
export function getAppUrl(env: AppUrlEnv = process.env): string {
  const raw = env.NEXTAUTH_URL?.trim();

  if (!raw) {
    return DEFAULT_APP_URL;
  }

  const host = raw.replace(/\/$/, "");
  const absolute = /^https?:\/\//i.test(host)
    ? host
    : host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? `http://${host}`
      : `https://${host}`;

  return new URL(absolute).origin;
}
