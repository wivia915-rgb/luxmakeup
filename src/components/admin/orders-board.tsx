"use client";

import { updateOrderStatus } from "@/app/actions/update-order-status";
import { ShippingSlip } from "@/components/admin/shipping-slip";
import { downloadOrdersCsv } from "@/lib/order-export";
import { formatDh } from "@/lib/products";
import {
  isOrderStatus,
  orderStatusLabel,
  type DeskOrder,
  type OrderMetrics,
  type OrderStatusValue,
} from "@/lib/order-desk";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

const quickStatuses: OrderStatusValue[] = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

const statusFilters = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "SHIPPED", label: "Shipped" },
  { id: "CANCELLED", label: "Cancelled" },
] as const;

type StatusFilter = (typeof statusFilters)[number]["id"];

const badgeClass: Record<OrderStatusValue, string> = {
  PENDING: "border border-[#E5C158] text-[#E5C158]",
  CONFIRMED: "border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#E5C158]",
  SHIPPED: "bg-[#D4AF37] text-[#0D0D0D]",
  DELIVERED: "bg-[#F8F8F8] text-[#0D0D0D]",
  CANCELLED: "border border-foreground/25 text-foreground/55",
};

type OrdersBoardProps = {
  connected: boolean;
  metrics: OrderMetrics;
  orders: DeskOrder[];
};

