import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, Search } from "lucide-react";

import { BillResults, type BillResultsLabels } from "@/components/bill-results";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Prisma } from "@/generated/prisma/client";
import {
  BILL_DISCOVERY_SORT_OPTIONS,
  getBillDiscoveryOrderBy,
  parseBillDiscoverySort,
  sortBillsForDiscovery,
  type BillDiscoverySort,
} from "@/lib/bill-discovery";
import { serializeBillResults } from "@/lib/bill-results";
import { PUBLIC_BILL_STATUSES } from "@/lib/bill-visibility";
import { prisma } from "@/lib/prisma";
import { getRequestMessages } from "@/lib/request-locale";

export const BILLS_PER_PAGE = 20;

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { q, category, sort, page } = await searchParams;
  const { locale, t } = await getRequestMessages();
  const copyClass = locale === "ml" ? "font-malayalam" : "";
  const query = q?.trim();
  const selectedCategory = category?.trim();
  const selectedSort = parseBillDiscoverySort(sort);
  const pageNumber = Math.max(parseInt(page ?? "1", 10) || 1, 1);
  const hasActiveFilters = Boolean(
    query || selectedCategory || selectedSort !== "newest",
  );

  const [result, categories] = await Promise.all([
    findPublicBills({
      query,
      selectedCategory,
      sort: selectedSort,
      page: pageNumber,
      perPage: BILLS_PER_PAGE,
    }),
    prisma.category.findMany({
      where: {
        bills: {
          some: {
            status: {
              in: [...PUBLIC_BILL_STATUSES],
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);
  const { bills, total } = result;
  const totalPages = Math.max(Math.ceil(total / BILLS_PER_PAGE), 1);

  if (pageNumber > totalPages && total > 0) {
    redirect(
      buildBillsPageHref(totalPages, query, selectedCategory, selectedSort),
    );
  }

  const labels: BillResultsLabels = {
    results: t.bills.results,
    clearFilters: t.bills.clearFilters,
    votes: t.bills.votes,
    comments: t.bills.comments,
    shares: t.bills.shares,
    by: t.bills.by,
    newProposal: t.bills.newProposal,
    layoutLabel: t.bills.layoutLabel,
    layoutList: t.bills.layoutList,
    layoutGrid: t.bills.layoutGrid,
    keyboardHint: t.bills.keyboardHint,
  };

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
              className="flex h-11 w-fit items-center gap-2 rounded-md bg-accent-solid px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <FileText size={17} aria-hidden="true" />
              {t.bills.create}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <form className="mb-5 grid gap-3 rounded-md border border-border bg-surface-raised p-4 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_auto]">
          <label className="relative block sm:col-span-2 lg:col-auto">
            <span className="sr-only">{t.bills.searchPlaceholder}</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              size={17}
              aria-hidden="true"
            />
            <input
              name="q"
              data-bill-search
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
            className="h-11 rounded-md bg-accent-solid px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover sm:col-span-2 lg:col-auto"
          >
            {t.bills.search}
          </button>
        </form>

        {bills.length > 0 ? (
          <>
            <BillResults
              bills={serializeBillResults(bills)}
              locale={locale}
              labels={labels}
              hasActiveFilters={hasActiveFilters}
              total={total}
            />
            {totalPages > 1 ? (
              <nav
                aria-label={t.bills.pagination}
                className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6"
              >
                {pageNumber > 1 ? (
                  <Link
                    href={buildBillsPageHref(
                      pageNumber - 1,
                      query,
                      selectedCategory,
                      selectedSort,
                    )}
                    className="flex h-10 items-center gap-1.5 rounded-md border border-border-strong bg-surface-raised px-4 text-sm font-semibold text-ink-soft shadow-sm transition-colors hover:border-accent hover:text-accent"
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                    {t.bills.previous}
                  </Link>
                ) : (
                  <span aria-hidden="true" />
                )}
                <p className="text-sm font-medium text-ink-muted">
                  {t.bills.pageOf
                    .replace("{current}", String(pageNumber))
                    .replace("{total}", String(totalPages))}
                </p>
                {pageNumber < totalPages ? (
                  <Link
                    href={buildBillsPageHref(
                      pageNumber + 1,
                      query,
                      selectedCategory,
                      selectedSort,
                    )}
                    className="flex h-10 items-center gap-1.5 rounded-md border border-border-strong bg-surface-raised px-4 text-sm font-semibold text-ink-soft shadow-sm transition-colors hover:border-accent hover:text-accent"
                  >
                    {t.bills.next}
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                ) : (
                  <span aria-hidden="true" />
                )}
              </nav>
            ) : null}
          </>
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
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-accent-solid px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
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
  page,
  perPage,
}: {
  query?: string;
  selectedCategory?: string;
  sort: BillDiscoverySort;
  page: number;
  perPage: number;
}) {
  const statusWhereValues = [...PUBLIC_BILL_STATUSES];
  const skip = (page - 1) * perPage;
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
    const where = {
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
    };
    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        orderBy: getBillDiscoveryOrderBy(sort),
        include,
        skip,
        take: perPage,
      }),
      prisma.bill.count({ where }),
    ]);

    return { bills, total };
  }

  const searchQueryClause = Prisma.sql`websearch_to_tsquery('english', ${query})`;
  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT b.id
    FROM "Bill" b
    LEFT JOIN "Category" c ON c.id = b."categoryId"
    CROSS JOIN ${searchQueryClause} search_query
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
    LIMIT ${perPage} OFFSET ${skip}
  `);
  const ids = rows.map((row) => row.id);

  const countRows = await prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
    SELECT count(*)::int AS count
    FROM "Bill" b
    LEFT JOIN "Category" c ON c.id = b."categoryId"
    CROSS JOIN ${searchQueryClause} search_query
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
  `);
  const total = Number(countRows[0]?.count ?? 0);
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

  return {
    bills: sortBillsForDiscovery(relevanceSortedBills, sort),
    total,
  };
}

function buildBillsPageHref(
  page: number,
  query?: string,
  category?: string,
  sort?: BillDiscoverySort,
) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }
  if (category) {
    params.set("category", category);
  }
  if (sort && sort !== "newest") {
    params.set("sort", sort);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();

  return queryString ? `/bills?${queryString}` : "/bills";
}
