import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCircle2 } from "lucide-react";

import { markNotificationsReadAction } from "@/app/notifications/actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { bill: true },
  });

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f6f2] text-[#161616]">
      <SiteHeader />
      <section className="mx-auto max-w-4xl flex-1 px-5 py-8 sm:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6d6658]">
              Notifications
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Activity updates</h1>
          </div>
          <form action={markNotificationsReadAction}>
            <button className="flex h-10 items-center gap-2 rounded-md border border-[#c8c0ae] bg-white px-3 text-sm font-semibold text-[#2f2a22] shadow-sm">
              <CheckCircle2 size={16} aria-hidden="true" />
              Mark read
            </button>
          </form>
        </div>

        <div className="divide-y divide-[#e7e1d3] rounded-lg border border-[#d8d2c4] bg-white shadow-sm">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Link
                key={notification.id}
                href={
                  notification.bill
                    ? `/bills/${notification.bill.slug}`
                    : "/dashboard"
                }
                className="flex gap-3 p-5 hover:bg-[#fbfaf7]"
              >
                <Bell
                  className={
                    notification.readAt ? "text-[#8a8170]" : "text-[#123c69]"
                  }
                  size={18}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="mt-1 text-xs text-[#8a8170]">
                    {notification.createdAt.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="p-5 text-sm text-[#6d6658]">No notifications yet.</p>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
