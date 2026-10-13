"use client";

import { applyCoupon } from "@/app/actions/apply-coupon";
import type { Dictionary } from "@/lib/messages";
import { formatDh } from "@/lib/products";
import { useEffect, useState } from "react";

export type AppliedCoupon = { code: string; discountDh: number };

export function CouponField({
  merchandiseDh,
  copy,
  applied,
  onApplied,
}: {
  merchandiseDh: number;
  copy: Dictionary["checkout"];
  applied: AppliedCoupon | null;
  onApplied: (coupon: AppliedCoupon | null) => void;
}) {
  const [code, setCode] = useState(applied?.code ?? "");
  const [note, setNote] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!applied) return;
    let cancel = false;
    void applyCoupon(applied.code, merchandiseDh).then((result) => {
      if (cancel) return;
      if (!result.ok) onApplied(null);
      else if (result.discountDh !== applied.discountDh) onApplied({ code: result.code, discountDh: result.discountDh });
    });
    return () => {
      cancel = true;
    };
  }, [applied, merchandiseDh, onApplied]);

  async function apply() {
    setApplying(true);
    setNote(null);
    const result = await applyCoupon(code, merchandiseDh);
    setApplying(false);
    if (!result.ok) {
      onApplied(null);
      setNote(copy.server[result.error] ?? result.error);
      return;
    }
    onApplied({ code: result.code, discountDh: result.discountDh });
    setCode(result.code);
  }

  return (
    <div>
      <span className="type-eyebrow">{copy.coupon}</span>
      <div className="mt-2 flex gap-2">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void apply();
            }
          }}
          placeholder={copy.couponPlaceholder}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 border border-gold/30 bg-background px-3 py-3 text-sm tracking-[0.12em] text-foreground uppercase outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-foreground/35 focus:border-gold-bright"
        />
        <button
          type="button"
          onClick={() => void apply()}
          disabled={applying || code.trim().length < 3}
          className="type-nav border border-gold-bright px-4 py-3 text-gold-bright disabled:opacity-40"
        >
          {applying ? copy.applying : copy.apply}
        </button>
      </div>
      {applied ? (
        <p className="mt-2 flex items-center justify-between gap-3 text-xs tracking-wide text-gold-bright">
          <span>
            {applied.code} · −{formatDh(applied.discountDh)}
          </span>
          <button type="button" onClick={() => onApplied(null)} className="text-foreground/60 hover:text-gold-bright">
            {copy.remove}
          </button>
        </p>
      ) : null}
      {note ? (
        <p className="mt-2 text-xs tracking-wide text-[#E7B4A8]" role="alert">
          {note}
        </p>
      ) : null}
    </div>
  );
}
