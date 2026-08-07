import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import {
  dismissReportAction,
  removeReportedBillAction,
  resetAiUsageAction,
  resolveReportAction,
} from "@/app/moderation/actions";
import { SiteHeader } from "@/components/site-header";
import { getAiUsageWindow, getDailyAiLimit } from "@/lib/ai-usage-limit";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ModerationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    redirect("/dashboard");
  }

  const { start, resetAt } = getAiUsageWindow();
  const dailyLimit = getDailyAiLimit();
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      bill: true,
      comment: true,
      reporter: true,
    },
  });
  const todayUsageEvents = await prisma.aiUsageEvent.findMany({
    where: {
      createdAt: {
        gte: start,
        lt: resetAt,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 250,
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
  const recentSafetyEvents = await prisma.aiSafetyEvent.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
    include: {
      user: {
        select: {
          displayName: true,
          name: true,
          email: true,
        },
      },
    },
  });
  const usageRows = createUsageRows(todayUsageEvents, dailyLimit);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-accent-soft text-accent">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
              Moderation
            </p>
            <h1 className="text-3xl font-semibold">Reported content</h1>
          </div>
        </div>

        <section className="mb-8 rounded-lg border border-border bg-surface-raised shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="text-xl font-semibold">AI usage today</h2>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              Daily quota is {dailyLimit.toLocaleString()} requests per user.
              Usage resets automatically at{" "}
              {resetAt.toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              .
            </p>
          </div>

          {usageRows.length > 0 ? (
            <div className="divide-y divide-border">
              {usageRows.map((row) => (
                <article key={row.userId} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge>{row.used} used</Badge>
                        <Badge>{row.remaining} remaining</Badge>
                        <Badge>{row.role.toLowerCase()}</Badge>
                      </div>
                      <h3 className="font-semibold">{row.name}</h3>
                      <p className="mt-1 text-sm text-ink-muted">{row.email}</p>
                      <p className="mt-2 text-sm leading-6 text-ink-soft">
                        Routes: {row.routes}
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        Last used{" "}
                        {row.lastUsedAt.toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <form action={resetAiUsageAction}>
                      <input type="hidden" name="userId" value={row.userId} />
                      <button className="h-10 rounded-md bg-accent-solid px-3 text-sm font-semibold text-white">
                        Reset today
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="p-5 text-sm text-ink-muted">
              No AI usage recorded today.
            </p>
          )}
        </section>

        <section className="mb-8 rounded-lg border border-border bg-surface-raised shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="text-xl font-semibold">AI guardrail events</h2>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              Recent blocked prompts help moderators spot abuse or confused use.
            </p>
          </div>
          {recentSafetyEvents.length > 0 ? (
            <div className="divide-y divide-border">
              {recentSafetyEvents.map((event) => (
                <article key={event.id} className="p-5">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge>{event.reason}</Badge>
                    <Badge>
                      {event.createdAt.toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-ink-soft">
                    {event.user?.displayName ??
                      event.user?.name ??
                      event.user?.email ??
                      "Anonymous request"}
                  </p>
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-ink-muted">
                    {event.prompt}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="p-5 text-sm text-ink-muted">
              No AI guardrail events yet.
            </p>
          )}
        </section>

        <div className="divide-y divide-border rounded-lg border border-border bg-surface-raised shadow-sm">
          {reports.length > 0 ? (
            reports.map((report) => (
              <article key={report.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge>{report.status.toLowerCase()}</Badge>
                      <Badge>{report.reason}</Badge>
                    </div>
                    {report.bill ? (
                      <Link
                        href={`/bills/${report.bill.slug}`}
                        className="font-semibold text-accent"
                      >
                        {report.bill.title}
                      </Link>
                    ) : (
                      <p className="font-semibold">Reported comment</p>
                    )}
                    {report.comment ? (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">
                        {report.comment.body}
                      </p>
                    ) : null}
                    {report.details ? (
                      <p className="mt-2 text-sm text-ink-muted">
                        {report.details}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-ink-muted">
                      Reported by{" "}
                      {report.reporter.displayName ??
                        report.reporter.name ??
                        "Citizen"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <form action={dismissReportAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <button className="h-10 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-semibold">
                        Dismiss
                      </button>
                    </form>
                    <form action={resolveReportAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <button className="h-10 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-semibold">
                        Resolve
                      </button>
                    </form>
                    {report.bill ? (
                      <form action={removeReportedBillAction}>
                        <input
                          type="hidden"
                          name="billId"
                          value={report.bill.id}
                        />
                        <button className="h-10 rounded-md bg-danger px-3 text-sm font-semibold text-white">
                          Remove bill
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="p-5 text-sm text-ink-muted">No reports yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}

type UsageEvent = Awaited<
  ReturnType<typeof prisma.aiUsageEvent.findMany>
>[number] & {
  user: {
    id: string;
    displayName: string | null;
    name: string | null;
    email: string;
    role: string;
  };
};

function createUsageRows(events: UsageEvent[], dailyLimit: number) {
  const rows = new Map<
    string,
    {
      userId: string;
      name: string;
      email: string;
      role: string;
      used: number;
      remaining: number;
      routes: string;
      routeCounts: Map<string, number>;
      lastUsedAt: Date;
    }
  >();

  for (const event of events) {
    const current = rows.get(event.userId) ?? {
      userId: event.userId,
      name: event.user.displayName ?? event.user.name ?? "Citizen",
      email: event.user.email,
      role: event.user.role,
      used: 0,
      remaining: dailyLimit,
      routes: "",
      routeCounts: new Map<string, number>(),
      lastUsedAt: event.createdAt,
    };

    current.used += 1;
    current.remaining = Math.max(dailyLimit - current.used, 0);
    current.lastUsedAt =
      event.createdAt > current.lastUsedAt
        ? event.createdAt
        : current.lastUsedAt;
    current.routeCounts.set(
      event.route,
      (current.routeCounts.get(event.route) ?? 0) + 1,
    );
    rows.set(event.userId, current);
  }

  return Array.from(rows.values())
    .map((row) => ({
      ...row,
      routes:
        Array.from(row.routeCounts.entries())
          .map(([route, count]) => `${route}: ${count}`)
          .join(", ") || "No route data",
    }))
    .sort((first, second) => {
      if (second.used !== first.used) {
        return second.used - first.used;
      }

      return second.lastUsedAt.getTime() - first.lastUsedAt.getTime();
    });
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
      {children}
    </span>
  );
}
