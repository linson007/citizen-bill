import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const allowedPlatforms = new Set([
  "copy",
  "facebook",
  "linkedin",
  "telegram",
  "whatsapp",
  "x",
]);

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

  if (
    !bill ||
    !["PUBLISHED", "UNDER_DISCUSSION", "READY_FOR_REVIEW"].includes(bill.status)
  ) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  await prisma.billShare.create({
    data: {
      billId: bill.id,
      platform,
    },
  });

  return NextResponse.json({ ok: true });
}
