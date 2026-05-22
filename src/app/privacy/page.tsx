import { SiteHeader } from "@/components/site-header";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#161616]">
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
            Last updated: May 12, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-5 px-5 py-8 text-sm leading-7 text-[#3f3a32] sm:px-8">
        <PolicySection title="Information collected">
          Citizen Bill stores account information from Google login, bill
          drafts, uploaded file metadata, votes, comments, reports, amendment
          suggestions, notifications, and optional AI conversation history.
        </PolicySection>

        <PolicySection title="Public content">
          Published bills, votes counts, comments, amendment suggestions, author
          names, tags, categories, and attached public files may be visible to
          other users and visitors.
        </PolicySection>

        <PolicySection title="AI processing">
          Text sent to the AI assistant may be processed by the configured AI
          provider. Conversation history is stored only when a signed-in user
          chooses to save it.
        </PolicySection>

        <PolicySection title="Uploads">
          Uploaded PDFs and DOCX files are stored with the configured file
          storage provider. Avoid uploading sensitive personal data or
          confidential documents.
        </PolicySection>

        <PolicySection title="Security and deletion">
          The project should avoid committing secrets and should use environment
          variables for credentials. Users may request deletion or correction of
          their account content from project maintainers or administrators.
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
