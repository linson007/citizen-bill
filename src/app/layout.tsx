import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Manjari, Source_Sans_3 } from "next/font/google";
import { getServerSession } from "next-auth";

import { AuthProvider } from "@/components/auth-provider";
import { getAppUrl } from "@/lib/app-url";
import { authOptions } from "@/lib/auth";
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

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const locale = await getRequestLocale();

  return (
    <html
      lang={localeHtmlLang(locale)}
      className={`${sourceSans.variable} ${fraunces.variable} ${manjari.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider session={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
