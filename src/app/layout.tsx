import type { Metadata, Viewport } from "next";
import { Fraunces, Manjari, Source_Sans_3 } from "next/font/google";

import { getAppUrl } from "@/lib/app-url";
import { localeHtmlLang } from "@/lib/locale";
import { getRequestLocale } from "@/lib/request-locale";

import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const manjari = Manjari({
  variable: "--font-manjari",
  subsets: ["malayalam"],
  weight: ["400", "700"],
});

const siteDescription =
  "മാറ്റം ഉണ്ടോ? Draft, discuss, and support public bill proposals for Kerala with AI assistance.";

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: "MattamUndo — മാറ്റം ഉണ്ടോ?",
    template: "%s | MattamUndo",
  },
  description: siteDescription,
  applicationName: "MattamUndo",
  keywords: [
    "MattamUndo",
    "Kerala",
    "private member bill",
    "civic tech",
    "public participation",
    "legislation",
  ],
  openGraph: {
    title: "MattamUndo — മാറ്റം ഉണ്ടോ?",
    description: siteDescription,
    siteName: "MattamUndo",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MattamUndo — മാറ്റം ഉണ്ടോ?",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0eee6" },
    { media: "(prefers-color-scheme: dark)", color: "#171410" },
  ],
  colorScheme: "dark light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html
      lang={localeHtmlLang(locale)}
      suppressHydrationWarning
      className={`${sourceSans.variable} ${fraunces.variable} ${manjari.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-accent px-4 py-3 text-sm font-semibold text-white focus:not-sr-only"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
