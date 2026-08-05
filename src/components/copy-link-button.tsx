"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setFailed(true);
      window.setTimeout(() => setFailed(false), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      aria-pressed={copied}
      className="flex h-10 items-center justify-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm font-semibold text-ink-soft shadow-sm"
    >
      {copied ? (
        <Check size={16} aria-hidden="true" />
      ) : (
        <Copy size={16} aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy link"}
      <span aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : failed ? "Could not copy link" : ""}
      </span>
    </button>
  );
}
