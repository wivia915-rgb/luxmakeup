"use server";

import { deskCategories, parseProductDraft, type ProductDraft, type VariantWrite } from "@/lib/admin-catalog";
import { requireDesk } from "@/lib/admin-gate";
import { pieceHash, translatePiece } from "@/lib/piece-locales";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createProduct(input: ProductDraft) {
  const gate = await requireDesk();
  if (gate) return gate;
  const parsed = parseProductDraft(input);
  if (!parsed.ok) return parsed;

  try {
    const categoryId = await categoryIdFor(parsed.value.category);
    const slug = await uniqueSlug(parsed.value.title);
    const copy = await localizedCopy(parsed.value.title, parsed.value.description, parsed.value.ingredients, parsed.value.highlights, parsed.value.traits);
    const created = await prisma.product.create({
      data: {
        title: parsed.value.title,
        slug,
        description: parsed.value.description || null,
        descriptionLocales: copy.descriptionLocales,
        titleLocales: copy.titleLocales,
        sellingLocales: copy.sellingLocales,
        copyHash: copy.hash,
        highlights: parsed.value.highlights,
        traits: parsed.value.traits,
        price: parsed.value.price,
        stock: parsed.value.stock,
        available: parsed.value.stock > 0,
        images: parsed.value.imageUrls,
        ingredients: parsed.value.ingredients.map((item) => item.name),
        categoryId,
        variants: { create: variantRows(parsed.value.variants) },
        formula: { create: ingredientRows(parsed.value.ingredients, copy.ingredientLocales) },
      },
      select: { slug: true },
    });
    refreshDesk(created.slug);
    return { ok: true as const };
  } catch (error) {
    console.error("Product was not created", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "The piece could not be added." };
  }
}

export async function updateProduct(id: string, input: ProductDraft) {
  const gate = await requireDesk();
  if (gate) return gate;
  if (!isId(id)) return { ok: false as const, error: "Unknown piece." };
  const parsed = parseProductDraft(input);
  if (!parsed.ok) return parsed;

  try {
    const current = await prisma.product.findUnique({
      where: { id },
      select: {
        available: true,
        stock: true,
        slug: true,
        copyHash: true,
        descriptionLocales: true,
        titleLocales: true,
        sellingLocales: true,
        formula: { orderBy: { sortOrder: "asc" }, select: { locales: true } },
      },
    });
    if (!current) return { ok: false as const, error: "This piece is no longer in the catalog." };

    const available = parsed.value.stock === 0 ? false : current.stock === 0 ? true : current.available;
    const categoryId = await categoryIdFor(parsed.value.category);
    const copy = await localizedCopy(
      parsed.value.title,
      parsed.value.description,
      parsed.value.ingredients,
      parsed.value.highlights,
      parsed.value.traits,
      current,
    );
    await prisma.product.update({
      where: { id },
      data: {
        title: parsed.value.title,
        description: parsed.value.description || null,
        descriptionLocales: copy.descriptionLocales,
        titleLocales: copy.titleLocales,
        sellingLocales: copy.sellingLocales,
        copyHash: copy.hash,
        highlights: parsed.value.highlights,
        traits: parsed.value.traits,
        price: parsed.value.price,
        stock: parsed.value.stock,
        available,
        images: parsed.value.imageUrls,
        ingredients: parsed.value.ingredients.map((item) => item.name),
        categoryId,
        variants: {
          deleteMany: {},
          create: variantRows(parsed.value.variants),
        },
        formula: {
          deleteMany: {},
          create: ingredientRows(parsed.value.ingredients, copy.ingredientLocales),
        },
      },
    });
    refreshDesk(current.slug);
    return { ok: true as const };
  } catch (error) {
    console.error("Product was not updated", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "The piece could not be updated." };
  }
}

