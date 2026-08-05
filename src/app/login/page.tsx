import Link from "next/link";
import { Scale } from "lucide-react";
import { getServerSession } from "next-auth";

import { AuthButton } from "@/components/auth-button";
import { authOptions } from "@/lib/auth";
import { getRequestMessages } from "@/lib/request-locale";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = callbackUrl?.startsWith("/")
    ? callbackUrl
    : "/dashboard";
  const [session, { locale, t }] = await Promise.all([
    getServerSession(authOptions),
    getRequestMessages(),
  ]);
  return (
    <main
      id="main-content"
      className={`grid min-h-screen place-items-center bg-background px-5 text-foreground ${locale === "ml" ? "font-malayalam" : ""}`}
    >
      <section className="w-full max-w-md rounded-md border border-border bg-surface-raised p-6">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="grid size-11 place-items-center rounded-lg bg-accent text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            aria-label={t.login.home}
          >
            <Scale size={23} aria-hidden="true" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">
              {t.login.heading}
            </h1>
            <p className="text-sm text-ink-muted">{t.login.support}</p>
          </div>
        </div>

        <AuthButton
          callbackUrl={safeCallbackUrl}
          labels={{
            checking: t.login.checking,
            signIn: t.login.signIn,
            signOut: t.login.signOut,
          }}
          signedIn={Boolean(session?.user)}
        />

        <p className="mt-5 text-sm leading-6 text-ink-muted">
          {t.login.disclaimer}
        </p>

        <p className="mt-4 text-sm text-ink-muted">
          {t.login.agreement}{" "}
          <Link href="/terms" className="font-semibold text-accent">
            {t.footer.terms}
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-accent">
            {t.login.privacyPolicy}
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
