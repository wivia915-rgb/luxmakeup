import { orderStatusLabel, type DeskOrder, type OrderStatusValue } from "@/lib/order-desk";

const columns = ["Name", "Phone", "City", "Address", "Total Price", "Status", "Date"] as const;

type CsvLabels = {
  columns: string[];
  status: Record<OrderStatusValue, string>;
};

export function ordersToCsv(orders: DeskOrder[], statusOf: (order: DeskOrder) => OrderStatusValue, labels?: CsvLabels) {
  const header = labels?.columns ?? [...columns];
  const lines = [
    header.join(","),
    ...orders.map((order) =>
      [
        order.customerName,
        order.phone,
        order.city,
        order.address,
        String(order.totalAmount),
        (labels?.status ?? orderStatusLabel)[statusOf(order)],
        courierDate(order.createdAt),
      ]
        .map(csvCell)
        .join(","),
    ),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}

export function downloadOrdersCsv(orders: DeskOrder[], statusOf: (order: DeskOrder) => OrderStatusValue, labels?: CsvLabels) {
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([ordersToCsv(orders, statusOf, labels)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lux-orders-${stamp}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

function courierDate(iso: string) {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
}
