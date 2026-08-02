import Link from "next/link";
import { Scale } from "lucide-react";

import { AuthButton } from "@/components/auth-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = callbackUrl?.startsWith("/")
    ? callbackUrl
    : "/dashboard";
  return (
    <main
      id="main-content"
      className="grid min-h-screen place-items-center bg-background px-5 text-foreground"
    >
      <section className="w-full max-w-md rounded-md border border-border bg-surface-raised p-6">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="grid size-11 place-items-center rounded-lg bg-accent text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            aria-label="MattamUndo home"
          >
            <Scale size={23} aria-hidden="true" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">
              Sign in to MattamUndo
            </h1>
            <p className="text-sm text-ink-muted">
              Use your Google account to create drafts, vote, and comment.
            </p>
          </div>
        </div>

        <AuthButton callbackUrl={safeCallbackUrl} />

        <p className="mt-5 text-sm leading-6 text-ink-muted">
          AI-generated bill drafts are assistance only and should be reviewed
          before being treated as legal or policy text.
        </p>

        <p className="mt-4 text-sm text-ink-muted">
          By continuing you agree to the{" "}
          <Link href="/terms" className="font-semibold text-accent">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-accent">
            Privacy policy
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
