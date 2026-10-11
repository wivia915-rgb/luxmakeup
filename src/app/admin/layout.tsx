import { AdminCopyProvider } from "@/components/admin/admin-locale";
import { adminMessages } from "@/lib/admin-copy";
import { getLocale } from "@/lib/get-locale";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const copy = adminMessages[await getLocale()];

  const links = [
    { href: "/admin", label: copy.nav.desk },
    { href: "/admin/orders", label: copy.nav.orders },
    { href: "/admin/products", label: copy.nav.products },
    { href: "/admin/coupons", label: copy.nav.coupons },
    { href: "/admin/settings", label: copy.nav.settings },
  ];

  return (
    <AdminCopyProvider copy={copy}>
      <div className="border-t border-gold/20 bg-background">
        <div className="flex min-h-[calc(100svh-5.5rem)]">
          <aside className="hidden w-52 shrink-0 border-e border-gold/20 px-6 py-8 md:block">
            <p className="type-eyebrow">{copy.nav.eyebrow}</p>
            <p className="mt-3 font-serif text-2xl tracking-[0.14em] text-foreground uppercase">Lux</p>
            <nav className="mt-10 flex flex-col gap-4" aria-label={copy.nav.label}>
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="type-nav text-foreground/80 hover:text-gold-bright">
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="min-w-0 flex-1">
            <nav className="flex gap-6 overflow-x-auto border-b border-gold/20 px-5 py-4 md:hidden" aria-label={copy.nav.label}>
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="type-nav shrink-0 text-foreground/80">
                  {link.label}
                </Link>
              ))}
            </nav>
            {children}
          </div>
        </div>
      </div>
    </AdminCopyProvider>
  );
}
