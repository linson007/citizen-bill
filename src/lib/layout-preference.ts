export const BILL_LAYOUT_STORAGE_KEY = "mattamundo.bill-layout.v1";

export const BILL_LAYOUTS = ["list", "grid"] as const;

export type BillLayout = (typeof BILL_LAYOUTS)[number];

export const DEFAULT_BILL_LAYOUT: BillLayout = "list";

const layoutListeners = new Set<() => void>();

export function subscribeToBillLayout(listener: () => void): () => void {
  layoutListeners.add(listener);

  return () => {
    layoutListeners.delete(listener);
  };
}

function emitBillLayoutChange() {
  for (const listener of layoutListeners) {
    listener();
  }
}

export function parseBillLayout(value: string | null | undefined): BillLayout {
  return value === "grid" ? "grid" : DEFAULT_BILL_LAYOUT;
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

export function loadBillLayout(storage?: Storage | null): BillLayout {
  const resolved = resolveStorage(storage);

  if (!resolved) {
    return DEFAULT_BILL_LAYOUT;
  }

  try {
    return parseBillLayout(resolved.getItem(BILL_LAYOUT_STORAGE_KEY));
  } catch {
    return DEFAULT_BILL_LAYOUT;
  }
}

export function saveBillLayout(
  layout: BillLayout,
  storage?: Storage | null,
): boolean {
  const resolved = resolveStorage(storage);

  if (!resolved) {
    return false;
  }

  try {
    resolved.setItem(BILL_LAYOUT_STORAGE_KEY, layout);
    emitBillLayoutChange();
    return true;
  } catch {
    return false;
  }
}
