"use client";

import { createCoupon, toggleCoupon } from "@/app/actions/coupon-desk";
import type { CouponDraft, DeskCoupon } from "@/lib/admin-coupons";
import { formatDh } from "@/lib/products";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";

const emptyDraft: CouponDraft = {
  code: "",
  discountType: "percent",
  amount: "",
  validUntil: "",
  isActive: true,
};

export function CouponsDesk({ connected, coupons }: { connected: boolean; coupons: DeskCoupon[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CouponDraft>(emptyDraft);
  const [notice, setNotice] = useState<string | null>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setActive((current) => {
      const next = { ...current };
      let changed = false;
      for (const [id, value] of Object.entries(current)) {
        const coupon = coupons.find((item) => item.id === id);
        if (!coupon || coupon.isActive === value) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [coupons]);

  const rows = coupons.map((coupon) => ({ ...coupon, isActive: active[coupon.id] ?? coupon.isActive }));

  function toggle(coupon: DeskCoupon) {
    const next = !coupon.isActive;
    setNotice(null);
    setActive((current) => ({ ...current, [coupon.id]: next }));
    startTransition(async () => {
      const result = await toggleCoupon(coupon.id);
      if (!result.ok) {
        setActive((current) => ({ ...current, [coupon.id]: coupon.isActive }));
        setNotice(result.error);
        return;
      }
      setActive((current) => ({ ...current, [coupon.id]: result.isActive }));
      router.refresh();
    });
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    startTransition(async () => {
      const result = await createCoupon(draft);
      if (!result.ok) {
        setNotice(result.error);
        return;
      }
      setDraft(emptyDraft);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-eyebrow">Coupons</p>
          <h1 className="type-headline mt-3">The book</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setNotice(null);
            setDraft(emptyDraft);
            setOpen(true);
          }}
          className="type-nav border border-gold-bright px-4 py-3 text-gold-bright transition-colors hover:bg-gold/10"
        >
          New coupon
        </button>
      </div>

      {!connected ? (
        <p className="type-body mt-6 max-w-xl">The coupon book is waiting for the database. Connect PostgreSQL, then codes will appear here.</p>
      ) : null}

      {notice && !open ? (
        <p className="mt-4 text-xs tracking-wide text-[#E7B4A8]" role="alert">
          {notice}
        </p>
      ) : null}

      <div className="mt-8 overflow-x-auto border border-gold/20">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="bg-card">
            <tr className="type-eyebrow text-[0.62rem]">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Uses</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="type-body px-4 py-10">
                  No coupons are in the book yet.
                </td>
              </tr>
            ) : (
              rows.map((coupon) => (
                <tr key={coupon.id} className="border-t border-gold/15">
                  <td className="px-4 py-4 font-serif text-xl tracking-[0.12em] text-foreground">{coupon.code}</td>
                  <td className="type-price px-4 py-4">{discountLabel(coupon)}</td>
                  <td className="type-caption px-4 py-4 text-foreground/80">{formatDay(coupon.validUntil)}</td>
                  <td className="px-4 py-4">
                    <StatusBadge coupon={coupon} />
                  </td>
                  <td className="type-body px-4 py-4">{coupon.usageCount}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => toggle(coupon)}
                      className="type-caption border border-gold/30 px-2.5 py-1.5 text-foreground hover:border-gold-bright hover:text-gold-bright"
                    >
                      {coupon.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 sm:items-center">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="coupon-form-title"
            onSubmit={save}
            className="max-h-[90svh] w-full max-w-lg overflow-y-auto border border-gold/30 bg-[#0a0a0a] px-6 py-6"
          >
            <p className="type-eyebrow">New code</p>
            <h2 id="coupon-form-title" className="mt-3 font-serif text-3xl text-foreground">
              Add a coupon
            </h2>
            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="type-eyebrow">Code</span>
                <input
                  value={draft.code}
                  onChange={(event) => setDraft({ ...draft, code: event.target.value.toUpperCase() })}
                  className="mt-2 w-full border border-gold/30 bg-[#0a0a0a] px-3 py-3 text-sm tracking-[0.14em] text-foreground uppercase outline-none focus:border-[#E5C158]"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="type-eyebrow">Discount type</span>
                  <select
                    value={draft.discountType}
                    onChange={(event) => setDraft({ ...draft, discountType: event.target.value === "fixed" ? "fixed" : "percent" })}
                    className="mt-2 w-full border border-gold/30 bg-[#0a0a0a] px-3 py-3 text-sm text-foreground outline-none [color-scheme:dark] focus:border-[#E5C158]"
                  >
                    <option value="percent">Percentage</option>
                    <option value="fixed">Fixed MAD</option>
                  </select>
                </label>
                <label className="block">
                  <span className="type-eyebrow">{draft.discountType === "percent" ? "Percent" : "Amount (DH)"}</span>
                  <input
                    value={draft.amount}
                    inputMode="numeric"
                    onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
                    className="mt-2 w-full border border-gold/30 bg-[#0a0a0a] px-3 py-3 text-sm text-foreground outline-none focus:border-[#E5C158]"
                  />
                </label>
              </div>
              <label className="block">
                <span className="type-eyebrow">Expiration date</span>
                <input
                  type="date"
                  value={draft.validUntil}
                  onChange={(event) => setDraft({ ...draft, validUntil: event.target.value })}
                  className="mt-2 w-full border border-gold/30 bg-[#0a0a0a] px-3 py-3 text-sm text-foreground outline-none [color-scheme:dark] focus:border-[#E5C158]"
                />
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })}
                  className="size-4 accent-[#D4AF37]"
                />
                <span className="type-body">Active</span>
              </label>
            </div>
            {notice ? (
              <p className="mt-4 text-xs tracking-wide text-[#E7B4A8]" role="alert">
                {notice}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="submit" disabled={isPending} className="type-nav border border-gold-bright px-4 py-3 text-gold-bright disabled:opacity-40">
                {isPending ? "Saving" : "Add coupon"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="type-nav px-4 py-3 text-foreground/70">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ coupon }: { coupon: DeskCoupon }) {
  if (coupon.expired) {
    return <span className="type-caption inline-flex border border-foreground/25 px-2.5 py-1 text-foreground/55">Expired</span>;
  }
  if (!coupon.isActive) {
    return <span className="type-caption inline-flex border border-foreground/25 px-2.5 py-1 text-foreground/55">Disabled</span>;
  }
  return <span className="type-caption inline-flex border border-[#E5C158] px-2.5 py-1 text-[#E5C158]">Active</span>;
}

function discountLabel(coupon: DeskCoupon) {
  if (coupon.discountPercentage != null) return `${coupon.discountPercentage}%`;
  if (coupon.fixedAmount != null) return formatDh(coupon.fixedAmount);
  return "—";
}

function formatDay(iso: string) {
  return new Intl.DateTimeFormat("fr-MA", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso));
}
