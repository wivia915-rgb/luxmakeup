import { OrdersBoard } from "@/components/admin/orders-board";
import { getOrderDesk } from "@/lib/admin-orders";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
  description: "Lux Makeup atelier desk for cash-on-delivery orders.",
};

export default async function AdminOrdersPage() {
  const desk = await getOrderDesk();

  return (
    <main id="main">
      <OrdersBoard connected={desk.connected} metrics={desk.metrics} orders={desk.orders} />
    </main>
  );
}
