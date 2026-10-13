export type BagLine = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  shadeId: string;
};

const storageKey = "lux-bag";
const bagEvent = "lux-bag-change";
let memory: BagLine[] = [];

function parseBag(raw: string | null): BagLine[] {
  const parsed = JSON.parse(raw ?? "[]") as BagLine[];
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((line) => line && typeof line.id === "string" && line.name && Number.isInteger(line.price) && Number.isInteger(line.quantity));
}

export function readBag(): BagLine[] {
  if (typeof window === "undefined") return [];
  try {
    memory = parseBag(window.localStorage.getItem(storageKey));
    return memory;
  } catch {
    return memory;
  }
}

export function writeBag(lines: BagLine[]) {
  memory = lines;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(lines));
  } catch {
    /* Private browsing can block storage; the bag still lives for this visit. */
  }
  window.dispatchEvent(new Event(bagEvent));
}

export function addToBag(line: Omit<BagLine, "quantity"> & { quantity?: number }) {
  const quantity = Math.min(8, Math.max(1, line.quantity ?? 1));
  const lines = readBag();
  const existing = lines.find((item) => item.id === line.id);
  if (existing) existing.quantity = Math.min(8, existing.quantity + quantity);
  else lines.push({ id: line.id, name: line.name, price: line.price, quantity, image: line.image, shadeId: line.shadeId });
  writeBag(lines);
}

export function onBagChange(listener: () => void) {
  window.addEventListener(bagEvent, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(bagEvent, listener);
    window.removeEventListener("storage", listener);
  };
}
