import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { canViewBill } from "@/lib/bill-visibility";
import { prisma } from "@/lib/prisma";

export default async function BillVersionPage({
  params,
}: {
  params: Promise<{ slug: string; versionId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { slug, versionId } = await params;

  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: { id: true, authorId: true, status: true, title: true },
  });

  if (!bill) {
    notFound();
  }

  if (!canViewBill(bill, session?.user?.id)) {
    if (session?.user?.id) {
      notFound();
    }

    redirect("/login");
  }

  const version = await prisma.billVersion.findUnique({
    where: { id: versionId },
  });

  if (!version || version.billId !== bill.id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <Link
          href={`/bills/${slug}`}
          className="mb-5 flex w-fit items-center gap-2 text-sm font-semibold text-accent"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to bill
        </Link>
        <article className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm">
          <p className="text-sm text-ink-muted">
            Snapshot from {version.createdAt.toLocaleString("en-IN")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">{version.title}</h1>
          {version.summary ? (
            <p className="mt-4 text-ink-soft">{version.summary}</p>
          ) : null}
          <pre className="mt-5 whitespace-pre-wrap text-sm leading-7 text-ink-soft">
            {version.body || "No body was saved in this version."}
          </pre>
        </article>
      </section>
    </main>
  );
}
