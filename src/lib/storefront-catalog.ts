import { prisma } from "@/lib/prisma";
import { getProductPage } from "@/lib/product-story";
import type { Motif, ProductCategory, ProductMood } from "@/lib/products";

export type StorefrontPieceDetail = StorefrontPiece & {
  ingredients: string[];
};

export type StorefrontPiece = {
  id: string;
  name: string;
  category: ProductCategory;
  moods: ProductMood[];
  price: number;
  compareAt: number | null;
  offer: boolean;
  badge: string;
  description: string;
  image: string;
  images: string[];
  motif: Motif;
  shadeId: string;
};

export async function getStorefrontPieces(): Promise<StorefrontPiece[]> {
  try {
    const rows = await prisma.product.findMany({
      where: {
        available: true,
        OR: [{ featured: true }, { NOT: { images: { isEmpty: true } } }],
      },
      orderBy: [{ featured: "desc" }, { title: "asc" }],
      select: {
        title: true,
        slug: true,
        price: true,
        discountPrice: true,
        description: true,
        images: true,
        featured: true,
        category: { select: { name: true, slug: true } },
      },
    });

    return rows.map((row) => {
      const category = storefrontCategory(row.category.slug, row.category.name);
      const images = visibleImages(row.images);
      const image = images[0] ?? "";
      const payable = row.discountPrice != null && row.discountPrice > 0 && row.discountPrice < row.price ? row.discountPrice : row.price;
      const offer = payable < row.price;
      return {
        id: row.slug,
        name: row.title,
        category,
        moods: moodsFor(category, row.title),
        price: payable,
        compareAt: offer ? row.price : null,
        offer,
        badge: row.category.name,
        description: row.description ?? "",
        image,
        images,
        motif: motifFor(category),
        shadeId: getProductPage(row.slug)?.shades[0]?.id ?? "atelier",
      };
    });
  } catch (error) {
    console.error("Storefront catalog could not be loaded", error instanceof Error ? error.name : "unknown");
    return [];
  }
}

export async function getStorefrontPiece(slug: string): Promise<StorefrontPieceDetail | null> {
  try {
    const row = await prisma.product.findFirst({
      where: { slug, available: true },
      select: {
        title: true,
        slug: true,
        price: true,
        discountPrice: true,
        description: true,
        images: true,
        ingredients: true,
        category: { select: { name: true, slug: true } },
      },
    });
    if (!row) return null;
    const category = storefrontCategory(row.category.slug, row.category.name);
    const images = visibleImages(row.images);
    const image = images[0] ?? "";
    const payable = row.discountPrice != null && row.discountPrice > 0 && row.discountPrice < row.price ? row.discountPrice : row.price;
    return {
      id: row.slug,
      name: row.title,
      category,
      moods: moodsFor(category, row.title),
      price: payable,
      compareAt: payable < row.price ? row.price : null,
      offer: payable < row.price,
      badge: row.category.name,
      description: row.description ?? "",
      image,
      images,
      motif: motifFor(category),
      shadeId: "atelier",
      ingredients: row.ingredients,
    };
  } catch (error) {
    console.error("Storefront piece could not be loaded", error instanceof Error ? error.name : "unknown");
    return null;
  }
}

function visibleImages(images: string[]) {
  return images.filter((item) => /^https?:\/\//.test(item) || item.startsWith("/media/"));
}

function storefrontCategory(slug: string, name: string): ProductCategory {
  const key = `${slug} ${name}`.toLowerCase();
  if (key.includes("parfum") || key.includes("fragrance")) return "Parfums";
  if (key.includes("soin") || key.includes("skin")) return "Skin Care";
  return "Makeup";
}

function motifFor(category: ProductCategory): Motif {
  if (category === "Parfums") return "flacon";
  if (category === "Skin Care") return "jar";
  return "tube";
}

function moodsFor(category: ProductCategory, title: string): ProductMood[] {
  if (category === "Parfums") return ["Glam Evening"];
  if (category === "Skin Care") return ["Hydration Boost"];
  if (/lipstick|rouge|or\b/i.test(title)) return ["Glam Evening"];
  return ["Natural Glow"];
}
