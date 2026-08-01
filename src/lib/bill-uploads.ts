import { slugify } from "@/lib/slug";

export const MAX_BILL_UPLOAD_BYTES = 10 * 1024 * 1024;

const allowedUploadTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const allowedUploadExtensions = new Set(["pdf", "docx"]);

export function sanitizeUploadFileName(fileName: string) {
  const trimmed = fileName.trim();
  const extension = getFileExtension(trimmed);
  const baseName = extension
    ? trimmed.slice(0, -(extension.length + 1))
    : trimmed;
  const safeBaseName = slugify(baseName).slice(0, 60) || "attachment";

  return extension ? `${safeBaseName}.${extension}` : safeBaseName;
}

export function createBillUploadKey({
  billId,
  fileName,
  nonce = crypto.randomUUID(),
  now = new Date(),
}: {
  billId: string;
  fileName: string;
  nonce?: string;
  now?: Date;
}) {
  return [
    "bills",
    billId,
    `${now.getTime().toString(36)}-${nonce}`,
    sanitizeUploadFileName(fileName),
  ].join("/");
}

export function isAllowedBillUploadMetadata(file: {
  name: string;
  type: string;
  size: number;
}) {
  if (file.size <= 0 || file.size > MAX_BILL_UPLOAD_BYTES) {
    return false;
  }

  const extension = getFileExtension(file.name);

  return (
    allowedUploadTypes.has(file.type) && allowedUploadExtensions.has(extension)
  );
}

export async function hasAllowedBillUploadSignature(file: File) {
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());

  if (file.type === "application/pdf") {
    return startsWith(header, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  }

  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return startsWith(header, [0x50, 0x4b, 0x03, 0x04]);
  }

  return false;
}

function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension || extension === fileName.toLowerCase()) {
    return "";
  }

  return extension;
}

function startsWith(bytes: Uint8Array, expected: number[]) {
  return expected.every((byte, index) => bytes[index] === byte);
}
