import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BILL_LAYOUT_STORAGE_KEY,
  DEFAULT_BILL_LAYOUT,
  loadBillLayout,
  parseBillLayout,
  saveBillLayout,
  subscribeToBillLayout,
} from "@/lib/layout-preference";

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

afterEach(() => {
  removeWindow();
});

describe("parseBillLayout", () => {
  it("accepts grid", () => {
    expect(parseBillLayout("grid")).toBe("grid");
  });

  it("accepts list", () => {
    expect(parseBillLayout("list")).toBe("list");
  });

  it("defaults for unknown, null, or undefined values", () => {
    expect(parseBillLayout("cards")).toBe(DEFAULT_BILL_LAYOUT);
    expect(parseBillLayout(null)).toBe(DEFAULT_BILL_LAYOUT);
    expect(parseBillLayout(undefined)).toBe(DEFAULT_BILL_LAYOUT);
  });
});

describe("loadBillLayout", () => {
  it("returns the default without a browser window", () => {
    removeWindow();

    expect(loadBillLayout()).toBe(DEFAULT_BILL_LAYOUT);
  });

  it("returns the default when localStorage access throws", () => {
    setWindow({
      get localStorage() {
        throw new Error("denied");
      },
    });

    expect(loadBillLayout()).toBe(DEFAULT_BILL_LAYOUT);
  });

  it("uses window.localStorage when no storage is passed", () => {
    const storage = createStorageMock();
    storage.map.set(BILL_LAYOUT_STORAGE_KEY, "grid");
    setWindow({ localStorage: storage });

    expect(loadBillLayout()).toBe("grid");
  });

  it("returns the default when nothing is stored", () => {
    const storage = createStorageMock();

    expect(loadBillLayout(storage as unknown as Storage)).toBe(
      DEFAULT_BILL_LAYOUT,
    );
  });

  it("reads a stored layout", () => {
    const storage = createStorageMock();
    storage.map.set(BILL_LAYOUT_STORAGE_KEY, "grid");

    expect(loadBillLayout(storage as unknown as Storage)).toBe("grid");
    storage.map.set(BILL_LAYOUT_STORAGE_KEY, "list");
    expect(loadBillLayout(storage as unknown as Storage)).toBe("list");
  });

  it("returns the default when reading throws", () => {
    const storage = {
      ...createStorageMock(),
      getItem: vi.fn(() => {
        throw new Error("denied");
      }),
    };

    expect(loadBillLayout(storage as unknown as Storage)).toBe(
      DEFAULT_BILL_LAYOUT,
    );
  });
});

describe("saveBillLayout", () => {
  it("returns false without a browser window", () => {
    removeWindow();

    expect(saveBillLayout("grid")).toBe(false);
  });

  it("stores the layout and notifies subscribers", () => {
    const storage = createStorageMock();
    const listener = vi.fn();
    const unsubscribe = subscribeToBillLayout(listener);

    expect(saveBillLayout("grid", storage as unknown as Storage)).toBe(true);
    expect(storage.map.get(BILL_LAYOUT_STORAGE_KEY)).toBe("grid");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    expect(saveBillLayout("list", storage as unknown as Storage)).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(storage.map.get(BILL_LAYOUT_STORAGE_KEY)).toBe("list");
  });

  it("returns false when writing throws", () => {
    const storage = {
      ...createStorageMock(),
      setItem: vi.fn(() => {
        throw new Error("quota");
      }),
    };

    expect(saveBillLayout("grid", storage as unknown as Storage)).toBe(false);
  });
});
