"use server";

import { isOrderStatus, type OrderStatusValue } from "@/lib/order-desk";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatusValue,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isOrderStatus(status)) {
    return { ok: false, error: "Unknown status." };
  }
  if (!orderId || orderId.length > 64) {
    return { ok: false, error: "Unknown order." };
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  } catch (error) {
    console.error("Order status was not updated", error instanceof Error ? error.name : "unknown");
    return { ok: false, error: "The status could not be updated." };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}
