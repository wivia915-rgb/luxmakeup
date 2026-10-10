import { getAdminDesk } from "@/lib/admin-desk";
import { formatDh } from "@/lib/products";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Desk",
  description: "Lux Makeup atelier desk for orders, revenue, and the collection.",
};

export default async function AdminPage() {
  const desk = await getAdminDesk();

  return (
    <main id="main" className="px-5 py-8 md:px-8 md:py-10">
      <p className="type-eyebrow">Atelier</p>
      <h1 className="type-headline mt-3">The desk</h1>
      <p className="type-body mt-4 max-w-xl">
        Cash on delivery, counted in dirhams. Delivered orders are the completed book.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
        <Metric label="Total orders" value={String(desk.totalOrders)} />
        <Metric label="Total revenue" value={formatDh(desk.totalRevenue)} />
        <Metric label="Pending orders" value={String(desk.pendingOrders)} />
        <Metric label="Completed orders" value={String(desk.completedOrders)} />
      </div>

      {!desk.connected ? (
        <p className="type-body mt-6 max-w-xl">
          The order book is waiting for the database. Connect PostgreSQL, then orders and pieces will appear here.
        </p>
      ) : null}

      <nav className="mt-10 grid gap-3 sm:grid-cols-2" aria-label="Desk shortcuts">
        <Link
          href="/admin/orders"
          className="border border-gold/20 bg-card px-6 py-6 transition-colors hover:border-gold-bright"
        >
          <p className="type-eyebrow">Orders</p>
          <p className="mt-3 font-serif text-3xl tracking-[-0.03em] text-foreground">Open the book</p>
          <p className="type-body mt-3">Confirm, ship, and close each cash-on-delivery order.</p>
        </Link>
        <Link
          href="/admin/products"
          className="border border-gold/20 bg-card px-6 py-6 transition-colors hover:border-gold-bright"
        >
          <p className="type-eyebrow">Products</p>
          <p className="mt-3 font-serif text-3xl tracking-[-0.03em] text-foreground">
            {desk.productCount} {desk.productCount === 1 ? "piece" : "pieces"}
          </p>
          <p className="type-body mt-3">The collection currently held in the catalog.</p>
        </Link>
      </nav>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="border border-gold/20 bg-card px-5 py-5">
      <p className="type-eyebrow">{label}</p>
      <p className="mt-3 font-serif text-3xl tracking-[-0.03em] text-foreground">{value}</p>
    </article>
  );
}
