import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Search,
  Share2,
  ThumbsUp,
  X,
} from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Prisma } from "@/generated/prisma/client";
import {
  BILL_DISCOVERY_SORT_OPTIONS,
  PUBLIC_BILL_STATUS_FILTER_OPTIONS,
  getBillDiscoveryOrderBy,
  getPublicBillStatusWhereValues,
  parseBillDiscoverySort,
  parsePublicBillStatusFilter,
  sortBillsForDiscovery,
  type BillDiscoverySort,
  type PublicBillStatusFilter,
} from "@/lib/bill-discovery";
import { formatDisplayTitle } from "@/lib/display-title";
import { prisma } from "@/lib/prisma";
import { getRequestMessages } from "@/lib/request-locale";

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    status?: string;
  }>;
}) {
  const { q, category, sort, status } = await searchParams;
  const { locale, t } = await getRequestMessages();
  const copyClass = locale === "ml" ? "font-malayalam" : "";
  const query = q?.trim();
  const selectedCategory = category?.trim();
  const selectedSort = parseBillDiscoverySort(sort);
  const selectedStatus = parsePublicBillStatusFilter(status);
  const statusWhereValues = getPublicBillStatusWhereValues(selectedStatus);
  const hasActiveFilters = Boolean(
    query ||
    selectedCategory ||
    selectedStatus !== "all" ||
    selectedSort !== "newest",
  );

  const [bills, categories] = await Promise.all([
    findPublicBills({
      query,
      selectedCategory,
      sort: selectedSort,
      statusFilter: selectedStatus,
    }),
    prisma.category.findMany({
      where: {
        bills: {
          some: {
            status: {
              in: statusWhereValues,
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <main
      id="main-content"
      className={`flex min-h-screen flex-col bg-background text-foreground ${copyClass}`}
    >
      <SiteHeader />

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
            {t.bills.eyebrow}
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {t.bills.heading}
              </h1>
              <p className="mt-2 max-w-2xl text-ink-soft">{t.bills.support}</p>
            </div>
            <Link
              href="/bills/new"
              className="flex h-11 w-fit items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-hero-ink"
            >
              <FileText size={17} aria-hidden="true" />
              {t.bills.create}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <form className="mb-5 grid gap-3 rounded-md border border-border bg-surface-raised p-4 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_180px_auto]">
          <label className="relative block sm:col-span-2 lg:col-auto">
            <span className="sr-only">{t.bills.searchPlaceholder}</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              size={17}
              aria-hidden="true"
            />
            <input
              name="q"
              defaultValue={query}
              placeholder={t.bills.searchPlaceholder}
              className="h-11 w-full rounded-md border border-border-strong bg-surface-raised pl-10 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </label>

          <select
            name="category"
            defaultValue={selectedCategory}
            aria-label={t.bills.allCategories}
            className="h-11 rounded-md border border-border-strong bg-surface-raised px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="">{t.bills.allCategories}</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={selectedStatus}
            aria-label={t.bills.statusFilter}
            className="h-11 rounded-md border border-border-strong bg-surface-raised px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            {PUBLIC_BILL_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {
                  t.bills[
                    option.value === "all"
                      ? "allPublicStatuses"
                      : option.value === "published"
                        ? "published"
                        : option.value === "under-discussion"
                          ? "underDiscussion"
                          : "readyForReview"
                  ]
                }
              </option>
            ))}
          </select>

          <select
            name="sort"
            defaultValue={selectedSort}
            aria-label={t.bills.sort}
            className="h-11 rounded-md border border-border-strong bg-surface-raised px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            {BILL_DISCOVERY_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {
                  t.bills[
                    option.value === "newest"
                      ? "newest"
                      : option.value === "trending"
                        ? "mostActive"
                        : option.value === "most-supported"
                          ? "mostSupported"
                          : "mostDiscussed"
                  ]
                }
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="h-11 rounded-md bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-hero-ink sm:col-span-2 lg:col-auto"
          >
            {t.bills.search}
          </button>
        </form>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="font-medium text-ink-soft" aria-live="polite">
            {bills.length.toLocaleString()} {t.bills.results}
          </p>
          {hasActiveFilters ? (
            <Link
              href="/bills"
              className="inline-flex items-center gap-1.5 font-semibold text-accent transition-colors hover:text-hero-ink"
            >
              <X size={15} aria-hidden="true" />
              {t.bills.clearFilters}
            </Link>
          ) : null}
        </div>

        {bills.length > 0 ? (
          <div className="divide-y divide-border border-y border-border">
            {bills.map((bill) => (
              <Link
                key={bill.id}
                href={`/bills/${bill.slug}`}
                className="block py-5 transition-colors hover:bg-surface"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {bill.category ? (
                        <Badge>{bill.category.name}</Badge>
                      ) : null}
                      <StatusBadge status={bill.status} />
                    </div>
                    <h2 className="font-display text-lg font-semibold leading-7 tracking-tight">
                      {formatDisplayTitle(bill.title)}
                    </h2>
                    <p className="mt-2 max-w-3xl line-clamp-3 text-sm leading-6 text-ink-muted">
                      {bill.description}
                    </p>
                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                      {t.bills.by}{" "}
                      {bill.author.displayName ?? bill.author.name ?? "Citizen"}
                    </p>
                  </div>

                  {hasEngagement(bill._count) ? (
                    <div className="flex shrink-0 gap-2">
                      <Metric
                        icon={ThumbsUp}
                        value={bill._count.votes}
                        label={t.bills.votes}
                        primary
                      />
                      <Metric
                        icon={MessageSquare}
                        value={bill._count.comments}
                        label={t.bills.comments}
                      />
                      <Metric
                        icon={Share2}
                        value={bill._count.shares}
                        label={t.bills.shares}
                      />
                    </div>
                  ) : (
                    <p className="shrink-0 text-sm font-medium text-ink-muted">
                      {t.bills.newProposal}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-border bg-surface px-6 py-10 text-center">
            <h2 className="font-display text-lg font-semibold">
              {t.bills.emptyHeading}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">
              {t.bills.emptySupport}
            </p>
            <Link
              href="/bills/new"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-hero-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              <FileText size={16} aria-hidden="true" />
              {t.bills.create}
            </Link>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}

async function findPublicBills({
  query,
  selectedCategory,
  sort,
  statusFilter,
}: {
  query?: string;
  selectedCategory?: string;
  sort: BillDiscoverySort;
  statusFilter: PublicBillStatusFilter;
}) {
  const statusWhereValues = getPublicBillStatusWhereValues(statusFilter);
  const include = {
    author: true,
    category: true,
    _count: {
      select: {
        votes: true,
        comments: true,
        shares: true,
      },
    },
  };

  if (!query) {
    return prisma.bill.findMany({
      where: {
        status: {
          in: statusWhereValues,
        },
        ...(selectedCategory
          ? {
              category: {
                slug: selectedCategory,
              },
            }
          : {}),
      },
      orderBy: getBillDiscoveryOrderBy(sort),
      include,
    });
  }

  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT b.id
    FROM "Bill" b
    LEFT JOIN "Category" c ON c.id = b."categoryId"
    CROSS JOIN websearch_to_tsquery('english', ${query}) search_query
    CROSS JOIN LATERAL (
      SELECT
        setweight(to_tsvector('english', coalesce(b.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(b.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(b.problem, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(b."proposedSolution", '')), 'C') ||
        setweight(to_tsvector('english', coalesce(b.body, '')), 'D') ||
        setweight(to_tsvector('english', coalesce(b."references", '')), 'D') AS document
    ) search_document
    WHERE b.status::text IN (${Prisma.join(statusWhereValues)})
      ${selectedCategory ? Prisma.sql`AND c.slug = ${selectedCategory}` : Prisma.empty}
      AND search_document.document @@ search_query
    ORDER BY ts_rank_cd(search_document.document, search_query) DESC,
      b."publishedAt" DESC NULLS LAST,
      b."updatedAt" DESC
    LIMIT 100
  `);
  const ids = rows.map((row) => row.id);

  if (ids.length === 0) {
    return [];
  }

  const bills = await prisma.bill.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include,
  });
  const order = new Map(ids.map((id, index) => [id, index]));

  const relevanceSortedBills = bills.sort((first, second) => {
    return (order.get(first.id) ?? 0) - (order.get(second.id) ?? 0);
  });

  return sortBillsForDiscovery(relevanceSortedBills, sort);
}

function hasEngagement(counts: {
  votes: number;
  comments: number;
  shares: number;
}) {
  return counts.votes + counts.comments + counts.shares > 0;
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