export function OrdersBoard({ connected, metrics, orders }: OrdersBoardProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [overrides, setOverrides] = useState<Partial<Record<string, OrderStatusValue>>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [slip, setSlip] = useState<DeskOrder | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 8000);
    return () => window.clearInterval(timer);
  }, [router]);

  useEffect(() => {
    setOverrides((current) => {
      const next = { ...current };
      let changed = false;
      for (const [id, value] of Object.entries(current)) {
        const order = orders.find((item) => item.id === id);
        if (order && value && order.status === value) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [orders]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      const current = overrides[order.id] ?? order.status;
      if (status !== "ALL" && current !== status) return false;
      if (!needle) return true;
      const haystack = [
        order.id,
        order.customerName,
        order.phone,
        order.city,
        order.address,
        ...order.items.map((item) => `${item.title} ${item.shadeName}`),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [orders, overrides, query, status]);

  function changeStatus(orderId: string, next: OrderStatusValue) {
    const order = orders.find((item) => item.id === orderId);
    const previous = overrides[orderId] ?? order?.status;
    if (!previous || previous === next) return;
    setNotice(null);
    setOverrides((current) => ({ ...current, [orderId]: next }));
    setPendingId(orderId);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      setPendingId(null);
      if (!result.ok) {
        setOverrides((current) => {
          const copy = { ...current };
          if (previous === order?.status) delete copy[orderId];
          else copy[orderId] = previous;
          return copy;
        });
        setNotice(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-eyebrow">Orders</p>
          <h1 className="type-headline mt-3">The desk</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={visible.length === 0}
            onClick={() => downloadOrdersCsv(visible, (order) => overrides[order.id] ?? order.status)}
            className="type-nav border border-gold-bright px-4 py-3 text-gold-bright transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Export orders (CSV)
          </button>
          <p className="type-caption inline-flex items-center gap-2">
            <span className="size-1.5 animate-pulse bg-[#E5C158]" aria-hidden />
            Live · refreshes every few seconds
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3" aria-live="polite">
        <Metric label="Total sales" value={formatDh(metrics.totalSales)} />
        <Metric label="Pending orders" value={String(metrics.pending)} />
        <Metric label="Delivered" value={String(metrics.delivered)} />
      </div>

      {!connected ? (
        <p className="type-body mt-6 max-w-xl">
          The order book is waiting for the database. Connect PostgreSQL, then new cash-on-delivery orders will appear here.
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 border-y border-gold/20 py-5">
        <label className="block max-w-md">
          <span className="type-eyebrow">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, phone, city, piece"
            className="mt-2 w-full border border-gold/30 bg-[#0D0D0D] px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-[#E5C158]"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
          {statusFilters.map((item) => (
            <FilterChip key={item.id} pressed={status === item.id} onClick={() => setStatus(item.id)}>
              {item.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {notice ? (
        <p className="mt-4 text-xs tracking-wide text-[#E7B4A8]" role="alert">
          {notice}
        </p>
      ) : null}

      <p className="type-caption mt-6">
        {visible.length === 1 ? "1 order" : `${visible.length} orders`}
      </p>

      <div className="mt-4 space-y-3 md:hidden">
        {visible.length === 0 ? (
          <p className="type-body border border-gold/20 px-4 py-10">No orders match this desk view.</p>
        ) : (
          visible.map((order) => {
            const current = overrides[order.id] ?? order.status;
            return (
              <article key={order.id} className="border border-gold/20 bg-card px-4 py-4">
                <p className="type-caption break-all text-foreground">{order.id}</p>
                <p className="mt-3 text-sm text-foreground">{order.customerName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="type-caption">{order.phone}</p>
                  <WhatsAppLink href={order.whatsappUrl} name={order.customerName} />
                </div>
                <p className="type-caption">{order.city}</p>
                <p className="type-price mt-3">{formatDh(order.totalAmount)}</p>
                <p className="type-caption mt-2">{formatWhen(order.createdAt)}</p>
                <button
                  type="button"
                  onClick={() => setSlip(order)}
                  className="type-caption mt-3 border border-gold/30 px-2.5 py-1.5 text-foreground hover:border-gold-bright hover:text-gold-bright"
                >
                  Print shipping slip
                </button>
                <div className="mt-3">
                  <StatusField
                    orderId={order.id}
                    status={current}
                    busy={isPending && pendingId === order.id}
                    onChange={(next) => changeStatus(order.id, next)}
                  />
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="mt-4 hidden overflow-x-auto border border-gold/20 md:block">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead className="bg-card">
            <tr className="type-eyebrow text-[0.62rem]">
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Customer Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Total Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Slip</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={8} className="type-body px-4 py-10">
                  No orders match this desk view.
                </td>
              </tr>
            ) : (
              visible.map((order) => {
                const current = overrides[order.id] ?? order.status;
                return (
                  <tr key={order.id} className="border-t border-gold/15 align-top">
                    <td className="type-caption max-w-40 px-4 py-4 break-all text-foreground">{order.id}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{order.customerName}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="type-caption text-foreground/85">{order.phone}</span>
                        <WhatsAppLink href={order.whatsappUrl} name={order.customerName} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground/85">{order.city}</td>
                    <td className="type-price px-4 py-4">{formatDh(order.totalAmount)}</td>
                    <td className="px-4 py-4">
                      <StatusField
                        orderId={order.id}
                        status={current}
                        busy={isPending && pendingId === order.id}
                        onChange={(next) => changeStatus(order.id, next)}
                      />
                    </td>
                    <td className="type-caption px-4 py-4 text-foreground/80">{formatWhen(order.createdAt)}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setSlip(order)}
                        className="type-caption border border-gold/30 px-2.5 py-1.5 text-foreground hover:border-gold-bright hover:text-gold-bright"
                      >
                        Print slip
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {slip ? <ShippingSlip order={slip} onClose={() => setSlip(null)} /> : null}
    </div>
  );
}

function WhatsAppLink({ href, name }: { href: string; name: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Contact ${name} via WhatsApp`}
      className="type-caption border border-[#E5C158] bg-[#0a0a0a] px-2.5 py-1.5 text-[#E5C158] hover:bg-gold/10"
    >
      WhatsApp
    </a>
  );
}

function StatusField({
  orderId,
  status,
  busy,
  onChange,
}: {
  orderId: string;
  status: OrderStatusValue;
  busy: boolean;
  onChange: (next: OrderStatusValue) => void;
}) {
  const options: OrderStatusValue[] = status === "CONFIRMED" ? ["CONFIRMED", ...quickStatuses] : quickStatuses;

  return (
    <div className="flex min-w-36 flex-col items-start gap-2">
      <span className={`type-caption inline-flex px-2.5 py-1 ${badgeClass[status]}`}>{orderStatusLabel[status]}</span>
      <select
        value={status}
        disabled={busy}
        aria-label={`Set status for order ${orderId.slice(0, 8)}`}
        onChange={(event) => {
          if (isOrderStatus(event.target.value)) onChange(event.target.value);
        }}
        className="w-full border border-gold/30 bg-[#0D0D0D] px-2 py-1.5 text-xs text-foreground outline-none [color-scheme:dark] focus:border-[#E5C158] disabled:opacity-40"
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {orderStatusLabel[item]}
          </option>
        ))}
      </select>
    </div>
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

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={pressed}
      onClick={onClick}
      className={`type-nav border px-3 py-2 ${pressed ? "border-gold-bright bg-gold/10 text-gold-bright" : "border-gold/25 text-foreground/80"}`}
    >
      {children}
    </button>
  );
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
