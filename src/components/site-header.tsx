import Link from "next/link";
import { Plus, Scale } from "lucide-react";
import { getServerSession } from "next-auth";

import { AuthButton } from "@/components/auth-button";
import { MobileNav } from "@/components/mobile-nav";
import { authOptions } from "@/lib/auth";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const canModerate =
    session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  const links = [
    { href: "/", label: "Home" },
    { href: "/bills", label: "Bills" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/notifications", label: "Notifications" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
    ...(canModerate ? [{ href: "/moderation", label: "Moderation" }] : []),
  ];

  return (
    <header className="relative border-b border-[#d8d2c4] bg-[#fbfaf7]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-[#123c69] text-white">
            <Scale size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-semibold">MattamUndo</span>
            <span className="block text-xs font-medium tracking-[0.04em] text-[#6d6658]">
              മാറ്റം ഉണ്ടോ?
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-6 text-sm font-medium text-[#4f4a40] md:flex"
          aria-label="Primary"
        >
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <MobileNav links={links} />
          <AuthButton />
          <Link
            href="/bills/new"
            className="flex h-10 items-center gap-2 rounded-md bg-[#123c69] px-4 text-sm font-semibold text-white shadow-sm"
          >
            <Plus size={16} aria-hidden="true" />
            <span className="hidden sm:inline">New bill</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
