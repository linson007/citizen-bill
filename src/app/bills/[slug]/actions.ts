"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";

import { authOptions } from "@/lib/auth";
import { resolveBillCategory } from "@/lib/bill-categories";
import { canPublishBillFields } from "@/lib/bill-form-schema";
import { isPublicBillStatus } from "@/lib/bill-visibility";
import {
  createBillUploadKey,
  hasAllowedBillUploadSignature,
  isAllowedBillUploadMetadata,
  MAX_BILL_UPLOAD_BYTES,
  sanitizeUploadFileName,
} from "@/lib/bill-uploads";
import { sendEmailNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function publishBillAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const slug = formData.get("slug")?.toString();

  if (!slug) {
    redirect("/dashboard");
  }

  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: {
      id: true,
      authorId: true,
      title: true,
      body: true,
      summary: true,
      description: true,
      problem: true,
      proposedSolution: true,
      status: true,
    },
  });

  if (!bill || bill.authorId !== session.user.id) {
    redirect("/dashboard");
  }

  if (bill.status !== "DRAFT") {
    redirect(`/bills/${slug}`);
  }

  if (!canPublishBillFields(bill)) {
    redirect(`/bills/${slug}/edit?error=publish`);
  }

  await prisma.$transaction([
    prisma.billVersion.create({
      data: {
        billId: bill.id,
        title: bill.title,
        body: bill.body ?? "",
        summary: bill.summary,
      },
    }),
    prisma.bill.update({
      where: {
        id: bill.id,
      },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    }),
  ]);

  await notifyUser({
    userId: bill.authorId,
    billId: bill.id,
    type: "bill_published",
    message: `Your bill "${bill.title}" was published.`,
  });

  revalidatePath("/bills");
  revalidatePath(`/bills/${slug}`);
  revalidatePath("/dashboard");
  redirect(`/bills/${slug}`);
}

async function notifyUser({
  userId,
  billId,
  type,
  message,
}: {
  userId: string;
  billId?: string;
  type: string;
  message: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      billId,
      type,
      message,
    },
    include: {
      user: true,
      bill: true,
    },
  });

  await sendEmailNotification({
    to: notification.user.email,
    subject: "MattamUndo notification",
    text: notification.bill
      ? `${message}\n\nBill: ${notification.bill.title}`
      : message,
  }).catch(() => undefined);
}

async function notifyBillFollowers({
  billId,
  actorId,
  excludedUserIds = [],
  type,
  message,
}: {
  billId: string;
  actorId: string;
  excludedUserIds?: string[];
  type: string;
  message: string;
}) {
  const excluded = new Set([actorId, ...excludedUserIds]);
  const followers = await prisma.billFollow.findMany({
    where: {
      billId,
      userId: {
        notIn: Array.from(excluded),
      },
    },
    select: {
      userId: true,
    },
  });

  await Promise.all(
    followers.map((follower) =>
      notifyUser({
        userId: follower.userId,
        billId,
        type,
        message,
      }),
    ),
  );
}

export async function toggleVoteAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const slug = formData.get("slug")?.toString();

  if (!slug) {
    redirect("/bills");
  }

  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: {
      id: true,
      status: true,
      authorId: true,
      title: true,
    },
  });

  if (!bill || !isPublicBillStatus(bill.status)) {
    redirect(`/bills/${slug}`);
  }

  if (bill.authorId === session.user.id) {
    redirect(`/bills/${slug}`);
  }

  const existingVote = await prisma.vote.findUnique({
    where: {
      billId_userId: {
        billId: bill.id,
        userId: session.user.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingVote) {
    await prisma.vote.delete({
      where: {
        id: existingVote.id,
      },
    });
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.vote.create({
        data: {
          billId: bill.id,
          userId: session.user.id,
        },
      });

      const voteCount = await tx.vote.count({
        where: {
          billId: bill.id,
        },
      });

      if (voteCount >= 25 && bill.status !== "READY_FOR_REVIEW") {
        await tx.bill.update({
          where: {
            id: bill.id,
          },
          data: {
            status: "READY_FOR_REVIEW",
          },
        });
      }
    });

    if (bill.authorId !== session.user.id) {
      await notifyUser({
        userId: bill.authorId,
        billId: bill.id,
        type: "vote",
        message: `Someone supported your bill "${bill.title}".`,
      });
    }
  }

  revalidatePath("/bills");
  revalidatePath(`/bills/${slug}`);
  revalidatePath("/dashboard");
  redirect(`/bills/${slug}`);
}

