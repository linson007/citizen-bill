import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Bookmark,
  Calendar,
  ChartNoAxesColumn,
  Flag,
  FileText,
  History,
  MessageSquare,
  Pencil,
  SendHorizontal,
  Send,
  Share2,
  ShieldCheck,
  Tag,
  ThumbsUp,
} from "lucide-react";

import {
  createCommentAction,
  createSuggestionAction,
  publishBillAction,
  reportBillAction,
  reportCommentAction,
  reviewSuggestionAction,
  toggleSavedBillAction,
  toggleVoteAction,
  uploadBillFileAction,
} from "@/app/bills/[slug]/actions";
import { SharePanel } from "@/components/share-panel";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { getSavedBillButtonLabel } from "@/lib/bill-engagement";
import { prisma } from "@/lib/prisma";
import { calculateReputationScore, getReputationLevel } from "@/lib/reputation";

const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bill = await prisma.bill.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      status: true,
    },
  });

  if (
    !bill ||
    !["PUBLISHED", "UNDER_DISCUSSION", "READY_FOR_REVIEW"].includes(bill.status)
  ) {
    return {
      title: "Citizen Bill",
    };
  }

  const url = `/bills/${slug}`;

  return {
    title: `${bill.title} | Citizen Bill`,
    description: bill.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: bill.title,
      description: bill.description,
      url,
      siteName: "Citizen Bill",
      type: "article",
    },
    twitter: {
      card: "summary",
      title: bill.title,
      description: bill.description,
    },
  };
}

