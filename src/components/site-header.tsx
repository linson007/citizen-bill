import Link from "next/link";
import { Plus, Scale } from "lucide-react";
import { getServerSession } from "next-auth";

import { AccountMenu } from "@/components/account-menu";
import { LocaleToggle } from "@/components/locale-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { NavLink } from "@/components/nav-link";
import { authOptions } from "@/lib/auth";
import { getRequestMessages } from "@/lib/request-locale";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const { locale, t } = await getRequestMessages();
  const canModerate =
    session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  const publicLinks = [{ href: "/bills", label: t.nav.bills }];

  const accountLinks = [
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/profile", label: t.nav.profile },
    { href: "/notifications", label: t.nav.notifications },
    ...(canModerate
      ? [{ href: "/moderation", label: t.nav.moderation }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3 sm:gap-4 sm:px-8 sm:py-4">
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

        <nav
          className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex"
          aria-label="Primary"
        >
          {publicLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-accent"
              activeClassName="text-accent"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
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
          <AccountMenu
            labels={{
              account: t.nav.account,
              signIn: t.nav.signIn,
              signOut: t.nav.signOut,
              checking: t.nav.checking,
            }}
            links={accountLinks}
          />
          <Link
            href="/bills/new"
            aria-label={t.nav.newBill}
            className="flex h-10 items-center gap-2 rounded-md bg-accent px-3 text-sm font-semibold text-white transition-colors hover:bg-hero-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 sm:px-4"
          >
            <Plus size={16} aria-hidden="true" />
            <span className="hidden sm:inline">{t.nav.newBill}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
