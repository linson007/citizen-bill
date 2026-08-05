import { revalidateTag, unstable_cache } from "next/cache";

import { PUBLIC_BILL_STATUSES } from "@/lib/bill-visibility";
import { prisma } from "@/lib/prisma";

const HOMEPAGE_DATA_TAG = "homepage-data";
const publicStatuses = [...PUBLIC_BILL_STATUSES];

const getCachedHomepageData = unstable_cache(
  async () => {
    const [publicBillCount, voteCount, commentCount, trendingBills] =
      await Promise.all([
        prisma.bill.count({
          where: {
            status: {
              in: publicStatuses,
            },
          },
        }),
        prisma.vote.count(),
        prisma.comment.count(),
        prisma.bill.findMany({
          where: {
            status: {
              in: publicStatuses,
            },
          },
          include: {
            category: true,
            _count: {
              select: {
                votes: true,
                comments: true,
              },
            },
          },
          orderBy: [
            {
              votes: {
                _count: "desc",
              },
            },
            {
              comments: {
                _count: "desc",
              },
            },
            {
              publishedAt: "desc",
            },
            {
              updatedAt: "desc",
            },
          ],
          take: 3,
        }),
      ]);

    return { commentCount, publicBillCount, trendingBills, voteCount };
  },
  [HOMEPAGE_DATA_TAG],
  {
    revalidate: 60,
    tags: [HOMEPAGE_DATA_TAG],
  },
);

export async function getHomepageData() {
  return getCachedHomepageData();
}

export function revalidateHomepageData() {
  revalidateTag(HOMEPAGE_DATA_TAG, "max");
}
