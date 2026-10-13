"use server";

import { discountForCoupon, normalizeCouponCode } from "@/lib/coupon-quote";
import { prisma } from "@/lib/prisma";

export async function applyCoupon(code: string, merchandiseDh: number) {
  const normalized = normalizeCouponCode(code);
  if (!/^[A-Z0-9-]{3,20}$/.test(normalized)) {
    return { ok: false as const, error: "Enter a coupon code." };
  }

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalized },
      select: { code: true, discountPercentage: true, fixedAmount: true, isActive: true, validUntil: true },
    });
    if (!coupon) return { ok: false as const, error: "That coupon is not in the book." };
    const priced = discountForCoupon(merchandiseDh, coupon);
    if (!priced.ok) return priced;
    return { ok: true as const, code: coupon.code, discountDh: priced.discountDh, payableDh: merchandiseDh - priced.discountDh };
  } catch (error) {
    console.error("Coupon could not be quoted", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "That coupon could not be applied." };
  }
}
