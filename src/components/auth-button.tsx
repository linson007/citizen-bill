"use client";

import { LogIn, LogOut, UserCircle } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button
        type="button"
        className="flex h-10 items-center gap-2 rounded-md border border-[#c8c0ae] bg-white px-3 text-sm font-medium text-[#2f2a22] shadow-sm"
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
        className="flex h-10 items-center gap-2 rounded-md border border-[#c8c0ae] bg-white px-3 text-sm font-medium text-[#2f2a22] shadow-sm"
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
      className="flex h-10 items-center gap-2 rounded-md border border-[#c8c0ae] bg-white px-3 text-sm font-medium text-[#2f2a22] shadow-sm"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      <LogIn size={16} aria-hidden="true" />
      Sign in
    </button>
  );
}
