import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Bookmark,
  Bell,
  Calendar,
  ChartNoAxesColumn,
  Clock,
  Flag,
  FileText,
  History,
  ListTree,
  MessageSquare,
  Pencil,
  PenLine,
  SendHorizontal,
  Send,
  Share2,
  ShieldCheck,
  ThumbsUp,
} from "lucide-react";

import {
  createCommentAction,
  createSuggestionAction,
  publishBillAction,
  reportBillAction,
  reportCommentAction,
  reviewSuggestionAction,
  toggleFollowBillAction,
  toggleSavedBillAction,
  toggleVoteAction,
  uploadBillFileAction,
} from "@/app/bills/[slug]/actions";
import { SharePanel } from "@/components/share-panel";
import { BillTabs } from "@/components/bill-tabs";
import { CharCount } from "@/components/char-count";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAppUrl } from "@/lib/app-url";
import { authOptions } from "@/lib/auth";
import { canViewBill, isPublicBillStatus } from "@/lib/bill-visibility";
import { getBillDetailData } from "@/lib/bill-detail";
import { formatRelativeTime } from "@/lib/relative-time";
import {
  estimateReadingTimeMinutes,
  extractBillSections,
  matchBillTextHeading,
  billSectionId,
  splitBillTextParagraphs,
} from "@/lib/bill-text";
import { formatDisplayTitle } from "@/lib/display-title";
import { prisma } from "@/lib/prisma";
import { getRequestLocale } from "@/lib/request-locale";
import { calculateReputationScore, getReputationLevel } from "@/lib/reputation";

