"use server";

import { parseCouponDraft, type CouponDraft } from "@/lib/admin-coupons";
import { requireDesk } from "@/lib/admin-gate";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createCoupon(input: CouponDraft) {
  const gate = await requireDesk();
  if (gate) return gate;
  const parsed = parseCouponDraft(input);
  if (!parsed.ok) return parsed;

  try {
    await prisma.coupon.create({
      data: {
        code: parsed.value.code,
        discountPercentage: parsed.value.discountPercentage,
        fixedAmount: parsed.value.fixedAmount,
        validUntil: parsed.value.validUntil,
        isActive: parsed.value.isActive,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false as const, error: "That code is already in the book." };
    }
    console.error("Coupon was not created", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "The coupon could not be added." };
  }

  revalidatePath("/admin/coupons");
  return { ok: true as const };
}

export async function toggleCoupon(id: string) {
  const gate = await requireDesk();
  if (gate) return gate;
  if (!id || id.length > 64) return { ok: false as const, error: "Unknown coupon." };

  try {
    const coupon = await prisma.coupon.findUnique({ where: { id }, select: { isActive: true } });
    if (!coupon) return { ok: false as const, error: "This coupon is no longer in the book." };
    const isActive = !coupon.isActive;
    await prisma.coupon.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/coupons");
    return { ok: true as const, isActive };
  } catch (error) {
    console.error("Coupon was not updated", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "The coupon could not be changed." };
  }
}
