import { revalidateTag, unstable_cache } from "next/cache";

import { PUBLIC_BILL_STATUSES } from "@/lib/bill-visibility";
import { prisma } from "@/lib/prisma";

const BILL_DETAIL_DATA_TAG = "bill-detail-data";
const publicStatuses = [...PUBLIC_BILL_STATUSES];

const getCachedBillDetailData = unstable_cache(
  async (slug: string) => {
    const bill = await prisma.bill.findUnique({
      where: { slug },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        files: {
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
            shares: true,
            savedBy: true,
            followers: true,
            suggestions: true,
          },
        },
      },
    });

    if (!bill) {
      return null;
    }

    const [comments, suggestions, versions, categoryBills, authorStats] =
      await Promise.all([
        prisma.comment.findMany({
          where: {
            billId: bill.id,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: true,
          },
        }),
        prisma.amendmentSuggestion.findMany({
          where: {
            billId: bill.id,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: true,
          },
        }),
        prisma.billVersion.findMany({
          where: {
            billId: bill.id,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 8,
        }),
        bill.categoryId
          ? prisma.bill.findMany({
              where: {
                categoryId: bill.categoryId,
                status: {
                  in: publicStatuses,
                },
              },
              select: {
                id: true,
                _count: {
                  select: {
                    votes: true,
                  },
                },
              },
            })
          : Promise.resolve([]),
        getAuthorStats(bill.authorId),
      ]);

    return {
      authorStats,
      bill,
      categoryBills,
      comments,
      suggestions,
      versions,
    };
  },
  [BILL_DETAIL_DATA_TAG],
  {
    revalidate: 60,
    tags: [BILL_DETAIL_DATA_TAG],
  },
);

export async function getBillDetailData(slug: string) {
  return hydrateBillDetailDates(await getCachedBillDetailData(slug));
}

export function revalidateBillDetailData() {
  revalidateTag(BILL_DETAIL_DATA_TAG, "max");
}

function hydrateBillDetailDates(
  billData: Awaited<ReturnType<typeof getCachedBillDetailData>>,
) {
  if (!billData) {
    return null;
  }

  return {
    ...billData,
    bill: {
      ...billData.bill,
      createdAt: toDate(billData.bill.createdAt),
      updatedAt: toDate(billData.bill.updatedAt),
      publishedAt: billData.bill.publishedAt
        ? toDate(billData.bill.publishedAt)
        : null,
    },
    comments: billData.comments.map((comment) => ({
      ...comment,
      createdAt: toDate(comment.createdAt),
      updatedAt: toDate(comment.updatedAt),
    })),
    suggestions: billData.suggestions.map((suggestion) => ({
      ...suggestion,
      createdAt: toDate(suggestion.createdAt),
      updatedAt: toDate(suggestion.updatedAt),
    })),
    versions: billData.versions.map((version) => ({
      ...version,
      createdAt: toDate(version.createdAt),
    })),
  };
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

async function getAuthorStats(authorId: string) {
  const [authorActivity, votesReceived, acceptedSuggestions] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: authorId },
        select: {
          _count: {
            select: {
              bills: {
                where: {
                  status: {
                    in: publicStatuses,
                  },
                },
              },
              comments: true,
              suggestions: true,
            },
          },
        },
      }),
      prisma.vote.count({
        where: {
          bill: {
            authorId,
          },
        },
      }),
      prisma.amendmentSuggestion.count({
        where: {
          userId: authorId,
          status: "ACCEPTED",
        },
      }),
    ]);

  return {
    publishedBills: authorActivity?._count.bills ?? 0,
    votesReceived,
    commentsMade: authorActivity?._count.comments ?? 0,
    suggestionsMade: authorActivity?._count.suggestions ?? 0,
    acceptedSuggestions,
  };
}
