import { customerWhatsAppUrl, type DeskOrder, type OrderMetrics, type OrderStatusValue } from "@/lib/order-desk";
import { prisma } from "@/lib/prisma";

export type OrderDeskData = {
  connected: boolean;
  metrics: OrderMetrics;
  orders: DeskOrder[];
};

const empty: OrderDeskData = {
  connected: false,
  metrics: { totalSales: 0, pending: 0, delivered: 0 },
  orders: [],
};

export async function getOrderDesk(): Promise<OrderDeskData> {
  try {
    const [sales, pending, delivered, orders] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            select: { title: true, shadeName: true, quantity: true },
          },
        },
      }),
    ]);

    return {
      connected: true,
      metrics: {
        totalSales: sales._sum.totalAmount ?? 0,
        pending,
        delivered,
      },
      orders: orders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        phone: order.phone,
        city: order.city,
        address: order.address,
        totalAmount: order.totalAmount,
        status: order.status as OrderStatusValue,
        createdAt: order.createdAt.toISOString(),
        items: order.items,
        whatsappUrl: customerWhatsAppUrl(order.phone, order.customerName, order.id),
      })),
    };
  } catch (error) {
    console.error("Order desk could not be loaded", error instanceof Error ? error.name : "unknown");
    return empty;
  }
}
