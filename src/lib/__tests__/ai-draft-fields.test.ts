import { describe, expect, it } from "vitest";

import { parseAiDraftFieldsFromText } from "@/lib/ai-draft-fields";

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
      description: "Create a public reporting duty for medicine availability.",
      proposedSolution:
        "Hospitals should publish monthly stock and service data.",
      expectedImpact: "Citizens can plan care and identify shortages earlier.",
      body: "1. Short title\n2. Publication duty",
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
});
