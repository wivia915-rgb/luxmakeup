import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-gold/20 bg-background">
      <div className="flex min-h-[calc(100svh-5.5rem)]">
        <aside className="hidden w-52 shrink-0 border-r border-gold/20 px-6 py-8 md:block">
          <p className="type-eyebrow">Atelier desk</p>
          <p className="mt-3 font-serif text-2xl tracking-[0.14em] text-foreground uppercase">Lux</p>
          <nav className="mt-10" aria-label="Admin">
            <Link href="/admin/orders" className="type-nav text-gold-bright">
              Orders
            </Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
