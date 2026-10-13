"use client";

import { LanguageSwitch } from "@/components/language-switch";
import type { Locale } from "@/lib/locale";
import type { Dictionary } from "@/lib/messages";
import { storeWhatsAppUrl } from "@/lib/store-contact";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const iconButton =
  "inline-flex size-10 shrink-0 items-center justify-center border border-gold/30 text-foreground transition-colors hover:border-gold-bright hover:text-gold-bright";

export function SiteHeader({
  locale,
  copy,
  banner = "",
  whatsapp = "",
  email = "",
}: {
  locale: Locale;
  copy: Dictionary;
  banner?: string;
  whatsapp?: string;
  email?: string;
}) {
  const [open, setOpen] = useState(false);
  const navigation = [
    { href: "/#makeup", label: copy.nav.makeup },
    { href: "/#parfums", label: copy.nav.parfums },
    { href: "/#skin-care", label: copy.nav.skin },
    { href: "/#maison", label: copy.nav.maison },
  ];

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const whatsappUrl = storeWhatsAppUrl(whatsapp);
  const announcement = banner.trim() || copy.announcement;

  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-background/90 backdrop-blur-md">
      <div className="border-b border-gold/15 px-5 py-2 text-center md:px-10">
        <p className="type-caption text-gold-bright">{announcement}</p>
        {whatsappUrl || email ? (
          <p className="type-caption mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {whatsappUrl ? (
              <a href={whatsappUrl} className="text-foreground/70 hover:text-gold-bright">
                WhatsApp
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email}`} className="text-foreground/70 hover:text-gold-bright">
                {email}
              </a>
            ) : null}
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-4 md:px-10">
        <Link
          href="/"
          className="font-serif text-sm uppercase tracking-[0.18em] whitespace-nowrap text-foreground sm:text-base sm:tracking-[0.28em]"
        >
          Lux <span className="text-gold-bright">Makeup</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="type-nav text-foreground/80 transition-colors hover:text-gold-bright">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitch locale={locale} label={copy.language} />
          <button type="button" className={`${iconButton} hidden sm:inline-flex`} aria-label={copy.search}>
            <Search strokeWidth={1.25} size={18} />
          </button>
          <button type="button" className={iconButton} aria-label={copy.bag}>
            <ShoppingBag strokeWidth={1.25} size={18} />
          </button>
          <button
            type="button"
            className={`${iconButton} md:hidden`}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? copy.closeMenu : copy.openMenu}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X strokeWidth={1.25} size={18} /> : <Menu strokeWidth={1.25} size={18} />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        aria-label="Mobile"
        aria-hidden={!open}
        className={`grid bg-card motion-reduce:transition-none md:hidden ${open ? "grid-rows-[1fr] border-t border-gold/20" : "grid-rows-[0fr]"} transition-[grid-template-rows] duration-300`}
      >
        <div className="overflow-hidden" {...(open ? {} : { inert: true })}>
          <ul className="flex flex-col px-5 py-2">
            {navigation.map((item) => (
              <li key={item.href} className="border-b border-gold/15 last:border-b-0">
                <Link
                  href={item.href}
                  className="type-nav block py-4 text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
