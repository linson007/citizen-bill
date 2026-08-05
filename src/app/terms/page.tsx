import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "Terms for using MattamUndo to draft, discuss, and share public bill proposals.",
};

export default function TermsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Terms of use
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Last updated: August 2, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl flex-1 space-y-5 px-5 py-8 text-sm leading-7 text-ink-soft sm:px-8">
        <PolicySection title="Public drafting platform">
          MattamUndo is an open-source civic platform for drafting, discussing,
          voting on, and sharing public bill proposals. Content on the platform
          is submitted by users and is intended for public discussion, not as
          official legislation unless adopted through lawful government process.
        </PolicySection>

        <PolicySection title="No legal advice">
          MattamUndo, including its AI assistant, does not provide legal advice,
          legal representation, or official government guidance. AI output may
          be incomplete or inaccurate and must be reviewed before use.
        </PolicySection>

        <PolicySection title="User responsibilities">
          Do not post unlawful, defamatory, hateful, abusive, spam, misleading,
          or privacy-invasive content. Do not upload documents that expose
          personal data without permission. You are responsible for content you
          submit and for verifying facts before relying on them.
        </PolicySection>

        <PolicySection title="Moderation">
          Reports may be reviewed by moderators or administrators. Content may
          be removed, archived, or restricted when it appears to violate these
          terms, platform safety rules, or applicable law.
        </PolicySection>

        <PolicySection title="Accounts">
          Sign-in currently uses Google. Keep your account secure and do not
          attempt to access another person&apos;s account. We may suspend
          accounts that abuse the service or AI usage limits.
        </PolicySection>

        <PolicySection title="Open-source project">
          The application code is open source under the MIT License.
          Contributions must follow the repository license, code of conduct, and
          contribution guidelines.
        </PolicySection>

        <PolicySection title="Contact">
          Questions about these terms:{" "}
          <a
            className="font-semibold text-accent"
            href="mailto:linsonkurian007@gmail.com"
          >
            linsonkurian007@gmail.com
          </a>
          .
        </PolicySection>
      </section>
      <SiteFooter />
    </main>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-foreground">{title}</h2>
      <p>{children}</p>
    </section>
  );
}
