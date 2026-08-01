import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { getAppUrl } from "@/lib/app-url";
import { PUBLIC_BILL_STATUSES } from "@/lib/bill-visibility";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  const appUrl = getAppUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${appUrl}/bills`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${appUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${appUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${appUrl}/login`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  try {
    const bills = await prisma.bill.findMany({
      where: {
        status: {
          in: [...PUBLIC_BILL_STATUSES],
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5000,
    });

    const billRoutes: MetadataRoute.Sitemap = bills.map((bill) => ({
      url: `${appUrl}/bills/${bill.slug}`,
      lastModified: bill.updatedAt ?? bill.publishedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...billRoutes];
  } catch {
    return staticRoutes;
  }
}
