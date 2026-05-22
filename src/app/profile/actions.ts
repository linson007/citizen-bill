"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const displayName = formData.get("displayName")?.toString().trim();

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      displayName: displayName ? displayName.slice(0, 80) : null,
    },
  });

  revalidatePath("/profile");
  redirect("/profile?profile=updated");
}

export async function deleteAiSessionAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const sessionId = formData.get("sessionId")?.toString();

  if (!sessionId) {
    redirect("/profile");
  }

  await prisma.aiConversation.deleteMany({
    where: {
      id: sessionId,
      userId: session.user.id,
    },
  });

  revalidatePath("/profile");
  redirect("/profile?ai=deleted");
}
