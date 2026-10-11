import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div dir="ltr" className="border-t border-gold/20 bg-background">
      <div className="flex min-h-[calc(100svh-5.5rem)]">
        <aside className="hidden w-52 shrink-0 border-r border-gold/20 px-6 py-8 md:block">
          <p className="type-eyebrow">Atelier desk</p>
          <p className="mt-3 font-serif text-2xl tracking-[0.14em] text-foreground uppercase">Lux</p>
          <nav className="mt-10 flex flex-col gap-4" aria-label="Admin">
            <Link href="/admin" className="type-nav text-foreground/80 hover:text-gold-bright">
              Desk
            </Link>
            <Link href="/admin/orders" className="type-nav text-foreground/80 hover:text-gold-bright">
              Orders
            </Link>
            <Link href="/admin/products" className="type-nav text-foreground/80 hover:text-gold-bright">
              Products
            </Link>
            <Link href="/admin/coupons" className="type-nav text-foreground/80 hover:text-gold-bright">
              Coupons
            </Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <nav className="flex gap-6 border-b border-gold/20 px-5 py-4 md:hidden" aria-label="Admin">
            <Link href="/admin" className="type-nav text-foreground/80">
              Desk
            </Link>
            <Link href="/admin/orders" className="type-nav text-foreground/80">
              Orders
            </Link>
            <Link href="/admin/products" className="type-nav text-foreground/80">
              Products
            </Link>
            <Link href="/admin/coupons" className="type-nav text-foreground/80">
              Coupons
            </Link>
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}
