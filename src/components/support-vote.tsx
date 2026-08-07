"use client";

import { useOptimistic, useTransition } from "react";
import { ThumbsUp } from "lucide-react";

import { toggleVoteAction } from "@/app/bills/[slug]/actions";

export function SupportVote({
  slug,
  supported,
  count,
  variant,
}: {
  slug: string;
  supported: boolean;
  count: number;
  variant: "primary" | "mobile";
}) {
  const [optimistic, setOptimistic] = useOptimistic({ supported, count });
  const [isPending, startTransition] = useTransition();

  const active = optimistic.supported;

  function handleToggle() {
    startTransition(async () => {
      setOptimistic((state) => ({
        supported: !state.supported,
        count: state.count + (state.supported ? -1 : 1),
      }));
      await toggleVoteAction(slug);
    });
  }

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={active}
        className={`flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold shadow-sm transition-colors ${
          active
            ? "border border-accent bg-accent-soft text-accent"
            : "bg-accent-solid text-white"
        }`}
      >
        <ThumbsUp size={16} aria-hidden="true" />
        {active ? "Supported" : "Support"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={active}
      className={`flex h-11 items-center gap-2 rounded-md px-5 text-sm font-semibold shadow-sm transition-colors ${
        active
          ? "border border-accent bg-accent-soft text-accent"
          : "bg-accent-solid text-white hover:bg-accent-hover"
      }`}
    >
      <ThumbsUp size={17} aria-hidden="true" />
      <span className="flex items-center gap-1.5">
        {active ? "Supported" : "Support this bill"}
        <span aria-live="polite" className="tabular-nums">
          · {optimistic.count}
        </span>
      </span>
      {isPending ? (
        <span aria-hidden="true" className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
    </button>
  );
}
