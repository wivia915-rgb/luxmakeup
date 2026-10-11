export type MetaEventName = "PageView" | "ViewContent" | "AddToCart" | "Purchase";

type MetaParams = Record<string, unknown>;

type QueuedMetaEvent = {
  event: MetaEventName;
  params?: MetaParams;
};

const STORAGE_KEY = "lux-meta-queue";
const events = new Set<MetaEventName>(["PageView", "ViewContent", "AddToCart", "Purchase"]);

type Fbq = {
  (command: "track", event: string, params?: MetaParams): void;
  (command: "init", pixelId: string): void;
  queue?: unknown[];
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let activePixelId = "";

function envPixelId() {
  const raw = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  return /^\d{5,20}$/.test(raw) ? raw : "";
}

export function activateMetaPixel(id: string) {
  activePixelId = /^\d{5,20}$/.test(id) ? id : "";
}

export function metaPixelId() {
  return activePixelId || envPixelId();
}

export function trackMeta(event: MetaEventName, params?: MetaParams) {
  if (typeof window === "undefined" || !metaPixelId()) return;
  if (typeof window.fbq === "function") {
    window.fbq("track", event, params);
    return;
  }

  try {
    const current = readQueue();
    current.push({ event, params });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(-12)));
  } catch {
    // Private browsing can block storage. The pixel still records once fbq exists.
  }
}

export function flushMetaQueue() {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  const pending = readQueue();
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures and still send the events we already read.
  }
  for (const item of pending) {
    window.fbq("track", item.event, item.params);
  }
}

export function trackCommerce(
  event: Exclude<MetaEventName, "PageView">,
  input: {
    id: string;
    name: string;
    value: number;
    quantity: number;
    unitPrice: number;
    category?: string;
    orderId?: string;
  },
) {
  const params: MetaParams = {
    content_ids: [input.id],
    content_name: input.name,
    content_type: "product",
    value: input.value,
    currency: "MAD",
    num_items: input.quantity,
    contents: [{ id: input.id, quantity: input.quantity, item_price: input.unitPrice }],
  };
  if (input.category) params.content_category = input.category;
  if (input.orderId) params.order_id = input.orderId;
  trackMeta(event, params);
}

function readQueue(): QueuedMetaEvent[] {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isQueuedEvent);
  } catch {
    return [];
  }
}

function isQueuedEvent(value: unknown): value is QueuedMetaEvent {
  if (!value || typeof value !== "object") return false;
  const event = (value as { event?: unknown }).event;
  return typeof event === "string" && events.has(event as MetaEventName);
}
