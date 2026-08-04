import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BILL_DRAFT_STORAGE_KEY,
  clearBillDraft,
  countBillDraftFilledFields,
  EMPTY_BILL_DRAFT_FIELDS,
  getBillDraftDisplayTitle,
  hasBillDraftContent,
  loadBillDraft,
  parseBillDraft,
  saveBillDraft,
  type BillDraftFields,
} from "@/lib/draft-storage";

function createStorageMock() {
  const map = new Map<string, string>();

  return {
    map,
    getItem: vi.fn((key: string) => map.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      map.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      map.delete(key);
    }),
  };
}

function setWindow(value: unknown) {
  (globalThis as { window?: unknown }).window = value;
}

function removeWindow() {
  delete (globalThis as { window?: unknown }).window;
}

const sampleFields: BillDraftFields = {
  ...EMPTY_BILL_DRAFT_FIELDS,
  title: "Kerala Public Health Data Transparency Bill",
  problem: "Public health data is not published in a usable form.",
};

const VALID_SAVED_AT = "2026-08-04T09:30:00.000Z";

afterEach(() => {
  removeWindow();
});

describe("hasBillDraftContent", () => {
  it("returns false when every field is blank", () => {
    expect(hasBillDraftContent(EMPTY_BILL_DRAFT_FIELDS)).toBe(false);
  });

  it("returns false when fields contain only whitespace", () => {
    expect(
      hasBillDraftContent({ ...EMPTY_BILL_DRAFT_FIELDS, tags: "   " }),
    ).toBe(false);
  });

  it("returns true when any field has content", () => {
    expect(hasBillDraftContent(sampleFields)).toBe(true);
  });
});

describe("countBillDraftFilledFields", () => {
  it("returns zero for a blank draft", () => {
    expect(countBillDraftFilledFields(EMPTY_BILL_DRAFT_FIELDS)).toBe(0);
  });

  it("ignores whitespace-only fields", () => {
    expect(
      countBillDraftFilledFields({ ...EMPTY_BILL_DRAFT_FIELDS, tags: "   " }),
    ).toBe(0);
  });

  it("counts every field that has content", () => {
    expect(countBillDraftFilledFields(sampleFields)).toBe(2);
    expect(
      countBillDraftFilledFields({
        ...sampleFields,
        category: "Health",
        body: "Text",
      }),
    ).toBe(4);
  });
});

describe("getBillDraftDisplayTitle", () => {
  it("returns the trimmed title when present", () => {
    expect(
      getBillDraftDisplayTitle({
        ...EMPTY_BILL_DRAFT_FIELDS,
        title: "  My Bill ",
      }),
    ).toBe("My Bill");
  });

  it("falls back to a placeholder for blank titles", () => {
    expect(getBillDraftDisplayTitle(EMPTY_BILL_DRAFT_FIELDS)).toBe(
      "Untitled draft",
    );
    expect(
      getBillDraftDisplayTitle({ ...EMPTY_BILL_DRAFT_FIELDS, title: "   " }),
    ).toBe("Untitled draft");
  });
});

describe("parseBillDraft", () => {
  it("returns null for invalid JSON", () => {
    expect(parseBillDraft("{not-json")).toBeNull();
  });

  it("returns null when the payload is not an object", () => {
    expect(parseBillDraft("42")).toBeNull();
    expect(parseBillDraft("null")).toBeNull();
  });

  it("returns null when fields are missing or not an object", () => {
    expect(
      parseBillDraft(JSON.stringify({ savedAt: VALID_SAVED_AT })),
    ).toBeNull();
    expect(
      parseBillDraft(JSON.stringify({ fields: null, savedAt: VALID_SAVED_AT })),
    ).toBeNull();
    expect(
      parseBillDraft(
        JSON.stringify({ fields: "title", savedAt: VALID_SAVED_AT }),
      ),
    ).toBeNull();
  });

  it("returns null when every stored field is blank", () => {
    expect(
      parseBillDraft(
        JSON.stringify({
          fields: EMPTY_BILL_DRAFT_FIELDS,
          savedAt: VALID_SAVED_AT,
        }),
      ),
    ).toBeNull();
  });

  it("ignores non-string field values", () => {
    const parsed = parseBillDraft(
      JSON.stringify({
        fields: { title: 123, problem: "A real problem" },
        savedAt: VALID_SAVED_AT,
      }),
    );

    expect(parsed?.fields.title).toBe("");
    expect(parsed?.fields.problem).toBe("A real problem");
  });

  it("keeps a valid savedAt value", () => {
    const parsed = parseBillDraft(
      JSON.stringify({ fields: sampleFields, savedAt: VALID_SAVED_AT }),
    );

    expect(parsed).toEqual({ fields: sampleFields, savedAt: VALID_SAVED_AT });
  });

  it("falls back to the current time when savedAt is missing", () => {
    const parsed = parseBillDraft(JSON.stringify({ fields: sampleFields }));

    expect(parsed?.fields).toEqual(sampleFields);
    expect(Number.isNaN(Date.parse(parsed?.savedAt ?? ""))).toBe(false);
  });

  it("falls back to the current time when savedAt is blank", () => {
    const parsed = parseBillDraft(
      JSON.stringify({ fields: sampleFields, savedAt: "" }),
    );

    expect(Number.isNaN(Date.parse(parsed?.savedAt ?? ""))).toBe(false);
  });

  it("falls back to the current time when savedAt is not a date", () => {
    const parsed = parseBillDraft(
      JSON.stringify({ fields: sampleFields, savedAt: "not-a-date" }),
    );

    expect(Number.isNaN(Date.parse(parsed?.savedAt ?? ""))).toBe(false);
  });
});

