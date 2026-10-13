import { prisma } from "@/lib/prisma";
import { ingredientIcons, type IngredientIcon } from "@/lib/product-story";

export const deskCategories = [
  { slug: "makeup", name: "Makeup" },
  { slug: "parfums", name: "Parfums" },
  { slug: "skin-care", name: "Skin Care" },
  { slug: "maison", name: "Maison" },
] as const;

export type DeskCategorySlug = (typeof deskCategories)[number]["slug"];

export type DeskVariant = {
  id: string;
  name: string;
  colorCode: string;
  size: string;
  stock: number;
  priceAdjustment: number;
  isActive: boolean;
};

export type DeskProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  available: boolean;
  imageUrl: string;
  imageUrls: string[];
  categoryName: string;
  categorySlug: DeskCategorySlug;
  variants: DeskVariant[];
  ingredients: DeskIngredient[];
};

export type VariantDraft = {
  clientId: string;
  name: string;
  colorCode: string;
  size: string;
  stock: string;
  priceAdjustment: string;
  isActive: boolean;
};

export type IngredientDraft = {
  clientId: string;
  name: string;
  benefit: string;
  icon: IngredientIcon;
};

export type DeskIngredient = {
  name: string;
  benefit: string;
  icon: IngredientIcon;
};

export type ProductDraft = {
  title: string;
  description: string;
  price: string;
  category: string;
  imageUrls: string[];
  stock: string;
  variants: VariantDraft[];
  ingredients: IngredientDraft[];
};

export type VariantWrite = {
  name: string;
  colorCode: string | null;
  size: string | null;
  stock: number;
  priceAdjustment: number;
  isActive: boolean;
};

export type IngredientWrite = {
  name: string;
  benefit: string;
  icon: IngredientIcon;
};

export type ProductWrite = {
  title: string;
  description: string;
  price: number;
  category: DeskCategorySlug;
  imageUrls: string[];
  stock: number;
  variants: VariantWrite[];
  ingredients: IngredientWrite[];
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

  const images = parseImages(input.imageUrls);
  if (!images.ok) return images;

  if (!/^\d+$/.test(input.stock.trim())) {
    return { ok: false, error: "Stock is a whole number." };
  }
  const stock = Number(input.stock.trim());
  if (stock > 9999) {
    return { ok: false, error: "Stock cannot pass 9999." };
  }

  const variants = parseVariants(input.variants, price);
  if (!variants.ok) return variants;
  const ingredients = parseIngredients(input.ingredients);
  if (!ingredients.ok) return ingredients;

  const countedStock = variants.value.length > 0 ? variants.value.reduce((sum, variant) => sum + (variant.isActive ? variant.stock : 0), 0) : stock;

  return {
    ok: true,
    value: {
      title,
      description,
      price,
      category: category.slug,
      imageUrls: images.value,
      stock: countedStock,
      variants: variants.value,
      ingredients: ingredients.value,
    },
  };
}

function parseIngredients(input: IngredientDraft[] | undefined): { ok: true; value: IngredientWrite[] } | { ok: false; error: string } {
  if (input === undefined) return { ok: true, value: [] };
  if (!Array.isArray(input)) return { ok: false, error: "Ingredients could not be read." };
  if (input.length > 8) return { ok: false, error: "A piece can hold up to 8 ingredients." };

  const seen = new Set<string>();
  const value: IngredientWrite[] = [];
  for (const item of input) {
    const name = String(item?.name ?? "").trim().replace(/\s+/g, " ");
    const benefit = String(item?.benefit ?? "").trim().replace(/\s+/g, " ");
    if (!name && !benefit) continue;
    if (name.length < 1 || name.length > 40) {
      return { ok: false, error: "An ingredient needs a name of 1 to 40 characters." };
    }
    if (benefit.length > 180) {
      return { ok: false, error: "An ingredient benefit must stay under 180 characters." };
    }
    const icon = ingredientIcons.find((mark) => mark === item?.icon);
    if (!icon) {
      return { ok: false, error: "An ingredient needs a mark." };
    }
    const key = name.toLowerCase();
    if (seen.has(key)) return { ok: false, error: "Each ingredient can only appear once." };
    seen.add(key);
    value.push({ name, benefit, icon });
  }
  return { ok: true, value };
}

