import { z } from "zod";

const placeholderTitlePattern =
  /^(test|testing|asdf|sample|demo|untitled|new bill|new public bill)(\s+\d+)?$/i;

export const billDraftSchema = z.object({
  title: z.string().trim().min(3, "Add a bill title before saving."),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  categoryOther: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  problem: z.string().trim().optional(),
  proposedSolution: z.string().trim().optional(),
  expectedImpact: z.string().trim().optional(),
  body: z.string().trim().optional(),
  references: z.string().trim().max(4000).optional(),
});

export const billPublishSchema = billDraftSchema
  .extend({
    title: z
      .string()
      .trim()
      .min(12, "Use a clearer bill title before publishing (at least 12 characters).")
      .max(200, "Keep the bill title under 200 characters.")
      .refine(
        (value) => !placeholderTitlePattern.test(value),
        "Choose a specific public-facing title before publishing.",
      ),
    description: z
      .string()
      .trim()
      .min(40, "Add a clearer public description before publishing (at least 40 characters)."),
    problem: z
      .string()
      .trim()
      .min(40, "Describe the public problem in more detail before publishing."),
    proposedSolution: z
      .string()
      .trim()
      .min(40, "Add a clearer proposed solution before publishing."),
    body: z
      .string()
      .trim()
      .min(120, "Add more draft bill text before publishing (at least 120 characters)."),
  });

export function canPublishBillFields(bill: {
  title?: string | null;
  description: string | null;
  problem: string | null;
  proposedSolution: string | null;
  body: string | null;
}) {
  return billPublishSchema.safeParse({
    title: bill.title ?? "Published public bill draft",
    description: bill.description ?? "",
    problem: bill.problem ?? "",
    proposedSolution: bill.proposedSolution ?? "",
    body: bill.body ?? "",
  }).success;
}
