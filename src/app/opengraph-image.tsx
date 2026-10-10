import { luxCard, ogContentType, ogSize } from "@/lib/og-card";

export const alt = "Lux Makeup — Redefine Elegance";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return luxCard({
    eyebrow: "Maison de beauté",
    title: "Redefine Elegance",
    detail: "with Lux Makeup",
    price: "MAKEUP · PARFUM · SKIN",
    detailGold: true,
  });
}
