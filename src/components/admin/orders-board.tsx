"use client";

import { updateOrderStatus } from "@/app/actions/update-order-status";
import { formatDh } from "@/lib/products";
import {
  orderStatusLabel,
  orderStatuses,
  type DeskOrder,
  type OrderMetrics,
  type OrderStatusValue,
} from "@/lib/order-desk";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

const quickStatuses: OrderStatusValue[] = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

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
  const [status, setStatus] = useState<OrderStatusValue | "ALL">("ALL");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 8000);
    return () => window.clearInterval(timer);
  }, [router]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== "ALL" && order.status !== status) return false;
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
  }, [orders, query, status]);

  function changeStatus(orderId: string, next: OrderStatusValue) {
    setNotice(null);
    setPendingId(orderId);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      setPendingId(null);
      if (!result.ok) {
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
        <p className="type-caption inline-flex items-center gap-2">
          <span className="size-1.5 animate-pulse bg-[#E5C158]" aria-hidden />
          Live · refreshes every few seconds
        </p>
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
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          <FilterChip pressed={status === "ALL"} onClick={() => setStatus("ALL")}>
            All
          </FilterChip>
          {orderStatuses.map((item) => (
            <FilterChip key={item} pressed={status === item} onClick={() => setStatus(item)}>
              {orderStatusLabel[item]}
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

      <div className="mt-4 overflow-x-auto border border-gold/20">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead className="bg-card">
            <tr className="type-eyebrow text-[0.62rem]">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Pieces</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="type-body px-4 py-10">
                  No orders match this desk view.
                </td>
              </tr>
            ) : (
              visible.map((order) => (
                <tr key={order.id} className="border-t border-gold/15 align-top">
                  <td className="px-4 py-4">
                    <p className="type-caption text-foreground">{order.id.slice(0, 8)}</p>
                    <p className="type-caption mt-1">{formatWhen(order.createdAt)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-foreground">{order.customerName}</p>
                    <p className="type-caption mt-1">{order.phone}</p>
                    <p className="type-caption">{order.city}</p>
                  </td>
                  <td className="px-4 py-4">
                    <ul className="space-y-1">
                      {order.items.map((item, index) => (
                        <li key={`${order.id}-${index}`} className="text-sm text-foreground/85">
                          {item.title}
                          <span className="type-caption"> · {item.shadeName} · ×{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="type-price px-4 py-4">{formatDh(order.totalAmount)}</td>
                  <td className="px-4 py-4">
                    <span className={`type-caption inline-flex px-2.5 py-1 ${badgeClass[order.status]}`}>
                      {orderStatusLabel[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {quickStatuses.map((next) => (
                        <button
                          key={next}
                          type="button"
                          disabled={order.status === next || (isPending && pendingId === order.id)}
                          aria-label={`Set order ${order.id.slice(0, 8)} to ${orderStatusLabel[next]}`}
                          onClick={() => changeStatus(order.id, next)}
                          className="type-caption border border-gold/30 px-2.5 py-1.5 text-foreground transition-colors hover:border-gold-bright hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {orderStatusLabel[next]}
                        </button>
                      ))}
                      <a
                        href={order.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="type-caption border border-[#E5C158] px-2.5 py-1.5 text-[#E5C158]"
                        aria-label={`WhatsApp ${order.customerName}`}
                      >
                        WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
      aria-pressed={pressed}
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