function parseVariants(input: VariantDraft[] | undefined, price: number): { ok: true; value: VariantWrite[] } | { ok: false; error: string } {
  if (input === undefined) return { ok: true, value: [] };
  if (!Array.isArray(input)) return { ok: false, error: "Variants could not be read." };
  if (input.length > 12) return { ok: false, error: "A piece can hold up to 12 variants." };

  const seen = new Set<string>();
  const value: VariantWrite[] = [];

  for (const [index, variant] of input.entries()) {
    const label = `Variant ${index + 1}`;
    const name = String(variant?.name ?? "").trim().replace(/\s+/g, " ");
    const size = String(variant?.size ?? "").trim().replace(/\s+/g, " ");
    if (name.length < 1 || name.length > 40) {
      return { ok: false, error: `${label} needs a shade or size, such as Ruby Gold or 50ml.` };
    }
    if (size.length > 24) {
      return { ok: false, error: `${label} volume is too long.` };
    }

    const color = normalizeColor(String(variant?.colorCode ?? ""));
    if (color === "invalid") {
      return { ok: false, error: `${label} color needs a hex code, such as #8C1C13.` };
    }

    const stockText = String(variant?.stock ?? "").trim();
    if (!/^\d+$/.test(stockText)) {
      return { ok: false, error: `${label} stock is a whole number.` };
    }
    const variantStock = Number(stockText);
    if (variantStock > 9999) {
      return { ok: false, error: `${label} stock cannot pass 9999.` };
    }

    const adjustmentText = String(variant?.priceAdjustment ?? "0").trim();
    if (!/^-?\d+$/.test(adjustmentText)) {
      return { ok: false, error: `${label} price adjustment is a whole amount in DH.` };
    }
    const priceAdjustment = Number(adjustmentText);
    const adjusted = price + priceAdjustment;
    if (adjusted < 1 || adjusted > 100000) {
      return { ok: false, error: `${label} must keep the price between 1 and 100 000 DH.` };
    }

    const key = `${name.toLowerCase()}|${size.toLowerCase()}`;
    if (seen.has(key)) {
      return { ok: false, error: "Each shade and size can only appear once." };
    }
    seen.add(key);

    value.push({
      name,
      colorCode: color,
      size: size || null,
      stock: variantStock,
      priceAdjustment,
      isActive: variant?.isActive !== false,
    });
  }

  return { ok: true, value };
}

function normalizeColor(value: string): string | null | "invalid" {
  const raw = value.trim();
  if (!raw) return null;
  const withHash = raw.startsWith("#") ? raw : `#${raw}`;
  if (/^#[0-9a-fA-F]{3}$/.test(withHash)) {
    const [red, green, blue] = withHash.slice(1);
    return `#${red}${red}${green}${green}${blue}${blue}`.toUpperCase();
  }
  if (/^#[0-9a-fA-F]{6}$/.test(withHash)) return withHash.toUpperCase();
  return "invalid";
}

export async function getProductDesk(): Promise<{ connected: boolean; products: DeskProduct[] }> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        price: true,
        stock: true,
        available: true,
        images: true,
        category: { select: { name: true, slug: true } },
        variants: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            colorCode: true,
            size: true,
            stock: true,
            priceAdjustment: true,
            isActive: true,
          },
        },
      },
    });

    return {
      connected: true,
      products: products.map((product) => ({
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description ?? "",
        price: product.price,
        stock: product.stock,
        available: product.available,
        imageUrl: product.images[0] ?? "",
        imageUrls: product.images,
        categoryName: deskCategoryLabel(product.category.slug, product.category.name),
        categorySlug: deskCategoryValue(product.category.slug),
        variants: product.variants.map((variant) => ({
          id: variant.id,
          name: variant.name,
          colorCode: variant.colorCode ?? "",
          size: variant.size ?? "",
          stock: variant.stock,
          priceAdjustment: variant.priceAdjustment,
          isActive: variant.isActive,
        })),
        ingredients: [],
      })),
    };
  } catch (error) {
    console.error("Product desk could not be loaded", error instanceof Error ? error.name : "unknown");
    return emptyDesk;
  }
}

export async function getDeskProduct(id: string): Promise<DeskProduct | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        price: true,
        stock: true,
        available: true,
        images: true,
        category: { select: { name: true, slug: true } },
        variants: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            colorCode: true,
            size: true,
            stock: true,
            priceAdjustment: true,
            isActive: true,
          },
        },
        formula: {
          orderBy: { sortOrder: "asc" },
          select: { name: true, benefit: true, icon: true },
        },
      },
    });
    if (!product) return null;
    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description ?? "",
      price: product.price,
      stock: product.stock,
      available: product.available,
      imageUrl: product.images[0] ?? "",
      imageUrls: product.images,
      categoryName: deskCategoryLabel(product.category.slug, product.category.name),
      categorySlug: deskCategoryValue(product.category.slug),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        colorCode: variant.colorCode ?? "",
        size: variant.size ?? "",
        stock: variant.stock,
        priceAdjustment: variant.priceAdjustment,
        isActive: variant.isActive,
      })),
      ingredients: product.formula.flatMap((item) => {
        const icon = ingredientIcons.find((mark) => mark === item.icon);
        if (!icon) return [];
        return [{ name: item.name, benefit: item.benefit, icon }];
      }),
    };
  } catch (error) {
    console.error("Product editor could not be loaded", error instanceof Error ? error.name : "unknown");
    return null;
  }
}

const maxImages = 8;

function parseImages(input: string[] | undefined): { ok: true; value: string[] } | { ok: false; error: string } {
  if (input === undefined) return { ok: true, value: [] };
  if (!Array.isArray(input)) return { ok: false, error: "Images could not be read." };

  const value: string[] = [];
  for (const item of input) {
    const url = String(item ?? "").trim();
    if (!url) continue;
    if (!isStoredImage(url)) {
      return { ok: false, error: "Image URL must start with http:// or https://." };
    }
    if (url.length > 500) {
      return { ok: false, error: "Image URL is too long." };
    }
    if (!value.includes(url)) value.push(url);
  }

  if (value.length > maxImages) {
    return { ok: false, error: "A piece can hold up to 8 images." };
  }
  return { ok: true, value };
}

function isStoredImage(value: string) {
  return isHttpUrl(value) || /^\/media\/[a-z0-9]{20,32}$/i.test(value);
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