export default async function BillDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ upload?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;
  const { upload } = await searchParams;

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
          suggestions: true,
        },
      },
    },
  });

  if (!bill) {
    notFound();
  }

  const isAuthor = session?.user?.id === bill.authorId;
  const userVote = session?.user?.id
    ? await prisma.vote.findUnique({
        where: {
          billId_userId: {
            billId: bill.id,
            userId: session.user.id,
          },
        },
        select: {
          id: true,
        },
      })
    : null;
  const userSavedBill = session?.user?.id
    ? await prisma.savedBill.findUnique({
        where: {
          billId_userId: {
            billId: bill.id,
            userId: session.user.id,
          },
        },
        select: {
          id: true,
        },
      })
    : null;
  const comments = await prisma.comment.findMany({
    where: {
      billId: bill.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });
  const [suggestions, versions, categoryBills, authorStats] = await Promise.all(
    [
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
                in: ["PUBLISHED", "UNDER_DISCUSSION", "READY_FOR_REVIEW"],
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
    ],
  );

  const isPublicBill = [
    "PUBLISHED",
    "UNDER_DISCUSSION",
    "READY_FOR_REVIEW",
  ].includes(bill.status);

  if (!isPublicBill && !isAuthor) {
    redirect("/login");
  }

  const billUrl = `${appUrl}/bills/${bill.slug}`;
  const shareText = `Support this public bill: ${bill.title}`;
  const categoryRank = categoryBills
    .sort((first, second) => second._count.votes - first._count.votes)
    .findIndex((item) => item.id === bill.id);
  const reputationScore = calculateReputationScore(authorStats);
  const reputationLevel = getReputationLevel(reputationScore);
  const activityItems = [
    bill.publishedAt
      ? {
          label: "Published",
          date: bill.publishedAt,
        }
      : null,
    comments[0]
      ? {
          label: "Latest comment",
          date: comments[0].createdAt,
        }
      : null,
    suggestions[0]
      ? {
          label: "Latest amendment suggestion",
          date: suggestions[0].createdAt,
        }
      : null,
    bill.updatedAt
      ? {
          label: "Updated",
          date: bill.updatedAt,
        }
      : null,
  ].filter((item): item is { label: string; date: Date } => Boolean(item));

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#161616]">
      <SiteHeader />
      <section className="border-b border-[#d8d2c4] bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge>{bill.status.replaceAll("_", " ").toLowerCase()}</Badge>
            {bill.category ? <Badge>{bill.category.name}</Badge> : null}
          </div>
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
            {bill.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#4f4a40]">
            {bill.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-[#6d6658]">
            <span className="flex items-center gap-2">
              <Calendar size={16} aria-hidden="true" />
              Created {bill.createdAt.toLocaleDateString("en-IN")}
            </span>
            <span className="flex items-center gap-2">
              <ThumbsUp size={16} aria-hidden="true" />
              {bill._count.votes} votes
            </span>
            <span className="flex items-center gap-2">
              <MessageSquare size={16} aria-hidden="true" />
              {bill._count.comments} comments
            </span>
            <span className="flex items-center gap-2">
              <Share2 size={16} aria-hidden="true" />
              {bill._count.shares} shares
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_320px]">
        <article className="space-y-5">
          <ContentBlock title="Problem statement" content={bill.problem} />
          <ContentBlock
            title="Proposed solution"
            content={bill.proposedSolution}
          />
          <ContentBlock title="Expected impact" content={bill.expectedImpact} />
          <ContentBlock title="Draft bill text" content={bill.body} />
          <ContentBlock
            title="References and supporting links"
            content={bill.references}
          />

          {isPublicBill ? (
            <section
              id="comments"
              className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Comments</h2>
                  <p className="text-sm text-[#6d6658]">
                    Discuss public impact, gaps, and improvements.
                  </p>
                </div>
                <span className="rounded-md bg-[#e4eef6] px-2.5 py-1 text-xs font-semibold text-[#123c69]">
                  {comments.length}
                </span>
              </div>

              {session?.user ? (
                <form action={createCommentAction} className="mb-5">
                  <input type="hidden" name="slug" value={bill.slug} />
                  <label className="block">
                    <span className="text-sm font-semibold text-[#3f3a32]">
                      Add a comment
                    </span>
                    <textarea
                      name="body"
                      rows={4}
                      minLength={3}
                      maxLength={2000}
                      required
                      placeholder="Share a question, concern, or suggestion for improving this bill."
                      className="mt-2 w-full resize-y rounded-md border border-[#c8c0ae] bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
                    />
                  </label>
                  <button
                    type="submit"
                    className="mt-3 flex h-10 items-center justify-center gap-2 rounded-md bg-[#123c69] px-4 text-sm font-semibold text-white shadow-sm"
                  >
                    <SendHorizontal size={16} aria-hidden="true" />
                    Post comment
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="mb-5 flex h-10 w-fit items-center justify-center rounded-md border border-[#c8c0ae] bg-white px-4 text-sm font-semibold text-[#2f2a22] shadow-sm"
                >
                  Sign in to comment
                </Link>
              )}

              {comments.length > 0 ? (
                <div className="divide-y divide-[#e7e1d3] border-t border-[#e7e1d3]">
                  {comments.map((comment) => (
                    <article key={comment.id} className="py-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          {comment.user.displayName ??
                            comment.user.name ??
                            "Citizen"}
                        </p>
                        <span className="text-xs text-[#8a8170]">
                          {comment.createdAt.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-[#3f3a32]">
                        {comment.body}
                      </p>
                      {session?.user ? (
                        <form action={reportCommentAction} className="mt-2">
                          <input type="hidden" name="slug" value={bill.slug} />
                          <input
                            type="hidden"
                            name="commentId"
                            value={comment.id}
                          />
                          <button
                            type="submit"
                            className="text-xs font-semibold text-[#8a3a2f]"
                          >
                            Report comment
                          </button>
                        </form>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-md bg-[#fbfaf7] px-3 py-3 text-sm text-[#6d6658]">
                  No comments yet. Start the discussion with a practical
                  suggestion.
                </p>
              )}
            </section>
          ) : null}

          {isPublicBill ? (
            <section
              id="suggestions"
              className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Amendment suggestions
                  </h2>
                  <p className="text-sm text-[#6d6658]">
                    Suggest changes without editing the author&apos;s bill.
                  </p>
                </div>
                <span className="rounded-md bg-[#e4eef6] px-2.5 py-1 text-xs font-semibold text-[#123c69]">
                  {suggestions.length}
                </span>
              </div>

              {session?.user ? (
                <form
                  action={createSuggestionAction}
                  className="mb-5 space-y-3"
                >
                  <input type="hidden" name="slug" value={bill.slug} />
                  <input
                    name="section"
                    placeholder="Section or clause, optional"
                    className="h-10 w-full rounded-md border border-[#c8c0ae] bg-white px-3 text-sm outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
                  />
                  <textarea
                    name="body"
                    rows={4}
                    minLength={5}
                    maxLength={3000}
                    required
                    placeholder="Write the amendment or improvement you suggest."
                    className="w-full resize-y rounded-md border border-[#c8c0ae] bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
                  />
                  <button
                    type="submit"
                    className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#123c69] px-4 text-sm font-semibold text-white shadow-sm"
                  >
                    <SendHorizontal size={16} aria-hidden="true" />
                    Suggest amendment
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="mb-5 flex h-10 w-fit items-center justify-center rounded-md border border-[#c8c0ae] bg-white px-4 text-sm font-semibold text-[#2f2a22] shadow-sm"
                >
                  Sign in to suggest
                </Link>
              )}

              {suggestions.length > 0 ? (
                <div className="divide-y divide-[#e7e1d3] border-t border-[#e7e1d3]">
                  {suggestions.map((suggestion) => (
                    <article key={suggestion.id} className="py-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          {suggestion.user.displayName ??
                            suggestion.user.name ??
                            "Citizen"}
                        </p>
                        <Badge>{suggestion.status.toLowerCase()}</Badge>
                        {suggestion.section ? (
                          <span className="text-xs text-[#8a8170]">
                            {suggestion.section}
                          </span>
                        ) : null}
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-[#3f3a32]">
                        {suggestion.body}
                      </p>
                      {isAuthor && suggestion.status === "OPEN" ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <SuggestionButton
                            slug={bill.slug}
                            suggestionId={suggestion.id}
                            intent="accept"
                          >
                            Accept
                          </SuggestionButton>
                          <SuggestionButton
                            slug={bill.slug}
                            suggestionId={suggestion.id}
                            intent="merge"
                          >
                            Accept and merge
                          </SuggestionButton>
                          <SuggestionButton
                            slug={bill.slug}
                            suggestionId={suggestion.id}
                            intent="reject"
                          >
                            Reject
                          </SuggestionButton>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-md bg-[#fbfaf7] px-3 py-3 text-sm text-[#6d6658]">
                  No amendment suggestions yet.
                </p>
              )}
            </section>
          ) : null}
        </article>

        <aside className="space-y-4">
          <BillAnalytics
            votes={bill._count.votes}
            comments={bill._count.comments}
            shares={bill._count.shares}
            saves={bill._count.savedBy}
            suggestions={bill._count.suggestions}
            categoryName={bill.category?.name}
            categoryRank={categoryRank >= 0 ? categoryRank + 1 : null}
            categoryTotal={categoryBills.length}
            activityItems={activityItems}
          />

          <StatusWorkflow status={bill.status} />

          {isAuthor ? (
            <Link
              href={`/bills/${bill.slug}/edit`}
              className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#123c69] px-4 text-sm font-semibold text-white shadow-sm"
            >
              <Pencil size={17} aria-hidden="true" />
              Edit bill
            </Link>
          ) : null}

          <div className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <FileText size={17} aria-hidden="true" />
              Export bill
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`/api/bills/${bill.slug}/export?format=pdf`}
                className="flex h-10 items-center justify-center rounded-md border border-[#c8c0ae] px-3 text-sm font-semibold text-[#2f2a22]"
              >
                PDF
              </a>
              <a
                href={`/api/bills/${bill.slug}/export?format=docx`}
                className="flex h-10 items-center justify-center rounded-md border border-[#c8c0ae] px-3 text-sm font-semibold text-[#2f2a22]"
              >
                DOCX
              </a>
            </div>
          </div>

          {isPublicBill ? (
            <form
              action={toggleSavedBillAction}
              className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm"
            >
              <input type="hidden" name="slug" value={bill.slug} />
              <h2 className="font-semibold">Saved bill</h2>
              <p className="mt-2 text-sm leading-6 text-[#6d6658]">
                {bill._count.savedBy} people saved this bill for later.
              </p>
              <button
                type="submit"
                className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold shadow-sm ${
                  userSavedBill
                    ? "border border-[#c8c0ae] bg-white text-[#2f2a22]"
                    : "bg-[#123c69] text-white"
                }`}
              >
                <Bookmark size={17} aria-hidden="true" />
                {getSavedBillButtonLabel(Boolean(userSavedBill))}
              </button>
            </form>
          ) : null}

          {isPublicBill ? (
            <form
              action={toggleVoteAction}
              className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm"
            >
              <input type="hidden" name="slug" value={bill.slug} />
              <h2 className="font-semibold">Public support</h2>
              <p className="mt-2 text-sm leading-6 text-[#6d6658]">
                {bill._count.votes} people have supported this bill.
              </p>
              <button
                type="submit"
                className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold shadow-sm ${
                  userVote
                    ? "border border-[#c8c0ae] bg-white text-[#2f2a22]"
                    : "bg-[#123c69] text-white"
                }`}
              >
                <ThumbsUp size={17} aria-hidden="true" />
                {userVote ? "Remove vote" : "Support this bill"}
              </button>
            </form>
          ) : null}

          {isPublicBill ? (
            <SharePanel slug={bill.slug} url={billUrl} text={shareText} />
          ) : null}

          <div className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <ShieldCheck size={17} aria-hidden="true" />
              Author reputation
            </div>
            <p className="mt-2 text-sm text-[#4f4a40]">
              {bill.author.displayName ?? bill.author.name ?? "Citizen"}
            </p>
            <p className="mt-3 text-2xl font-semibold text-[#123c69]">
              {reputationScore}
            </p>
            <p className="text-sm font-medium text-[#3f3a32]">
              {reputationLevel}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#6d6658]">
              <StatLabel label="Published" value={authorStats.publishedBills} />
              <StatLabel
                label="Votes received"
                value={authorStats.votesReceived}
              />
              <StatLabel label="Comments" value={authorStats.commentsMade} />
              <StatLabel
                label="Suggestions"
                value={authorStats.suggestionsMade}
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <History size={17} aria-hidden="true" />
              Version history
            </div>
            {versions.length > 0 ? (
              <div className="space-y-2">
                {versions.length >= 2 ? (
                  <Link
                    href={`/bills/${bill.slug}/versions/compare?from=${versions[1].id}&to=${versions[0].id}`}
                    className="block rounded-md bg-[#123c69] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Compare latest versions
                  </Link>
                ) : null}
                {versions.map((version) => (
                  <Link
                    key={version.id}
                    href={`/bills/${bill.slug}/versions/${version.id}`}
                    className="block rounded-md border border-[#e7e1d3] px-3 py-2 text-sm font-medium text-[#123c69]"
                  >
                    {version.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6d6658]">
                No previous versions yet.
              </p>
            )}
          </div>

          {isAuthor && bill.status === "DRAFT" ? (
            <form
              action={publishBillAction}
              className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm"
            >
              <input type="hidden" name="slug" value={bill.slug} />
              <h2 className="font-semibold">Publish draft</h2>
              <p className="mt-2 text-sm leading-6 text-[#6d6658]">
                Publishing makes this bill visible in the public bills list.
              </p>
              <button
                type="submit"
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#123c69] px-4 text-sm font-semibold text-white shadow-sm"
              >
                <Send size={17} aria-hidden="true" />
                Publish bill
              </button>
            </form>
          ) : null}

          <div className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <Tag size={17} aria-hidden="true" />
              Tags
            </div>
            {bill.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {bill.tags.map(({ tag }) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6d6658]">No tags added yet.</p>
            )}
          </div>

          <div className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <FileText size={17} aria-hidden="true" />
              Files
            </div>
            {bill.files.length > 0 ? (
              <div className="space-y-2">
                {bill.files.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-md border border-[#e7e1d3] px-3 py-2 text-sm font-medium text-[#123c69]"
                  >
                    {file.fileName}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6d6658]">No files attached yet.</p>
            )}

            {isAuthor ? (
              <form action={uploadBillFileAction} className="mt-4 space-y-3">
                <input type="hidden" name="slug" value={bill.slug} />
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="w-full text-sm"
                  required
                />
                <button
                  type="submit"
                  className="flex h-10 w-full items-center justify-center rounded-md border border-[#c8c0ae] bg-white px-3 text-sm font-semibold text-[#2f2a22] shadow-sm"
                >
                  Upload PDF/DOCX
                </button>
                <p className="text-xs leading-5 text-[#6d6658]">
                  PDF or DOCX only. Maximum file size is 10 MB. Requires
                  `BLOB_READ_WRITE_TOKEN` for Vercel Blob uploads.
                </p>
                {upload ? <UploadMessage code={upload} /> : null}
              </form>
            ) : null}
          </div>

          {isPublicBill && session?.user ? (
            <form
              action={reportBillAction}
              className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm"
            >
              <input type="hidden" name="slug" value={bill.slug} />
              <div className="mb-3 flex items-center gap-2 font-semibold">
                <Flag size={17} aria-hidden="true" />
                Report bill
              </div>
              <select
                name="reason"
                className="h-10 w-full rounded-md border border-[#c8c0ae] bg-white px-3 text-sm"
              >
                <option>Spam or misleading</option>
                <option>Abusive or hateful</option>
                <option>Personal data exposure</option>
                <option>Needs moderator review</option>
              </select>
              <textarea
                name="details"
                rows={3}
                placeholder="Optional details"
                className="mt-3 w-full rounded-md border border-[#c8c0ae] bg-white px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="mt-3 flex h-10 w-full items-center justify-center rounded-md border border-[#c8c0ae] bg-white px-3 text-sm font-semibold text-[#8a3a2f] shadow-sm"
              >
                Submit report
              </button>
            </form>
          ) : null}

          <Link
            href={isAuthor ? "/dashboard" : "/bills"}
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#c8c0ae] bg-white px-4 text-sm font-semibold text-[#2f2a22] shadow-sm"
          >
            <FileText size={17} aria-hidden="true" />
            {isAuthor ? "Back to dashboard" : "Back to bills"}
          </Link>
        </aside>
      </section>
    </main>
  );
}

function UploadMessage({ code }: { code: string }) {
  const messages: Record<string, string> = {
    "blob-missing": "File storage is not configured yet.",
    missing: "Choose a PDF or DOCX file before uploading.",
    ok: "File uploaded successfully.",
    size: "File is too large. Upload a PDF or DOCX up to 10 MB.",
    type: "Only PDF and DOCX files are supported.",
  };

  return (
    <p
      className={`rounded-md px-3 py-2 text-xs font-medium ${
        code === "ok"
          ? "bg-[#e6f1ec] text-[#2f7d62]"
          : "bg-[#fff3d7] text-[#6b4e16]"
      }`}
    >
      {messages[code] ?? "Upload could not be completed."}
    </p>
  );
}

function SuggestionButton({
  slug,
  suggestionId,
  intent,
  children,
}: {
  slug: string;
  suggestionId: string;
  intent: "accept" | "merge" | "reject";
  children: React.ReactNode;
}) {
  return (
    <form action={reviewSuggestionAction}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="suggestionId" value={suggestionId} />
      <button
        type="submit"
        name="intent"
        value={intent}
        className={`h-8 rounded-md border px-2.5 text-xs font-semibold ${
          intent === "reject"
            ? "border-[#c8c0ae] text-[#8a3a2f]"
            : "border-[#123c69] bg-[#123c69] text-white"
        }`}
      >
        {children}
      </button>
    </form>
  );
}

function ContentBlock({
  title,
  content,
}: {
  title: string;
  content: string | null;
}) {
  return (
    <section className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {content ? (
        <p className="whitespace-pre-wrap text-sm leading-7 text-[#3f3a32]">
          {content}
        </p>
      ) : (
        <p className="text-sm text-[#6d6658]">Not added yet.</p>
      )}
    </section>
  );
}

function BillAnalytics({
  votes,
  comments,
  shares,
  saves,
  suggestions,
  categoryName,
  categoryRank,
  categoryTotal,
  activityItems,
}: {
  votes: number;
  comments: number;
  shares: number;
  saves: number;
  suggestions: number;
  categoryName?: string;
  categoryRank: number | null;
  categoryTotal: number;
  activityItems: { label: string; date: Date }[];
}) {
  return (
    <section className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 font-semibold">
        <ChartNoAxesColumn size={17} aria-hidden="true" />
        Public analytics
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatLabel label="Votes" value={votes} />
        <StatLabel label="Comments" value={comments} />
        <StatLabel label="Shares" value={shares} />
        <StatLabel label="Saves" value={saves} />
        <StatLabel label="Suggestions" value={suggestions} />
      </div>
      {categoryName && categoryRank ? (
        <p className="mt-4 rounded-md bg-[#fbfaf7] px-3 py-2 text-sm text-[#4f4a40]">
          Ranked #{categoryRank} of {categoryTotal} in {categoryName}
        </p>
      ) : null}
      <div className="mt-4 border-t border-[#e7e1d3] pt-4">
        <p className="mb-2 text-sm font-semibold text-[#3f3a32]">
          Recent activity
        </p>
        <div className="space-y-2">
          {activityItems.slice(0, 3).map((item) => (
            <p
              key={`${item.label}-${item.date.toISOString()}`}
              className="text-sm text-[#6d6658]"
            >
              {item.label} on {item.date.toLocaleDateString("en-IN")}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatusWorkflow({ status }: { status: string }) {
  const steps = [
    {
      label: "Draft",
      active: status === "DRAFT",
      done: status !== "DRAFT",
    },
    {
      label: "Published",
      active: status === "PUBLISHED",
      done: status !== "DRAFT",
    },
    {
      label: "Under discussion",
      active: status === "UNDER_DISCUSSION",
      done: status === "UNDER_DISCUSSION" || status === "READY_FOR_REVIEW",
    },
    {
      label: "Community supported",
      active: status === "READY_FOR_REVIEW",
      done: status === "READY_FOR_REVIEW",
    },
  ];

  return (
    <section className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Public status</h2>
      <div className="mt-4 space-y-3">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            <span
              className={`size-3 rounded-full ${
                step.active || step.done ? "bg-[#123c69]" : "bg-[#d8d2c4]"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                step.active ? "text-[#123c69]" : "text-[#4f4a40]"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-[#6d6658]">
        Community supported is persisted when a bill reaches 25 public votes.
      </p>
    </section>
  );
}

function StatLabel({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[#e7e1d3] px-3 py-2">
      <p className="text-lg font-semibold text-[#123c69]">
        {value.toLocaleString()}
      </p>
      <p className="text-xs font-medium text-[#6d6658]">{label}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-[#e4eef6] px-2.5 py-1 text-xs font-semibold capitalize text-[#123c69]">
      {children}
    </span>
  );
}

async function getAuthorStats(authorId: string) {
  const [
    publishedBills,
    authorBills,
    commentsMade,
    suggestionsMade,
    acceptedSuggestions,
  ] = await Promise.all([
    prisma.bill.count({
      where: {
        authorId,
        status: {
          in: ["PUBLISHED", "UNDER_DISCUSSION", "READY_FOR_REVIEW"],
        },
      },
    }),
    prisma.bill.findMany({
      where: {
        authorId,
      },
      select: {
        _count: {
          select: {
            votes: true,
          },
        },
      },
    }),
    prisma.comment.count({
      where: {
        userId: authorId,
      },
    }),
    prisma.amendmentSuggestion.count({
      where: {
        userId: authorId,
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
    publishedBills,
    votesReceived: authorBills.reduce(
      (total, item) => total + item._count.votes,
      0,
    ),
    commentsMade,
    suggestionsMade,
    acceptedSuggestions,
  };
}
