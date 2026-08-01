import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f7f6f2] text-[#161616]">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <span className="grid size-14 place-items-center rounded-lg bg-[#e4eef6] text-[#123c69]">
          <FileQuestion size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-[#6d6658]">
          That page does not exist or the bill is no longer public. Browse
          published proposals or start a new draft.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/bills"
            className="flex h-11 items-center justify-center rounded-md bg-[#123c69] px-5 text-sm font-semibold text-white shadow-sm"
          >
            Browse bills
          </Link>
          <Link
            href="/"
            className="flex h-11 items-center justify-center rounded-md border border-[#c8c0ae] bg-white px-5 text-sm font-semibold text-[#2f2a22] shadow-sm"
          >
            Back home
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
