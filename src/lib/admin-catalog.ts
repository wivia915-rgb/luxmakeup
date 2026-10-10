import { prisma } from "@/lib/prisma";

export const deskCategories = [
  { slug: "makeup", name: "Makeup" },
  { slug: "parfums", name: "Parfums" },
  { slug: "skin-care", name: "Skin Care" },
  { slug: "maison", name: "Maison" },
] as const;

export type DeskCategorySlug = (typeof deskCategories)[number]["slug"];

export type DeskProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  available: boolean;
  imageUrl: string;
  categoryName: string;
  categorySlug: DeskCategorySlug;
};

export type ProductDraft = {
  title: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  stock: string;
};

export type ProductWrite = {
  title: string;
  description: string;
  price: number;
  category: DeskCategorySlug;
  imageUrl: string;
  stock: number;
};

const emptyDesk = { connected: false as const, products: [] as DeskProduct[] };

export function deskCategoryLabel(slug: string, fallback: string) {
  if (slug === "fragrance") return "Parfums";
  if (slug === "skincare") return "Skin Care";
  return deskCategories.find((item) => item.slug === slug)?.name ?? fallback;
}

export function deskCategoryValue(slug: string): DeskCategorySlug {
  if (slug === "fragrance" || slug === "parfums") return "parfums";
  if (slug === "skincare" || slug === "skin-care") return "skin-care";
  if (slug === "maison") return "maison";
  return "makeup";
}

export function parseProductDraft(input: ProductDraft): { ok: true; value: ProductWrite } | { ok: false; error: string } {
  const title = input.title.trim().replace(/\s+/g, " ");
  if (title.length < 2 || title.length > 80) {
    return { ok: false, error: "Give the piece a name of 2 to 80 characters." };
  }

  const description = input.description.trim();
  if (description.length > 800) {
    return { ok: false, error: "Keep the description under 800 characters." };
  }

  if (!/^\d+$/.test(input.price.trim())) {
    return { ok: false, error: "Price is a whole amount in DH." };
  }
  const price = Number(input.price.trim());
  if (price < 1 || price > 100000) {
    return { ok: false, error: "Price must be between 1 and 100 000 DH." };
  }

  const category = deskCategories.find((item) => item.slug === input.category);
  if (!category) {
    return { ok: false, error: "Choose Makeup, Parfums, Skin Care, or Maison." };
  }

  const imageUrl = input.imageUrl.trim();
  if (imageUrl && !isHttpUrl(imageUrl)) {
    return { ok: false, error: "Image URL must start with http:// or https://." };
  }
  if (imageUrl.length > 500) {
    return { ok: false, error: "Image URL is too long." };
  }

  if (!/^\d+$/.test(input.stock.trim())) {
    return { ok: false, error: "Stock is a whole number." };
  }
  const stock = Number(input.stock.trim());
  if (stock > 9999) {
    return { ok: false, error: "Stock cannot pass 9999." };
  }

  return {
    ok: true,
    value: { title, description, price, category: category.slug, imageUrl, stock },
  };
}

export async function getProductDesk(): Promise<{ connected: boolean; products: DeskProduct[] }> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        stock: true,
        available: true,
        images: true,
        category: { select: { name: true, slug: true } },
      },
    });

    return {
      connected: true,
      products: products.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description ?? "",
        price: product.price,
        stock: product.stock,
        available: product.available,
        imageUrl: product.images[0] ?? "",
        categoryName: deskCategoryLabel(product.category.slug, product.category.name),
        categorySlug: deskCategoryValue(product.category.slug),
      })),
    };
  } catch (error) {
    console.error("Product desk could not be loaded", error instanceof Error ? error.name : "unknown");
    return emptyDesk;
  }
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
