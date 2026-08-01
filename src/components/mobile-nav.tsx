"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

type MobileNavLink = {
  href: string;
  label: string;
};

type MobileNavProps = {
  publicLinks: MobileNavLink[];
  accountLinks: MobileNavLink[];
  labels: {
    openMenu: string;
    closeMenu: string;
    account: string;
  };
};

export function MobileNav({
  publicLinks,
  accountLinks,
  labels,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="grid size-10 place-items-center rounded-md border border-border-strong bg-surface-raised text-ink-soft"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? labels.closeMenu : labels.openMenu}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      </button>

      {open ? (
        <div
          id={menuId}
          className="absolute inset-x-0 top-full z-40 border-b border-border bg-surface px-5 py-4 sm:px-8"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-raised"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {accountLinks.length > 0 ? (
            <div className="mt-3 border-t border-border pt-3">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                {labels.account}
              </p>
              <nav className="flex flex-col gap-1" aria-label="Account">
                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-raised"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
