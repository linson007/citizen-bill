import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileCheck2,
  FileText,
  Bookmark,
  Bell,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Plus,
  Rocket,
  Search,
  Share2,
  ThumbsUp,
} from "lucide-react";

import { ContinueDraftCard } from "@/components/continue-draft-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { authOptions } from "@/lib/auth";
import { getSavedBillEmptyMessage } from "@/lib/bill-engagement";
import { getBillFollowEmptyMessage } from "@/lib/bill-follow";
import { PUBLIC_BILL_STATUSES } from "@/lib/bill-visibility";
import {
  countCompletedOnboardingSteps,
  getOnboardingSteps,
} from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const [
    totalBillCount,
    publishedCount,
    draftCount,
    voteCount,
    commentCount,
    savedBillCount,
    followedBillCount,
    recentBills,
    savedBills,
    followedBills,
    recentCommentsOnMyBills,
    trendingBills,
    mostSupportedBills,
    recentlyPublishedBills,
    categories,
  ] = await Promise.all([
    prisma.bill.count({
      where: {
        authorId: session.user.id,
      },
    }),
    prisma.bill.count({
      where: {
        authorId: session.user.id,
        status: {
          in: [...PUBLIC_BILL_STATUSES],
        },
      },
    }),
    prisma.bill.count({
      where: {
        authorId: session.user.id,
        status: "DRAFT",
      },
    }),
    prisma.vote.count({
      where: {
        userId: session.user.id,
      },
    }),
    prisma.comment.count({
      where: {
        userId: session.user.id,
      },
    }),
    prisma.savedBill.count({
      where: {
        userId: session.user.id,
      },
    }),
    prisma.billFollow.count({
      where: {
        userId: session.user.id,
      },
    }),
    prisma.bill.findMany({
      where: {
        authorId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      include: {
        category: true,
      },
    }),
    prisma.savedBill.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        bill: {
          include: {
            category: true,
          },
        },
      },
    }),
    prisma.billFollow.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        bill: {
          include: {
            category: true,
          },
        },
      },
    }),
    prisma.comment.findMany({
      where: {
        bill: {
          authorId: session.user.id,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        bill: true,
        user: true,
      },
    }),
    prisma.bill.findMany({
      where: {
        status: {
          in: [...PUBLIC_BILL_STATUSES],
        },
      },
      orderBy: [
        {
          comments: {
            _count: "desc",
          },
        },
        {
          shares: {
            _count: "desc",
          },
        },
        {
          votes: {
            _count: "desc",
          },
        },
      ],
      take: 5,
      include: {
        category: true,
        _count: {
          select: {
            votes: true,
            comments: true,
            shares: true,
          },
        },
      },
    }),
    prisma.bill.findMany({
      where: {
        status: {
          in: [...PUBLIC_BILL_STATUSES],
        },
      },
      orderBy: {
        votes: {
          _count: "desc",
        },
      },
      take: 5,
      include: {
        category: true,
        _count: {
          select: {
            votes: true,
            comments: true,
            shares: true,
          },
        },
      },
    }),
    prisma.bill.findMany({
      where: {
        status: {
          in: [...PUBLIC_BILL_STATUSES],
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 5,
      include: {
        category: true,
        _count: {
          select: {
            votes: true,
            comments: true,
            shares: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      where: {
        bills: {
          some: {
            status: {
              in: [...PUBLIC_BILL_STATUSES],
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const discoverySeenIds = new Set<string>();
  const trendingForDisplay = trendingBills.filter((bill) => {
    if (discoverySeenIds.has(bill.id)) {
      return false;
    }
    discoverySeenIds.add(bill.id);
    return true;
  });
  const mostSupportedForDisplay = mostSupportedBills.filter((bill) => {
    if (discoverySeenIds.has(bill.id)) {
      return false;
    }
    discoverySeenIds.add(bill.id);
    return true;
  });
  const recentlyPublishedForDisplay = recentlyPublishedBills.filter((bill) => {
    if (discoverySeenIds.has(bill.id)) {
      return false;
    }
    discoverySeenIds.add(bill.id);
    return true;
  });

  const dashboardCards = [
    {
      title: "My bills",
      value: totalBillCount.toString(),
      detail: "All bills you created, including drafts and published bills.",
      icon: FileText,
    },
    {
      title: "Published",
      value: publishedCount.toString(),
      detail: "Bills visible in the public bills list.",
      icon: FileCheck2,
    },
    {
      title: "My drafts",
      value: draftCount.toString(),
      detail: "Private bills that are not published yet.",
      icon: FileText,
    },
    {
      title: "Votes given",
      value: voteCount.toString(),
      detail: "Bills you support will appear here.",
      icon: ThumbsUp,
    },
    {
      title: "Comments",
      value: commentCount.toString(),
      detail: "Track discussion on your proposals.",
      icon: MessageSquare,
    },
    {
      title: "Saved bills",
      value: savedBillCount.toString(),
      detail: "Public bills you saved for reading or follow-up.",
      icon: Bookmark,
    },
    {
      title: "Followed bills",
      value: followedBillCount.toString(),
      detail: "Bills where you receive new activity notifications.",
      icon: Bell,
    },
  ];

  const onboardingSteps = getOnboardingSteps({
    billCount: totalBillCount,
    publishedCount,
    voteCount,
    commentCount,
    followedCount: followedBillCount,
  });
  const completedOnboardingSteps =
    countCompletedOnboardingSteps(onboardingSteps);
  const onboardingProgress = Math.round(
    (completedOnboardingSteps / onboardingSteps.length) * 100,
  );

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      <SiteHeader />
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
            Dashboard
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                Welcome, {session.user.name ?? "citizen"}
              </h1>
              <p className="mt-2 max-w-2xl text-ink-soft">
                Your personal workspace for drafts, votes, comments, and bill
                activity.
              </p>
            </div>
            <Link
              href="/bills/new"
              className="flex h-11 w-fit items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white shadow-sm"
            >
              <Plus size={17} aria-hidden="true" />
              New bill
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <ContinueDraftCard />
        {completedOnboardingSteps < onboardingSteps.length ? (
          <section
            aria-label="Get started"
            className="mb-6 rounded-lg border border-border bg-surface-raised p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-accent text-white">
                  <Rocket size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-semibold">Get started</h2>
                  <p className="text-sm text-ink-muted">
                    {completedOnboardingSteps} of {onboardingSteps.length} steps
                    complete
                  </p>
                </div>
              </div>
            </div>
            <div
              role="progressbar"
              aria-valuenow={onboardingProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Onboarding progress"
              className="mt-4 h-2 overflow-hidden rounded-full bg-border"
            >
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${onboardingProgress}%` }}
              />
            </div>
            <ol className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {onboardingSteps.map((step, index) =>
                step.completed ? (
                  <li
                    key={step.id}
                    className="flex items-start gap-3 rounded-md border border-border bg-surface px-3 py-3"
                  >
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-success"
                    />
                    <div>
                      <p className="text-sm font-semibold text-ink-muted line-through">
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ) : (
                  <li key={step.id}>
                    <Link
                      href={step.href}
                      className="flex items-start gap-3 rounded-md border border-border px-3 py-3 transition-colors hover:border-accent/40 hover:bg-surface"
                    >
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                        {index + 1}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">
                          {step.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-ink-muted">
                          {step.description}
                        </span>
                      </span>
                      <ChevronRight
                        size={16}
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-ink-muted"
                      />
                    </Link>
                  </li>
                ),
              )}
            </ol>
          </section>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {dashboardCards.map((card) => (
            <article
              key={card.title}
              className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{card.title}</h2>
                <span className="grid size-10 place-items-center rounded-md bg-accent-soft text-accent">
                  <card.icon size={20} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-accent">
                {card.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {card.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-surface-raised shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="text-lg font-semibold">Recent bills</h2>
              <p className="text-sm text-ink-muted">
                Drafts and published proposals you created.
              </p>
            </div>
            <Link
              href="/bills/new"
              className="flex h-10 items-center gap-2 rounded-md border border-border-strong px-3 text-sm font-semibold text-ink-soft"
            >
              <Plus size={16} aria-hidden="true" />
              New
            </Link>
          </div>

          {recentBills.length > 0 ? (
            <div className="divide-y divide-border">
              {recentBills.map((bill) => (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.slug}`}
                  className="block p-5 transition-colors hover:bg-surface"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{bill.title}</h3>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-ink-muted">
                        {bill.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <StatusBadge status={bill.status} />
                      {bill.category ? (
                        <span className="rounded-md bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning-ink">
                          {bill.category.name}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-5 text-sm leading-6 text-ink-muted">
              No bills yet. Create your first bill from a problem statement.
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-border bg-surface-raised shadow-sm">
              <div className="border-b border-border p-5">
                <h2 className="text-lg font-semibold">Public discovery</h2>
                <p className="text-sm text-ink-muted">
                  Trending, most supported, and newly published bills.
                </p>
              </div>
              <div className="grid gap-5 p-5 xl:grid-cols-3">
                <BillList
                  title="Trending"
                  bills={trendingForDisplay}
                  viewAllHref="/bills?sort=trending"
                />
                <BillList
                  title="Most supported"
                  bills={mostSupportedForDisplay}
                  viewAllHref="/bills?sort=most-supported"
                />
                <BillList
                  title="Recently published"
                  bills={recentlyPublishedForDisplay}
                  viewAllHref="/bills"
                />
              </div>
            </section>

            <section className="rounded-lg border border-border bg-surface-raised shadow-sm">
              <div className="flex items-center gap-2 border-b border-border p-5">
                <Bookmark size={18} aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-semibold">Saved bills</h2>
                  <p className="text-sm text-ink-muted">
                    Public proposals you bookmarked for later.
                  </p>
                </div>
              </div>
              {savedBills.length > 0 ? (
                <div className="divide-y divide-border">
                  {savedBills.map((savedBill) => (
                    <Link
                      key={savedBill.id}
                      href={`/bills/${savedBill.bill.slug}`}
                      className="block p-5 transition-colors hover:bg-surface"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {savedBill.bill.title}
                          </h3>
                          <p className="mt-1 max-w-3xl text-sm leading-6 text-ink-muted">
                            {savedBill.bill.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <StatusBadge status={savedBill.bill.status} />
                          {savedBill.bill.category ? (
                            <Badge>{savedBill.bill.category.name}</Badge>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-sm leading-6 text-ink-muted">
                  {getSavedBillEmptyMessage()}
                </p>
              )}
            </section>

            <section className="rounded-lg border border-border bg-surface-raised shadow-sm">
              <div className="flex items-center gap-2 border-b border-border p-5">
                <Bell size={18} aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-semibold">Followed bills</h2>
                  <p className="text-sm text-ink-muted">
                    Bills where you receive comment and suggestion updates.
                  </p>
                </div>
              </div>
              {followedBills.length > 0 ? (
                <div className="divide-y divide-border">
                  {followedBills.map((follow) => (
                    <Link
                      key={follow.id}
                      href={`/bills/${follow.bill.slug}`}
                      className="block p-5 transition-colors hover:bg-surface"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold">{follow.bill.title}</h3>
                          <p className="mt-1 max-w-3xl text-sm leading-6 text-ink-muted">
                            {follow.bill.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <StatusBadge status={follow.bill.status} />
                          {follow.bill.category ? (
                            <Badge>{follow.bill.category.name}</Badge>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-sm leading-6 text-ink-muted">
                  {getBillFollowEmptyMessage()}
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Search size={18} aria-hidden="true" />
                <h2 className="font-semibold">Find bills</h2>
              </div>
              <form action="/bills" className="space-y-3">
                <input
                  name="q"
                  placeholder="Search public bills"
                  className="h-10 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                />
                <select
                  name="category"
                  className="h-10 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="flex h-10 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white shadow-sm"
                >
                  Search bills
                </button>
              </form>
            </section>

            <section className="rounded-lg border border-border bg-surface-raised p-5 shadow-sm">
              <h2 className="font-semibold">Recent comments on my bills</h2>
              <div className="mt-4 space-y-3">
                {recentCommentsOnMyBills.map((comment) => (
                  <Link
                    key={comment.id}
                    href={`/bills/${comment.bill.slug}#comments`}
                    className="block rounded-md border border-border px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-accent">
                      {comment.bill.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-muted">
                      {comment.user.displayName ??
                        comment.user.name ??
                        "Citizen"}
                      : {comment.body}
                    </p>
                  </Link>
                ))}
                {recentCommentsOnMyBills.length === 0 ? (
                  <p className="text-sm text-ink-muted">
                    No comments on your bills yet.
                  </p>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

type DashboardBill = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  category: { name: string } | null;
  _count: {
    votes: number;
    comments: number;
    shares: number;
  };
};

function BillList({
  title,
  bills,
  viewAllHref,
}: {
  title: string;
  bills: DashboardBill[];
  viewAllHref?: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-xs font-semibold text-accent transition-colors hover:text-hero-ink"
          >
            View all
          </Link>
        ) : null}
      </div>
      <div className="space-y-3">
        {bills.map((bill) => (
          <Link
            key={bill.id}
            href={`/bills/${bill.slug}`}
            className="block rounded-md border border-border px-3 py-3"
          >
            <div className="mb-2 flex flex-wrap gap-2">
              {bill.category ? <Badge>{bill.category.name}</Badge> : null}
              <StatusBadge status={bill.status} />
            </div>
            <p className="line-clamp-2 text-sm font-semibold leading-6 text-foreground">
              {bill.title}
            </p>
            <div className="mt-3 flex gap-2 text-xs font-semibold text-ink-soft">
              <span className="flex items-center gap-1">
                <ThumbsUp size={14} aria-hidden="true" />
                {bill._count.votes}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={14} aria-hidden="true" />
                {bill._count.comments}
              </span>
              <span className="flex items-center gap-1">
                <Share2 size={14} aria-hidden="true" />
                {bill._count.shares}
              </span>
            </div>
          </Link>
        ))}
        {bills.length === 0 ? (
          <p className="text-sm text-ink-muted">No public bills yet.</p>
        ) : null}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold capitalize text-accent">
      {children}
    </span>
  );
}
