import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <span className="grid size-14 place-items-center rounded-lg bg-accent-soft text-accent">
          <FileQuestion size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-ink-muted">
          That page does not exist or the bill is no longer public. Browse
          published proposals or start a new draft.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/bills"
            className="flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-white shadow-sm"
          >
            Browse bills
          </Link>
          <Link
            href="/"
            className="flex h-11 items-center justify-center rounded-md border border-border-strong bg-surface-raised px-5 text-sm font-semibold text-ink-soft shadow-sm"
          >
            Back home
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
