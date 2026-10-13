"use client";

import type { Dictionary } from "@/lib/messages";
import { hashForCategory, type Category } from "@/lib/products";
import Link from "next/link";
import { usePathname } from "next/navigation";

const shopCategories = ["Makeup", "Parfums", "Skin Care", "Special Offers"] as const satisfies readonly Category[];

const linkClass = "type-nav text-gold-bright hover:text-foreground";

export function SiteFooter({ copy }: { copy: Dictionary }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const year = new Date().getFullYear();
  const product = pathname.startsWith("/product/");

  return (
    <footer className={`border-t border-gold/20 px-5 py-10 md:px-10 md:py-14 ${product ? "pb-28 md:pb-14" : ""}`}>
      <hr className="rule-gold mb-10" />
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-serif text-3xl tracking-[0.16em] text-foreground uppercase">Lux Makeup</p>
          <p className="type-caption mt-4 max-w-xs">{copy.footer}</p>
        </div>
        <nav className="flex flex-col gap-3" aria-label={copy.footerCategories}>
          <p className="type-eyebrow">{copy.footerCategories}</p>
          {shopCategories.map((category) => (
            <Link key={category} href={`/${hashForCategory(category)}`} className={linkClass}>
              {copy.category[category]}
            </Link>
          ))}
        </nav>
        <nav className="flex flex-col gap-3" aria-label={copy.maisonEyebrow}>
          <p className="type-eyebrow">{copy.maisonEyebrow}</p>
          <Link href="/about" className={linkClass}>
            {copy.footerAbout}
          </Link>
          <Link href="/contact" className={linkClass}>
            {copy.footerContact}
          </Link>
          <Link href="/terms" className={linkClass}>
            {copy.footerTerms}
          </Link>
          <Link href="/usage" className={linkClass}>
            {copy.footerUsage}
          </Link>
        </nav>
      </div>
      <p className="type-caption mt-10">{copy.footerRights.replace("{year}", String(year))}</p>
    </footer>
  );
}
