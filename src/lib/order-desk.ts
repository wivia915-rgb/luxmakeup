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

export function moroccanWhatsAppDigits(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("212")) return digits;
  if (digits.startsWith("0")) digits = digits.slice(1);
  return `212${digits}`;
}

export function customerWhatsAppUrl(phone: string, name: string, orderId: string, productName: string) {
  const product = productName.trim() || "الطلب";
  const text = `سلام ${name}، معاك متجر LuxMakeup. كنشكروك على الطلب ديالك رقم #${orderId} (${product}). بغينا ناكدو معاك العنوان ومدينتك لتسليم الطلب.`;
  return `https://wa.me/${moroccanWhatsAppDigits(phone)}?text=${encodeURIComponent(text)}`;
}
