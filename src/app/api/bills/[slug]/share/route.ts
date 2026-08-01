import { NextResponse } from "next/server";

import { isPublicBillStatus } from "@/lib/bill-visibility";
import { prisma } from "@/lib/prisma";

const allowedPlatforms = new Set([
  "copy",
  "facebook",
  "linkedin",
  "telegram",
  "whatsapp",
  "x",
]);

const SHARE_THROTTLE_WINDOW_MS = 60_000;
const SHARE_THROTTLE_LIMIT = 20;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    platform?: string;
  };
  const platform = body.platform?.trim().toLowerCase() ?? "unknown";

  if (!allowedPlatforms.has(platform)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: {
      id: true,
      status: true,
    },
  });

  if (!bill || !isPublicBillStatus(bill.status)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const recentShareCount = await prisma.billShare.count({
    where: {
      billId: bill.id,
      platform,
      createdAt: {
        gte: new Date(Date.now() - SHARE_THROTTLE_WINDOW_MS),
      },
    },
  });

  if (recentShareCount >= SHARE_THROTTLE_LIMIT) {
    return NextResponse.json({ ok: true, throttled: true });
  }

  await prisma.billShare.create({
    data: {
      billId: bill.id,
      platform,
    },
  });

  return NextResponse.json({ ok: true });
}
