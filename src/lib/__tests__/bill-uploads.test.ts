import { describe, expect, it } from "vitest";

import {
  createBillUploadKey,
  hasAllowedBillUploadSignature,
  isAllowedBillUploadMetadata,
  sanitizeUploadFileName,
} from "@/lib/bill-uploads";

describe("bill upload helpers", () => {
  it("sanitizes uploaded file names", () => {
    expect(sanitizeUploadFileName(" My Private Draft (Final)!!.pdf ")).toBe(
      "my-private-draft-final.pdf",
    );
  });

  it("creates namespaced blob keys without raw file names", () => {
    expect(
      createBillUploadKey({
        billId: "bill-1",
        fileName: "../secret draft.pdf",
        nonce: "nonce-1",
        now: new Date("2026-05-16T00:00:00.000Z"),
      }),
    ).toBe("bills/bill-1/mp7kxs00-nonce-1/secret-draft.pdf");
  });

  it("requires allowed MIME types, extensions, and sizes", () => {
    expect(
      isAllowedBillUploadMetadata({
        name: "draft.pdf",
        type: "application/pdf",
        size: 100,
      }),
    ).toBe(true);
    expect(
      isAllowedBillUploadMetadata({
        name: "draft.exe",
        type: "application/pdf",
        size: 100,
      }),
    ).toBe(false);
  });

  it("checks PDF and DOCX signatures", async () => {
    await expect(
      hasAllowedBillUploadSignature(
        new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], "a.pdf", {
          type: "application/pdf",
        }),
      ),
    ).resolves.toBe(true);
    await expect(
      hasAllowedBillUploadSignature(
        new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04])], "a.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
      ),
    ).resolves.toBe(true);
  });
});
