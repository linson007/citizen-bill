import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { createDocx, createPdf, safeBillExportFileName } from "@/lib/bill-export";
import { prisma } from "@/lib/prisma";

const publicStatuses = ["PUBLISHED", "UNDER_DISCUSSION", "READY_FOR_REVIEW"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const format =
    new URL(request.url).searchParams.get("format") === "docx" ? "docx" : "pdf";
  const bill = await prisma.bill.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
      _count: {
        select: {
          votes: true,
          comments: true,
        },
      },
    },
  });

  if (
    !bill ||
    (!publicStatuses.includes(bill.status) &&
      bill.authorId !== session?.user?.id)
  ) {
    return NextResponse.json({ error: "Bill not found." }, { status: 404 });
  }

  const lines = [
    bill.title,
    "",
    `Status: ${bill.status.replaceAll("_", " ").toLowerCase()}`,
    `Author: ${bill.author.displayName ?? bill.author.name ?? "Citizen"}`,
    bill.category ? `Category: ${bill.category.name}` : null,
    `Votes: ${bill._count.votes}`,
    `Comments: ${bill._count.comments}`,
    `Version date: ${bill.updatedAt.toLocaleDateString("en-IN")}`,
    "",
    "Short Description",
    bill.description,
    "",
    "Problem Statement",
    bill.problem,
    "",
    "Proposed Solution",
    bill.proposedSolution,
    "",
    "Expected Public Impact",
    bill.expectedImpact,
    "",
    "Bill Text",
    bill.body,
    "",
    "References and Supporting Links",
    bill.references,
  ].filter((line): line is string => typeof line === "string");

  if (format === "docx") {
    const body = createDocx(lines);

    return new Response(body, {
      headers: {
        "Content-Disposition": `attachment; filename="${safeBillExportFileName(bill.slug)}.docx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });
  }

  const body = createPdf(lines);

  return new Response(body, {
    headers: {
      "Content-Disposition": `attachment; filename="${safeBillExportFileName(bill.slug)}.pdf"`,
      "Content-Type": "application/pdf",
    },
  });
}
