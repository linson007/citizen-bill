import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { BillForm } from "@/app/bills/new/bill-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { getRequestMessages } from "@/lib/request-locale";

export default async function NewBillPage() {
  const session = await getServerSession(authOptions);
  const { locale, t } = await getRequestMessages();
  const copyClass = locale === "ml" ? "font-malayalam" : "";

  if (!session?.user) {
    redirect("/login?callbackUrl=/bills/new");
  }

  return (
    <main
      id="main-content"
      className={`flex min-h-screen flex-col bg-background text-foreground ${copyClass}`}
    >
      <SiteHeader />
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
            {t.draft.eyebrow}
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.draft.heading}
          </h1>
          <p className="mt-2 max-w-2xl text-ink-soft">{t.draft.support}</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8">
        <BillForm suggestionLabels={t.draft.suggestions} />
      </section>
      <SiteFooter />
    </main>
  );
}
