import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileCheck2,
  FileText,
  Bookmark,
  Bell,
  MessageSquare,
  Plus,
  Search,
  Share2,
  ThumbsUp,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { getSavedBillEmptyMessage } from "@/lib/bill-engagement";
import { getBillFollowEmptyMessage } from "@/lib/bill-follow";
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
          in: ["PUBLISHED", "UNDER_DISCUSSION", "READY_FOR_REVIEW"],
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
          in: ["PUBLISHED", "UNDER_DISCUSSION", "READY_FOR_REVIEW"],
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
          in: ["PUBLISHED", "UNDER_DISCUSSION", "READY_FOR_REVIEW"],
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
          in: ["PUBLISHED", "UNDER_DISCUSSION", "READY_FOR_REVIEW"],
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
              in: ["PUBLISHED", "UNDER_DISCUSSION", "READY_FOR_REVIEW"],
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

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

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#161616]">
      <SiteHeader />
      <section className="border-b border-[#d8d2c4] bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6d6658]">
            Dashboard
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                Welcome, {session.user.name ?? "citizen"}
              </h1>
              <p className="mt-2 max-w-2xl text-[#4f4a40]">
                Your personal workspace for drafts, votes, comments, and bill
                activity.
              </p>
            </div>
            <Link
              href="/bills/new"
              className="flex h-11 w-fit items-center gap-2 rounded-md bg-[#123c69] px-4 text-sm font-semibold text-white shadow-sm"
            >
              <Plus size={17} aria-hidden="true" />
              New bill
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
          {dashboardCards.map((card) => (
            <article
              key={card.title}
              className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{card.title}</h2>
                <span className="grid size-10 place-items-center rounded-md bg-[#e4eef6] text-[#123c69]">
                  <card.icon size={20} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-[#123c69]">
                {card.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6d6658]">
                {card.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-[#d8d2c4] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e7e1d3] p-5">
            <div>
              <h2 className="text-lg font-semibold">Recent bills</h2>
              <p className="text-sm text-[#6d6658]">
                Drafts and published proposals you created.
              </p>
            </div>
            <Link
              href="/bills/new"
              className="flex h-10 items-center gap-2 rounded-md border border-[#c8c0ae] px-3 text-sm font-semibold text-[#2f2a22]"
            >
              <Plus size={16} aria-hidden="true" />
              New
            </Link>
          </div>

          {recentBills.length > 0 ? (
            <div className="divide-y divide-[#e7e1d3]">
              {recentBills.map((bill) => (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.slug}`}
                  className="block p-5 transition-colors hover:bg-[#fbfaf7]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{bill.title}</h3>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6d6658]">
                        {bill.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <span className="rounded-md bg-[#e4eef6] px-2.5 py-1 text-xs font-semibold capitalize text-[#123c69]">
                        {bill.status.replaceAll("_", " ").toLowerCase()}
                      </span>
                      {bill.category ? (
                        <span className="rounded-md bg-[#f0e8d8] px-2.5 py-1 text-xs font-semibold text-[#6b4e16]">
                          {bill.category.name}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-5 text-sm leading-6 text-[#6d6658]">
              No bills yet. Create your first bill from a problem statement.
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-[#d8d2c4] bg-white shadow-sm">
              <div className="border-b border-[#e7e1d3] p-5">
                <h2 className="text-lg font-semibold">Public discovery</h2>
                <p className="text-sm text-[#6d6658]">
                  Trending, most supported, and newly published bills.
                </p>
              </div>
              <div className="grid gap-5 p-5 xl:grid-cols-3">
                <BillList title="Trending" bills={trendingBills} />
                <BillList title="Most supported" bills={mostSupportedBills} />
                <BillList
                  title="Recently published"
                  bills={recentlyPublishedBills}
                />
              </div>
            </section>

            <section className="rounded-lg border border-[#d8d2c4] bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#e7e1d3] p-5">
                <Bookmark size={18} aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-semibold">Saved bills</h2>
                  <p className="text-sm text-[#6d6658]">
                    Public proposals you bookmarked for later.
                  </p>
                </div>
              </div>
              {savedBills.length > 0 ? (
                <div className="divide-y divide-[#e7e1d3]">
                  {savedBills.map((savedBill) => (
                    <Link
                      key={savedBill.id}
                      href={`/bills/${savedBill.bill.slug}`}
                      className="block p-5 transition-colors hover:bg-[#fbfaf7]"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {savedBill.bill.title}
                          </h3>
                          <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6d6658]">
                            {savedBill.bill.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Badge>
                            {savedBill.bill.status
                              .replaceAll("_", " ")
                              .toLowerCase()}
                          </Badge>
                          {savedBill.bill.category ? (
                            <Badge>{savedBill.bill.category.name}</Badge>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-sm leading-6 text-[#6d6658]">
                  {getSavedBillEmptyMessage()}
                </p>
              )}
            </section>

            <section className="rounded-lg border border-[#d8d2c4] bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#e7e1d3] p-5">
                <Bell size={18} aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-semibold">Followed bills</h2>
                  <p className="text-sm text-[#6d6658]">
                    Bills where you receive comment and suggestion updates.
                  </p>
                </div>
              </div>
              {followedBills.length > 0 ? (
                <div className="divide-y divide-[#e7e1d3]">
                  {followedBills.map((follow) => (
                    <Link
                      key={follow.id}
                      href={`/bills/${follow.bill.slug}`}
                      className="block p-5 transition-colors hover:bg-[#fbfaf7]"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold">{follow.bill.title}</h3>
                          <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6d6658]">
                            {follow.bill.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Badge>
                            {follow.bill.status
                              .replaceAll("_", " ")
                              .toLowerCase()}
                          </Badge>
                          {follow.bill.category ? (
                            <Badge>{follow.bill.category.name}</Badge>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-sm leading-6 text-[#6d6658]">
                  {getBillFollowEmptyMessage()}
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Search size={18} aria-hidden="true" />
                <h2 className="font-semibold">Find bills</h2>
              </div>
              <form action="/bills" className="space-y-3">
                <input
                  name="q"
                  placeholder="Search public bills"
                  className="h-10 w-full rounded-md border border-[#c8c0ae] bg-white px-3 text-sm outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
                />
                <select
                  name="category"
                  className="h-10 w-full rounded-md border border-[#c8c0ae] bg-white px-3 text-sm outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
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
                  className="flex h-10 w-full items-center justify-center rounded-md bg-[#123c69] px-4 text-sm font-semibold text-white shadow-sm"
                >
                  Search bills
                </button>
              </form>
            </section>

            <section className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Recent comments on my bills</h2>
              <div className="mt-4 space-y-3">
                {recentCommentsOnMyBills.map((comment) => (
                  <Link
                    key={comment.id}
                    href={`/bills/${comment.bill.slug}#comments`}
                    className="block rounded-md border border-[#e7e1d3] px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-[#123c69]">
                      {comment.bill.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6d6658]">
                      {comment.user.displayName ??
                        comment.user.name ??
                        "Citizen"}
                      : {comment.body}
                    </p>
                  </Link>
                ))}
                {recentCommentsOnMyBills.length === 0 ? (
                  <p className="text-sm text-[#6d6658]">
                    No comments on your bills yet.
                  </p>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </section>
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

function BillList({ title, bills }: { title: string; bills: DashboardBill[] }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="space-y-3">
        {bills.map((bill) => (
          <Link
            key={bill.id}
            href={`/bills/${bill.slug}`}
            className="block rounded-md border border-[#e7e1d3] px-3 py-3"
          >
            <div className="mb-2 flex flex-wrap gap-2">
              {bill.category ? <Badge>{bill.category.name}</Badge> : null}
              <Badge>{bill.status.replaceAll("_", " ").toLowerCase()}</Badge>
            </div>
            <p className="line-clamp-2 text-sm font-semibold leading-6 text-[#161616]">
              {bill.title}
            </p>
            <div className="mt-3 flex gap-2 text-xs font-semibold text-[#4f4a40]">
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
          <p className="text-sm text-[#6d6658]">No public bills yet.</p>
        ) : null}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-[#e4eef6] px-2 py-1 text-xs font-semibold capitalize text-[#123c69]">
      {children}
    </span>
  );
}
