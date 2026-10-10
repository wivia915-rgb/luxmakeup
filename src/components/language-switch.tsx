"use client";

import { LOCALE_COOKIE, type Locale } from "@/lib/locale";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const options: { id: Locale; label: string; name: string }[] = [
  { id: "ar", label: "عربي", name: "العربية" },
  { id: "fr", label: "FR", name: "Français" },
  { id: "en", label: "EN", name: "English" },
];

export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div role="group" aria-label={label} className="flex items-center border border-gold/30">
      {options.map((option) => {
        const selected = option.id === locale;
        return (
          <button
            key={option.id}
            type="button"
            lang={option.id}
            aria-pressed={selected}
            aria-label={option.name}
            disabled={pending && !selected}
            onClick={() => choose(option.id)}
            className={`type-nav px-2 py-2 text-[0.62rem] transition-colors sm:px-2.5 ${selected ? "bg-gold/15 text-gold-bright" : "text-foreground/70 hover:text-gold-bright"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
