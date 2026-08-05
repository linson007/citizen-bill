"use client";

import { LogIn, LogOut } from "lucide-react";
import { signIn, signOut } from "next-auth/react";

export function AuthButton({
  callbackUrl = "/dashboard",
  labels,
  signedIn,
}: {
  callbackUrl?: string;
  labels: { checking: string; signIn: string; signOut: string };
  signedIn: boolean;
}) {
  if (signedIn) {
    return (
      <button
        type="button"
        className="flex h-10 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-medium text-ink-soft"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut size={16} aria-hidden="true" />
        {labels.signOut}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="flex h-10 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-medium text-ink-soft"
      onClick={() => signIn("google", { callbackUrl })}
    >
      <LogIn size={16} aria-hidden="true" />
      {labels.signIn}
    </button>
  );
}
