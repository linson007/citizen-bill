"use client";

import { useSyncExternalStore } from "react";
import { useRef, useState } from "react";
import Link from "next/link";
import { PenLine, Trash2 } from "lucide-react";

import {
  clearBillDraft,
  countBillDraftFilledFields,
  BILL_DRAFT_FIELD_KEYS,
  getBillDraftDisplayTitle,
  loadBillDraft,
  type StoredBillDraft,
} from "@/lib/draft-storage";
import { formatRelativeTime } from "@/lib/relative-time";

function subscribeToBillDraft() {
  return () => {};
}

export function ContinueDraftCard() {
  const snapshotRef = useRef<StoredBillDraft | null | undefined>(undefined);
  const [dismissed, setDismissed] = useState(false);

  const draft = useSyncExternalStore(
    subscribeToBillDraft,
    () => {
      if (snapshotRef.current === undefined) {
        snapshotRef.current = loadBillDraft();
      }

      return snapshotRef.current;
    },
    () => null,
  );

  if (dismissed || !draft) {
    return null;
  }

  const filled = countBillDraftFilledFields(draft.fields);
  const total = BILL_DRAFT_FIELD_KEYS.length;

  function discardDraft() {
    clearBillDraft();
    setDismissed(true);
  }

  return (
    <section
      aria-label="Continue your saved draft"
      className="mb-6 rounded-lg border border-[#123c69]/30 bg-[#e4eef6] p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#123c69] text-white">
            <PenLine size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold text-[#123c69]">
              Continue your saved draft
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#3f3a32]">
              <span className="font-semibold">
                {getBillDraftDisplayTitle(draft.fields)}
              </span>{" "}
              · {filled} of {total} fields filled · last saved{" "}
              {formatRelativeTime(new Date(draft.savedAt), "en")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={discardDraft}
            className="flex h-10 items-center gap-2 rounded-md border border-[#123c69]/30 bg-white px-3 text-sm font-semibold text-[#123c69]"
          >
            <Trash2 size={16} aria-hidden="true" />
            Discard
          </button>
          <Link
            href="/bills/new"
            className="flex h-10 items-center gap-2 rounded-md bg-[#123c69] px-4 text-sm font-semibold text-white shadow-sm"
          >
            <PenLine size={16} aria-hidden="true" />
            Continue drafting
          </Link>
        </div>
      </div>
    </section>
  );
}
