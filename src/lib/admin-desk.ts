import { prisma } from "@/lib/prisma";

export type AdminDeskData = {
  connected: boolean;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  productCount: number;
};

const empty: AdminDeskData = {
  connected: false,
  totalOrders: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  completedOrders: 0,
  productCount: 0,
};

export async function getAdminDesk(): Promise<AdminDeskData> {
  try {
    const [totalOrders, revenue, pendingOrders, completedOrders, productCount] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.product.count(),
    ]);

    return {
      connected: true,
      totalOrders,
      totalRevenue: revenue._sum.totalAmount ?? 0,
      pendingOrders,
      completedOrders,
      productCount,
    };
  } catch (error) {
    console.error("Admin desk could not be loaded", error instanceof Error ? error.name : "unknown");
    return empty;
  }
}
