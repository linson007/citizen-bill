import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How MattamUndo collects, uses, and shares account and bill data.",
};

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f7f6f2] text-[#161616]">
      <SiteHeader />
      <section className="border-b border-[#d8d2c4] bg-[#fbfaf7]">
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6d6658]">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Privacy policy
          </h1>
          <p className="mt-2 text-sm text-[#6d6658]">
            Last updated: August 2, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl flex-1 space-y-5 px-5 py-8 text-sm leading-7 text-[#3f3a32] sm:px-8">
        <PolicySection title="Information collected">
          MattamUndo stores account information from Google login (name, email,
          and profile image when provided), bill drafts, uploaded file metadata,
          votes, comments, reports, amendment suggestions, notifications, and
          optional AI conversation history you choose to save.
        </PolicySection>

        <PolicySection title="Public content">
          Published bills, vote counts, comments, amendment suggestions, author
          display names, tags, categories, and attached public files may be
          visible to other users and visitors. Do not publish personal data you
          do not want shared publicly.
        </PolicySection>

        <PolicySection title="AI processing">
          Text sent to the AI assistant may be processed by the configured AI
          provider to generate drafting help. Conversation history is stored
          only when a signed-in user chooses to save it. AI output is assistance
          only and is not legal advice.
        </PolicySection>

        <PolicySection title="Uploads">
          Uploaded PDFs and DOCX files are stored with the configured file
          storage provider. Avoid uploading sensitive personal data or
          confidential documents.
        </PolicySection>

        <PolicySection title="Cookies and sign-in">
          Sign-in uses session cookies managed by the authentication provider.
          These cookies are needed to keep you signed in and are not used for
          third-party advertising.
        </PolicySection>

        <PolicySection title="Security and deletion">
          Credentials and secrets are stored in environment variables, not in
          source code. To request deletion or correction of your account or
          content, email{" "}
          <a
            className="font-semibold text-[#123c69]"
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
    <section className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-[#161616]">{title}</h2>
      <p>{children}</p>
    </section>
  );
}
