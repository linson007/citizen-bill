"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  List,
  MessageSquare,
  Share2,
  ThumbsUp,
  X,
} from "lucide-react";

import {
  hasBillResultEngagement,
  type BillResultItem,
} from "@/lib/bill-results";
import { formatDisplayTitle } from "@/lib/display-title";
import {
  getNextBillResultIndex,
  isKeyboardShortcutTarget,
} from "@/lib/bill-keyboard";
import {
  DEFAULT_BILL_LAYOUT,
  loadBillLayout,
  saveBillLayout,
  subscribeToBillLayout,
  type BillLayout,
} from "@/lib/layout-preference";
import type { Locale } from "@/lib/locale";
import { formatRelativeTime } from "@/lib/relative-time";
import { StatusBadge } from "@/components/status-badge";

export type BillResultsLabels = {
  results: string;
  clearFilters: string;
  votes: string;
  comments: string;
  shares: string;
  by: string;
  newProposal: string;
  layoutLabel: string;
  layoutList: string;
  layoutGrid: string;
  keyboardHint: string;
};

export function BillResults({
  bills,
  locale,
  labels,
  hasActiveFilters,
  total,
}: {
  bills: BillResultItem[];
  locale: Locale;
  labels: BillResultsLabels;
  hasActiveFilters: boolean;
  total?: number;
}) {
  const layout = useSyncExternalStore(
    subscribeToBillLayout,
    () => loadBillLayout(),
    () => DEFAULT_BILL_LAYOUT,
  );
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const resultRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const rovingResultIndex = Math.min(
    activeResultIndex,
    Math.max(bills.length - 1, 0),
  );

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isKeyboardShortcutTarget(event.target)
      ) {
        return;
      }

      if (event.key === "/") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>("[data-bill-search]")?.focus();
      }

      if (event.key.toLowerCase() === "g") {
        saveBillLayout("grid");
      }

      if (event.key.toLowerCase() === "l") {
        saveBillLayout("list");
      }
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  function moveResultFocus(currentIndex: number, direction: -1 | 1) {
    const nextIndex = getNextBillResultIndex({
      currentIndex,
      direction,
      total: bills.length,
    });

    if (nextIndex < 0) {
      return;
    }

    setActiveResultIndex(nextIndex);
    resultRefs.current[nextIndex]?.focus();
  }

  function handleResultKeyDown(
    event: React.KeyboardEvent<HTMLAnchorElement>,
    index: number,
  ) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      moveResultFocus(index, 1);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveResultFocus(index, -1);
      return;
    }

    if (event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="font-medium text-ink-soft" aria-live="polite">
          {(total ?? bills.length).toLocaleString()} {labels.results}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {hasActiveFilters ? (
            <Link
              href="/bills"
              className="inline-flex items-center gap-1.5 font-semibold text-accent transition-colors hover:text-hero-ink"
            >
              <X size={15} aria-hidden="true" />
              {labels.clearFilters}
            </Link>
          ) : null}
          <LayoutToggle layout={layout} labels={labels} />
        </div>
      </div>
      <p className="mb-4 text-xs text-ink-muted">{labels.keyboardHint}</p>

      {layout === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bills.map((bill, index) => (
            <BillCard
              key={bill.id}
              bill={bill}
              locale={locale}
              labels={labels}
              tabIndex={index === rovingResultIndex ? 0 : -1}
              resultRef={(element) => {
                resultRefs.current[index] = element;
              }}
              onFocus={() => setActiveResultIndex(index)}
              onKeyDown={(event) => handleResultKeyDown(event, index)}
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {bills.map((bill, index) => (
            <BillRow
              key={bill.id}
              bill={bill}
              locale={locale}
              labels={labels}
              tabIndex={index === rovingResultIndex ? 0 : -1}
              resultRef={(element) => {
                resultRefs.current[index] = element;
              }}
              onFocus={() => setActiveResultIndex(index)}
              onKeyDown={(event) => handleResultKeyDown(event, index)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function LayoutToggle({
  layout,
  labels,
}: {
  layout: BillLayout;
  labels: BillResultsLabels;
}) {
  return (
    <div
      role="group"
      aria-label={labels.layoutLabel}
      className="flex overflow-hidden rounded-md border border-border-strong"
    >
      <LayoutToggleButton
        active={layout === "list"}
        label={labels.layoutList}
        icon={List}
        onClick={() => saveBillLayout("list")}
      />
      <LayoutToggleButton
        active={layout === "grid"}
        label={labels.layoutGrid}
        icon={LayoutGrid}
        onClick={() => saveBillLayout("grid")}
      />
    </div>
  );
}

function LayoutToggleButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof List;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`grid size-9 place-items-center transition-colors ${
        active
          ? "bg-accent-solid text-white"
          : "bg-surface-raised text-ink-muted hover:text-foreground"
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}

function BillMeta({
  bill,
  locale,
  labels,
}: {
  bill: BillResultItem;
  locale: Locale;
  labels: BillResultsLabels;
}) {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
      <span>
        {labels.by} {bill.authorName}
      </span>
      {bill.publishedAt ? (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={bill.publishedAt}>
            {formatRelativeTime(new Date(bill.publishedAt), locale)}
          </time>
        </>
      ) : null}
    </p>
  );
}

function BillEngagement({
  bill,
  labels,
}: {
  bill: BillResultItem;
  labels: BillResultsLabels;
}) {
  if (!hasBillResultEngagement(bill)) {
    return (
      <p className="shrink-0 text-sm font-medium text-ink-muted">
        {labels.newProposal}
      </p>
    );
  }

  return (
    <div className="flex shrink-0 gap-2">
      <Metric icon={ThumbsUp} value={bill.votes} label={labels.votes} primary />
      <Metric
        icon={MessageSquare}
        value={bill.comments}
        label={labels.comments}
      />
      <Metric icon={Share2} value={bill.shares} label={labels.shares} />
    </div>
  );
}

function BillRow({
  bill,
  locale,
  labels,
  tabIndex,
  resultRef,
  onFocus,
  onKeyDown,
}: {
  bill: BillResultItem;
  locale: Locale;
  labels: BillResultsLabels;
  tabIndex: number;
  resultRef: (element: HTMLAnchorElement | null) => void;
  onFocus: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={`/bills/${bill.slug}`}
      ref={resultRef}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      className="block py-5 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {bill.categoryName ? <Badge>{bill.categoryName}</Badge> : null}
            <StatusBadge status={bill.status} />
          </div>
          <h2 className="font-display text-lg font-semibold leading-7 tracking-tight">
            {formatDisplayTitle(bill.title)}
          </h2>
          <p className="mt-2 max-w-3xl line-clamp-3 text-sm leading-6 text-ink-muted">
            {bill.description}
          </p>
          <BillMeta bill={bill} locale={locale} labels={labels} />
        </div>

        <BillEngagement bill={bill} labels={labels} />
      </div>
    </Link>
  );
}

function BillCard({
  bill,
  locale,
  labels,
  tabIndex,
  resultRef,
  onFocus,
  onKeyDown,
}: {
  bill: BillResultItem;
  locale: Locale;
  labels: BillResultsLabels;
  tabIndex: number;
  resultRef: (element: HTMLAnchorElement | null) => void;
  onFocus: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={`/bills/${bill.slug}`}
      ref={resultRef}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      className="flex flex-col rounded-lg border border-border bg-surface-raised p-5 shadow-sm transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {bill.categoryName ? <Badge>{bill.categoryName}</Badge> : null}
        <StatusBadge status={bill.status} />
      </div>
      <h2 className="font-display line-clamp-2 text-lg font-semibold leading-7 tracking-tight">
        {formatDisplayTitle(bill.title)}
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-muted">
        {bill.description}
      </p>
      <BillMeta bill={bill} locale={locale} labels={labels} />
      <div className="mt-4 border-t border-border pt-4">
        <BillEngagement bill={bill} labels={labels} />
      </div>
    </Link>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-border bg-surface-raised px-2.5 py-1 text-xs font-semibold text-ink-soft">
      {children}
    </span>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
  primary = false,
}: {
  icon: typeof ThumbsUp;
  value: number;
  label: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold ${
        primary ? "bg-accent-solid text-white" : "border border-border text-ink-soft"
      }`}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{value.toLocaleString()}</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