describe("loadBillDraft", () => {
  it("returns null without a browser window", () => {
    removeWindow();

    expect(loadBillDraft()).toBeNull();
  });

  it("returns null when localStorage access throws", () => {
    setWindow({
      get localStorage() {
        throw new Error("denied");
      },
    });

    expect(loadBillDraft()).toBeNull();
  });

  it("uses window.localStorage when no storage is passed", () => {
    const storage = createStorageMock();
    setWindow({ localStorage: storage });
    saveBillDraft(sampleFields);

    expect(loadBillDraft()?.fields).toEqual(sampleFields);
  });

  it("returns null when nothing is stored", () => {
    const storage = createStorageMock();

    expect(loadBillDraft(storage as unknown as Storage)).toBeNull();
  });

  it("returns null when the stored payload is invalid", () => {
    const storage = createStorageMock();
    storage.map.set(BILL_DRAFT_STORAGE_KEY, "{broken");

    expect(loadBillDraft(storage as unknown as Storage)).toBeNull();
  });

  it("returns null when reading storage throws", () => {
    const storage = {
      ...createStorageMock(),
      getItem: vi.fn(() => {
        throw new Error("denied");
      }),
    };

    expect(loadBillDraft(storage as unknown as Storage)).toBeNull();
  });

  it("restores a stored draft", () => {
    const storage = createStorageMock();
    storage.map.set(
      BILL_DRAFT_STORAGE_KEY,
      JSON.stringify({ fields: sampleFields, savedAt: VALID_SAVED_AT }),
    );

    expect(loadBillDraft(storage as unknown as Storage)).toEqual({
      fields: sampleFields,
      savedAt: VALID_SAVED_AT,
    });
  });
});

describe("saveBillDraft", () => {
  it("returns false without a browser window", () => {
    removeWindow();

    expect(saveBillDraft(sampleFields)).toBe(false);
  });

  it("removes the stored draft when every field is blank", () => {
    const storage = createStorageMock();
    storage.map.set(BILL_DRAFT_STORAGE_KEY, "stale");

    expect(
      saveBillDraft(EMPTY_BILL_DRAFT_FIELDS, storage as unknown as Storage),
    ).toBe(true);
    expect(storage.removeItem).toHaveBeenCalledWith(BILL_DRAFT_STORAGE_KEY);
    expect(storage.map.has(BILL_DRAFT_STORAGE_KEY)).toBe(false);
  });

  it("stores the draft with a savedAt timestamp", () => {
    const storage = createStorageMock();

    expect(saveBillDraft(sampleFields, storage as unknown as Storage)).toBe(
      true,
    );

    const stored = JSON.parse(storage.map.get(BILL_DRAFT_STORAGE_KEY) ?? "");
    expect(stored.fields).toEqual(sampleFields);
    expect(Number.isNaN(Date.parse(stored.savedAt))).toBe(false);
  });

  it("returns false when writing throws", () => {
    const storage = {
      ...createStorageMock(),
      setItem: vi.fn(() => {
        throw new Error("quota");
      }),
    };

    expect(saveBillDraft(sampleFields, storage as unknown as Storage)).toBe(
      false,
    );
  });

  it("returns false when clearing blank fields throws", () => {
    const storage = {
      ...createStorageMock(),
      removeItem: vi.fn(() => {
        throw new Error("denied");
      }),
    };

    expect(
      saveBillDraft(EMPTY_BILL_DRAFT_FIELDS, storage as unknown as Storage),
    ).toBe(false);
  });
});

describe("clearBillDraft", () => {
  it("returns false without a browser window", () => {
    removeWindow();

    expect(clearBillDraft()).toBe(false);
  });

  it("removes the stored draft", () => {
    const storage = createStorageMock();
    storage.map.set(BILL_DRAFT_STORAGE_KEY, "draft");

    expect(clearBillDraft(storage as unknown as Storage)).toBe(true);
    expect(storage.map.has(BILL_DRAFT_STORAGE_KEY)).toBe(false);
  });

  it("returns false when removing throws", () => {
    const storage = {
      ...createStorageMock(),
      removeItem: vi.fn(() => {
        throw new Error("denied");
      }),
    };

    expect(clearBillDraft(storage as unknown as Storage)).toBe(false);
  });
});
