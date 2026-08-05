import { describe, expect, it } from "vitest";

import {
  groupNotificationsByDayAndBill,
  matchesNotificationFilter,
  parseNotificationFilter,
} from "@/lib/notification-groups";

const notifications = [
  notification({ id: "new", billId: "bill-1", type: "comment" }),
  notification({
    id: "old",
    billId: "bill-1",
    type: "vote",
    createdAt: "2026-08-03T12:00:00.000Z",
  }),
  notification({ id: "other", billId: "bill-2", type: "suggestion" }),
];

describe("parseNotificationFilter", () => {
  it("uses all for missing or unsupported filters", () => {
    expect(parseNotificationFilter(undefined)).toBe("all");
    expect(parseNotificationFilter("unknown")).toBe("all");
    expect(parseNotificationFilter("votes")).toBe("votes");
  });
});

describe("matchesNotificationFilter", () => {
  it("matches unread and notification-type tabs", () => {
    expect(matchesNotificationFilter(notifications[0], "unread")).toBe(true);
    expect(matchesNotificationFilter(notifications[0], "comments")).toBe(true);
    expect(matchesNotificationFilter(notifications[0], "votes")).toBe(false);
    expect(matchesNotificationFilter(notifications[2], "amendments")).toBe(
      true,
    );
  });
});

describe("groupNotificationsByDayAndBill", () => {
  it("groups notification items first by day and then by bill", () => {
    const groups = groupNotificationsByDayAndBill(notifications);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({
      day: "2026-08-04",
      bills: [
        { billId: "bill-1", items: [{ id: "new" }] },
        { billId: "bill-2", items: [{ id: "other" }] },
      ],
    });
    expect(groups[1]?.bills[0]).toMatchObject({
      billId: "bill-1",
      items: [{ id: "old" }],
    });
  });
});

function notification({
  id,
  billId,
  type,
  createdAt = "2026-08-04T12:00:00.000Z",
}: {
  id: string;
  billId: string;
  type: string;
  createdAt?: string;
}) {
  return {
    id,
    billId,
    type,
    readAt: null,
    createdAt: new Date(createdAt),
    bill: { title: `Bill ${billId}`, slug: billId },
  };
}
