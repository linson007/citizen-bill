import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Search,
  Share2,
  ThumbsUp,
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
import { prisma } from "@/lib/prisma";

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
  const query = q?.trim();
  const selectedCategory = category?.trim();
  const selectedSort = parseBillDiscoverySort(sort);
  const selectedStatus = parsePublicBillStatusFilter(status);
  const statusWhereValues = getPublicBillStatusWhereValues(selectedStatus);

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
    <main className="flex min-h-screen flex-col bg-[#f7f6f2] text-[#161616]">
      <SiteHeader />

      <section className="border-b border-[#d8d2c4] bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6d6658]">
            Public bills
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                Published public bills
              </h1>
              <p className="mt-2 max-w-2xl text-[#4f4a40]">
                Browse bills that authors have published for public reading,
                discussion, voting, and sharing.
              </p>
            </div>
            <Link
              href="/bills/new"
              className="flex h-11 w-fit items-center gap-2 rounded-md bg-[#123c69] px-4 text-sm font-semibold text-white shadow-sm"
            >
              <FileText size={17} aria-hidden="true" />
              Create bill
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <form className="mb-5 grid gap-3 rounded-lg border border-[#d8d2c4] bg-white p-4 shadow-sm md:grid-cols-[1fr_200px_200px_200px_auto]">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6d6658]"
              size={17}
              aria-hidden="true"
            />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search title, description, or problem"
              className="h-11 w-full rounded-md border border-[#c8c0ae] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
            />
          </label>

          <select
            name="category"
            defaultValue={selectedCategory}
            className="h-11 rounded-md border border-[#c8c0ae] bg-white px-3 text-sm outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={selectedStatus}
            aria-label="Filter by bill status"
            className="h-11 rounded-md border border-[#c8c0ae] bg-white px-3 text-sm outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
          >
            {PUBLIC_BILL_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="sort"
            defaultValue={selectedSort}
            aria-label="Sort bills"
            className="h-11 rounded-md border border-[#c8c0ae] bg-white px-3 text-sm outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
          >
            {BILL_DISCOVERY_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="h-11 rounded-md bg-[#123c69] px-5 text-sm font-semibold text-white shadow-sm"
          >
            Search
          </button>
        </form>

        {bills.length > 0 ? (
          <div className="divide-y divide-[#e7e1d3] rounded-lg border border-[#d8d2c4] bg-white shadow-sm">
            {bills.map((bill) => (
              <Link
                key={bill.id}
                href={`/bills/${bill.slug}`}
                className="block p-5 transition-colors hover:bg-[#fbfaf7]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {bill.category ? (
                        <Badge>{bill.category.name}</Badge>
                      ) : null}
                      <Badge>
                        {bill.status.replaceAll("_", " ").toLowerCase()}
                      </Badge>
                    </div>
                    <h2 className="text-lg font-semibold leading-7">
                      {bill.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6d6658]">
                      {bill.description}
                    </p>
                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-[#8a8170]">
                      By{" "}
                      {bill.author.displayName ?? bill.author.name ?? "Citizen"}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Metric
                      icon={ThumbsUp}
                      value={bill._count.votes}
                      label="votes"
                    />
                    <Metric
                      icon={MessageSquare}
                      value={bill._count.comments}
                      label="comments"
                    />
                    <Metric
                      icon={Share2}
                      value={bill._count.shares}
                      label="shares"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[#d8d2c4] bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold">No published bills yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6d6658]">
              Create a draft, publish it from the bill detail page, and it will
              appear here for public review.
            </p>
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-[#e4eef6] px-2.5 py-1 text-xs font-semibold text-[#123c69]">
      {children}
    </span>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof ThumbsUp;
  value: number;
  label: string;
}) {
  return (
    <div className="flex h-10 items-center gap-1.5 rounded-md border border-[#d8d2c4] px-2.5 text-sm font-semibold text-[#3f3a32]">
      <Icon size={16} aria-hidden="true" />
      <span>{value.toLocaleString()}</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
