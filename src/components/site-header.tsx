import Link from "next/link";
import { Bell, Plus, Scale } from "lucide-react";
import { getServerSession } from "next-auth";

import { AccountMenu } from "@/components/account-menu";
import { LocaleToggle } from "@/components/locale-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { NavLink } from "@/components/nav-link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestMessages } from "@/lib/request-locale";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const { locale, t } = await getRequestMessages();
  const canModerate =
    session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  const unreadNotificationCount = session?.user?.id
    ? await prisma.notification.count({
        where: { userId: session.user.id, readAt: null },
      })
    : 0;

  const publicLinks = [{ href: "/bills", label: t.nav.bills }];

  const accountLinks = [
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/profile", label: t.nav.profile },
    { href: "/notifications", label: t.nav.notifications },
    ...(canModerate ? [{ href: "/moderation", label: t.nav.moderation }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-raised/95 shadow-sm shadow-hero-ink/5 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-8 sm:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-white">
            <Scale size={22} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="font-display block truncate text-lg font-semibold tracking-tight">
              MattamUndo
            </span>
            <span className="font-malayalam hidden text-xs font-medium tracking-[0.04em] text-ink-muted sm:block">
              മാറ്റം ഉണ്ടോ?
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <MobileNav
            publicLinks={publicLinks}
            accountLinks={session?.user ? accountLinks : []}
            locale={locale}
            signedIn={Boolean(session?.user)}
            labels={{
              openMenu: t.nav.openMenu,
              closeMenu: t.nav.closeMenu,
              account: t.nav.account,
              language: t.nav.language,
              english: t.nav.english,
              malayalam: t.nav.malayalam,
              newBill: t.nav.newBill,
              signIn: t.nav.signIn,
            }}
          />
          <div className="hidden md:block">
            <LocaleToggle
              locale={locale}
              labels={{
                language: t.nav.language,
                english: t.nav.english,
                malayalam: t.nav.malayalam,
              }}
            />
          </div>
          <NavLink
            href="/bills"
            className="hidden h-11 items-center rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 md:inline-flex"
            activeClassName="border-accent bg-accent-soft text-accent"
          >
            {t.nav.bills}
          </NavLink>
          {session?.user ? (
            <Link
              href="/notifications"
              aria-label={`${t.nav.notifications}${
                unreadNotificationCount > 0
                  ? ` (${unreadNotificationCount} unread)`
                  : ""
              }`}
              className="relative grid size-11 place-items-center rounded-md border border-border-strong bg-surface-raised text-ink-soft transition-colors hover:bg-surface hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              <Bell size={18} aria-hidden="true" />
              {unreadNotificationCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold leading-5 text-white">
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              ) : null}
            </Link>
          ) : null}
          <AccountMenu
            labels={{
              account: t.nav.account,
              signIn: t.nav.signIn,
              signOut: t.nav.signOut,
            }}
            links={accountLinks}
            user={session?.user}
          />
          <Link
            href="/bills/new"
            aria-label={t.nav.newBill}
            className="flex h-11 items-center gap-2 rounded-md bg-accent px-3 text-sm font-semibold text-white transition-colors hover:bg-hero-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 sm:px-4"
          >
            <Plus size={16} aria-hidden="true" />
            <span className="hidden sm:inline">{t.nav.newBill}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
