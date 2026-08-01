import { describe, expect, it } from "vitest";

import {
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

  it("accepts publish-ready bill fields", () => {
    expect(
      canPublishBillFields({
        description:
          "A public bill to improve transparent water quality reporting.",
        problem:
          "Communities lack timely access to drinking water quality reports.",
        proposedSolution:
          "Require local authorities to publish monthly water quality updates.",
        body: "1. Short title\n2. Duties of public authorities\n3. Citizen access and reporting.",
      }),
    ).toBe(true);
  });
});
