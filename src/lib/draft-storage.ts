export const BILL_DRAFT_STORAGE_KEY = "mattamundo.bill-draft.v1";

export type BillDraftFields = {
  title: string;
  description: string;
  category: string;
  categoryOther: string;
  tags: string;
  problem: string;
  proposedSolution: string;
  expectedImpact: string;
  body: string;
  references: string;
};

export type StoredBillDraft = {
  fields: BillDraftFields;
  savedAt: string;
};

export const BILL_DRAFT_FIELD_KEYS = [
  "title",
  "description",
  "category",
  "categoryOther",
  "tags",
  "problem",
  "proposedSolution",
  "expectedImpact",
  "body",
  "references",
] as const satisfies readonly (keyof BillDraftFields)[];

export const EMPTY_BILL_DRAFT_FIELDS: BillDraftFields = {
  title: "",
  description: "",
  category: "",
  categoryOther: "",
  tags: "",
  problem: "",
  proposedSolution: "",
  expectedImpact: "",
  body: "",
  references: "",
};

export function hasBillDraftContent(fields: BillDraftFields): boolean {
  return BILL_DRAFT_FIELD_KEYS.some((key) => fields[key].trim().length > 0);
}

function resolveStorage(storage?: Storage | null): Storage | null {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function parseBillDraft(raw: string): StoredBillDraft | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const candidate = parsed as { fields?: unknown; savedAt?: unknown };

  if (typeof candidate.fields !== "object" || candidate.fields === null) {
    return null;
  }

  const source = candidate.fields as Record<string, unknown>;
  const fields: BillDraftFields = { ...EMPTY_BILL_DRAFT_FIELDS };

  for (const key of BILL_DRAFT_FIELD_KEYS) {
    const value = source[key];

    if (typeof value === "string") {
      fields[key] = value;
    }
  }

  if (!hasBillDraftContent(fields)) {
    return null;
  }

  const savedAt =
    typeof candidate.savedAt === "string" &&
    candidate.savedAt.length > 0 &&
    !Number.isNaN(Date.parse(candidate.savedAt))
      ? candidate.savedAt
      : new Date().toISOString();

  return { fields, savedAt };
}

export function loadBillDraft(
  storage?: Storage | null,
): StoredBillDraft | null {
  const resolved = resolveStorage(storage);

  if (!resolved) {
    return null;
  }

  try {
    const raw = resolved.getItem(BILL_DRAFT_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return parseBillDraft(raw);
  } catch {
    return null;
  }
}

export function saveBillDraft(
  fields: BillDraftFields,
  storage?: Storage | null,
): boolean {
  const resolved = resolveStorage(storage);

  if (!resolved) {
    return false;
  }

  try {
    if (!hasBillDraftContent(fields)) {
      resolved.removeItem(BILL_DRAFT_STORAGE_KEY);
      return true;
    }

    const record: StoredBillDraft = {
      fields,
      savedAt: new Date().toISOString(),
    };

    resolved.setItem(BILL_DRAFT_STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearBillDraft(storage?: Storage | null): boolean {
  const resolved = resolveStorage(storage);

  if (!resolved) {
    return false;
  }

  try {
    resolved.removeItem(BILL_DRAFT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
