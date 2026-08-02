import Image from "next/image";

import type { Locale } from "@/lib/locale";

const HERO_IMAGE_BY_LOCALE = {
  en: "/hero-niyama-sabha.png",
  ml: "/hero-niyama-sabha-ml.png",
} as const;

/** Decorative civic landscape for the homepage hero. */
export function HeroVisual() {
  return (
    <div
      className="animate-hero-drift pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,#f8f4ea_0%,transparent_55%),radial-gradient(ellipse_at_85%_15%,#e7eee8_0%,transparent_45%),linear-gradient(160deg,#f7f5ef_0%,#f0eee6_48%,#ece9df_100%)]" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M0 620 C180 560 320 680 520 640 C760 590 900 500 1120 540 C1280 568 1360 610 1440 590 L1440 900 L0 900 Z"
          fill="#0f355c"
          fillOpacity="0.06"
        />
        <path
          d="M0 680 C220 640 380 720 560 700 C820 668 980 600 1200 650 C1320 678 1380 710 1440 700 L1440 900 L0 900 Z"
          fill="#0f355c"
          fillOpacity="0.08"
        />
        <g stroke="#0f355c" strokeOpacity="0.22" strokeWidth="1.5">
          <rect x="980" y="210" width="28" height="220" rx="2" />
          <rect x="1024" y="180" width="34" height="250" rx="2" />
          <rect x="1074" y="230" width="26" height="200" rx="2" />
          <rect x="1116" y="160" width="40" height="270" rx="2" />
          <rect x="1172" y="210" width="28" height="220" rx="2" />
          <path d="M970 430 H1210" />
          <path d="M990 150 H1190" />
          <path d="M1040 120 L1090 150 L1140 120" />
        </g>
        <g fill="#0f355c" fillOpacity="0.14">
          <circle cx="220" cy="180" r="48" />
          <circle cx="268" cy="168" r="28" />
          <circle cx="180" cy="210" r="22" />
        </g>
        <g stroke="#0f355c" strokeOpacity="0.18" strokeWidth="1.25">
          <path d="M120 420 H420" />
          <path d="M120 448 H380" />
          <path d="M120 476 H400" />
          <path d="M120 504 H340" />
          <rect
            x="120"
            y="360"
            width="46"
            height="10"
            rx="2"
            fill="#0f355c"
            fillOpacity="0.16"
            stroke="none"
          />
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

export function CivicHeroImage({ locale }: { locale: Locale }) {
  return (
    <div className="animate-fade-up-delay relative overflow-hidden rounded-xl border border-surface-raised/80 bg-surface-raised shadow-2xl shadow-hero-ink/15">
      <Image
        src={HERO_IMAGE_BY_LOCALE[locale]}
        alt="A citizen presenting a bill at the Kerala Legislative Assembly."
        width={1536}
        height={1024}
        priority
        sizes="(min-width: 1024px) 44vw, 100vw"
        className="h-auto w-full"
      />
    </div>
  );
}