export async function toggleSavedBillAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const slug = formData.get("slug")?.toString();

  if (!slug) {
    redirect("/bills");
  }

  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: {
      id: true,
      status: true,
    },
  });

  if (!bill || !isPublicBillStatus(bill.status)) {
    redirect(`/bills/${slug}`);
  }

  const existingSavedBill = await prisma.savedBill.findUnique({
    where: {
      billId_userId: {
        billId: bill.id,
        userId: session.user.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingSavedBill) {
    await prisma.savedBill.delete({
      where: {
        id: existingSavedBill.id,
      },
    });
  } else {
    await prisma.savedBill.create({
      data: {
        billId: bill.id,
        userId: session.user.id,
      },
    });
  }

  revalidatePath(`/bills/${slug}`);
  revalidatePath("/dashboard");
  redirect(`/bills/${slug}`);
}

export async function toggleFollowBillAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const slug = formData.get("slug")?.toString();

  if (!slug) {
    redirect("/bills");
  }

  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: {
      id: true,
      status: true,
    },
  });

  if (!bill || !isPublicBillStatus(bill.status)) {
    redirect(`/bills/${slug}`);
  }

  const existingFollow = await prisma.billFollow.findUnique({
    where: {
      billId_userId: {
        billId: bill.id,
        userId: session.user.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingFollow) {
    await prisma.billFollow.delete({
      where: {
        id: existingFollow.id,
      },
    });
  } else {
    await prisma.billFollow.create({
      data: {
        billId: bill.id,
        userId: session.user.id,
      },
    });
  }

  revalidatePath(`/bills/${slug}`);
  revalidatePath("/dashboard");
  redirect(`/bills/${slug}`);
}

export async function createCommentAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const slug = formData.get("slug")?.toString();
  const body = formData.get("body")?.toString().trim();

  if (!slug) {
    redirect("/bills");
  }

  if (!body || body.length < 3) {
    redirect(`/bills/${slug}`);
  }

  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: {
      id: true,
      status: true,
      authorId: true,
      title: true,
    },
  });

  if (!bill || !isPublicBillStatus(bill.status)) {
    redirect(`/bills/${slug}`);
  }

  await prisma.$transaction([
    prisma.comment.create({
      data: {
        billId: bill.id,
        userId: session.user.id,
        body: body.slice(0, 2000),
      },
    }),
    ...(bill.status === "PUBLISHED"
      ? [
          prisma.bill.update({
            where: {
              id: bill.id,
            },
            data: {
              status: "UNDER_DISCUSSION" as const,
            },
          }),
        ]
      : []),
  ]);

  if (bill.authorId !== session.user.id) {
    await notifyUser({
      userId: bill.authorId,
      billId: bill.id,
      type: "comment",
      message: `New comment on "${bill.title}".`,
    });
  }

  await notifyBillFollowers({
    billId: bill.id,
    actorId: session.user.id,
    excludedUserIds: [bill.authorId],
    type: "followed_bill_comment",
    message: `New comment on a bill you follow: "${bill.title}".`,
  });

  revalidatePath("/bills");
  revalidatePath(`/bills/${slug}`);
  revalidatePath("/dashboard");
  redirect(`/bills/${slug}#comments`);
}

