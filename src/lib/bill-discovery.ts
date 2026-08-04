import type { Prisma } from "@/generated/prisma/client";
export const BILL_DISCOVERY_SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest",
  },
  {
    value: "trending",
    label: "Most active",
  },
  {
    value: "most-supported",
    label: "Most supported",
  },
  {
    value: "most-discussed",
    label: "Most discussed",
  },
] as const;

export type BillDiscoverySort =
  (typeof BILL_DISCOVERY_SORT_OPTIONS)[number]["value"];

const billDiscoverySortValues = new Set<string>(
  BILL_DISCOVERY_SORT_OPTIONS.map((option) => option.value),
);

export function parseBillDiscoverySort(
  value: string | null | undefined,
): BillDiscoverySort {
  const trimmedValue = value?.trim();

  if (trimmedValue && billDiscoverySortValues.has(trimmedValue)) {
    return trimmedValue as BillDiscoverySort;
  }

  return "newest";
}

export function getBillDiscoveryOrderBy(
  sort: BillDiscoverySort,
): Prisma.BillOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ publishedAt: "desc" }, { updatedAt: "desc" }];
    case "most-supported":
      return [
        { votes: { _count: "desc" } },
        { comments: { _count: "desc" } },
        { shares: { _count: "desc" } },
        { publishedAt: "desc" },
        { updatedAt: "desc" },
      ];
    case "most-discussed":
      return [
        { comments: { _count: "desc" } },
        { votes: { _count: "desc" } },
        { shares: { _count: "desc" } },
        { publishedAt: "desc" },
        { updatedAt: "desc" },
      ];
    case "trending":
      return [
        { votes: { _count: "desc" } },
        { comments: { _count: "desc" } },
        { shares: { _count: "desc" } },
        { publishedAt: "desc" },
        { updatedAt: "desc" },
      ];
  }
}

type DiscoverableBill = {
  publishedAt: Date | null;
  updatedAt: Date;
  _count: {
    votes: number;
    comments: number;
    shares: number;
  };
};

export function sortBillsForDiscovery<TBill extends DiscoverableBill>(
  bills: readonly TBill[],
  sort: BillDiscoverySort,
) {
  return [...bills].sort((first, second) => compareBills(first, second, sort));
}

function compareBills(
  first: DiscoverableBill,
  second: DiscoverableBill,
  sort: BillDiscoverySort,
) {
  switch (sort) {
    case "newest":
      return (
        compareDates(second.publishedAt, first.publishedAt) ||
        compareDates(second.updatedAt, first.updatedAt)
      );
    case "most-supported":
      return (
        second._count.votes - first._count.votes ||
        second._count.comments - first._count.comments ||
        second._count.shares - first._count.shares ||
        compareRecency(first, second)
      );
    case "most-discussed":
      return (
        second._count.comments - first._count.comments ||
        second._count.votes - first._count.votes ||
        second._count.shares - first._count.shares ||
        compareRecency(first, second)
      );
    case "trending":
      return (
        second._count.votes - first._count.votes ||
        second._count.comments - first._count.comments ||
        second._count.shares - first._count.shares ||
        compareRecency(first, second)
      );
  }
}

function compareRecency(first: DiscoverableBill, second: DiscoverableBill) {
  return (
    compareDates(second.publishedAt, first.publishedAt) ||
    compareDates(second.updatedAt, first.updatedAt)
  );
}

function compareDates(first: Date | null, second: Date | null) {
  return getTime(first) - getTime(second);
}

function getTime(value: Date | null) {
  return value?.getTime() ?? 0;
}
