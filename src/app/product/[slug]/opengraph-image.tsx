import { luxCard, ogContentType, ogSize } from "@/lib/og-card";
import { getProductPage } from "@/lib/product-story";
import { formatDh } from "@/lib/products";

export const size = ogSize;
export const contentType = ogContentType;

export async function generateImageMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductPage(slug);
  return [
    {
      id: slug,
      alt: product ? `${product.name} · Lux Makeup` : "Lux Makeup",
      size: ogSize,
      contentType: ogContentType,
    },
  ];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductPage(slug);

  if (!product) {
    return luxCard({
      eyebrow: "Lux Makeup",
      title: "The maison",
      detail: "Makeup, perfume, and beauty.",
    });
  }

  return luxCard({
    eyebrow: product.badge,
    title: product.name,
    detail: product.description,
    price: formatDh(product.price),
    badge: product.category,
  });
}
