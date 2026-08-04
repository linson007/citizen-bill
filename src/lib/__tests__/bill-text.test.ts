import { describe, expect, it } from "vitest";

import {
  billSectionId,
  countBillTextWords,
  estimateReadingTimeMinutes,
  extractBillSections,
  isBillSectionHash,
  matchBillTextHeading,
  splitBillTextParagraphs,
} from "@/lib/bill-text";

function words(count: number): string {
  return Array.from({ length: count }, (_, index) => `word${index}`).join(" ");
}

describe("countBillTextWords", () => {
  it("returns zero for blank text", () => {
    expect(countBillTextWords("")).toBe(0);
    expect(countBillTextWords("   \n  ")).toBe(0);
  });

  it("counts whitespace-separated words", () => {
    expect(countBillTextWords("one two three")).toBe(3);
    expect(countBillTextWords("one\ntwo  three\n\nfour")).toBe(4);
  });
});

describe("estimateReadingTimeMinutes", () => {
  it("returns zero for blank text", () => {
    expect(estimateReadingTimeMinutes("")).toBe(0);
    expect(estimateReadingTimeMinutes("   ")).toBe(0);
  });

  it("rounds up to at least one minute", () => {
    expect(estimateReadingTimeMinutes("single")).toBe(1);
    expect(estimateReadingTimeMinutes(words(200))).toBe(1);
  });

  it("uses 200 words per minute", () => {
    expect(estimateReadingTimeMinutes(words(201))).toBe(2);
    expect(estimateReadingTimeMinutes(words(1000))).toBe(5);
  });
});

describe("splitBillTextParagraphs", () => {
  it("splits on blank lines", () => {
    expect(splitBillTextParagraphs("a\n\nb\n\n\nc")).toEqual(["a", "b", "c"]);
  });

  it("keeps single line breaks inside a paragraph", () => {
    expect(splitBillTextParagraphs("a\nb")).toEqual(["a\nb"]);
  });
});

describe("matchBillTextHeading", () => {
  it("matches markdown headings", () => {
    expect(matchBillTextHeading("## Preamble")).toBe("Preamble");
    expect(matchBillTextHeading("### Definitions")).toBe("Definitions");
    expect(matchBillTextHeading("# Title")).toBe("Title");
  });

  it("matches bold-only paragraphs", () => {
    expect(matchBillTextHeading("**Preamble**")).toBe("Preamble");
    expect(matchBillTextHeading("**Preamble")).toBe("Preamble");
  });

  it("returns null for regular paragraphs", () => {
    expect(matchBillTextHeading("A regular paragraph.")).toBeNull();
    expect(matchBillTextHeading("#### Too deep")).toBeNull();
  });

  it("keeps trailing text inside bold headings like the renderer", () => {
    expect(matchBillTextHeading("**Bold** with trailing text")).toBe(
      "Bold** with trailing text",
    );
  });
});

describe("billSectionId", () => {
  it("creates stable positional ids", () => {
    expect(billSectionId(0)).toBe("bill-section-0");
    expect(billSectionId(3)).toBe("bill-section-3");
  });
});

describe("extractBillSections", () => {
  it("returns an empty list without headings", () => {
    expect(extractBillSections("Just a paragraph.\n\nAnother one.")).toEqual(
      [],
    );
    expect(extractBillSections("")).toEqual([]);
  });

  it("collects headings with positional ids", () => {
    const text = [
      "## Preamble",
      "Context for the bill.",
      "**Definitions**",
      "Meaning of terms.",
      "### Obligations",
      "Duties of agencies.",
    ].join("\n\n");

    expect(extractBillSections(text)).toEqual([
      { id: "bill-section-0", title: "Preamble" },
      { id: "bill-section-1", title: "Definitions" },
      { id: "bill-section-2", title: "Obligations" },
    ]);
  });
});

describe("isBillSectionHash", () => {
  it("accepts section hashes", () => {
    expect(isBillSectionHash("#bill-section-0")).toBe(true);
    expect(isBillSectionHash("#bill-section-12")).toBe(true);
  });

  it("rejects other hashes", () => {
    expect(isBillSectionHash("#comments")).toBe(false);
    expect(isBillSectionHash("#summary")).toBe(false);
    expect(isBillSectionHash("")).toBe(false);
  });
});
