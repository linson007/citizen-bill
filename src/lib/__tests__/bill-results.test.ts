import { describe, expect, it } from "vitest";

import {
  hasBillResultEngagement,
  serializeBillResults,
  type BillResultInput,
  type BillResultItem,
} from "@/lib/bill-results";

function createBillInput(
  overrides?: Partial<BillResultInput>,
): BillResultInput {
  return {
    id: "bill-1",
    slug: "kerala-health-bill",
    title: "Kerala Public Health Data Transparency Bill",
    description: "Publish public health data in usable formats.",
    status: "PUBLISHED",
    publishedAt: new Date("2026-08-01T09:00:00.000Z"),
    author: {
      name: "Asha Kumar",
      displayName: "Asha K.",
    },
    category: {
      name: "Health",
    },
    _count: {
      votes: 12,
      comments: 4,
      shares: 2,
    },
    ...overrides,
  };
}

describe("serializeBillResults", () => {
  it("maps bills to a serializable shape", () => {
    expect(serializeBillResults([createBillInput()])).toEqual([
      {
        id: "bill-1",
        slug: "kerala-health-bill",
        title: "Kerala Public Health Data Transparency Bill",
        description: "Publish public health data in usable formats.",
        status: "PUBLISHED",
        categoryName: "Health",
        authorName: "Asha K.",
        publishedAt: "2026-08-01T09:00:00.000Z",
        votes: 12,
        comments: 4,
        shares: 2,
      },
    ]);
  });

  it("falls back to the account name when no display name exists", () => {
    const [bill] = serializeBillResults([
      createBillInput({
        author: { name: "Asha Kumar", displayName: null },
      }),
    ]);

    expect(bill.authorName).toBe("Asha Kumar");
  });

  it("falls back to Citizen when no name exists", () => {
    const [bill] = serializeBillResults([
      createBillInput({
        author: { name: null, displayName: null },
      }),
    ]);

    expect(bill.authorName).toBe("Citizen");
  });

  it("handles missing categories and publish dates", () => {
    const [bill] = serializeBillResults([
      createBillInput({ category: null, publishedAt: null }),
    ]);

    expect(bill.categoryName).toBeNull();
    expect(bill.publishedAt).toBeNull();
  });

  it("returns an empty array for no bills", () => {
    expect(serializeBillResults([])).toEqual([]);
  });
});

describe("hasBillResultEngagement", () => {
  const base: BillResultItem = {
    id: "bill-1",
    slug: "slug",
    title: "Title",
    description: "Description",
    status: "PUBLISHED",
    categoryName: null,
    authorName: "Citizen",
    publishedAt: null,
    votes: 0,
    comments: 0,
    shares: 0,
  };

  it("returns false without engagement", () => {
    expect(hasBillResultEngagement(base)).toBe(false);
  });

  it("returns true when any metric is positive", () => {
    expect(hasBillResultEngagement({ ...base, votes: 1 })).toBe(true);
    expect(hasBillResultEngagement({ ...base, comments: 1 })).toBe(true);
    expect(hasBillResultEngagement({ ...base, shares: 1 })).toBe(true);
  });
});
