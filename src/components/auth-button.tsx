"use client";

import { LogIn, LogOut, UserCircle } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button
        type="button"
        className="flex h-10 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-medium text-ink-soft"
        disabled
      >
        <UserCircle size={16} aria-hidden="true" />
        Checking
      </button>
    );
  }

  if (session?.user) {
    return (
      <button
        type="button"
        className="flex h-10 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-medium text-ink-soft"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut size={16} aria-hidden="true" />
        Sign out
      </button>
    );
  }

  return (
    <button
      type="button"
      className="flex h-10 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-medium text-ink-soft"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      <LogIn size={16} aria-hidden="true" />
      Sign in
    </button>
  );
}
