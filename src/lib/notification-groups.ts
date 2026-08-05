export const notificationFilters = [
  "all",
  "unread",
  "comments",
  "amendments",
  "votes",
  "follows",
] as const;

export type NotificationFilter = (typeof notificationFilters)[number];

export type NotificationGroupItem = {
  id: string;
  type: string;
  readAt: Date | null;
  createdAt: Date;
  billId: string | null;
  bill: { title: string; slug: string } | null;
};

export type NotificationBillGroup<T extends NotificationGroupItem> = {
  billId: string | null;
  billTitle: string;
  items: T[];
};

export type NotificationDayGroup<T extends NotificationGroupItem> = {
  day: string;
  bills: NotificationBillGroup<T>[];
};

export function parseNotificationFilter(
  value: string | undefined,
): NotificationFilter {
  return notificationFilters.includes(value as NotificationFilter)
    ? (value as NotificationFilter)
    : "all";
}

export function matchesNotificationFilter(
  notification: Pick<NotificationGroupItem, "type" | "readAt">,
  filter: NotificationFilter,
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "unread") {
    return notification.readAt === null;
  }

  if (filter === "comments") {
    return notification.type.includes("comment");
  }

  if (filter === "amendments") {
    return notification.type.includes("suggestion");
  }

  if (filter === "votes") {
    return notification.type === "vote";
  }

  return notification.type.includes("follow");
}

export function groupNotificationsByDayAndBill<T extends NotificationGroupItem>(
  notifications: T[],
): NotificationDayGroup<T>[] {
  const days = new Map<string, Map<string, NotificationBillGroup<T>>>();

  for (const notification of notifications) {
    const day = notification.createdAt.toISOString().slice(0, 10);
    const billKey = notification.billId ?? "platform";
    const billTitle = notification.bill?.title ?? "Platform updates";
    const bills = days.get(day) ?? new Map<string, NotificationBillGroup<T>>();
    const billGroup = bills.get(billKey) ?? {
      billId: notification.billId,
      billTitle,
      items: [],
    };

    billGroup.items.push(notification);
    bills.set(billKey, billGroup);
    days.set(day, bills);
  }

  return [...days.entries()].map(([day, bills]) => ({
    day,
    bills: [...bills.values()],
  }));
}

export function formatNotificationDay(day: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${day}T00:00:00.000Z`));
}
