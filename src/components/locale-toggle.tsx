"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { LOCALE_COOKIE, type Locale } from "@/lib/locale";

type LocaleToggleProps = {
  locale: Locale;
  labels: {
    language: string;
    english: string;
    malayalam: string;
  };
};

export function LocaleToggle({ locale, labels }: LocaleToggleProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale) {
      return;
    }

    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div
      className="inline-flex h-10 items-center rounded-md border border-border-strong bg-surface-raised p-0.5 text-sm font-medium text-ink-soft"
      role="group"
      aria-label={labels.language}
    >
      <button
        type="button"
        className={`rounded px-2.5 py-1.5 transition-colors ${
          locale === "en"
            ? "bg-accent text-white"
            : "text-ink-muted hover:text-foreground"
        }`}
        aria-pressed={locale === "en"}
        disabled={pending}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={`rounded px-2.5 py-1.5 font-malayalam transition-colors ${
          locale === "ml"
            ? "bg-accent text-white"
            : "text-ink-muted hover:text-foreground"
        }`}
        aria-pressed={locale === "ml"}
        disabled={pending}
        onClick={() => setLocale("ml")}
      >
        മല
      </button>
    </div>
  );
}
