import { describe, expect, it } from "vitest";

import {
  BILL_DISCOVERY_SORT_OPTIONS,
  getBillDiscoveryOrderBy,
  parseBillDiscoverySort,
  sortBillsForDiscovery,
} from "@/lib/bill-discovery";

describe("bill discovery sorting", () => {
  it("defaults unknown or missing sort values to newest", () => {
    expect(parseBillDiscoverySort(undefined)).toBe("newest");
    expect(parseBillDiscoverySort("")).toBe("newest");
    expect(parseBillDiscoverySort("invalid")).toBe("newest");
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
    expect(
      sortBillsForDiscovery(bills, "trending").map((bill) => bill.id),
    ).toEqual(["c", "b", "a"]);
  });

  it("breaks most-supported and most-discussed ties across secondary counts", () => {
    const older = new Date("2026-01-01T00:00:00Z");
    const newer = new Date("2026-02-01T00:00:00Z");
    const bills = [
      {
        id: "shares-older",
        publishedAt: older,
        updatedAt: older,
        _count: { votes: 5, comments: 2, shares: 9 },
      },
      {
        id: "shares-newer",
        publishedAt: newer,
        updatedAt: newer,
        _count: { votes: 5, comments: 2, shares: 9 },
      },
      {
        id: "comments-lead",
        publishedAt: older,
        updatedAt: older,
        _count: { votes: 5, comments: 8, shares: 1 },
      },
      {
        id: "low-shares",
        publishedAt: newer,
        updatedAt: newer,
        _count: { votes: 5, comments: 2, shares: 1 },
      },
      {
        id: "vote-lead",
        publishedAt: older,
        updatedAt: older,
        _count: { votes: 9, comments: 2, shares: 1 },
      },
    ];

    expect(
      sortBillsForDiscovery(bills, "most-supported").map((bill) => bill.id),
    ).toEqual([
      "vote-lead",
      "comments-lead",
      "shares-newer",
      "shares-older",
      "low-shares",
    ]);
    expect(
      sortBillsForDiscovery(bills, "most-discussed").map((bill) => bill.id),
    ).toEqual([
      "comments-lead",
      "vote-lead",
      "shares-newer",
      "shares-older",
      "low-shares",
    ]);
  });

  it("breaks trending ties with published and updated timestamps", () => {
    const older = new Date("2026-01-01T00:00:00Z");
    const newer = new Date("2026-02-01T00:00:00Z");
    const bills = [
      {
        id: "draft-old",
        publishedAt: null,
        updatedAt: older,
        _count: { votes: 1, comments: 1, shares: 1 },
      },
      {
        id: "published-new",
        publishedAt: newer,
        updatedAt: older,
        _count: { votes: 1, comments: 1, shares: 1 },
      },
      {
        id: "published-updated",
        publishedAt: newer,
        updatedAt: newer,
        _count: { votes: 1, comments: 1, shares: 1 },
      },
    ];

    expect(
      sortBillsForDiscovery(bills, "trending").map((bill) => bill.id),
    ).toEqual(["published-updated", "published-new", "draft-old"]);
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
