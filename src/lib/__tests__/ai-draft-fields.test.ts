import { describe, expect, it } from "vitest";

import {
  parseAiDraftFieldsFromText,
  parseAiTitleCategorySuggestion,
} from "@/lib/ai-draft-fields";

describe("parseAiDraftFieldsFromText", () => {
  it("maps labeled AI draft sections into form fields", () => {
    const fields = parseAiDraftFieldsFromText(`
Short Description:
Create a public reporting duty for medicine availability.

Proposed Solution:
Hospitals should publish monthly stock and service data.

Expected Public Impact:
Citizens can plan care and identify shortages earlier.

Draft Bill Text:
1. Short title
2. Publication duty
`);

    expect(fields).toEqual({
      title: "",
      description: "Create a public reporting duty for medicine availability.",
      category: "",
      categoryOther: "",
      tags: "",
      problem: "",
      proposedSolution:
        "Hospitals should publish monthly stock and service data.",
      expectedImpact: "Citizens can plan care and identify shortages earlier.",
      body: "1. Short title\n2. Publication duty",
      references: "",
    });
  });

  it("supports numbered headings and inline values", () => {
    const fields = parseAiDraftFieldsFromText(`
1. Short Description: Public service accountability proposal.
2. Proposed Solution: Define duties and reporting.
3. Expected Impact: Better transparency.
4. Draft Bill: Clause 1
Clause 2
`);

    expect(fields?.description).toBe("Public service accountability proposal.");
    expect(fields?.proposedSolution).toBe("Define duties and reporting.");
    expect(fields?.expectedImpact).toBe("Better transparency.");
    expect(fields?.body).toBe("Clause 1\nClause 2");
  });

  it("returns null when no known headings exist", () => {
    expect(parseAiDraftFieldsFromText("Plain chat response")).toBeNull();
  });

  it("returns null for blank input", () => {
    expect(parseAiDraftFieldsFromText("   ")).toBeNull();
  });

  it("derives a short description from draft bill text when missing", () => {
    const fields = parseAiDraftFieldsFromText(`
Draft Bill Text:
First clause about water quality reporting.
Second clause about oversight.
`);

    expect(fields).toEqual({
      title: "",
      description: "First clause about water quality reporting.",
      category: "",
      categoryOther: "",
      tags: "",
      problem: "",
      proposedSolution: "",
      expectedImpact: "",
      body: "First clause about water quality reporting.\nSecond clause about oversight.",
      references: "",
    });
  });

  it("ignores empty headed sections and markdown-style headings", () => {
    const fields = parseAiDraftFieldsFromText(`
# Description:
Public water accountability draft.

## Proposed Solution:

### Expected Impact:
Better oversight for citizens.
`);

    expect(fields).toEqual({
      title: "",
      description: "Public water accountability draft.",
      category: "",
      categoryOther: "",
      tags: "",
      problem: "",
      proposedSolution: "",
      expectedImpact: "Better oversight for citizens.",
      body: "",
      references: "",
    });
  });

  it("maps every form-ready section from an AI chat response", () => {
    const fields = parseAiDraftFieldsFromText(`
Title: Clean Water Transparency Bill
Category: Environment
Tags: water, transparency
Problem Statement: Residents cannot easily see water quality results.
Short Description: Publish water quality data for public review.
Proposed Solution: Require regular public reporting.
Expected Public Impact: Residents can make informed decisions.
Draft Bill Text: Clause 1: Public reporting duty.
References: Kerala water quality reports.
`);

    expect(fields).toEqual({
      title: "Clean Water Transparency Bill",
      description: "Publish water quality data for public review.",
      category: "Environment",
      categoryOther: "",
      tags: "water, transparency",
      problem: "Residents cannot easily see water quality results.",
      proposedSolution: "Require regular public reporting.",
      expectedImpact: "Residents can make informed decisions.",
      body: "Clause 1: Public reporting duty.",
      references: "Kerala water quality reports.",
    });
  });
});

describe("parseAiTitleCategorySuggestion", () => {
  it("accepts a title and a known category without changing its canonical name", () => {
    expect(
      parseAiTitleCategorySuggestion(
        '{"title":"Kerala Medicine Availability Transparency Bill","category":"health"}',
      ),
    ).toEqual({
      title: "Kerala Medicine Availability Transparency Bill",
      category: "Health",
    });
  });

  it("maps Other to the form's dedicated category value", () => {
    expect(
      parseAiTitleCategorySuggestion(
        '{"title":"Public Services Bill","category":"Other"}',
      ),
    ).toEqual({
      title: "Public Services Bill",
      category: "__other__",
    });
  });

  it("rejects missing fields and categories outside the allowed list", () => {
    expect(
      parseAiTitleCategorySuggestion(
        '{"title":"Public Services Bill","category":"Infrastructure"}',
      ),
    ).toBeNull();
    expect(parseAiTitleCategorySuggestion('{"category":"Health"}')).toBeNull();
  });
});
