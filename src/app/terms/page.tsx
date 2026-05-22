import { SiteHeader } from "@/components/site-header";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#161616]">
      <SiteHeader />
      <section className="border-b border-[#d8d2c4] bg-[#fbfaf7]">
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6d6658]">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Terms of use
          </h1>
          <p className="mt-2 text-sm text-[#6d6658]">
            Last updated: May 12, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5 px-5 py-8 text-sm leading-7 text-[#3f3a32] sm:px-8">
        <PolicySection title="Public drafting platform">
          Citizen Bill is an open-source civic platform for drafting,
          discussing, voting on, and sharing public bill proposals. Content on
          the platform is submitted by users and is intended for public
          discussion.
        </PolicySection>

        <PolicySection title="No legal advice">
          Citizen Bill, including its AI assistant, does not provide legal
          advice, legal representation, or official government guidance. AI
          output may be incomplete or inaccurate and must be reviewed before
          use.
        </PolicySection>

        <PolicySection title="User responsibilities">
          Do not post unlawful, defamatory, hateful, abusive, spam, misleading,
          or privacy-invasive content. Do not upload documents that expose
          personal data without permission. You are responsible for content you
          submit.
        </PolicySection>

        <PolicySection title="Moderation">
          Reports may be reviewed by moderators or administrators. Content may
          be removed, archived, or restricted when it appears to violate these
          terms, platform safety rules, or applicable law.
        </PolicySection>

        <PolicySection title="Open-source project">
          The application code is intended to be open source. Contributions must
          follow the repository license, code of conduct, and contribution
          guidelines.
        </PolicySection>
      </section>
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
