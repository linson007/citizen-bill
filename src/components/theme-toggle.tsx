"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";

const THEME_STORAGE_KEY = "theme";

type Theme = "light" | "dark";

function resolveFromDocument(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

export function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<Theme>(resolveFromDocument);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="grid size-11 place-items-center rounded-md border border-border-strong bg-surface-raised text-ink-soft transition-colors hover:bg-surface hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
    >
      <Sun className="hidden dark:block" size={18} aria-hidden="true" />
      <Moon className="dark:hidden" size={18} aria-hidden="true" />
    </button>
  );
}