export async function updateBillAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const slug = formData.get("slug")?.toString();

  if (!slug) {
    redirect("/dashboard");
  }

  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: {
      id: true,
      authorId: true,
      status: true,
      title: true,
      body: true,
      summary: true,
    },
  });

  if (!bill || bill.authorId !== session.user.id) {
    redirect("/dashboard");
  }

  const title = formData.get("title")?.toString().trim();

  if (!title || title.length < 3) {
    redirect(`/bills/${slug}/edit?error=title`);
  }

  const categoryName = resolveBillCategory({
    category: formData.get("category")?.toString(),
    categoryOther: formData.get("categoryOther")?.toString(),
  });
  const categorySlug = categoryName ? slugify(categoryName) : undefined;
  const tagNames = (formData.get("tags")?.toString() ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);

  await prisma.$transaction([
    prisma.billVersion.create({
      data: {
        billId: bill.id,
        title: bill.title,
        body: bill.body ?? "",
        summary: bill.summary,
      },
    }),
    prisma.billTag.deleteMany({
      where: {
        billId: bill.id,
      },
    }),
    prisma.bill.update({
      where: {
        id: bill.id,
      },
      data: {
        title,
        description:
          formData.get("description")?.toString().trim() ||
          "Draft bill proposal",
        problem: formData.get("problem")?.toString().trim() || null,
        proposedSolution:
          formData.get("proposedSolution")?.toString().trim() || null,
        expectedImpact:
          formData.get("expectedImpact")?.toString().trim() || null,
        body: formData.get("body")?.toString().trim() || null,
        references:
          formData.get("references")?.toString().trim().slice(0, 4000) || null,
        category:
          categoryName && categorySlug
            ? {
                connectOrCreate: {
                  where: { slug: categorySlug },
                  create: { name: categoryName, slug: categorySlug },
                },
              }
            : {
                disconnect: true,
              },
        tags: {
          create: tagNames.map((name) => {
            const tagSlug = slugify(name);

            return {
              tag: {
                connectOrCreate: {
                  where: { slug: tagSlug },
                  create: { name, slug: tagSlug },
                },
              },
            };
          }),
        },
      },
    }),
  ]);

  revalidatePath("/bills");
  revalidatePath(`/bills/${slug}`);
  revalidatePath(`/bills/${slug}/edit`);
  revalidatePath("/dashboard");
  redirect(`/bills/${slug}`);
}

export async function uploadBillFileAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const slug = formData.get("slug")?.toString();
  const file = formData.get("file");

  if (!slug || !(file instanceof File) || file.size === 0) {
    redirect(`/bills/${slug ?? ""}?upload=missing`);
  }

  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!bill || bill.authorId !== session.user.id) {
    redirect("/dashboard");
  }

  if (file.size > MAX_BILL_UPLOAD_BYTES) {
    redirect(`/bills/${slug}?upload=size`);
  }

  if (!isAllowedBillUploadMetadata(file)) {
    redirect(`/bills/${slug}?upload=type`);
  }

  if (!(await hasAllowedBillUploadSignature(file))) {
    redirect(`/bills/${slug}?upload=type`);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    redirect(`/bills/${slug}?upload=blob-missing`);
  }

  const safeFileName = sanitizeUploadFileName(file.name);
  const blob = await put(
    createBillUploadKey({
      billId: bill.id,
      fileName: file.name,
    }),
    file,
    {
      access: "public",
    },
  );

  await prisma.uploadedFile.create({
    data: {
      billId: bill.id,
      url: blob.url,
      fileName: safeFileName,
      mimeType: file.type,
      size: file.size,
    },
  });

  revalidatePath(`/bills/${slug}`);
  redirect(`/bills/${slug}?upload=ok`);
}

export async function reportBillAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const slug = formData.get("slug")?.toString();
  const reason = formData.get("reason")?.toString().trim() || "Needs review";
  const details = formData.get("details")?.toString().trim();

  if (!slug) {
    redirect("/bills");
  }

  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: {
      id: true,
      authorId: true,
      status: true,
      title: true,
    },
  });

  if (!bill || !isPublicBillStatus(bill.status)) {
    redirect("/bills");
  }

  const existingReport = await prisma.report.findFirst({
    where: {
      billId: bill.id,
      reporterId: session.user.id,
      status: {
        in: ["OPEN", "REVIEWING"],
      },
    },
    select: {
      id: true,
    },
  });

  if (existingReport) {
    redirect(`/bills/${slug}?reported=bill`);
  }

  // Reports enter the moderation queue without hiding the bill. Moderators
  // can remove or dismiss content from the moderation dashboard.
  await prisma.report.create({
    data: {
      billId: bill.id,
      reporterId: session.user.id,
      reason,
      details: details || null,
    },
  });

  await notifyUser({
    userId: bill.authorId,
    billId: bill.id,
    type: "report_created",
    message: `A report was submitted for "${bill.title}".`,
  }).catch(() => undefined);

  revalidatePath(`/bills/${slug}`);
  revalidatePath("/moderation");
  redirect(`/bills/${slug}?reported=bill`);
}

