import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, Check, CheckCircle2 } from "lucide-react";

import {
  markNotificationReadAction,
  markNotificationsReadAction,
} from "@/app/notifications/actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import {
  formatNotificationDay,
  groupNotificationsByDayAndBill,
  matchesNotificationFilter,
  parseNotificationFilter,
  type NotificationFilter,
} from "@/lib/notification-groups";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/relative-time";
import { getRequestMessages } from "@/lib/request-locale";

const notificationFilterTabs: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "comments", label: "Comments" },
  { value: "amendments", label: "Amendments" },
  { value: "votes", label: "Votes" },
  { value: "follows", label: "Follows" },
];

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const [{ filter }, { locale }] = await Promise.all([
    searchParams,
    getRequestMessages(),
  ]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { bill: true },
  });
  const selectedFilter = parseNotificationFilter(filter);
  const filteredNotifications = notifications.filter((notification) =>
    matchesNotificationFilter(notification, selectedFilter),
  );
  const groups = groupNotificationsByDayAndBill(filteredNotifications);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto max-w-4xl flex-1 px-5 py-8 sm:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
              Notifications
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Activity updates</h1>
          </div>
          <form action={markNotificationsReadAction}>
            <button className="flex h-10 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-semibold text-ink-soft shadow-sm">
              <CheckCircle2 size={16} aria-hidden="true" />
              Mark read
            </button>
          </form>
        </div>

        <nav
          aria-label="Notification filters"
          className="mb-5 flex flex-wrap gap-2"
        >
          {notificationFilterTabs.map((tab) => (
            <Link
              key={tab.value}
              href={
                tab.value === "all"
                  ? "/notifications"
                  : `/notifications?filter=${tab.value}`
              }
              aria-current={selectedFilter === tab.value ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                selectedFilter === tab.value
                  ? "border-accent bg-accent text-white"
                  : "border-border-strong bg-surface-raised text-ink-soft hover:border-accent"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-6">
          {groups.length > 0 ? (
            groups.map((dayGroup) => (
              <section
                key={dayGroup.day}
                aria-labelledby={`day-${dayGroup.day}`}
              >
                <h2
                  id={`day-${dayGroup.day}`}
                  className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink-muted"
                >
                  {formatNotificationDay(dayGroup.day, locale)}
                </h2>
                <div className="overflow-hidden rounded-lg border border-border bg-surface-raised shadow-sm">
                  {dayGroup.bills.map((billGroup) => (
                    <section
                      key={billGroup.billId ?? "platform"}
                      className="border-b border-border last:border-b-0"
                    >
                      <h3 className="border-b border-border bg-surface px-5 py-3 text-sm font-semibold text-ink-soft">
                        {billGroup.billTitle}
                      </h3>
                      <div className="divide-y divide-border">
                        {billGroup.items.map((notification) => (
                          <div
                            key={notification.id}
                            className="flex items-start gap-3 p-5"
                          >
                            <Bell
                              className={
                                notification.readAt
                                  ? "mt-0.5 text-ink-muted"
                                  : "mt-0.5 text-accent"
                              }
                              size={18}
                              aria-hidden="true"
                            />
                            <Link
                              href={
                                notification.bill
                                  ? `/bills/${notification.bill.slug}`
                                  : "/dashboard"
                              }
                              className="min-w-0 flex-1 rounded-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                            >
                              <p className="font-medium">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-ink-muted">
                                {formatRelativeTime(
                                  notification.createdAt,
                                  locale,
                                )}
                              </p>
                            </Link>
                            {!notification.readAt ? (
                              <form action={markNotificationReadAction}>
                                <input
                                  type="hidden"
                                  name="notificationId"
                                  value={notification.id}
                                />
                                <button
                                  type="submit"
                                  className="flex h-8 shrink-0 items-center gap-1 rounded-md border border-border-strong bg-surface-raised px-2 text-xs font-semibold text-ink-soft hover:border-accent"
                                >
                                  <Check size={14} aria-hidden="true" />
                                  Mark read
                                </button>
                              </form>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p className="rounded-lg border border-border bg-surface-raised p-5 text-sm text-ink-muted">
              No notifications match this filter.
            </p>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
