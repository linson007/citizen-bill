import {
  ArrowRight,
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

import { CivicHeroImage, HeroVisual } from "@/components/hero-visual";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatDisplayTitle } from "@/lib/display-title";
import { hasEstablishedCommunity } from "@/lib/home-community";
import { getHomepageData } from "@/lib/homepage";
import { getRequestMessages } from "@/lib/request-locale";

export default async function Home() {
  const { locale, t } = await getRequestMessages();
  const copyClass = locale === "ml" ? "font-malayalam" : "";

  const { commentCount, publicBillCount, trendingBills, voteCount } =
    await getHomepageData();
  const establishedCommunity = hasEstablishedCommunity({
    publicBills: publicBillCount,
    votes: voteCount,
    comments: commentCount,
  });

  const draftSteps = [t.home.step1, t.home.step2, t.home.step3, t.home.step4];

  return (
    <main
      id="main-content"
      className={`flex min-h-screen flex-col bg-background text-foreground ${copyClass}`}
    >
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-border">
        <HeroVisual />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:min-h-[min(88vh,820px)] lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.9fr)] lg:items-center lg:gap-12 lg:py-20">
          <div className="max-w-2xl">
            <p className="animate-fade-up inline-flex w-fit items-center rounded-full border border-accent/15 bg-surface-raised/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent backdrop-blur-sm">
              {t.home.eyebrow}
            </p>
            <p className="animate-fade-up font-display mt-4 text-5xl font-semibold tracking-tight text-hero-ink sm:text-6xl lg:text-7xl">
              {t.home.brand}
            </p>
            <p className="animate-fade-up-delay font-malayalam mt-3 text-2xl font-medium tracking-wide text-accent sm:text-3xl">
              {t.home.tagline}
            </p>
            <h1 className="animate-fade-up-delay mt-6 text-xl font-medium leading-snug text-ink-soft sm:text-2xl">
              {t.home.headline}
            </h1>
            <p className="animate-fade-up-delay mt-4 text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
              {t.home.support}
            </p>
            <div className="animate-fade-up-delay-2 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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
              <a
                href="#draft"
                className="flex h-12 items-center justify-center gap-1.5 px-2 text-sm font-semibold text-accent transition-colors hover:text-hero-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              >
                {t.home.heroHowLink}
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="animate-fade-up-delay-2 mt-4 space-y-2 rounded-md border border-border bg-surface-raised/65 px-3 py-2.5 backdrop-blur-sm">
              <p className="flex items-start gap-2 text-sm font-medium leading-6 text-ink-soft">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-success"
                  size={17}
                  aria-hidden="true"
                />
                {t.home.heroNote}
              </p>
              <p className="flex items-start gap-2 text-xs leading-5 text-ink-muted">
                <ShieldCheck
                  className="mt-0.5 shrink-0 text-accent"
                  size={15}
                  aria-hidden="true"
                />
                {t.home.independence}
              </p>
            </div>
          </div>
          <div className="lg:order-2">
            <CivicHeroImage locale={locale} />
          </div>
        </div>
      </section>

      <section
        id="draft"
        className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16"
      >
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
                {establishedCommunity
                  ? t.home.trendingHeading
                  : t.home.proposalsHeading}
              </h2>
              <p className="mt-3 text-base leading-7 text-ink-muted">
                {establishedCommunity
                  ? t.home.trendingSupport
                  : t.home.proposalsSupport}
              </p>
            </div>
            <Link
              href="/bills"
              className="flex h-11 w-fit items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
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
                      {establishedCommunity ? (
                        <>
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
                        </>
                      ) : null}
                      <Link
                        href={`/bills/${bill.slug}`}
                        className="grid size-11 place-items-center rounded-md border border-border text-ink-soft transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
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

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
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
