import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthProvider } from "@/components/auth-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: "Citizen Bill",
  description:
    "Create, publish, discuss, and support public bills with AI assistance.",
  openGraph: {
    title: "Citizen Bill",
    description:
      "Create, publish, discuss, and support public bills with AI assistance.",
    siteName: "Citizen Bill",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Citizen Bill",
    description:
      "Create, publish, discuss, and support public bills with AI assistance.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
