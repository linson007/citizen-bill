import Image from "next/image";

import type { Locale } from "@/lib/locale";

const HERO_BY_LOCALE = {
  en: {
    src: "/hero-niyama-sabha.png",
    alt: "A citizen speaking at Kerala Niyama Sabha while holding a bill. Text reads: Your Voice. Your Ideas. Your Bill. Empowering every citizen to create a better Kerala.",
  },
  ml: {
    src: "/hero-niyama-sabha-ml.png",
    alt: "കേരള നിയമസഭയിൽ ബിൽ കൈയ്യിലേന്തി സംസാരിക്കുന്ന ഒരു പൗരൻ. മുദ്രാവാക്യം: നിങ്ങളുടെ ശബ്ദം. നിങ്ങളുടെ ആശയങ്ങൾ. നിങ്ങളുടെ ബിൽ. മികച്ച കേരളം സൃഷ്ടിക്കാൻ ഓരോ പൗരനെയും ശാക്തീകരിക്കുന്നു.",
  },
} as const;

/** Full Niyama Sabha banner — shown uncropped so baked-in slogan stays readable. */
export function HeroVisual({ locale }: { locale: Locale }) {
  const hero = HERO_BY_LOCALE[locale];

  return (
    <div className="animate-hero-drift relative w-full overflow-hidden bg-[#f3efe6]">
      <Image
        key={hero.src}
        src={hero.src}
        alt={hero.alt}
        width={1536}
        height={1024}
        priority
        sizes="100vw"
        className="h-auto w-full"
      />
    </div>
  );
}