const appUrl = getAppUrl();

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

  if (!bill || !isPublicBillStatus(bill.status)) {
    return {
      title: "MattamUndo",
    };
  }

  const url = `/bills/${slug}`;

  return {
    title: bill.title,
    description: bill.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: bill.title,
      description: bill.description,
      url,
      siteName: "MattamUndo",
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
  const { slug } = await params;
  const [session, { upload }, billData, locale] = await Promise.all([
    getServerSession(authOptions),
    searchParams,
    getBillDetailData(slug),
    getRequestLocale(),
  ]);
  if (!billData) {
    notFound();
  }
  const { authorStats, bill, categoryBills, comments, suggestions, versions } =
    billData;

  const isAuthor = session?.user?.id === bill.authorId;
  const isPublicBill = isPublicBillStatus(bill.status);

  if (!canViewBill(bill, session?.user?.id)) {
    if (session?.user?.id) {
      notFound();
    }

    redirect(`/login?callbackUrl=/bills/${slug}`);
  }

  const [userVote, userSavedBill, userFollow] = session?.user?.id
    ? await Promise.all([
        prisma.vote.findUnique({
          where: {
            billId_userId: {
              billId: bill.id,
              userId: session.user.id,
            },
          },
          select: { id: true },
        }),
        prisma.savedBill.findUnique({
          where: {
            billId_userId: {
              billId: bill.id,
              userId: session.user.id,
            },
          },
          select: { id: true },
        }),
        prisma.billFollow.findUnique({
          where: {
            billId_userId: {
              billId: bill.id,
              userId: session.user.id,
            },
          },
          select: { id: true },
        }),
      ])
    : [null, null, null];
  const billUrl = `${appUrl}/bills/${bill.slug}`;
  const shareText = `Support this public bill: ${formatDisplayTitle(bill.title)}`;
  const categoryRank = categoryBills
    .sort((first, second) => second._count.votes - first._count.votes)
    .findIndex((item) => item.id === bill.id);
  const reputationScore = calculateReputationScore(authorStats);
  const reputationLevel = getReputationLevel(reputationScore);
  const engagementTotal =
    bill._count.votes +
    bill._count.comments +
    bill._count.shares +
    bill._count.savedBy +
    bill._count.followers +
    bill._count.suggestions;
  const hasEstablishedActivity = engagementTotal >= 5;
  const readableContent = [
    bill.problem,
    bill.proposedSolution,
    bill.expectedImpact,
    bill.body,
    bill.references,
  ]
    .filter((part): part is string => Boolean(part))
    .join("\n\n");
  const readingMinutes = estimateReadingTimeMinutes(readableContent);
  const bodySections = extractBillSections(bill.body ?? "");
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
    <main
      id="main-content"
      className="flex min-h-screen flex-col bg-background pb-20 text-foreground lg:pb-0"
    >
      <SiteHeader />
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge>{bill.status.replaceAll("_", " ").toLowerCase()}</Badge>
            {bill.category ? <Badge>{bill.category.name}</Badge> : null}
          </div>
          <h1 className="font-display max-w-4xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {formatDisplayTitle(bill.title)}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-soft">
            {bill.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
            <span className="flex items-center gap-2">
              <Calendar size={16} aria-hidden="true" />
              Created {bill.createdAt.toLocaleDateString("en-IN")}
            </span>
            <span className="flex items-center gap-2">
              <ThumbsUp size={16} aria-hidden="true" />
              {bill._count.votes} supporters
            </span>
            <span className="flex items-center gap-2">
              <MessageSquare size={16} aria-hidden="true" />
              {bill._count.comments} comments
            </span>
            <span className="flex items-center gap-2">
              <SendHorizontal size={16} aria-hidden="true" />
              {bill._count.suggestions} amendments
            </span>
            {readingMinutes > 0 ? (
              <span className="flex items-center gap-2">
                <Clock size={16} aria-hidden="true" />
                {readingMinutes} min read
              </span>
            ) : null}
            {hasEstablishedActivity && categoryRank >= 0 ? (
              <span className="flex items-center gap-2 font-semibold text-accent">
                <ChartNoAxesColumn size={16} aria-hidden="true" />#
                {categoryRank + 1} in {bill.category?.name ?? "category"}
              </span>
            ) : (
              <span>New public proposal — be the first to contribute.</span>
            )}
          </div>
        </div>

        <div className="sticky top-0 z-20 hidden border-t border-border bg-surface/95 backdrop-blur-sm lg:block">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-5 py-3 sm:px-8">
            {isPublicBill && !isAuthor ? (
              <form action={toggleVoteAction}>
                <input type="hidden" name="slug" value={bill.slug} />
                <button
                  type="submit"
                  className={`flex h-11 items-center gap-2 rounded-md px-5 text-sm font-semibold shadow-sm transition-colors ${
                    userVote
                      ? "border border-accent bg-accent-soft text-accent"
                      : "bg-accent text-white hover:bg-hero-ink"
                  }`}
                >
                  <ThumbsUp size={17} aria-hidden="true" />
                  {userVote
                    ? `Supported · ${bill._count.votes}`
                    : `Support this bill · ${bill._count.votes}`}
                </button>
              </form>
            ) : null}
            {isAuthor ? (
              <Link
                href={`/bills/${bill.slug}/edit`}
                className="flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-hero-ink"
              >
                <Pencil size={17} aria-hidden="true" />
                Edit bill
              </Link>
            ) : null}
            {isPublicBill ? (
              <>
                <a
                  href="#comments"
                  className="flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-4 text-sm font-semibold text-ink-soft shadow-sm transition-colors hover:border-accent hover:text-accent"
                >
                  <MessageSquare size={17} aria-hidden="true" />
                  Discuss
                </a>
                <a
                  href="#suggestions"
                  className="flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-4 text-sm font-semibold text-ink-soft shadow-sm transition-colors hover:border-accent hover:text-accent"
                >
                  <PenLine size={17} aria-hidden="true" />
                  Suggest amendment
                </a>
                <a
                  href="#share"
                  className="flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-4 text-sm font-semibold text-ink-soft shadow-sm transition-colors hover:border-accent hover:text-accent"
                >
                  <Share2 size={17} aria-hidden="true" />
                  Share
                </a>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_320px]">
        <article>
          {isPublicBill ? (
            <BillEngagementPrompt
              slug={bill.slug}
              signedIn={Boolean(session?.user)}
              hasEstablishedActivity={hasEstablishedActivity}
            />
          ) : null}
          <BillTabs
            counts={{
              comments: comments.length,
              suggestions: suggestions.length,
              versions: versions.length,
            }}
            sections={{
              summary: (
                <div className="space-y-5">
                  <ContentBlock
                    title="Problem statement"
                    content={bill.problem}
                  />
                  <ContentBlock
                    title="Proposed solution"
                    content={bill.proposedSolution}
                  />
                  <ContentBlock
                    title="Expected impact"
                    content={bill.expectedImpact}
                    hideWhenEmpty
                  />
                  <ContentBlock
                    title="Draft bill text"
                    content={bill.body}
                    formatted
                  />
                  <ContentBlock
                    title="References and supporting links"
                    content={bill.references}
                    hideWhenEmpty
                    linkify
                  />
                </div>
              ),
              comments: isPublicBill ? (
                <section
                  id="comments"
                  className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm"
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">Comments</h2>
                      <p className="text-sm text-ink-muted">
                        Discuss public impact, gaps, and improvements.
                      </p>
                    </div>
                    <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                      {comments.length}
                    </span>
                  </div>

                  {session?.user ? (
                    <form action={createCommentAction} className="mb-5">
                      <input type="hidden" name="slug" value={bill.slug} />
                      <label className="block">
                        <span className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-ink-soft">
                            Add a comment
                          </span>
                          <CharCount htmlFor="comment-body" max={2000} />
                        </span>
                        <textarea
                          name="body"
                          id="comment-body"
                          rows={4}
                          minLength={3}
                          maxLength={2000}
                          required
                          placeholder="Share a question, concern, or suggestion for improving this bill."
                          className="mt-2 w-full resize-y rounded-md border border-border-strong bg-surface-raised px-3 py-3 text-sm leading-6 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                        />
                      </label>
                      <button
                        type="submit"
                        className="mt-3 flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white shadow-sm"
                      >
                        <SendHorizontal size={16} aria-hidden="true" />
                        Post comment
                      </button>
                    </form>
                  ) : (
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(`/bills/${bill.slug}#comments`)}`}
                      className="mb-5 flex h-10 w-fit items-center justify-center rounded-md border border-border-strong bg-surface-raised px-4 text-sm font-semibold text-ink-soft shadow-sm"
                    >
                      Sign in to comment
                    </Link>
                  )}

                  {comments.length > 0 ? (
                    <div className="divide-y divide-border border-t border-border">
                      {comments.map((comment) => (
                        <article key={comment.id} className="py-4">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <p className="font-semibold">
                              {comment.user.displayName ??
                                comment.user.name ??
                                "Citizen"}
                            </p>
                            <time
                              dateTime={comment.createdAt.toISOString()}
                              className="text-xs text-ink-muted"
                            >
                              {formatRelativeTime(
                                comment.createdAt,
                                locale,
                              )}
                            </time>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-7 text-ink-soft">
                            <LinkifyText text={comment.body} />
                          </p>
                          {session?.user ? (
                            <form action={reportCommentAction} className="mt-2">
                              <input
                                type="hidden"
                                name="slug"
                                value={bill.slug}
                              />
                              <input
                                type="hidden"
                                name="commentId"
                                value={comment.id}
                              />
                              <button
                                type="submit"
                                className="text-xs font-semibold text-danger"
                              >
                                Report comment
                              </button>
                            </form>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-md bg-surface px-3 py-3 text-sm text-ink-muted">
                      No comments yet. Start the discussion with a practical
                      suggestion.
                    </p>
                  )}
                </section>
              ) : (
                <UnavailableSection message="Discussion opens when this bill is published." />
              ),
              suggestions: isPublicBill ? (
                <section
                  id="suggestions"
                  className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm"
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Amendment suggestions
                      </h2>
                      <p className="text-sm text-ink-muted">
                        Suggest changes without editing the author&apos;s bill.
                      </p>
                    </div>
                    <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
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
                        className="h-10 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                      />
                      <label className="block">
                        <span className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-ink-soft">
                            Amendment
                          </span>
                          <CharCount htmlFor="suggestion-body" max={3000} />
                        </span>
                        <textarea
                          name="body"
                          id="suggestion-body"
                          rows={4}
                          minLength={5}
                          maxLength={3000}
                          required
                          placeholder="Write the amendment or improvement you suggest."
                          className="mt-1 w-full resize-y rounded-md border border-border-strong bg-surface-raised px-3 py-3 text-sm leading-6 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                        />
                      </label>
                      <button
                        type="submit"
                        className="flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white shadow-sm"
                      >
                        <SendHorizontal size={16} aria-hidden="true" />
                        Suggest amendment
                      </button>
                    </form>
                  ) : (
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(`/bills/${bill.slug}#suggestions`)}`}
                      className="mb-5 flex h-10 w-fit items-center justify-center rounded-md border border-border-strong bg-surface-raised px-4 text-sm font-semibold text-ink-soft shadow-sm"
                    >
                      Sign in to suggest
                    </Link>
                  )}

                  {suggestions.length > 0 ? (
                    <div className="divide-y divide-border border-t border-border">
                      {suggestions.map((suggestion) => (
                        <article key={suggestion.id} className="py-4">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <p className="font-semibold">
                              {suggestion.user.displayName ??
                                suggestion.user.name ??
                                "Citizen"}
                            </p>
                            <Badge>{suggestion.status.toLowerCase()}</Badge>
                            <time
                              dateTime={suggestion.createdAt.toISOString()}
                              className="text-xs text-ink-muted"
                            >
                              {formatRelativeTime(
                                suggestion.createdAt,
                                locale,
                              )}
                            </time>
                            {suggestion.section ? (
                              <span className="text-xs text-ink-muted">
                                · {suggestion.section}
                              </span>
                            ) : null}
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-7 text-ink-soft">
                            <LinkifyText text={suggestion.body} />
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
                    <p className="rounded-md bg-surface px-3 py-3 text-sm text-ink-muted">
                      No amendment suggestions yet.
                    </p>
                  )}
                </section>
              ) : (
                <UnavailableSection message="Amendment suggestions open when this bill is published." />
              ),
              versions: (
                <section className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 font-semibold">
                    <History size={17} aria-hidden="true" />
                    Version history
                  </div>
                  {versions.length > 0 ? (
                    <div className="space-y-2">
                      {versions.length >= 2 ? (
                        <Link
                          href={`/bills/${bill.slug}/versions/compare?from=${versions[1].id}&to=${versions[0].id}`}
                          className="block rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white"
                        >
                          Compare latest versions
                        </Link>
                      ) : null}
                      {versions.map((version, index) => (
                        <Link
                          key={version.id}
                          href={`/bills/${bill.slug}/versions/${version.id}`}
                          className="block rounded-md border border-border px-3 py-2 text-sm"
                        >
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-accent">
                              {formatRelativeTime(version.createdAt, locale)}
                            </span>
                            {index === 0 ? (
                              <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent">
                                Latest
                              </span>
                            ) : null}
                          </span>
                          {version.summary ? (
                            <span className="mt-1 line-clamp-2 block text-xs leading-5 text-ink-muted">
                              {version.summary}
                            </span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink-muted">
                      No previous versions yet.
                    </p>
                  )}
                </section>
              ),
            }}
          />
        </article>

        <aside className="space-y-4">
          {bodySections.length >= 2 ? (
            <nav
              aria-label="Bill sections"
              className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm"
            >
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <ListTree size={17} aria-hidden="true" />
                On this page
              </h2>
              <ol className="space-y-2">
                {bodySections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex gap-2 text-sm leading-6 text-ink-soft transition-colors hover:text-accent"
                    >
                      <span className="shrink-0 font-semibold text-accent">
                        {index + 1}.
                      </span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <BillAnalytics
            votes={bill._count.votes}
            comments={bill._count.comments}
            shares={bill._count.shares}
            saves={bill._count.savedBy}
            followers={bill._count.followers}
            suggestions={bill._count.suggestions}
            categoryName={bill.category?.name}
            categoryRank={
              hasEstablishedActivity && categoryRank >= 0
                ? categoryRank + 1
                : null
            }
            categoryTotal={categoryBills.length}
            activityItems={activityItems}
            hasEstablishedActivity={hasEstablishedActivity}
          />

          <StatusWorkflow status={bill.status} />

          {isPublicBill ? (
            <div className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm">
              <h2 className="font-semibold">Stay involved</h2>
              <p className="mt-1 text-sm leading-5 text-ink-muted">
                {bill._count.followers} following · {bill._count.savedBy} saved
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <form action={toggleFollowBillAction}>
                  <input type="hidden" name="slug" value={bill.slug} />
                  <button
                    type="submit"
                    className={`flex h-11 w-full items-center justify-center gap-2 rounded-md px-2 text-sm font-semibold shadow-sm ${
                      userFollow
                        ? "border border-accent bg-accent-soft text-accent"
                        : "border border-border-strong bg-surface-raised text-ink-soft"
                    }`}
                  >
                    <Bell size={16} aria-hidden="true" />
                    {userFollow ? "Following" : "Follow"}
                  </button>
                </form>
                <form action={toggleSavedBillAction}>
                  <input type="hidden" name="slug" value={bill.slug} />
                  <button
                    type="submit"
                    className={`flex h-11 w-full items-center justify-center gap-2 rounded-md px-2 text-sm font-semibold shadow-sm ${
                      userSavedBill
                        ? "border border-accent bg-accent-soft text-accent"
                        : "border border-border-strong bg-surface-raised text-ink-soft"
                    }`}
                  >
                    <Bookmark size={16} aria-hidden="true" />
                    {userSavedBill ? "Saved" : "Save"}
                  </button>
                </form>
              </div>
              <div className="mt-5 border-t border-border pt-4" id="share">
                <SharePanel
                  slug={bill.slug}
                  url={billUrl}
                  text={shareText}
                  embedded
                />
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <ShieldCheck size={17} aria-hidden="true" />
              Author reputation
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              {bill.author.displayName ?? bill.author.name ?? "Citizen"}
            </p>
            <p className="mt-3 text-2xl font-semibold text-accent">
              {reputationScore}
            </p>
            <p className="text-sm font-medium text-ink-soft">
              {reputationLevel}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink-muted">
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

          {isAuthor && bill.status === "DRAFT" ? (
            <form
              action={publishBillAction}
              className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm"
            >
              <input type="hidden" name="slug" value={bill.slug} />
              <h2 className="font-semibold">Publish draft</h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                Publishing makes this bill visible in the public bills list.
              </p>
              <button
                type="submit"
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white shadow-sm"
              >
                <Send size={17} aria-hidden="true" />
                Publish bill
              </button>
            </form>
          ) : null}

          <div className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <FileText size={17} aria-hidden="true" />
              Resources
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`/api/bills/${bill.slug}/export?format=pdf`}
                className="flex h-10 items-center justify-center rounded-md border border-border-strong px-3 text-sm font-semibold text-ink-soft"
              >
                PDF
              </a>
              <a
                href={`/api/bills/${bill.slug}/export?format=docx`}
                className="flex h-10 items-center justify-center rounded-md border border-border-strong px-3 text-sm font-semibold text-ink-soft"
              >
                DOCX
              </a>
            </div>

            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Tags
            </h3>
            {bill.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {bill.tags.map(({ tag }) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">No tags added yet.</p>
            )}

            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Files
            </h3>
            {bill.files.length > 0 ? (
              <div className="mt-2 space-y-2">
                {bill.files.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-md border border-border px-3 py-2 text-sm font-medium text-accent"
                  >
                    {file.fileName}
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">No files attached yet.</p>
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
                  className="flex h-10 w-full items-center justify-center rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-semibold text-ink-soft shadow-sm"
                >
                  Upload PDF/DOCX
                </button>
                <p className="text-xs leading-5 text-ink-muted">
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
              className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm"
            >
              <input type="hidden" name="slug" value={bill.slug} />
              <div className="mb-3 flex items-center gap-2 font-semibold">
                <Flag size={17} aria-hidden="true" />
                Report bill
              </div>
              <select
                name="reason"
                className="h-10 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-sm"
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
                className="mt-3 w-full rounded-md border border-border-strong bg-surface-raised px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="mt-3 flex h-10 w-full items-center justify-center rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-semibold text-danger shadow-sm"
              >
                Submit report
              </button>
            </form>
          ) : null}

          <Link
            href={isAuthor ? "/dashboard" : "/bills"}
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-border-strong bg-surface-raised px-4 text-sm font-semibold text-ink-soft shadow-sm"
          >
            <FileText size={17} aria-hidden="true" />
            {isAuthor ? "Back to dashboard" : "Back to bills"}
          </Link>
        </aside>
      </section>

      {isPublicBill ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-raised/95 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-2 px-4 py-3">
            {!isAuthor ? (
              <form action={toggleVoteAction} className="flex-1">
                <input type="hidden" name="slug" value={bill.slug} />
                <button
                  type="submit"
                  className={`flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold shadow-sm transition-colors ${
                    userVote
                      ? "border border-accent bg-accent-soft text-accent"
                      : "bg-accent text-white"
                  }`}
                >
                  <ThumbsUp size={16} aria-hidden="true" />
                  {userVote ? "Supported" : "Support"}
                </button>
              </form>
            ) : (
              <Link
                href={`/bills/${bill.slug}/edit`}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white shadow-sm"
              >
                <Pencil size={16} aria-hidden="true" />
                Edit bill
              </Link>
            )}
            <a
              href="#comments"
              aria-label="Discuss"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-border-strong bg-surface-raised text-ink-soft shadow-sm"
            >
              <MessageSquare size={17} aria-hidden="true" />
            </a>
            <a
              href="#suggestions"
              aria-label="Suggest amendment"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-border-strong bg-surface-raised text-ink-soft shadow-sm"
            >
              <PenLine size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      ) : null}
      <SiteFooter />
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
          ? "bg-success-soft text-success"
          : "bg-warning-bg text-warning-ink"
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
            ? "border-border-strong text-danger"
            : "border-accent bg-accent text-white"
        }`}
      >
        {children}
      </button>
    </form>
  );
}

function LinkifyText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<]+)/g);

  return (
    <>
      {parts.map((part, index) =>
        /^https?:/.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="break-all font-medium text-accent underline-offset-2 hover:underline"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

function ContentBlock({
  title,
  content,
  hideWhenEmpty = false,
  formatted = false,
  linkify = false,
}: {
  title: string;
  content: string | null;
  hideWhenEmpty?: boolean;
  formatted?: boolean;
  linkify?: boolean;
}) {
  if (!content && hideWhenEmpty) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {content ? (
        formatted ? (
          <FormattedBillText content={content} />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-7 text-ink-soft">
            {linkify ? <LinkifyText text={content} /> : content}
          </p>
        )
      ) : (
        <p className="text-sm text-ink-muted">Not added yet.</p>
      )}
    </section>
  );
}

function FormattedBillText({ content }: { content: string }) {
  const blocks = splitBillTextParagraphs(content).reduce<
    {
      paragraph: string;
      heading: string | null;
      id: string | null;
    }[]
  >((accumulator, paragraph) => {
    const heading = matchBillTextHeading(paragraph);

    if (!heading) {
      return [...accumulator, { paragraph, heading: null, id: null }];
    }

    const headingCount = accumulator.filter(
      (block) => block.id !== null,
    ).length;

    return [
      ...accumulator,
      { paragraph, heading, id: billSectionId(headingCount) },
    ];
  }, []);

  return (
    <div className="space-y-4 text-sm leading-7 text-ink-soft">
      {blocks.map((block, index) => {
        if (block.heading) {
          return (
            <h3
              key={`${block.heading}-${index}`}
              id={block.id ?? undefined}
              className="scroll-mt-24 font-semibold text-foreground"
            >
              {block.heading}
            </h3>
          );
        }

        return (
          <p
            key={`${block.paragraph.slice(0, 24)}-${index}`}
            className="whitespace-pre-wrap"
          >
            {block.paragraph
              .split(/(\*\*[^*]+\*\*)/)
              .map((part, partIndex) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={partIndex}>{part.slice(2, -2)}</strong>
                ) : (
                  part
                ),
              )}
          </p>
        );
      })}
    </div>
  );
}

function BillEngagementPrompt({
  slug,
  signedIn,
  hasEstablishedActivity,
}: {
  slug: string;
  signedIn: boolean;
  hasEstablishedActivity: boolean;
}) {
  if (hasEstablishedActivity) {
    return null;
  }

  const href = signedIn
    ? "#comments"
    : `/login?callbackUrl=${encodeURIComponent(`/bills/${slug}#comments`)}`;

  return (
    <section className="rounded-lg border border-accent/30 bg-accent-soft p-5">
      <h2 className="text-lg font-semibold text-accent">
        Help start the public discussion
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
        This proposal is new. Add a practical comment, suggest an amendment, or
        support it if it addresses a public need.
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-semibold text-white shadow-sm"
      >
        Join the discussion
      </Link>
    </section>
  );
}

function BillAnalytics({
  votes,
  comments,
  shares,
  saves,
  followers,
  suggestions,
  categoryName,
  categoryRank,
  categoryTotal,
  activityItems,
  hasEstablishedActivity,
}: {
  votes: number;
  comments: number;
  shares: number;
  saves: number;
  followers: number;
  suggestions: number;
  categoryName?: string;
  categoryRank: number | null;
  categoryTotal: number;
  activityItems: { label: string; date: Date }[];
  hasEstablishedActivity: boolean;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 font-semibold">
        <ChartNoAxesColumn size={17} aria-hidden="true" />
        Public analytics
      </div>
      {hasEstablishedActivity ? (
        <div className="grid grid-cols-2 gap-2">
          <StatLabel label="Votes" value={votes} />
          <StatLabel label="Comments" value={comments} />
          <StatLabel label="Shares" value={shares} />
          <StatLabel label="Saves" value={saves} />
          <StatLabel label="Followers" value={followers} />
          <StatLabel label="Suggestions" value={suggestions} />
        </div>
      ) : (
        <p className="rounded-md bg-surface px-3 py-3 text-sm leading-6 text-ink-soft">
          This proposal is gathering its first public responses. Activity will
          appear here once people begin participating.
        </p>
      )}
      {hasEstablishedActivity && categoryName && categoryRank ? (
        <p className="mt-4 rounded-md bg-surface px-3 py-2 text-sm text-ink-soft">
          Ranked #{categoryRank} of {categoryTotal} in {categoryName}
        </p>
      ) : null}
      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-2 text-sm font-semibold text-ink-soft">
          Recent activity
        </p>
        <div className="space-y-2">
          {activityItems.slice(0, 3).map((item) => (
            <p
              key={`${item.label}-${item.date.toISOString()}`}
              className="text-sm text-ink-muted"
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
  ];

  return (
    <section className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm">
      <h2 className="font-semibold">Public status</h2>
      <div className="mt-4 space-y-3">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            <span
              className={`size-3 rounded-full ${
                step.active || step.done ? "bg-accent" : "bg-border"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                step.active ? "text-accent" : "text-ink-soft"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-ink-muted">
        Community supported is persisted when a bill reaches 25 public votes.
      </p>
    </section>
  );
}

function StatLabel({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <p className="text-lg font-semibold text-accent">
        {value.toLocaleString()}
      </p>
      <p className="text-xs font-medium text-ink-muted">{label}</p>
    </div>
  );
}

function UnavailableSection({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-border bg-surface-raised px-4 py-4 text-sm leading-6 text-ink-muted shadow-sm">
      {message}
    </p>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold capitalize text-accent">
      {children}
    </span>
  );
}
