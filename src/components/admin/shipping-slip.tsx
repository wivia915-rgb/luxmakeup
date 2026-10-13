"use client";

import { useAdminCopy } from "@/components/admin/admin-locale";
import { formatDh } from "@/lib/products";
import type { DeskOrder } from "@/lib/order-desk";
import { useEffect } from "react";

export function ShippingSlip({ order, onClose }: { order: DeskOrder; onClose: () => void }) {
  const copy = useAdminCopy();
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 sm:items-center">
      <style>{printStyles}</style>
      <article
        className="cod-slip max-h-[90svh] w-full max-w-md overflow-y-auto border border-gold/30 bg-card px-6 py-6 text-foreground"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipping-slip-title"
      >
        <p className="cod-gold type-eyebrow">{copy.slip.eyebrow}</p>
        <h2 id="shipping-slip-title" className="mt-3 font-serif text-3xl tracking-[0.12em] text-foreground uppercase">
          Lux Makeup
        </h2>
        <p className="type-caption mt-2">{copy.slip.title}</p>

        <dl className="mt-6 space-y-3 border-y border-gold/25 py-4 text-sm">
          <SlipRow label={copy.slip.id} value={order.id} />
          <SlipRow label={copy.slip.customer} value={order.customerName} />
          <SlipRow label={copy.slip.phone} value={order.phone} />
          <SlipRow label={copy.slip.city} value={order.city} />
          <SlipRow label={copy.slip.address} value={order.address} />
          <SlipRow label={copy.slip.date} value={slipDate(order.createdAt, copy.dateLocale)} />
        </dl>

        <p className="type-eyebrow mt-5">{copy.slip.items}</p>
        {order.items.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/70">{copy.slip.empty}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {order.items.map((item, index) => (
              <li key={`${order.id}-${index}`} className="flex justify-between gap-4 text-sm text-foreground">
                <span>
                  {item.title}
                  {item.shadeName ? <span className="text-foreground/60"> · {item.shadeName}</span> : null}
                </span>
                <span className="shrink-0">×{item.quantity}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 flex items-end justify-between border-t border-gold/30 pt-4">
          <span className="type-eyebrow">{copy.slip.total}</span>
          <span className="font-serif text-3xl text-gold-bright">{formatDh(order.totalAmount)}</span>
        </p>

        <div className="cod-slip-actions mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => window.print()} className="type-nav border border-gold-bright px-4 py-3 text-gold-bright">
            {copy.slip.print}
          </button>
          <button type="button" onClick={onClose} className="type-nav px-4 py-3 text-foreground/70">
            {copy.slip.close}
          </button>
        </div>
      </article>
    </div>
  );
}

function SlipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3">
      <dt className="type-caption">{label}</dt>
      <dd className="break-words text-foreground">{value}</dd>
    </div>
  );
}

function slipDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

const printStyles = `
@media print {
  @page { size: A4; margin: 12mm; }
  html, body { background: #fff !important; }
  body * { visibility: hidden !important; }
  .cod-slip, .cod-slip * { visibility: visible !important; }
  .cod-slip {
    position: absolute !important;
    inset: 0 auto auto 0 !important;
    width: 80mm !important;
    max-width: 100% !important;
    max-height: none !important;
    overflow: visible !important;
    border: 0 !important;
    background: #fff !important;
    color: #111 !important;
    box-shadow: none !important;
  }
  .cod-slip .cod-slip-actions { display: none !important; }
  .cod-slip, .cod-slip h2, .cod-slip dd, .cod-slip li, .cod-slip span { color: #111 !important; }
  .cod-slip .cod-gold, .cod-slip dt { color: #444 !important; }
}
`;
