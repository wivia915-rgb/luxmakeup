"use client";

import { useAdminCopy } from "@/components/admin/admin-locale";
import { fillCount } from "@/lib/admin-copy";
import type { AdminDeskData, DeskRank, DeskStatusSlice } from "@/lib/admin-desk";
import { formatDh } from "@/lib/products";
import Link from "next/link";

const figure = "font-serif [font-variant-numeric:lining-nums]";

const statusColor: Record<DeskStatusSlice["status"], string> = {
  PENDING: "#E5C158",
  SHIPPED: "#D4AF37",
  CANCELLED: "#E7B4A8",
  CONFIRMED: "#8C7340",
  DELIVERED: "var(--color-foreground)",
};

export function DeskOverview({ desk }: { desk: AdminDeskData }) {
  const copy = useAdminCopy().desk;
  return (
    <main id="main" className="bg-card px-5 py-8 md:px-8 md:py-10">
      <p className="type-eyebrow">{copy.eyebrow}</p>
      <h1 className="type-headline mt-3">{copy.title}</h1>
      <p className="type-body mt-4 max-w-xl">{copy.lead}</p>

      <div className="mt-8 grid gap-3 lg:grid-cols-5" aria-live="polite">
        <article className="border border-gold/25 bg-card px-5 py-6 lg:col-span-2">
          <p className="type-eyebrow">{copy.revenue}</p>
          <p className={`mt-4 text-5xl tracking-[-0.04em] text-gold-bright ${figure}`}>{formatDh(desk.totalRevenue)}</p>
          <p className="type-caption mt-4">{copy.revenueNote}</p>
        </article>

        <article className="border border-gold/25 bg-card px-5 py-6 lg:col-span-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="type-eyebrow">{copy.orders}</p>
              <p className={`mt-4 text-5xl tracking-[-0.04em] text-gold-bright ${figure}`}>{desk.totalOrders}</p>
            </div>
            <p className="type-caption pb-1 text-end">{copy.share}</p>
          </div>
          <StatusChart statuses={desk.statuses} total={desk.totalOrders} />
        </article>
      </div>

      {!desk.connected ? (
        <p className="type-body mt-6 max-w-xl">
          {copy.waiting}
        </p>
      ) : null}

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        <RankChart
          eyebrow={copy.citiesEyebrow}
          title={copy.cities}
          empty={copy.citiesEmpty}
          rows={desk.cities}
          scale="amount"
          metric={(row) => `${row.count === 1 ? copy.oneOrder : fillCount(copy.manyOrders, row.count)} · ${formatDh(row.amount)}`}
        />
        <RankChart
          eyebrow={copy.piecesEyebrow}
          title={copy.pieces}
          empty={copy.piecesEmpty}
          rows={desk.pieces}
          scale="count"
          metric={(row) => `${row.count === 1 ? copy.onePiece : fillCount(copy.manyPieces, row.count)} · ${formatDh(row.amount)}`}
        />
      </div>

      <nav className="mt-10 grid gap-3 sm:grid-cols-2" aria-label={copy.shortcuts}>
        <Link href="/admin/orders" className="border border-gold/25 bg-card px-6 py-6 transition-colors hover:border-gold-bright">
          <p className="type-eyebrow">{copy.orders}</p>
          <p className={`mt-3 text-3xl tracking-[-0.03em] text-gold-bright ${figure}`}>{copy.openBook}</p>
          <p className="type-body mt-3">{copy.openBookBody}</p>
        </Link>
        <Link href="/admin/products" className="border border-gold/25 bg-card px-6 py-6 transition-colors hover:border-gold-bright">
          <p className="type-eyebrow">{copy.piecesEyebrow}</p>
          <p className={`mt-3 text-3xl tracking-[-0.03em] text-gold-bright ${figure}`}>
            {desk.productCount === 1 ? copy.onePiece : fillCount(copy.manyPieces, desk.productCount)}
          </p>
          <p className="type-body mt-3">{copy.collectionBody}</p>
        </Link>
      </nav>
    </main>
  );
}

function StatusChart({ statuses, total }: { statuses: DeskStatusSlice[]; total: number }) {
  const copy = useAdminCopy();
  const active = statuses.filter((slice) => slice.count > 0);
  let cursor = 0;
  const stops = active.map((slice) => {
    const start = cursor;
    cursor += slice.share * 100;
    return `${statusColor[slice.status]} ${start}% ${cursor}%`;
  });
  const summary = statuses.map((slice) => `${copy.status[slice.status]} ${slice.count}`).join(", ");

  return (
    <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
      <div
        className="relative size-36 shrink-0 rounded-full"
        role="img"
        aria-label={total === 0 ? copy.desk.noOrders : summary}
        style={
          stops.length > 0
            ? { background: `conic-gradient(${stops.join(", ")})` }
            : { background: "var(--color-card)", boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.35)" }
        }
      >
        <div className="absolute inset-[1.15rem] rounded-full bg-card" />
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5">
        {statuses.map((slice) => (
          <li key={slice.status} className="flex items-center justify-between gap-4">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2 shrink-0" style={{ background: statusColor[slice.status] }} aria-hidden />
              <span className="type-caption text-foreground">{copy.status[slice.status]}</span>
            </span>
            <span className="type-caption text-gold-bright">
              {slice.count}
              <span className="ms-2 text-foreground/55">{Math.round(slice.share * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RankChart({
  eyebrow,
  title,
  empty,
  rows,
  scale,
  metric,
}: {
  eyebrow: string;
  title: string;
  empty: string;
  rows: DeskRank[];
  scale: "amount" | "count";
  metric: (row: DeskRank) => string;
}) {
  const peak = rows.reduce((max, row) => Math.max(max, row[scale]), 0);

  return (
    <section className="border border-gold/25 bg-card px-5 py-6" aria-label={title}>
      <p className="type-eyebrow">{eyebrow}</p>
          <h2 className={`mt-3 text-3xl tracking-[-0.03em] text-gold-bright ${figure}`}>{title}</h2>
      {rows.length === 0 ? (
        <p className="type-body mt-6">{empty}</p>
      ) : (
        <ol className="mt-6 space-y-5">
          {rows.map((row) => {
            const width = peak > 0 ? Math.max((row[scale] / peak) * 100, 6) : 0;
            return (
              <li key={row.label}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="type-caption text-foreground">{row.label}</span>
                  <span className="type-caption shrink-0 text-gold-bright">{metric(row)}</span>
                </div>
                <div className="mt-2 h-px bg-[#D4AF37]/20" aria-hidden>
                  <div className="h-[3px] -translate-y-px bg-[#D4AF37]" style={{ width: `${width}%` }} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
