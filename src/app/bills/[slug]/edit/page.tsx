import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { Save } from "lucide-react";

import { updateBillAction } from "@/app/bills/[slug]/actions";
import { AiDraftHelper } from "@/components/ai-draft-helper";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import {
  billCategories,
  isKnownBillCategory,
  OTHER_BILL_CATEGORY,
} from "@/lib/bill-categories";
import { prisma } from "@/lib/prisma";

export default async function EditBillPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { slug } = await params;
  const { error } = await searchParams;
  const bill = await prisma.bill.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!bill) {
    notFound();
  }

  if (bill.authorId !== session.user.id) {
    redirect("/dashboard");
  }

  const tagValue = bill.tags.map(({ tag }) => tag.name).join(", ");
  const categoryName = bill.category?.name ?? "";
  const selectedCategory = isKnownBillCategory(categoryName)
    ? categoryName
    : categoryName
      ? OTHER_BILL_CATEGORY
      : "";
  const otherCategory =
    selectedCategory === OTHER_BILL_CATEGORY ? categoryName : "";
  const errorMessage =
    error === "publish"
      ? "Add a clear title and complete description, problem, proposed solution, and draft text before publishing."
      : error === "title"
        ? "Add a bill title with at least 3 characters."
        : null;

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#161616]">
      <SiteHeader />
      <section className="border-b border-[#d8d2c4] bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6d6658]">
            Edit bill
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Refine your bill draft
          </h1>
          <p className="mt-2 max-w-2xl text-[#4f4a40]">
            Update the structured content and use the AI helper for drafting
            support.
          </p>
          {errorMessage ? (
            <p className="mt-4 rounded-md border border-[#e2b35a] bg-[#fff7e8] px-3 py-2 text-sm text-[#6a4b10]">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_360px]">
        <form action={updateBillAction} className="space-y-5">
          <input type="hidden" name="slug" value={bill.slug} />
          <Panel title="Bill details">
            <Field name="title" label="Title" defaultValue={bill.title} />
            <TextArea
              name="description"
              label="Short description"
              rows={3}
              defaultValue={bill.description}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <CategorySelect
                name="category"
                label="Category"
                defaultValue={selectedCategory}
              />
              <Field name="tags" label="Tags" defaultValue={tagValue} />
            </div>
            <Field
              name="categoryOther"
              label="Other category"
              defaultValue={otherCategory}
            />
          </Panel>

          <Panel title="Policy content">
            <TextArea
              name="problem"
              label="Problem statement"
              rows={5}
              defaultValue={bill.problem ?? ""}
            />
            <TextArea
              name="proposedSolution"
              label="Proposed solution"
              rows={5}
              defaultValue={bill.proposedSolution ?? ""}
            />
            <TextArea
              name="expectedImpact"
              label="Expected public impact"
              rows={4}
              defaultValue={bill.expectedImpact ?? ""}
            />
            <TextArea
              name="body"
              label="Draft bill text"
              rows={10}
              defaultValue={bill.body ?? ""}
            />
            <TextArea
              name="references"
              label="References and supporting links"
              rows={4}
              defaultValue={bill.references ?? ""}
            />
          </Panel>

          <button
            type="submit"
            className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#123c69] px-4 text-sm font-semibold text-white shadow-sm"
          >
            <Save size={17} aria-hidden="true" />
            Save changes
          </button>
        </form>

        <AiDraftHelper
          title={bill.title}
          problem={bill.problem ?? ""}
          billId={bill.id}
        />
      </section>
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function CategorySelect({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#3f3a32]">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-md border border-[#c8c0ae] bg-white px-3 text-sm outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
      >
        <option value="">Select category</option>
        {billCategories.map((category) => (
          <option key={category} value={category}>
            {category === OTHER_BILL_CATEGORY ? "Other" : category}
          </option>
        ))}
      </select>
    </label>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#3f3a32]">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-md border border-[#c8c0ae] bg-white px-3 text-sm outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  rows,
  defaultValue,
}: {
  label: string;
  name: string;
  rows: number;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#3f3a32]">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="mt-2 w-full resize-y rounded-md border border-[#c8c0ae] bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
      />
    </label>
  );
}
