import { z } from "zod";

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

export const billPublishSchema = billDraftSchema.extend({
  description: z
    .string()
    .trim()
    .min(20, "Add a public description before publishing."),
  problem: z
    .string()
    .trim()
    .min(20, "Describe the public problem before publishing."),
  proposedSolution: z
    .string()
    .trim()
    .min(20, "Add a proposed solution before publishing."),
  body: z.string().trim().min(30, "Add draft bill text before publishing."),
});

export function canPublishBillFields(bill: {
  description: string | null;
  problem: string | null;
  proposedSolution: string | null;
  body: string | null;
}) {
  return billPublishSchema.safeParse({
    title: "Published bill",
    description: bill.description ?? "",
    problem: bill.problem ?? "",
    proposedSolution: bill.proposedSolution ?? "",
    body: bill.body ?? "",
  }).success;
}
