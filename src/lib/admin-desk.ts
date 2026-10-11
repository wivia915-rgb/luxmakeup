import { orderStatusLabel, type OrderStatusValue } from "@/lib/order-desk";
import { prisma } from "@/lib/prisma";

export type DeskStatusSlice = {
  status: OrderStatusValue;
  label: string;
  count: number;
  share: number;
};

export type DeskRank = {
  label: string;
  count: number;
  amount: number;
};

export type AdminDeskData = {
  connected: boolean;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  shippedOrders: number;
  cancelledOrders: number;
  completedOrders: number;
  productCount: number;
  statuses: DeskStatusSlice[];
  cities: DeskRank[];
  pieces: DeskRank[];
};

const statusOrder: OrderStatusValue[] = ["PENDING", "SHIPPED", "CANCELLED", "CONFIRMED", "DELIVERED"];

const empty: AdminDeskData = {
  connected: false,
  totalOrders: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  shippedOrders: 0,
  cancelledOrders: 0,
  completedOrders: 0,
  productCount: 0,
  statuses: statusOrder.map((status) => ({
    status,
    label: orderStatusLabel[status],
    count: 0,
    share: 0,
  })),
  cities: [],
  pieces: [],
};

export async function getAdminDesk(): Promise<AdminDeskData> {
  try {
    const [totalOrders, revenue, statusGroups, cityGroups, itemRows, productCount] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.order.groupBy({
        by: ["city"],
        where: { status: { not: "CANCELLED" } },
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),
      prisma.orderItem.findMany({
        where: { order: { status: { not: "CANCELLED" } } },
        select: { title: true, quantity: true, unitPrice: true },
      }),
      prisma.product.count(),
    ]);

    const counts = new Map(statusGroups.map((group) => [group.status, group._count._all]));
    const statuses = statusOrder.map((status) => {
      const count = counts.get(status) ?? 0;
      return {
        status,
        label: orderStatusLabel[status],
        count,
        share: totalOrders > 0 ? count / totalOrders : 0,
      };
    });

    const cities = cityGroups
      .map((group) => ({
        label: group.city,
        count: group._count._all,
        amount: group._sum.totalAmount ?? 0,
      }))
      .sort((a, b) => b.amount - a.amount || b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, 6);

    const pieceMap = new Map<string, DeskRank>();
    for (const row of itemRows) {
      const title = row.title.trim() || "Untitled piece";
      const current = pieceMap.get(title) ?? { label: title, count: 0, amount: 0 };
      current.count += row.quantity;
      current.amount += row.quantity * row.unitPrice;
      pieceMap.set(title, current);
    }
    const pieces = [...pieceMap.values()]
      .sort((a, b) => b.count - a.count || b.amount - a.amount || a.label.localeCompare(b.label))
      .slice(0, 6);

    return {
      connected: true,
      totalOrders,
      totalRevenue: revenue._sum.totalAmount ?? 0,
      pendingOrders: counts.get("PENDING") ?? 0,
      shippedOrders: counts.get("SHIPPED") ?? 0,
      cancelledOrders: counts.get("CANCELLED") ?? 0,
      completedOrders: counts.get("DELIVERED") ?? 0,
      productCount,
      statuses,
      cities,
      pieces,
    };
  } catch (error) {
    console.error("Admin desk could not be loaded", error instanceof Error ? error.name : "unknown");
    return empty;
  }
}