export async function toggleProductAvailability(id: string) {
  const gate = await requireDesk();
  if (gate) return gate;
  if (!isId(id)) return { ok: false as const, error: "Unknown piece." };

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { available: true, stock: true, _count: { select: { variants: true } } },
    });
    if (!product) return { ok: false as const, error: "This piece is no longer in the catalog." };

    const available = !product.available;
    const stock = available && product.stock === 0 && product._count.variants === 0 ? 1 : product.stock;
    await prisma.product.update({
      where: { id },
      data: { available, stock },
    });
    refreshDesk();
    return { ok: true as const, available, stock };
  } catch (error) {
    console.error("Product availability was not updated", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "Availability could not be changed." };
  }
}

export async function deleteProduct(id: string) {
  const gate = await requireDesk();
  if (gate) return gate;
  if (!isId(id)) return { ok: false as const, error: "Unknown piece." };

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { ok: false as const, error: "This piece is on an order and stays in the catalog." };
    }
    console.error("Product was not deleted", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "The piece could not be removed." };
  }

  refreshDesk();
  return { ok: true as const };
}

async function categoryIdFor(slug: (typeof deskCategories)[number]["slug"]) {
  const category = deskCategories.find((item) => item.slug === slug)!;
  const saved = await prisma.category.upsert({
    where: { slug: category.slug },
    update: { name: category.name },
    create: { name: category.name, slug: category.slug },
  });
  return saved.id;
}

async function uniqueSlug(title: string) {
  const base =
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "piece";

  let slug = base;
  let suffix = 2;
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

function ingredientRows(
  ingredients: { name: string; benefit: string; icon: string }[],
  locales: Prisma.InputJsonValue[],
) {
  return ingredients.map((item, index) => ({
    name: item.name,
    benefit: item.benefit,
    icon: item.icon,
    sortOrder: index,
    locales: locales[index] ?? {},
  }));
}

async function localizedCopy(
  title: string,
  description: string,
  ingredients: { name: string; benefit: string }[],
  highlights: string[],
  traits: string[],
  existing?: {
    copyHash: string;
    descriptionLocales: Prisma.JsonValue;
    titleLocales: Prisma.JsonValue;
    sellingLocales: Prisma.JsonValue;
    formula: { locales: Prisma.JsonValue }[];
  },
) {
  const hash = pieceHash(title, description, ingredients, highlights, traits);
  if (
    existing &&
    existing.copyHash === hash &&
    existing.formula.length === ingredients.length &&
    existing.copyHash !== ""
  ) {
    return {
      hash,
      descriptionLocales: existing.descriptionLocales as Prisma.InputJsonValue,
      titleLocales: existing.titleLocales as Prisma.InputJsonValue,
      sellingLocales: existing.sellingLocales as Prisma.InputJsonValue,
      ingredientLocales: existing.formula.map((row) => row.locales as Prisma.InputJsonValue),
    };
  }
  try {
    const translated = await translatePiece({ title, description, ingredients, highlights, traits });
    if (translated) {
      return {
        hash,
        descriptionLocales: translated.description,
        titleLocales: translated.title,
        sellingLocales: { highlights: translated.highlights, traits: translated.traits },
        ingredientLocales: translated.ingredients,
      };
    }
  } catch (error) {
    console.error("Piece copy was not translated", error instanceof Error ? error.name : "unknown");
  }
  return { hash: "", descriptionLocales: {}, titleLocales: {}, sellingLocales: {}, ingredientLocales: ingredients.map(() => ({})) };
}

function variantRows(variants: VariantWrite[]) {
  return variants.map((variant, index) => ({
    name: variant.name,
    colorCode: variant.colorCode,
    size: variant.size,
    stock: variant.stock,
    priceAdjustment: variant.priceAdjustment,
    isActive: variant.isActive,
    sortOrder: index,
  }));
}

function isId(id: string) {
  return typeof id === "string" && id.length > 0 && id.length <= 64;
}

function refreshDesk(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/");
  if (slug) revalidatePath(`/product/${slug}`);
}
