"use client";

import { useEffect, useRef, useState } from "react";

import { isBillSectionHash } from "@/lib/bill-text";

const TABS = [
  { id: "summary", label: "Summary" },
  { id: "comments", label: "Discussion" },
  { id: "suggestions", label: "Amendments" },
  { id: "versions", label: "Versions" },
] as const;

export type BillTabId = (typeof TABS)[number]["id"];

function tabFromHash(hash: string): BillTabId | null {
  const id = hash.replace("#", "");
  return TABS.some((tab) => tab.id === id) ? (id as BillTabId) : null;
}

export function BillTabs({
  counts,
  sections,
}: {
  counts: Partial<Record<BillTabId, number>>;
  sections: Record<BillTabId, React.ReactNode>;
}) {
  const [active, setActive] = useState<BillTabId>(() => {
    if (typeof window === "undefined") {
      return "summary";
    }
    return tabFromHash(window.location.hash) ?? "summary";
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      const next = tabFromHash(hash);
      if (next) {
        setActive(next);
        requestAnimationFrame(() => {
          containerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
        return;
      }

      if (isBillSectionHash(hash)) {
        setActive("summary");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document
              .getElementById(hash.slice(1))
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        });
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div ref={containerRef} className="scroll-mt-20">
      <div
        role="tablist"
        aria-label="Bill sections"
        className="mb-5 flex flex-wrap gap-2"
      >
        {TABS.map((tab) => {
          const count = counts[tab.id];
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tab-panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold shadow-sm transition-colors ${
                isActive
                  ? "bg-[#123c69] text-white"
                  : "border border-[#c8c0ae] bg-white text-[#2f2a22] hover:border-[#123c69] hover:text-[#123c69]"
              }`}
            >
              {tab.label}
              {typeof count === "number" ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#e4eef6] text-[#123c69]"
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {TABS.map((tab) => (
        <div
          key={tab.id}
          id={`tab-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
        >
          {sections[tab.id]}
        </div>
      ))}
    </div>
  );
}
