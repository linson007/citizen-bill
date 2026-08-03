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
  return getCachedBillDetailData(slug);
}

export function revalidateBillDetailData() {
  revalidateTag(BILL_DETAIL_DATA_TAG, "max");
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
