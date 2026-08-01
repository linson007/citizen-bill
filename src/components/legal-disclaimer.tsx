import Link from "next/link";

export function LegalDisclaimer({ compact = false }: { compact?: boolean }) {
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
        AI and legal disclaimer
      </p>
      <p
        className={`mt-1 leading-6 text-ink-muted ${compact ? "text-xs" : "text-sm"}`}
      >
        MattamUndo and its AI assistant help prepare public discussion bill
        text. They do not provide legal advice, legal representation, or
        official government guidance. Review important proposals with qualified
        experts before relying on them.
      </p>
      {!compact ? (
        <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-accent">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      ) : null}
    </section>
  );
}
