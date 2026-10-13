export function discountForCoupon(
  merchandiseDh: number,
  coupon: { discountPercentage: number | null; fixedAmount: number | null; isActive: boolean; validUntil: Date },
): { ok: true; discountDh: number } | { ok: false; error: string } {
  if (!Number.isInteger(merchandiseDh) || merchandiseDh < 1) {
    return { ok: false, error: "That coupon could not be applied." };
  }
  if (!coupon.isActive) return { ok: false, error: "That coupon is not active." };
  if (coupon.validUntil.getTime() < Date.now()) return { ok: false, error: "That coupon has expired." };

  const percent = coupon.discountPercentage;
  const fixed = coupon.fixedAmount;
  const discountDh =
    percent != null ? Math.min(merchandiseDh, Math.round((merchandiseDh * percent) / 100)) : fixed != null ? Math.min(merchandiseDh, fixed) : 0;
  if (discountDh < 1) return { ok: false, error: "That coupon could not be applied." };
  return { ok: true, discountDh };
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}
