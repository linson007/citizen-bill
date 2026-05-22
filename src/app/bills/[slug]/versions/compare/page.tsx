import { notFound } from "next/navigation";
import Link from "next/link";
import { GitCompare } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export default async function VersionComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { slug } = await params;
  const { from, to } = await searchParams;
  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  if (!bill) {
    notFound();
  }

  const versions = await prisma.billVersion.findMany({
    where: {
      billId: bill.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });
  const fallbackFrom = versions[1]?.id;
  const fallbackTo = versions[0]?.id;
  const fromVersion = versions.find(
    (version) => version.id === (from ?? fallbackFrom),
  );
  const toVersion = versions.find(
    (version) => version.id === (to ?? fallbackTo),
  );

  if (!fromVersion || !toVersion) {
    notFound();
  }

  const diffRows = diffLines(fromVersion.body, toVersion.body);

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#161616]">
      <SiteHeader />
      <section className="border-b border-[#d8d2c4] bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#6d6658]">
            <GitCompare size={17} aria-hidden="true" />
            Version comparison
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{bill.title}</h1>
          <p className="mt-2 text-sm text-[#6d6658]">
            Comparing {fromVersion.createdAt.toLocaleDateString("en-IN")} to{" "}
            {toVersion.createdAt.toLocaleDateString("en-IN")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <form className="mb-5 grid gap-3 rounded-lg border border-[#d8d2c4] bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto]">
          <select
            name="from"
            defaultValue={fromVersion.id}
            className="h-10 rounded-md border border-[#c8c0ae] bg-white px-3 text-sm"
          >
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                From {version.createdAt.toLocaleDateString("en-IN")}
              </option>
            ))}
          </select>
          <select
            name="to"
            defaultValue={toVersion.id}
            className="h-10 rounded-md border border-[#c8c0ae] bg-white px-3 text-sm"
          >
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                To {version.createdAt.toLocaleDateString("en-IN")}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-10 rounded-md bg-[#123c69] px-4 text-sm font-semibold text-white"
          >
            Compare
          </button>
        </form>

        <div className="overflow-hidden rounded-lg border border-[#d8d2c4] bg-white shadow-sm">
          {diffRows.map((row, index) => (
            <div
              key={`${row.kind}-${index}`}
              className={`grid gap-3 border-b border-[#e7e1d3] px-4 py-3 text-sm md:grid-cols-[120px_1fr] ${
                row.kind === "added"
                  ? "bg-[#e6f1ec]"
                  : row.kind === "removed"
                    ? "bg-[#fff3d7]"
                    : "bg-white"
              }`}
            >
              <span className="font-semibold capitalize text-[#4f4a40]">
                {row.kind}
              </span>
              <span className="whitespace-pre-wrap text-[#2f2a22]">
                {row.text || " "}
              </span>
            </div>
          ))}
        </div>

        <Link
          href={`/bills/${bill.slug}`}
          className="mt-5 inline-flex h-10 items-center rounded-md border border-[#c8c0ae] bg-white px-3 text-sm font-semibold text-[#2f2a22]"
        >
          Back to bill
        </Link>
      </section>
    </main>
  );
}

function diffLines(from: string, to: string) {
  const before = from.split("\n");
  const after = to.split("\n");
  const rows: { kind: "unchanged" | "added" | "removed"; text: string }[] = [];
  const max = Math.max(before.length, after.length);

  for (let index = 0; index < max; index += 1) {
    const oldLine = before[index] ?? "";
    const newLine = after[index] ?? "";

    if (oldLine === newLine) {
      rows.push({ kind: "unchanged", text: oldLine });
    } else {
      if (oldLine) {
        rows.push({ kind: "removed", text: oldLine });
      }
      if (newLine) {
        rows.push({ kind: "added", text: newLine });
      }
    }
  }

  return rows;
}
