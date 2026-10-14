import { luxCard, ogContentType, ogSize } from "@/lib/og-card";

export const alt = "El Idrissi — Parfumeur";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return luxCard({
    eyebrow: "Maison de beauté",
    title: "Redefine Elegance",
    detail: "El Idrissi",
    price: "MAKEUP · PARFUM · SKIN",
    detailGold: true,
  });
}
