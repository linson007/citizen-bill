import {
  ArrowUpRight,
  Bell,
  Bot,
  CheckCircle2,
  FileText,
  Gavel,
  MessageSquare,
  Share2,
  ShieldCheck,
  ThumbsUp,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import { SiteHeader } from "@/components/site-header";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { BillStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const publicStatuses = [
  BillStatus.PUBLISHED,
  BillStatus.UNDER_DISCUSSION,
  BillStatus.READY_FOR_REVIEW,
];

const draftSteps = [
  "Describe the public problem",
  "Generate a bill outline with AI",
  "Review clauses and plain-language summary",
  "Publish for voting and comments",
];

type HomeActivity = {
  id: string;
  message: string;
  href: string;
  createdAt: Date;
};

export default async function Home() {
  await connection();

  const [
    publicBillCount,
    reviewBillCount,
    voteCount,
    commentCount,
    trendingBills,
    activity,
  ] = await Promise.all([
    prisma.bill.count({
      where: {
        status: {
          in: publicStatuses,
        },
      },
    }),
    prisma.bill.count({
      where: {
        status: {
          in: [BillStatus.READY_FOR_REVIEW, BillStatus.UNDER_DISCUSSION],
        },
      },
    }),
    prisma.vote.count(),
    prisma.comment.count(),
    getTrendingBills(),
    getRecentActivity(),
  ]);

  const stats = [
    { label: "Public bills", value: formatCompactNumber(publicBillCount) },
    { label: "Bills in review", value: formatCompactNumber(reviewBillCount) },
    { label: "Community votes", value: formatCompactNumber(voteCount) },
    { label: "Public comments", value: formatCompactNumber(commentCount) },
  ];

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#161616]">
      <SiteHeader />

      <section className="border-b border-[#d8d2c4] bg-[#fbfaf7]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border border-[#c8c0ae] bg-white px-3 py-2 text-sm font-medium text-[#4f4a40]">
              <Gavel size={16} aria-hidden="true" />
              Public bill workspace
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#141414] sm:text-5xl lg:text-6xl">
              Turn public problems into bills people can support.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4f4a40]">
              Citizen Bill helps people in Kerala upload, create, review, vote
              on, comment on, and share public bill proposals with AI assistance
              and community oversight.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/bills/new"
                className="flex h-12 items-center justify-center gap-2 rounded-md bg-[#123c69] px-5 text-sm font-semibold text-white shadow-sm"
              >
                <Bot size={18} aria-hidden="true" />
                Start with AI
              </Link>
              <Link
                href="/bills/new"
                className="flex h-12 items-center justify-center gap-2 rounded-md border border-[#c8c0ae] bg-white px-5 text-sm font-semibold text-[#2f2a22] shadow-sm"
              >
                <Upload size={18} aria-hidden="true" />
                Upload bill
              </Link>
            </div>
          </div>

          <div
            id="dashboard"
            className="rounded-lg border border-[#d8d2c4] bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-[#e7e1d3] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold">Civic dashboard</h2>
                <p className="text-sm text-[#6d6658]">Live proposal snapshot</p>
              </div>
              <Link
                href="/notifications"
                className="grid size-10 place-items-center rounded-md border border-[#d8d2c4] text-[#4f4a40]"
                aria-label="Notifications"
              >
                <Bell size={18} aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-2 border-b border-[#e7e1d3]">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-[#e7e1d3] p-5 odd:border-r"
                >
                  <p className="text-2xl font-semibold text-[#123c69]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-[#6d6658]">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">This week</h3>
                <a
                  href="#bills"
                  className="flex items-center gap-1 text-sm font-semibold text-[#123c69]"
                >
                  View bills
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
              <div className="space-y-3">
                {activity.length > 0 ? (
                  activity.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-start gap-3 rounded-md bg-[#f7f6f2] px-3 py-3 text-sm text-[#3f3a32] transition-colors hover:bg-[#eee9dd]"
                    >
                      <CheckCircle2
                        className="mt-0.5 shrink-0 text-[#2f7d62]"
                        size={17}
                        aria-hidden="true"
                      />
                      <span>{item.message}</span>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-md bg-[#f7f6f2] px-3 py-3 text-sm leading-6 text-[#6d6658]">
                    No public activity yet. Published bills, votes, comments,
                    and shares will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="draft" className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-[#e4eef6] text-[#123c69]">
                <Bot size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-semibold">AI bill assistant</h2>
                <p className="text-sm text-[#6d6658]">
                  Structured bill creation
                </p>
              </div>
            </div>

            <div className="rounded-md border border-[#d8d2c4] bg-[#fbfaf7] p-4">
              <p className="text-sm font-medium text-[#4f4a40]">
                Problem statement
              </p>
              <p className="mt-3 text-lg font-semibold leading-7">
                Public hospitals should publish monthly availability data for
                essential medicines and diagnostic services.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {draftSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-md border border-[#e7e1d3] px-3 py-3"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[#123c69] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-[#3f3a32]">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            id="bills"
            className="rounded-lg border border-[#d8d2c4] bg-white shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-[#e7e1d3] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Trending bills</h2>
                <p className="text-sm text-[#6d6658]">
                  Ranked by votes, discussion, and recent activity
                </p>
              </div>
              <Link
                href="/bills"
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#c8c0ae] px-3 text-sm font-semibold text-[#2f2a22]"
              >
                <FileText size={16} aria-hidden="true" />
                All proposals
              </Link>
            </div>

            <div className="divide-y divide-[#e7e1d3]">
              {trendingBills.length > 0 ? (
                trendingBills.map((bill) => (
                  <article key={bill.id} className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {bill.category ? (
                            <span className="rounded-md bg-[#e4eef6] px-2.5 py-1 text-xs font-semibold text-[#123c69]">
                              {bill.category.name}
                            </span>
                          ) : null}
                          <span className="rounded-md bg-[#e6f1ec] px-2.5 py-1 text-xs font-semibold text-[#2f7d62]">
                            {formatStatus(bill.status)}
                          </span>
                        </div>
                        <Link
                          href={`/bills/${bill.slug}`}
                          className="text-lg font-semibold leading-7 transition-colors hover:text-[#123c69]"
                        >
                          {bill.title}
                        </Link>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d6658]">
                          {bill.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Metric
                          icon={ThumbsUp}
                          value={bill._count.votes}
                          label="votes"
                        />
                        <Metric
                          icon={MessageSquare}
                          value={bill._count.comments}
                          label="comments"
                        />
                        <Link
                          href={`/bills/${bill.slug}`}
                          className="grid size-10 place-items-center rounded-md border border-[#d8d2c4] text-[#4f4a40] transition-colors hover:bg-[#fbfaf7]"
                          aria-label={`Open sharing options for ${bill.title}`}
                        >
                          <Share2 size={17} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="p-5 text-sm leading-6 text-[#6d6658]">
                  No public bills yet. Published proposals will appear here once
                  people start sharing them.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        id="moderation"
        className="border-y border-[#d8d2c4] bg-[#fbfaf7]"
      >
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:px-8 md:grid-cols-3">
          <TrustItem
            icon={ShieldCheck}
            title="Moderation queue"
            text="Reports, abuse flags, and policy risks are designed into the workflow."
          />
          <TrustItem
            icon={Users}
            title="Community review"
            text="Votes and comments help strong public proposals move forward."
          />
          <TrustItem
            icon={Gavel}
            title="Public bill workflow"
            text="Bills stay focused on public discussion, transparent versions, and community support."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <LegalDisclaimer />
      </section>
    </main>
  );
}

async function getTrendingBills() {
  return prisma.bill.findMany({
    where: {
      status: {
        in: publicStatuses,
      },
    },
    include: {
      category: true,
      _count: {
        select: {
          votes: true,
          comments: true,
        },
      },
    },
    orderBy: [
      {
        votes: {
          _count: "desc",
        },
      },
      {
        comments: {
          _count: "desc",
        },
      },
      {
        publishedAt: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],
    take: 3,
  });
}

async function getRecentActivity(): Promise<HomeActivity[]> {
  const [votes, comments, shares] = await Promise.all([
    prisma.vote.findMany({
      where: {
        bill: {
          status: {
            in: publicStatuses,
          },
        },
      },
      include: {
        bill: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    }),
    prisma.comment.findMany({
      where: {
        bill: {
          status: {
            in: publicStatuses,
          },
        },
      },
      include: {
        bill: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    }),
    prisma.billShare.findMany({
      where: {
        bill: {
          status: {
            in: publicStatuses,
          },
        },
      },
      include: {
        bill: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    }),
  ]);

  return [
    ...votes.map((vote) => ({
      id: `vote-${vote.id}`,
      message: `New support for ${vote.bill.title}`,
      href: `/bills/${vote.bill.slug}`,
      createdAt: vote.createdAt,
    })),
    ...comments.map((comment) => ({
      id: `comment-${comment.id}`,
      message: `New comment on ${comment.bill.title}`,
      href: `/bills/${comment.bill.slug}`,
      createdAt: comment.createdAt,
    })),
    ...shares.map((share) => ({
      id: `share-${share.id}`,
      message: `${formatPlatform(share.platform)} share for ${share.bill.title}`,
      href: `/bills/${share.bill.slug}`,
      createdAt: share.createdAt,
    })),
  ]
    .sort(
      (first, second) => second.createdAt.getTime() - first.createdAt.getTime(),
    )
    .slice(0, 4);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPlatform(platform: string) {
  return platform
    .toLowerCase()
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
}) {
  return (
    <div className="flex h-10 items-center gap-1.5 rounded-md border border-[#d8d2c4] px-2.5 text-sm font-semibold text-[#3f3a32]">
      <Icon size={16} aria-hidden="true" />
      <span>{value.toLocaleString()}</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-[#d8d2c4] bg-white p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#e4eef6] text-[#123c69]">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[#6d6658]">{text}</p>
      </div>
    </div>
  );
}
