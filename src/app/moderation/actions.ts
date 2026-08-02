"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getAiUsageWindow } from "@/lib/ai-usage-limit";
import { revalidateHomepageData } from "@/lib/homepage";
import { prisma } from "@/lib/prisma";

async function requireModerator() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    redirect("/dashboard");
  }
}

export async function dismissReportAction(formData: FormData) {
  await requireModerator();
  const reportId = formData.get("reportId")?.toString();

  if (!reportId) {
    redirect("/moderation");
  }

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "DISMISSED" },
  });

  revalidatePath("/moderation");
  redirect("/moderation");
}

export async function resolveReportAction(formData: FormData) {
  await requireModerator();
  const reportId = formData.get("reportId")?.toString();

  if (!reportId) {
    redirect("/moderation");
  }

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "RESOLVED" },
  });

  revalidatePath("/moderation");
  redirect("/moderation");
}

export async function removeReportedBillAction(formData: FormData) {
  await requireModerator();
  const billId = formData.get("billId")?.toString();

  if (!billId) {
    redirect("/moderation");
  }

  await prisma.bill.update({
    where: { id: billId },
    data: { status: "REMOVED" },
  });

  await prisma.report.updateMany({
    where: { billId },
    data: { status: "RESOLVED" },
  });

  revalidatePath("/moderation");
  revalidatePath("/bills");
  revalidateHomepageData();
  redirect("/moderation");
}

export async function resetAiUsageAction(formData: FormData) {
  await requireModerator();
  const userId = formData.get("userId")?.toString();

  if (!userId) {
    redirect("/moderation");
  }

  const { start, resetAt } = getAiUsageWindow();

  await prisma.aiUsageEvent.deleteMany({
    where: {
      userId,
      createdAt: {
        gte: start,
        lt: resetAt,
      },
    },
  });

  revalidatePath("/moderation");
  redirect("/moderation");
}
