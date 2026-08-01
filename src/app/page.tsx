import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Gavel,
  MessageSquare,
  PenLine,
  ShieldCheck,
  ThumbsUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import { HeroVisual } from "@/components/hero-visual";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BillStatus } from "@/generated/prisma/enums";
import { PUBLIC_BILL_STATUSES } from "@/lib/bill-visibility";
import { formatDisplayTitle } from "@/lib/display-title";
import { prisma } from "@/lib/prisma";
import { getRequestMessages } from "@/lib/request-locale";

const publicStatuses = [...PUBLIC_BILL_STATUSES];

type HomeActivity = {
  id: string;
  message: string;
  href: string;
  createdAt: Date;
};

export default async function Home() {
  await connection();
  const { locale, t } = await getRequestMessages();
  const copyClass = locale === "ml" ? "font-malayalam" : "";

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
    { label: t.home.publicBills, value: formatCompactNumber(publicBillCount) },
    {
      label: t.home.billsInReview,
      value: formatCompactNumber(reviewBillCount),
    },
    {
      label: t.home.communityVotes,
      value: formatCompactNumber(voteCount),
    },
    {
      label: t.home.publicComments,
      value: formatCompactNumber(commentCount),
    },
  ];

  const draftSteps = [
    t.home.step1,
    t.home.step2,
    t.home.step3,
    t.home.step4,
  ];

  return (
    <main className={`flex min-h-screen flex-col bg-background text-foreground ${copyClass}`}>
      <SiteHeader />

      <section className="relative isolate min-h-[min(88vh,820px)] overflow-hidden border-b border-border">
        <HeroVisual />
        <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-28 lg:min-h-[min(88vh,820px)] lg:justify-center lg:pb-24 lg:pt-24">
          <p className="animate-fade-up font-display text-5xl font-semibold tracking-tight text-hero-ink sm:text-6xl lg:text-7xl">
            {t.home.brand}
          </p>
          <p className="animate-fade-up-delay font-malayalam mt-3 text-2xl font-medium tracking-wide text-accent sm:text-3xl">
            {t.home.tagline}
          </p>
          <h1 className="animate-fade-up-delay mt-6 max-w-2xl text-xl font-medium leading-snug text-ink-soft sm:text-2xl">
            {t.home.headline}
          </h1>
          <p className="animate-fade-up-delay-2 mt-4 max-w-xl text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
            {t.home.support}
          </p>
          <div className="animate-fade-up-delay-2 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/bills/new"
              className="flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-hero-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              <PenLine size={18} aria-hidden="true" />
              {t.home.ctaPrimary}
            </Link>
            <Link
              href="/bills"
              className="flex h-12 items-center justify-center gap-2 rounded-md border border-border-strong bg-surface-raised/80 px-6 text-sm font-semibold text-ink-soft backdrop-blur-sm transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              <FileText size={18} aria-hidden="true" />
              {t.home.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      <section id="draft" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.home.howHeading}
          </h2>
          <p className="mt-3 text-base leading-7 text-ink-muted">
            {t.home.howSupport}
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-sm font-medium text-ink-muted">
              {t.home.exampleProblemLabel}
            </p>
            <p className="font-display mt-3 text-xl font-medium leading-snug text-ink-soft sm:text-2xl">
              {t.home.exampleProblem}
            </p>
          </div>
          <div>
            <ol className="space-y-0 border-t border-border">
              {draftSteps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-baseline gap-4 border-b border-border py-4"
                >
                  <span className="font-display w-8 shrink-0 text-lg font-semibold text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base font-medium text-ink-soft">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <Link
              href="/bills/new"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-hero-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              {t.home.howCta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="bills"
        className="border-y border-border bg-surface px-5 py-14 sm:px-8 sm:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {t.home.trendingHeading}
              </h2>
              <p className="mt-3 text-base leading-7 text-ink-muted">
                {t.home.trendingSupport}
              </p>
            </div>
            <Link
              href="/bills"
              className="flex h-10 w-fit items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              <FileText size={16} aria-hidden="true" />
              {t.home.allProposals}
            </Link>
          </div>

          <div className="mt-8 divide-y divide-border border-y border-border">
            {trendingBills.length > 0 ? (
              trendingBills.map((bill) => (
                <article key={bill.id} className="py-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap gap-2">
                        {bill.category ? (
                          <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                            {bill.category.name}
                          </span>
                        ) : null}
                        <span className="rounded-md bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                          {formatStatus(bill.status)}
                        </span>
                      </div>
                      <Link
                        href={`/bills/${bill.slug}`}
                        className="font-display text-xl font-semibold leading-snug tracking-tight transition-colors hover:text-accent"
                      >
                        {formatDisplayTitle(bill.title)}
                      </Link>
                      <p className="mt-2 max-w-2xl line-clamp-3 text-sm leading-6 text-ink-muted">
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
                        className="grid size-10 place-items-center rounded-md border border-border text-ink-soft transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                        aria-label={`Open ${formatDisplayTitle(bill.title)}`}
                      >
                        <ArrowRight size={17} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="py-8 text-sm leading-6 text-ink-muted">
                {t.home.emptyBills}
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        id="dashboard"
        className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16"
      >
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.home.snapshotHeading}
          </h2>
          <p className="mt-3 text-base leading-7 text-ink-muted">
            {t.home.snapshotSupport}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface-raised p-5 sm:p-6">
              <p className="font-display text-3xl font-semibold text-accent">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-semibold tracking-tight">
              {t.home.thisWeek}
            </h3>
            <Link
              href="/bills"
              className="flex items-center gap-1 text-sm font-semibold text-accent"
            >
              {t.home.viewBills}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="space-y-2">
            {activity.length > 0 ? (
              activity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-start gap-3 border-b border-border px-1 py-3 text-sm text-ink-soft transition-colors hover:text-accent"
                >
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-success"
                    size={17}
                    aria-hidden="true"
                  />
                  <span>{item.message}</span>
                </Link>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-border bg-surface px-4 py-5">
                <p className="text-sm leading-6 text-ink-muted">
                  {t.home.emptyActivity}
                </p>
                <Link
                  href="/bills"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent"
                >
                  {t.home.emptyActivityCta}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        id="moderation"
        className="border-y border-border bg-surface px-5 py-14 sm:px-8 sm:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.home.trustHeading}
            </h2>
            <p className="mt-3 text-base leading-7 text-ink-muted">
              {t.home.trustSupport}
            </p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            <TrustItem
              icon={ShieldCheck}
              title={t.home.trustModeration}
              text={t.home.trustModerationText}
            />
            <TrustItem
              icon={Users}
              title={t.home.trustCommunity}
              text={t.home.trustCommunityText}
            />
            <TrustItem
              icon={Gavel}
              title={t.home.trustWorkflow}
              text={t.home.trustWorkflowText}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <LegalDisclaimer />
      </section>
      <SiteFooter />
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
      message: `New support for ${formatDisplayTitle(vote.bill.title)}`,
      href: `/bills/${vote.bill.slug}`,
      createdAt: vote.createdAt,
    })),
    ...comments.map((comment) => ({
      id: `comment-${comment.id}`,
      message: `New comment on ${formatDisplayTitle(comment.bill.title)}`,
      href: `/bills/${comment.bill.slug}`,
      createdAt: comment.createdAt,
    })),
    ...shares.map((share) => ({
      id: `share-${share.id}`,
      message: `${formatPlatform(share.platform)} share for ${formatDisplayTitle(share.bill.title)}`,
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
    <div className="flex h-10 items-center gap-1.5 rounded-md border border-border px-2.5 text-sm font-semibold text-ink-soft">
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
    <div>
      <span className="grid size-10 place-items-center rounded-md bg-accent-soft text-accent">
        <Icon size={20} aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{text}</p>
    </div>
  );
}
