"use client";

import Link from "next/link";
import { ChevronDown, LogIn, LogOut, UserCircle } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useId, useRef, useState } from "react";

type AccountLink = {
  href: string;
  label: string;
};

type AccountMenuProps = {
  labels: {
    account: string;
    signIn: string;
    signOut: string;
    checking: string;
  };
  links: AccountLink[];
};

export function AccountMenu({ labels, links }: AccountMenuProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (status === "loading") {
    return (
      <button
        type="button"
        className="flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-medium text-ink-soft"
        disabled
      >
        <UserCircle size={16} aria-hidden="true" />
        <span className="hidden sm:inline">{labels.checking}</span>
      </button>
    );
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        className="flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        aria-label={labels.signIn}
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        <LogIn size={16} aria-hidden="true" />
        <span className="hidden sm:inline">{labels.signIn}</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        aria-label={session.user.name ?? labels.account}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <UserCircle size={16} aria-hidden="true" />
        <span className="hidden max-w-28 truncate sm:inline">
          {session.user.name?.split(" ")[0] ?? labels.account}
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-md border border-border bg-surface-raised py-1"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              className="block px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-surface hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-left text-sm text-ink-soft transition-colors hover:bg-surface hover:text-foreground"
            onClick={() => {
              setOpen(false);
              void signOut({ callbackUrl: "/" });
            }}
          >
            <LogOut size={14} aria-hidden="true" />
            {labels.signOut}
          </button>
        </div>
      ) : null}
    </div>
  );
}
