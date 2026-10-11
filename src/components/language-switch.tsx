"use client";

import { LOCALE_COOKIE, type Locale } from "@/lib/locale";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

const options: { id: Locale; short: string; name: string }[] = [
  { id: "ar", short: "عربي", name: "العربية" },
  { id: "fr", short: "FR", name: "Français" },
  { id: "en", short: "EN", name: "English" },
];

export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((option) => option.id === locale) ?? options[2];

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        aria-busy={pending}
        onClick={() => setOpen((value) => !value)}
        className="type-nav inline-flex items-center gap-1.5 border border-gold/30 px-2.5 py-2 text-[0.62rem] text-foreground transition-colors hover:border-gold-bright hover:text-gold-bright"
      >
        <span lang={current.id}>{current.short}</span>
        <ChevronDown
          strokeWidth={1.5}
          size={14}
          aria-hidden
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`absolute end-0 top-full z-50 pt-2 ${open ? "" : "pointer-events-none"}`}>
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden" {...(open ? {} : { inert: true })}>
            <ul id={listId} role="listbox" aria-label={label} className="min-w-40 border border-gold/30 bg-[#0a0a0a] shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
              {options.map((option) => {
                const selected = option.id === locale;
                return (
                  <li key={option.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      lang={option.id}
                      aria-selected={selected}
                      onClick={() => choose(option.id)}
                      className={`type-nav block w-full px-4 py-3 text-start text-[0.68rem] transition-colors ${selected ? "bg-gold/15 text-gold-bright" : "text-foreground/80 hover:bg-[#141414] hover:text-gold-bright"}`}
                    >
                      {option.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
