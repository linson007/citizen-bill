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
      className="inline-flex h-11 items-center rounded-md border border-border-strong bg-surface-raised p-0.5 text-sm font-medium text-ink-soft"
      role="group"
      aria-label={labels.language}
    >
      <button
        type="button"
        className={`rounded px-2.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
          locale === "en"
            ? "bg-accent text-white"
            : "text-ink-muted hover:text-foreground"
        }`}
        aria-pressed={locale === "en"}
        aria-label={labels.english}
        disabled={pending}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={`rounded px-2.5 py-1.5 font-malayalam transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
          locale === "ml"
            ? "bg-accent text-white"
            : "text-ink-muted hover:text-foreground"
        }`}
        aria-pressed={locale === "ml"}
        aria-label={labels.malayalam}
        disabled={pending}
        onClick={() => setLocale("ml")}
      >
        മലയാളം
      </button>
    </div>
  );
}
