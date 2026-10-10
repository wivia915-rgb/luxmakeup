export const orderStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export type OrderStatusValue = (typeof orderStatuses)[number];

export const orderStatusLabel: Record<OrderStatusValue, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export type DeskOrderItem = {
  title: string;
  shadeName: string;
  quantity: number;
};

export type DeskOrder = {
  id: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  totalAmount: number;
  status: OrderStatusValue;
  createdAt: string;
  items: DeskOrderItem[];
  whatsappUrl: string;
};

export type OrderMetrics = {
  totalSales: number;
  pending: number;
  delivered: number;
};

export function isOrderStatus(value: string): value is OrderStatusValue {
  return orderStatuses.some((status) => status === value);
}

export function customerWhatsAppUrl(phone: string, name: string, orderId: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `212${digits.slice(1)}`;
  const text = `Hello ${name}, this is Lux Makeup regarding order ${orderId.slice(0, 8)}.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
