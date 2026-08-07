"use client";

import { useState } from "react";
import { Loader2, LogIn, LogOut } from "lucide-react";
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
  const [pending, setPending] = useState(false);

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

  async function handleSignIn() {
    setPending(true);
    await signIn("google", { callbackUrl });
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={pending}
      className="flex h-10 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-medium text-ink-soft disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <Loader2 className="animate-spin" size={16} aria-hidden="true" />
      ) : (
        <LogIn size={16} aria-hidden="true" />
      )}
      {pending ? labels.checking : labels.signIn}
    </button>
  );
}
