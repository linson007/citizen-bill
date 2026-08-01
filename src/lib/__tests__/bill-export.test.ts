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

  it("paginates long PDF exports", () => {
    const pdf = createPdf(
      Array.from({ length: 140 }, (_, index) => `Line ${index + 1}`),
    );
    const text = new TextDecoder().decode(pdf);

    expect(text).toContain("/Count 3");
  });

  it("creates a DOCX zip byte stream", () => {
    const docx = createDocx(["MattamUndo", "Public water access"]);

    expect(Array.from(docx.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(docx.length).toBeGreaterThan(100);
  });
});
