"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

type MobileNavLink = {
  href: string;
  label: string;
};

export function MobileNav({ links }: { links: MobileNavLink[] }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="grid size-10 place-items-center rounded-md border border-[#c8c0ae] bg-white text-[#2f2a22] shadow-sm"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      </button>

      {open ? (
        <div
          id={menuId}
          className="absolute inset-x-0 top-full z-40 border-b border-[#d8d2c4] bg-[#fbfaf7] px-5 py-4 shadow-sm sm:px-8"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-[#4f4a40] hover:bg-white"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
