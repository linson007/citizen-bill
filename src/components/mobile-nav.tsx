"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { LocaleToggle } from "@/components/locale-toggle";
import { NavLink } from "@/components/nav-link";
import type { Locale } from "@/lib/locale";

type MobileNavLink = {
  href: string;
  label: string;
};

type MobileNavProps = {
  publicLinks: MobileNavLink[];
  accountLinks: MobileNavLink[];
  locale: Locale;
  labels: {
    openMenu: string;
    closeMenu: string;
    account: string;
    language: string;
    english: string;
    malayalam: string;
    newBill: string;
    signIn: string;
  };
  signedIn: boolean;
};

export function MobileNav({
  publicLinks,
  accountLinks,
  locale,
  labels,
  signedIn,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        className="grid size-11 place-items-center rounded-md border border-border-strong bg-surface-raised text-ink-soft transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? labels.closeMenu : labels.openMenu}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <X size={18} aria-hidden="true" />
        ) : (
          <Menu size={18} aria-hidden="true" />
        )}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 top-[68px] z-40 cursor-default bg-hero-ink/20 backdrop-blur-[1px]"
            aria-label={labels.closeMenu}
            onClick={() => setOpen(false)}
          />
          <div
            id={menuId}
            className="fixed right-4 top-[4.75rem] z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-surface-raised p-2 shadow-xl shadow-hero-ink/15"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {publicLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface"
                  activeClassName="bg-accent-soft text-accent"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                href="/bills/new"
                className="rounded-md px-3 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface"
                onClick={() => setOpen(false)}
              >
                {labels.newBill}
              </Link>
              {!signedIn ? (
                <Link
                  href="/login"
                  className="rounded-md px-3 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface"
                  onClick={() => setOpen(false)}
                >
                  {labels.signIn}
                </Link>
              ) : null}
            </nav>

            <div className="mt-2 border-t border-border pt-3">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                {labels.language}
              </p>
              <div className="px-3">
                <LocaleToggle
                  locale={locale}
                  labels={{
                    language: labels.language,
                    english: labels.english,
                    malayalam: labels.malayalam,
                  }}
                />
              </div>
            </div>

            {accountLinks.length > 0 ? (
              <div className="mt-2 border-t border-border pt-3">
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  {labels.account}
                </p>
                <nav className="flex flex-col gap-1" aria-label="Account">
                  {accountLinks.map((link) => (
                    <NavLink
                      key={link.href}
                      href={link.href}
                      className="rounded-md px-3 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface"
                      activeClassName="bg-accent-soft text-accent"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
