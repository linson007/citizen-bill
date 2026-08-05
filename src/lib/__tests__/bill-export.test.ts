import { describe, expect, it } from "vitest";

import { createDocx, createPdf, safeBillExportFileName } from "@/lib/bill-export";

describe("bill export helpers", () => {
  it("sanitizes bill slugs for attachment file names", () => {
    expect(safeBillExportFileName("Kerala Water Bill 2026!")).toBe(
      "kerala-water-bill-2026-",
    );
  });

  it("creates a PDF byte stream", () => {
    const pdf = createPdf(["MattamUndo", "Public water access"]);
    const text = new TextDecoder().decode(pdf.slice(0, 8));

    expect(text).toBe("%PDF-1.4");
    expect(pdf.length).toBeGreaterThan(100);
  });

  it("escapes PDF special characters and wraps long lines", () => {
    const longWord = "a".repeat(100);
    const pdf = createPdf([
      "",
      longWord,
      `Intro (note) \\path ${longWord}`,
      "short then " + "word".repeat(30),
      "   ",
    ]);
    const text = new TextDecoder().decode(pdf);

    expect(text).toContain("\\(");
    expect(text).toContain("\\)");
    expect(text).toContain("\\\\");
    expect(text).toContain("/Count 1");
  });

  it("paginates long PDF exports", () => {
    const pdf = createPdf(
      Array.from({ length: 140 }, (_, index) => `Line ${index + 1}`),
    );
    const text = new TextDecoder().decode(pdf);

    expect(text).toContain("/Count 3");
  });

  it("creates an empty PDF page when no lines are provided", () => {
    const pdf = createPdf([]);
    const text = new TextDecoder().decode(pdf);

    expect(text).toContain("/Count 1");
  });

  it("creates a DOCX zip byte stream", () => {
    const docx = createDocx([
      "MattamUndo & Water",
      "Public <water> access > quality",
    ]);

    expect(Array.from(docx.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(docx.length).toBeGreaterThan(100);
    expect(new TextDecoder().decode(docx)).toContain("&amp;");
  });
});
