"use client";

import { useSyncExternalStore } from "react";
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
  DEFAULT_BILL_LAYOUT,
  loadBillLayout,
  saveBillLayout,
  subscribeToBillLayout,
  type BillLayout,
} from "@/lib/layout-preference";
import type { Locale } from "@/lib/locale";
import { formatRelativeTime } from "@/lib/relative-time";

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
};

export function BillResults({
  bills,
  locale,
  labels,
  hasActiveFilters,
}: {
  bills: BillResultItem[];
  locale: Locale;
  labels: BillResultsLabels;
  hasActiveFilters: boolean;
}) {
  const layout = useSyncExternalStore(
    subscribeToBillLayout,
    () => loadBillLayout(),
    () => DEFAULT_BILL_LAYOUT,
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="font-medium text-ink-soft" aria-live="polite">
          {bills.length.toLocaleString()} {labels.results}
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

      {layout === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              locale={locale}
              labels={labels}
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {bills.map((bill) => (
            <BillRow
              key={bill.id}
              bill={bill}
              locale={locale}
              labels={labels}
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
          ? "bg-accent text-white"
          : "bg-surface-raised text-ink-muted hover:text-foreground"
      }`}
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
}: {
  bill: BillResultItem;
  locale: Locale;
  labels: BillResultsLabels;
}) {
  return (
    <Link
      href={`/bills/${bill.slug}`}
      className="block py-5 transition-colors hover:bg-surface"
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
}: {
  bill: BillResultItem;
  locale: Locale;
  labels: BillResultsLabels;
}) {
  return (
    <Link
      href={`/bills/${bill.slug}`}
      className="flex flex-col rounded-lg border border-border bg-surface-raised p-5 shadow-sm transition-colors hover:border-accent/50"
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

function StatusBadge({ status }: { status: string }) {
  const label = status.replaceAll("_", " ").toLowerCase();
  const tone =
    status === "READY_FOR_REVIEW"
      ? "bg-success-soft text-success"
      : status === "UNDER_DISCUSSION"
        ? "bg-warning-bg text-warning-ink"
        : "bg-accent-soft text-accent";

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}
    >
      {label}
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
        primary ? "bg-accent text-white" : "border border-border text-ink-soft"
      }`}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{value.toLocaleString()}</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
