"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { resolveBillCategory } from "@/lib/bill-categories";
import {
  billDraftSchema,
  billPublishSchema,
} from "@/lib/bill-form-schema";
import { prisma } from "@/lib/prisma";
import { createUniqueSlug, slugify } from "@/lib/slug";

export type BillFormState = {
  errors?: Record<string, string[]>;
  fields?: Record<string, string>;
  message?: string;
};

export async function createBillAction(
  _previousState: BillFormState,
  formData: FormData,
): Promise<BillFormState> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const intent = formData.get("intent")?.toString();
  const shouldPublish = intent === "publish";
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    categoryOther: formData.get("categoryOther"),
    tags: formData.get("tags"),
    problem: formData.get("problem"),
    proposedSolution: formData.get("proposedSolution"),
    expectedImpact: formData.get("expectedImpact"),
    body: formData.get("body"),
    references: formData.get("references"),
  };
  const parsed = (shouldPublish ? billPublishSchema : billDraftSchema).safeParse(
    rawData,
  );

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      fields: Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [
          key,
          value.toString(),
        ]),
      ),
      message: shouldPublish
        ? "Please complete the required fields before publishing."
        : "Please fix the highlighted fields.",
    };
  }

  const data = parsed.data;
  const categoryName = resolveBillCategory({
    category: data.category,
    categoryOther: data.categoryOther,
  });
  const categorySlug = categoryName ? slugify(categoryName) : undefined;
  const tagNames = (data.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);

  const bill = await prisma.bill.create({
    data: {
      title: data.title,
      slug: createUniqueSlug(data.title),
      description: data.description || "Draft bill proposal",
      problem: data.problem || null,
      proposedSolution: data.proposedSolution || null,
      expectedImpact: data.expectedImpact || null,
      body: data.body || null,
      references: data.references || null,
      status: shouldPublish ? "PUBLISHED" : "DRAFT",
      publishedAt: shouldPublish ? new Date() : null,
      author: {
        connect: {
          id: session.user.id,
        },
      },
      category:
        categoryName && categorySlug
          ? {
              connectOrCreate: {
                where: { slug: categorySlug },
                create: { name: categoryName, slug: categorySlug },
              },
            }
          : undefined,
      tags: {
        create: tagNames.map((name) => {
          const slug = slugify(name);

          return {
            tag: {
              connectOrCreate: {
                where: { slug },
                create: { name, slug },
              },
            },
          };
        }),
      },
      versions: {
        create: {
          title: data.title,
          body: data.body || "",
          summary: data.description || null,
        },
      },
    },
    select: {
      slug: true,
    },
  });

  redirect(`/bills/${bill.slug}`);
}
