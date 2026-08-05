import { describe, expect, it } from "vitest";

import {
  billDraftSchema,
  billPublishSchema,
  canPublishBillFields,
} from "@/lib/bill-form-schema";

describe("bill form schema", () => {
  it("requires complete fields before publishing", () => {
    const parsed = billPublishSchema.safeParse({
      title: "Clean Water Access Bill",
      description: "Too short",
      problem: "Too short",
      proposedSolution: "Too short",
      body: "Too short",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects placeholder titles before publishing", () => {
    const parsed = billPublishSchema.safeParse({
      title: "test",
      description:
        "A public bill to improve transparent water quality reporting across districts.",
      problem:
        "Communities lack timely access to drinking water quality reports from local bodies.",
      proposedSolution:
        "Require local authorities to publish monthly water quality updates in a public portal.",
      body: "1. Short title\n2. Duties of public authorities\n3. Citizen access and reporting.\n4. Oversight and penalties.",
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts publish-ready bill fields", () => {
    expect(
      canPublishBillFields({
        title: "Clean Water Access Bill",
        description:
          "A public bill to improve transparent water quality reporting across districts.",
        problem:
          "Communities lack timely access to drinking water quality reports from local bodies.",
        proposedSolution:
          "Require local authorities to publish monthly water quality updates in a public portal.",
        body: "1. Short title\n2. Duties of public authorities\n3. Citizen access and reporting.\n4. Oversight and penalties for delayed disclosure.",
      }),
    ).toBe(true);
  });

  it("rejects incomplete publish fields and null coalescing defaults", () => {
    expect(
      canPublishBillFields({
        title: null,
        description: null,
        problem: null,
        proposedSolution: null,
        body: null,
      }),
    ).toBe(false);
  });

  it("validates draft schema minimums", () => {
    expect(
      billDraftSchema.safeParse({
        title: "ab",
      }).success,
    ).toBe(false);
    expect(
      billDraftSchema.safeParse({
        title: "Clean Water Access Bill",
        references: "x".repeat(4001),
      }).success,
    ).toBe(false);
    expect(
      billDraftSchema.safeParse({
        title: "Clean Water Access Bill",
      }).success,
    ).toBe(true);
  });
});
