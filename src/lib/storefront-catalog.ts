import { prisma } from "@/lib/prisma";
import { getProductPage, ingredientIcons, type Ingredient } from "@/lib/product-story";
import { ingredientIn, linesIn, textIn } from "@/lib/piece-locales";
import type { Locale } from "@/lib/locale";
import type { Motif, ProductCategory, ProductMood } from "@/lib/products";

export type StorefrontVariant = {
  id: string;
  name: string;
  colorCode: string | null;
  size: string | null;
  priceAdjustment: number;
  stock: number;
};

export type StorefrontPieceDetail = StorefrontPiece & {
  ingredients: Ingredient[];
  highlights: string[];
  traits: string[];
  variants: StorefrontVariant[];
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

export async function getStorefrontPieces(locale: Locale = "en"): Promise<StorefrontPiece[]> {
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
        descriptionLocales: true,
        titleLocales: true,
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
        name: textIn(row.titleLocales, locale, row.title),
        category,
        moods: moodsFor(category, row.title),
        price: payable,
        compareAt: offer ? row.price : null,
        offer,
        badge: row.category.name,
        description: textIn(row.descriptionLocales, locale, row.description ?? ""),
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

export async function getRelatedPieces(slug: string, category: ProductCategory, locale: Locale = "en") {
  const pieces = await getStorefrontPieces(locale);
  const others = pieces.filter((piece) => piece.id !== slug);
  const same = others.filter((piece) => piece.category === category);
  const rest = others.filter((piece) => piece.category !== category);
  return [...same, ...rest].slice(0, 4);
}

export async function getStorefrontPiece(slug: string, locale: Locale = "en"): Promise<StorefrontPieceDetail | null> {
  try {
    const row = await prisma.product.findFirst({
      where: { slug, available: true },
      select: {
        title: true,
        slug: true,
        price: true,
        discountPrice: true,
        description: true,
        descriptionLocales: true,
        titleLocales: true,
        highlights: true,
        traits: true,
        sellingLocales: true,
        images: true,
        ingredients: true,
        formula: { orderBy: { sortOrder: "asc" }, select: { name: true, benefit: true, icon: true, locales: true } },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, colorCode: true, size: true, priceAdjustment: true, stock: true },
        },
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
      name: textIn(row.titleLocales, locale, row.title),
      category,
      moods: moodsFor(category, row.title),
      price: payable,
      compareAt: payable < row.price ? row.price : null,
      offer: payable < row.price,
      badge: row.category.name,
      description: textIn(row.descriptionLocales, locale, row.description ?? ""),
      highlights: linesIn(row.sellingLocales, "highlights", locale, row.highlights),
      traits: linesIn(row.sellingLocales, "traits", locale, row.traits),
      image,
      images,
      motif: motifFor(category),
      shadeId: row.variants.find((variant) => variant.stock > 0)?.id ?? row.variants[0]?.id ?? "atelier",
      ingredients: formulaOf(row.formula, row.ingredients, locale),
      variants: row.variants,
    };
  } catch (error) {
    console.error("Storefront piece could not be loaded", error instanceof Error ? error.name : "unknown");
    return null;
  }
}

function formulaOf(
  formula: { name: string; benefit: string; icon: string; locales: unknown }[],
  names: string[],
  locale: Locale,
): Ingredient[] {
  const source =
    formula.length > 0
      ? formula
      : names.map((name, index) => ({ name, benefit: "", icon: ingredientIcons[index % ingredientIcons.length], locales: {} }));
  return source.flatMap((item) => {
    const icon = ingredientIcons.find((mark) => mark === item.icon);
    if (!item.name || !icon) return [];
    const translated = ingredientIn(item.locales, locale);
    return [{ name: translated?.name || item.name, benefit: translated?.benefit || item.benefit, icon }];
  });
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
