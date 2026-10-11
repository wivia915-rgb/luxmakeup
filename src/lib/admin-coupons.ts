import { prisma } from "@/lib/prisma";

export type DeskCoupon = {
  id: string;
  code: string;
  discountPercentage: number | null;
  fixedAmount: number | null;
  validUntil: string;
  isActive: boolean;
  usageCount: number;
  expired: boolean;
};

export type CouponDraft = {
  code: string;
  discountType: "percent" | "fixed";
  amount: string;
  validUntil: string;
  isActive: boolean;
};

const empty = { connected: false as const, coupons: [] as DeskCoupon[] };

export async function getCouponDesk(): Promise<{ connected: boolean; coupons: DeskCoupon[] }> {
  try {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({ orderBy: [{ validUntil: "asc" }, { code: "asc" }] });
    return {
      connected: true,
      coupons: coupons.map((coupon) => ({
        id: coupon.id,
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        fixedAmount: coupon.fixedAmount,
        validUntil: coupon.validUntil.toISOString(),
        isActive: coupon.isActive,
        usageCount: coupon.usageCount,
        expired: coupon.validUntil.getTime() < now.getTime(),
      })),
    };
  } catch (error) {
    console.error("Coupon desk could not be loaded", error instanceof Error ? error.name : "unknown");
    return empty;
  }
}

export function parseCouponDraft(input: CouponDraft): { ok: true; value: CouponWrite } | { ok: false; error: string } {
  const code = input.code.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9-]{3,20}$/.test(code)) {
    return { ok: false, error: "Use 3 to 20 letters, numbers, or hyphens." };
  }
  if (input.discountType !== "percent" && input.discountType !== "fixed") {
    return { ok: false, error: "Choose a percentage or a fixed amount." };
  }
  if (!/^\d+$/.test(input.amount.trim())) {
    return { ok: false, error: "Discount is a whole number." };
  }
  const amount = Number(input.amount.trim());
  if (input.discountType === "percent" && (amount < 1 || amount > 100)) {
    return { ok: false, error: "Percentage is between 1 and 100." };
  }
  if (input.discountType === "fixed" && (amount < 1 || amount > 100000)) {
    return { ok: false, error: "Fixed discount is between 1 and 100 000 DH." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.validUntil)) {
    return { ok: false, error: "Choose an expiration date." };
  }
  const validUntil = new Date(`${input.validUntil}T23:59:59.999Z`);
  if (Number.isNaN(validUntil.getTime())) {
    return { ok: false, error: "Choose an expiration date." };
  }

  return {
    ok: true,
    value: {
      code,
      discountPercentage: input.discountType === "percent" ? amount : null,
      fixedAmount: input.discountType === "fixed" ? amount : null,
      validUntil,
      isActive: input.isActive,
    },
  };
}

type CouponWrite = {
  code: string;
  discountPercentage: number | null;
  fixedAmount: number | null;
  validUntil: Date;
  isActive: boolean;
};
