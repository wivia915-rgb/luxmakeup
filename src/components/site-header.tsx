"use client";

import { CodDrawer } from "@/components/cod-drawer";
import { LanguageSwitch } from "@/components/language-switch";
import { ThemeSwitch } from "@/components/theme-switch";
import { onBagChange, readBag, writeBag, type BagLine } from "@/lib/bag-store";
import type { ShippingRates } from "@/lib/cod";
import type { Locale } from "@/lib/locale";
import type { Dictionary } from "@/lib/messages";
import type { Theme } from "@/lib/theme";
import { formatDh } from "@/lib/products";
import { storeWhatsAppUrl } from "@/lib/store-contact";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const iconButton =
  "inline-flex size-10 shrink-0 items-center justify-center border border-gold/30 text-foreground transition-colors hover:border-gold-bright hover:text-gold-bright";

export type HeaderPiece = {
  id: string;
  name: string;
  price: number;
  image: string;
  shadeId: string;
};

export function SiteHeader({
  locale,
  theme,
  copy,
  banner = "",
  whatsapp = "",
  email = "",
  pieces = [],
  shippingRates,
}: {
  locale: Locale;
  theme: Theme;
  copy: Dictionary;
  banner?: string;
  whatsapp?: string;
  email?: string;
  pieces?: HeaderPiece[];
  shippingRates?: ShippingRates;
}) {
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<"search" | "bag" | null>(null);
  const [query, setQuery] = useState("");
  const [bag, setBag] = useState<BagLine[]>([]);
  const [orderLine, setOrderLine] = useState<BagLine | null>(null);
  const navigation = [
    { href: "/#makeup", label: copy.nav.makeup },
    { href: "/#parfums", label: copy.nav.parfums },
    { href: "/#skin-care", label: copy.nav.skin },
    { href: "/#maison", label: copy.nav.maison },
  ];

  useEffect(() => {
    setBag(readBag());
    return onBagChange(() => setBag(readBag()));
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen && !panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setPanel(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, panel]);

  useEffect(() => {
    if (panel === "search") searchRef.current?.focus();
  }, [panel]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return pieces.slice(0, 6);
    return pieces.filter((piece) => piece.name.toLowerCase().includes(needle)).slice(0, 8);
  }, [pieces, query]);

  const bagCount = bag.reduce((sum, line) => sum + line.quantity, 0);
  const bagTotal = bag.reduce((sum, line) => sum + line.price * line.quantity, 0);

  function toggle(next: "search" | "bag") {
    setMenuOpen(false);
    setPanel((current) => (current === next ? null : next));
  }

  function changeQuantity(id: string, quantity: number) {
    const next = quantity < 1 ? bag.filter((line) => line.id !== id) : bag.map((line) => (line.id === id ? { ...line, quantity: Math.min(8, quantity) } : line));
    setBag(next);
    writeBag(next);
  }

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
          <ThemeSwitch theme={theme} lightLabel={copy.themeLight} darkLabel={copy.themeDark} />
          <LanguageSwitch locale={locale} label={copy.language} />
          <button
            type="button"
            className={iconButton}
            aria-label={copy.search}
            aria-expanded={panel === "search"}
            aria-controls={searchId}
            onClick={() => toggle("search")}
          >
            <Search strokeWidth={1.25} size={18} />
          </button>
          <button type="button" className={`${iconButton} relative`} aria-label={copy.bag} aria-expanded={panel === "bag"} onClick={() => toggle("bag")}>
            <ShoppingBag strokeWidth={1.25} size={18} />
            {bagCount > 0 ? (
              <span className="absolute -top-1.5 -end-1.5 grid min-w-4 place-items-center bg-[#D4AF37] px-1 text-[0.6rem] leading-4 text-[#0D0D0D]">{bagCount}</span>
            ) : null}
          </button>
          <button
            type="button"
            className={`${iconButton} md:hidden`}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? copy.closeMenu : copy.openMenu}
            onClick={() => {
              setPanel(null);
              setMenuOpen((value) => !value);
            }}
          >
            {menuOpen ? <X strokeWidth={1.25} size={18} /> : <Menu strokeWidth={1.25} size={18} />}
          </button>
        </div>
      </div>

      {panel === "search" ? (
        <div id={searchId} className="border-t border-gold/20 bg-card px-5 py-4 md:px-10">
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.tools.searchPlaceholder}
            className="w-full border border-gold/30 bg-background px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-gold-bright"
          />
          <ul className="mt-3 max-h-80 overflow-auto">
            {matches.length === 0 ? (
              <li className="type-caption py-3 text-foreground/60">{copy.tools.searchEmpty}</li>
            ) : (
              matches.map((piece) => (
                <li key={piece.id} className="border-t border-gold/15">
                  <Link href={`/product/${piece.id}`} onClick={() => setPanel(null)} className="flex items-center justify-between gap-4 py-3 hover:text-gold-bright">
                    <span className="font-serif text-xl text-foreground">{piece.name}</span>
                    <span className="type-price text-sm">{formatDh(piece.price)}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {panel === "bag" ? (
        <div className="border-t border-gold/20 bg-card px-5 py-4 md:px-10">
          <p className="type-eyebrow">{copy.tools.bagTitle}</p>
          {bag.length === 0 ? (
            <div className="mt-4">
              <p className="type-body">{copy.tools.bagEmpty}</p>
              <Link href="/#edit" onClick={() => setPanel(null)} className="type-nav mt-4 inline-block border border-gold-bright px-4 py-3 text-gold-bright">
                {copy.tools.bagBrowse}
              </Link>
            </div>
          ) : (
            <>
              <ul className="mt-3">
                {bag.map((line) => (
                  <li key={line.id} className="flex flex-wrap items-center justify-between gap-4 border-t border-gold/15 py-3">
                    <div className="min-w-0">
                      <Link href={`/product/${line.id}`} onClick={() => setPanel(null)} className="font-serif text-xl text-foreground hover:text-gold-bright">
                        {line.name}
                      </Link>
                      <p className="type-caption mt-1">{formatDh(line.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className={iconButton} onClick={() => changeQuantity(line.id, line.quantity - 1)} aria-label={copy.product.decrease}>
                        −
                      </button>
                      <span className="w-4 text-center text-sm">{line.quantity}</span>
                      <button type="button" className={iconButton} onClick={() => changeQuantity(line.id, line.quantity + 1)} aria-label={copy.product.increase}>
                        +
                      </button>
                      <button type="button" className="type-nav border border-gold-bright px-3 py-2 text-gold-bright" onClick={() => setOrderLine(line)}>
                        {copy.tools.bagOrder}
                      </button>
                      <button type="button" className="type-caption text-foreground/60 hover:text-gold-bright" onClick={() => changeQuantity(line.id, 0)}>
                        {copy.tools.bagRemove}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="type-price mt-4 text-end">
                {copy.tools.bagTotal} · {formatDh(bagTotal)}
              </p>
            </>
          )}
        </div>
      ) : null}

      <nav
        id="mobile-navigation"
        aria-label="Mobile"
        aria-hidden={!menuOpen}
        className={`grid bg-card motion-reduce:transition-none md:hidden ${menuOpen ? "grid-rows-[1fr] border-t border-gold/20" : "grid-rows-[0fr]"} transition-[grid-template-rows] duration-300`}
      >
        <div className="overflow-hidden" {...(menuOpen ? {} : { inert: true })}>
          <ul className="flex flex-col px-5 py-2">
            {navigation.map((item) => (
              <li key={item.href} className="border-b border-gold/15 last:border-b-0">
                <Link href={item.href} className="type-nav block py-4 text-foreground" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {orderLine ? (
        <CodDrawer
          open
          onClose={() => setOrderLine(null)}
          shippingRates={shippingRates}
          copy={copy.checkout}
          line={{
            productId: orderLine.id,
            shadeId: orderLine.shadeId,
            quantity: orderLine.quantity,
            name: orderLine.name,
            detail: `×${orderLine.quantity}`,
            merchandise: orderLine.price * orderLine.quantity,
          }}
        />
      ) : null}
    </header>
  );
}
