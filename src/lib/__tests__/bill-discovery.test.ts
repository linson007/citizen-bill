import { describe, expect, it } from "vitest";

import {
  BILL_DISCOVERY_SORT_OPTIONS,
  PUBLIC_BILL_STATUS_FILTER_OPTIONS,
  getBillDiscoveryOrderBy,
  getPublicBillStatusWhereValues,
  parseBillDiscoverySort,
  parsePublicBillStatusFilter,
  sortBillsForDiscovery,
} from "@/lib/bill-discovery";

describe("bill discovery sorting", () => {
  it("defaults unknown or missing status filters to all public statuses", () => {
    expect(parsePublicBillStatusFilter(undefined)).toBe("all");
    expect(parsePublicBillStatusFilter("")).toBe("all");
    expect(parsePublicBillStatusFilter("DRAFT")).toBe("all");
  });

  it("accepts every configured status filter option", () => {
    for (const option of PUBLIC_BILL_STATUS_FILTER_OPTIONS) {
      expect(parsePublicBillStatusFilter(option.value)).toBe(option.value);
    }
  });

  it("maps status filters to public bill statuses", () => {
    expect(getPublicBillStatusWhereValues("all")).toEqual([
      "PUBLISHED",
      "UNDER_DISCUSSION",
      "READY_FOR_REVIEW",
    ]);
    expect(getPublicBillStatusWhereValues("published")).toEqual(["PUBLISHED"]);
    expect(getPublicBillStatusWhereValues("under-discussion")).toEqual([
      "UNDER_DISCUSSION",
    ]);
    expect(getPublicBillStatusWhereValues("ready-for-review")).toEqual([
      "READY_FOR_REVIEW",
    ]);
  });

  it("defaults unknown or missing sort values to trending", () => {
    expect(parseBillDiscoverySort(undefined)).toBe("trending");
    expect(parseBillDiscoverySort("")).toBe("trending");
    expect(parseBillDiscoverySort("invalid")).toBe("trending");
  });

  it("accepts every configured sort option", () => {
    for (const option of BILL_DISCOVERY_SORT_OPTIONS) {
      expect(parseBillDiscoverySort(option.value)).toBe(option.value);
    }
  });

  it("builds Prisma ordering for each discovery sort", () => {
    expect(getBillDiscoveryOrderBy("trending")).toEqual([
      { votes: { _count: "desc" } },
      { comments: { _count: "desc" } },
      { shares: { _count: "desc" } },
      { publishedAt: "desc" },
      { updatedAt: "desc" },
    ]);
    expect(getBillDiscoveryOrderBy("newest")).toEqual([
      { publishedAt: "desc" },
      { updatedAt: "desc" },
    ]);
    expect(getBillDiscoveryOrderBy("most-supported")).toEqual([
      { votes: { _count: "desc" } },
      { comments: { _count: "desc" } },
      { shares: { _count: "desc" } },
      { publishedAt: "desc" },
      { updatedAt: "desc" },
    ]);
    expect(getBillDiscoveryOrderBy("most-discussed")).toEqual([
      { comments: { _count: "desc" } },
      { votes: { _count: "desc" } },
      { shares: { _count: "desc" } },
      { publishedAt: "desc" },
      { updatedAt: "desc" },
    ]);
  });

  it("sorts fetched search results by the selected discovery sort", () => {
    const older = new Date("2026-01-01T00:00:00Z");
    const newer = new Date("2026-02-01T00:00:00Z");
    const bills = [
      {
        id: "a",
        publishedAt: older,
        updatedAt: older,
        _count: { votes: 1, comments: 10, shares: 0 },
      },
      {
        id: "b",
        publishedAt: newer,
        updatedAt: newer,
        _count: { votes: 5, comments: 1, shares: 0 },
      },
      {
        id: "c",
        publishedAt: older,
        updatedAt: newer,
        _count: { votes: 5, comments: 4, shares: 2 },
      },
    ];

    expect(
      sortBillsForDiscovery(bills, "most-supported").map((bill) => bill.id),
    ).toEqual(["c", "b", "a"]);
    expect(
      sortBillsForDiscovery(bills, "most-discussed").map((bill) => bill.id),
    ).toEqual(["a", "c", "b"]);
    expect(
      sortBillsForDiscovery(bills, "newest").map((bill) => bill.id),
    ).toEqual(["b", "c", "a"]);
  });

  it("does not mutate the fetched result array", () => {
    const bills = [
      {
        id: "a",
        publishedAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
        _count: { votes: 0, comments: 0, shares: 0 },
      },
      {
        id: "b",
        publishedAt: new Date("2026-02-01T00:00:00Z"),
        updatedAt: new Date("2026-02-01T00:00:00Z"),
        _count: { votes: 0, comments: 0, shares: 0 },
      },
    ];

    expect(
      sortBillsForDiscovery(bills, "newest").map((bill) => bill.id),
    ).toEqual(["b", "a"]);
    expect(bills.map((bill) => bill.id)).toEqual(["a", "b"]);
  });
});
