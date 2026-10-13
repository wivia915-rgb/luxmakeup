"use client";

import { THEME_COOKIE, type Theme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";

const themeColor = { dark: "#0D0D0D", light: "#F4EFE6" };

export function ThemeSwitch({
  theme,
  lightLabel,
  darkLabel,
}: {
  theme: Theme;
  lightLabel: string;
  darkLabel: string;
}) {
  const [current, setCurrent] = useState(theme);
  const next = current === "dark" ? "light" : "dark";

  function toggle() {
    setCurrent(next);
    document.documentElement.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor[next]);
  }

  return (
    <button
      type="button"
      aria-label={next === "light" ? lightLabel : darkLabel}
      onClick={toggle}
      className="inline-flex size-10 shrink-0 items-center justify-center border border-gold/30 text-foreground transition-colors hover:border-gold-bright hover:text-gold-bright"
    >
      {current === "dark" ? <Sun strokeWidth={1.25} size={18} /> : <Moon strokeWidth={1.25} size={18} />}
    </button>
  );
}
