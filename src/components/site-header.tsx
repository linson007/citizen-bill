import Link from "next/link";
import { Plus, Scale } from "lucide-react";
import { getServerSession } from "next-auth";

import { AccountMenu } from "@/components/account-menu";
import { LocaleToggle } from "@/components/locale-toggle";
import { MobileNav } from "@/components/mobile-nav";
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
    <header className="relative z-30 border-b border-border bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-accent text-white">
            <Scale size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="font-display block text-lg font-semibold tracking-tight">
              MattamUndo
            </span>
            <span className="font-malayalam block text-xs font-medium tracking-[0.04em] text-ink-muted">
              മാറ്റം ഉണ്ടോ?
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex"
          aria-label="Primary"
        >
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <MobileNav
            publicLinks={publicLinks}
            accountLinks={session?.user ? accountLinks : []}
            labels={{
              openMenu: t.nav.openMenu,
              closeMenu: t.nav.closeMenu,
              account: t.nav.account,
            }}
          />
          <LocaleToggle
            locale={locale}
            labels={{
              language: t.nav.language,
              english: t.nav.english,
              malayalam: t.nav.malayalam,
            }}
          />
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
            className="flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-hero-ink"
          >
            <Plus size={16} aria-hidden="true" />
            <span className="hidden sm:inline">{t.nav.newBill}</span>
            <span className="sm:hidden">{t.nav.new}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