export async function reportCommentAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const slug = formData.get("slug")?.toString();
  const commentId = formData.get("commentId")?.toString();

  if (!slug || !commentId) {
    redirect("/bills");
  }

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      id: true,
      bill: {
        select: {
          slug: true,
          status: true,
        },
      },
    },
  });

  if (
    !comment ||
    comment.bill.slug !== slug ||
    !isPublicBillStatus(comment.bill.status)
  ) {
    redirect("/bills");
  }

  await prisma.report.create({
    data: {
      commentId: comment.id,
      reporterId: session.user.id,
      reason: "Comment reported",
    },
  });

  revalidatePath(`/bills/${slug}`);
  redirect(`/bills/${slug}?reported=comment#comments`);
}

export async function createSuggestionAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const slug = formData.get("slug")?.toString();
  const section = formData.get("section")?.toString().trim();
  const body = formData.get("body")?.toString().trim();

  if (!slug) {
    redirect("/bills");
  }

  if (!body || body.length < 5) {
    redirect(`/bills/${slug}#suggestions`);
  }

  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      status: true,
      authorId: true,
    },
  });

  if (!bill || !isPublicBillStatus(bill.status)) {
    redirect(`/bills/${slug}`);
  }

  await prisma.$transaction([
    prisma.amendmentSuggestion.create({
      data: {
        billId: bill.id,
        userId: session.user.id,
        section: section || null,
        body: body.slice(0, 3000),
      },
    }),
    ...(bill.status === "PUBLISHED"
      ? [
          prisma.bill.update({
            where: {
              id: bill.id,
            },
            data: {
              status: "UNDER_DISCUSSION" as const,
            },
          }),
        ]
      : []),
  ]);

  if (bill.authorId !== session.user.id) {
    await notifyUser({
      userId: bill.authorId,
      billId: bill.id,
      type: "suggestion",
      message: `New amendment suggestion on "${bill.title}".`,
    });
  }

  await notifyBillFollowers({
    billId: bill.id,
    actorId: session.user.id,
    excludedUserIds: [bill.authorId],
    type: "followed_bill_suggestion",
    message: `New amendment suggestion on a bill you follow: "${bill.title}".`,
  });

  revalidatePath(`/bills/${slug}`);
  revalidatePath("/dashboard");
  redirect(`/bills/${slug}#suggestions`);
}

export async function reviewSuggestionAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const slug = formData.get("slug")?.toString();
  const suggestionId = formData.get("suggestionId")?.toString();
  const intent = formData.get("intent")?.toString();

  if (!slug || !suggestionId) {
    redirect("/dashboard");
  }

  const suggestion = await prisma.amendmentSuggestion.findUnique({
    where: {
      id: suggestionId,
    },
    include: {
      bill: true,
      user: true,
    },
  });

  if (
    !suggestion ||
    suggestion.bill.authorId !== session.user.id ||
    suggestion.bill.slug !== slug
  ) {
    redirect(`/bills/${slug}`);
  }

  if (suggestion.status !== "OPEN") {
    redirect(`/bills/${slug}#suggestions`);
  }

  if (intent === "reject") {
    await prisma.amendmentSuggestion.update({
      where: {
        id: suggestion.id,
      },
      data: {
        status: "REJECTED",
      },
    });
  } else {
    const mergedBody =
      intent === "merge"
        ? [
            suggestion.bill.body ?? "",
            "",
            suggestion.section
              ? `Suggested section: ${suggestion.section}`
              : "",
            suggestion.body,
          ]
            .filter(Boolean)
            .join("\n")
        : suggestion.bill.body;

    await prisma.$transaction([
      prisma.billVersion.create({
        data: {
          billId: suggestion.bill.id,
          title: suggestion.bill.title,
          body: suggestion.bill.body ?? "",
          summary: suggestion.bill.summary,
        },
      }),
      prisma.amendmentSuggestion.update({
        where: {
          id: suggestion.id,
        },
        data: {
          status: "ACCEPTED",
        },
      }),
      prisma.bill.update({
        where: {
          id: suggestion.bill.id,
        },
        data: {
          body: mergedBody,
        },
      }),
    ]);
  }

  if (suggestion.userId !== session.user.id) {
    await notifyUser({
      userId: suggestion.userId,
      billId: suggestion.bill.id,
      type: "suggestion_reviewed",
      message: `Your amendment suggestion on "${suggestion.bill.title}" was ${intent === "reject" ? "rejected" : "accepted"}.`,
    });
  }

  revalidatePath(`/bills/${slug}`);
  revalidatePath("/dashboard");
  redirect(`/bills/${slug}#suggestions`);
}
