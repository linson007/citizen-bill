"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

const shareTargets = [
  {
    label: "WhatsApp",
    platform: "whatsapp",
    buildHref: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    label: "X",
    platform: "x",
    buildHref: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    label: "Facebook",
    platform: "facebook",
    buildHref: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "LinkedIn",
    platform: "linkedin",
    buildHref: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    label: "Telegram",
    platform: "telegram",
    buildHref: (url: string, text: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
];

export function SharePanel({
  slug,
  url,
  text,
}: {
  slug: string;
  url: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function recordShare(platform: string) {
    await fetch(`/api/bills/${slug}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ platform }),
    }).catch(() => undefined);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    await recordShare("copy");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 font-semibold">
        <Share2 size={17} aria-hidden="true" />
        Share bill
      </div>
      <div className="grid grid-cols-2 gap-2">
        {shareTargets.map((target) => (
          <a
            key={target.platform}
            href={target.buildHref(url, text)}
            target="_blank"
            rel="noreferrer"
            onClick={() => void recordShare(target.platform)}
            className="flex h-10 items-center justify-center rounded-md border border-[#c8c0ae] bg-white px-3 text-sm font-semibold text-[#2f2a22] shadow-sm"
          >
            {target.label}
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#c8c0ae] bg-white px-3 text-sm font-semibold text-[#2f2a22] shadow-sm"
        >
          {copied ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Copy size={16} aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
