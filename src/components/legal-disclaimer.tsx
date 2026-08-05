import Link from "next/link";
import type { Locale } from "@/lib/locale";

export function LegalDisclaimer({ compact = false, locale = "en" }: { compact?: boolean; locale?: Locale }) {
  const ml = locale === "ml";
  return (
    <section
      className={`border border-border bg-warning-bg ${
        compact ? "rounded-md px-3 py-2" : "rounded-md p-5"
      }`}
    >
      <p
        className={`font-semibold text-warning-ink ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {ml ? "AI, നിയമ അറിയിപ്പ്" : "AI and legal disclaimer"}
      </p>
      <p
        className={`mt-1 leading-6 text-ink-muted ${compact ? "text-xs" : "text-sm"}`}
      >
        {ml ? "MattamUndo-വും AI സഹായിയും പൊതു ചർച്ചയ്ക്കുള്ള ബിൽ വാചകം തയ്യാറാക്കാൻ സഹായിക്കുന്നു. ഇവ നിയമോപദേശമോ നിയമ പ്രതിനിധാനമോ ഔദ്യോഗിക സർക്കാർ മാർഗനിർദേശമോ നൽകുന്നില്ല. പ്രധാന നിർദേശങ്ങളെ ആശ്രയിക്കുന്നതിന് മുമ്പ് യോഗ്യരായ വിദഗ്ധരുമായി പരിശോധിക്കുക." : "MattamUndo and its AI assistant help prepare public discussion bill text. They do not provide legal advice, legal representation, or official government guidance. Review important proposals with qualified experts before relying on them."}
      </p>
      {!compact ? (
        <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-accent">
          <Link href="/terms">{ml ? "നിബന്ധനകൾ" : "Terms"}</Link>
          <Link href="/privacy">{ml ? "സ്വകാര്യത" : "Privacy"}</Link>
        </div>
      ) : null}
    </section>
  );
}
