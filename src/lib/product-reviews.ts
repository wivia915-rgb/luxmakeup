import { prisma } from "@/lib/prisma";
import { getProductPage } from "@/lib/product-story";

export type PublicReview = {
  id: string;
  authorName: string;
  stars: number;
  body: string;
  imageUrl: string | null;
  createdAt: string;
};

export async function listProductReviews(slug: string): Promise<PublicReview[]> {
  try {
    const rows = await prisma.productReview.findMany({
      where: { productSlug: slug, sentiment: "positive" },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, authorName: true, stars: true, body: true, imageUrl: true, createdAt: true },
    });
    return rows.map((row) => ({
      id: row.id,
      authorName: row.authorName,
      stars: row.stars,
      body: row.body,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Reviews could not be loaded", error instanceof Error ? error.name : "unknown");
    return [];
  }
}

export type DeskReview = {
  id: string;
  productTitle: string;
  authorName: string;
  stars: number;
  body: string;
  imageUrl: string | null;
  note: string;
  sentiment: "negative" | "held";
  createdAt: string;
};

export async function listPrivateReviews(): Promise<{ connected: boolean; reviews: DeskReview[] }> {
  try {
    const rows = await prisma.productReview.findMany({
      where: { sentiment: { in: ["negative", "held"] } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, productSlug: true, authorName: true, stars: true, body: true, imageUrl: true, note: true, sentiment: true, createdAt: true },
    });
    const slugs = [...new Set(rows.map((row) => row.productSlug))];
    const products = slugs.length
      ? await prisma.product.findMany({ where: { slug: { in: slugs } }, select: { slug: true, title: true } })
      : [];
    const titles = new Map(products.map((product) => [product.slug, product.title]));
    return {
      connected: true,
      reviews: rows.map((row) => ({
        id: row.id,
        productTitle: titles.get(row.productSlug) ?? row.productSlug,
        authorName: row.authorName,
        stars: row.stars,
        body: row.body,
        imageUrl: row.imageUrl,
        note: row.note,
        sentiment: row.sentiment === "held" ? "held" : "negative",
        createdAt: row.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Private reviews could not be loaded", error instanceof Error ? error.name : "unknown");
    return { connected: false, reviews: [] };
  }
}

export async function productAcceptsReviews(slug: string) {
  if (getProductPage(slug)) return true;
  const piece = await prisma.product.findFirst({
    where: { slug, available: true },
    select: { id: true },
  });
  return piece != null;
}
