export function variantUnitPrice(basePrice: number, sizePrice?: number | null) {
  if (typeof sizePrice === "number" && sizePrice > 0) return sizePrice;
  return basePrice;
}
