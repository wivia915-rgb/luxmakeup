"use server";

import { deskCategories, parseProductDraft, type ProductDraft } from "@/lib/admin-catalog";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createProduct(input: ProductDraft) {
  const parsed = parseProductDraft(input);
  if (!parsed.ok) return parsed;

  try {
    const categoryId = await categoryIdFor(parsed.value.category);
    const slug = await uniqueSlug(parsed.value.title);
    await prisma.product.create({
      data: {
        title: parsed.value.title,
        slug,
        description: parsed.value.description || null,
        price: parsed.value.price,
        stock: parsed.value.stock,
        available: parsed.value.stock > 0,
        images: parsed.value.imageUrl ? [parsed.value.imageUrl] : [],
        categoryId,
      },
    });
  } catch (error) {
    console.error("Product was not created", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "The piece could not be added." };
  }

  refreshDesk();
  return { ok: true as const };
}

export async function updateProduct(id: string, input: ProductDraft) {
  if (!isId(id)) return { ok: false as const, error: "Unknown piece." };
  const parsed = parseProductDraft(input);
  if (!parsed.ok) return parsed;

  try {
    const current = await prisma.product.findUnique({
      where: { id },
      select: { available: true, stock: true },
    });
    if (!current) return { ok: false as const, error: "This piece is no longer in the catalog." };

    const available = parsed.value.stock === 0 ? false : current.stock === 0 ? true : current.available;
    const categoryId = await categoryIdFor(parsed.value.category);
    await prisma.product.update({
      where: { id },
      data: {
        title: parsed.value.title,
        description: parsed.value.description || null,
        price: parsed.value.price,
        stock: parsed.value.stock,
        available,
        images: parsed.value.imageUrl ? [parsed.value.imageUrl] : [],
        categoryId,
      },
    });
  } catch (error) {
    console.error("Product was not updated", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "The piece could not be updated." };
  }

  refreshDesk();
  return { ok: true as const };
}

export async function toggleProductAvailability(id: string) {
  if (!isId(id)) return { ok: false as const, error: "Unknown piece." };

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { available: true, stock: true },
    });
    if (!product) return { ok: false as const, error: "This piece is no longer in the catalog." };

    const available = !product.available;
    await prisma.product.update({
      where: { id },
      data: {
        available,
        stock: available && product.stock === 0 ? 1 : product.stock,
      },
    });
  } catch (error) {
    console.error("Product availability was not updated", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "Availability could not be changed." };
  }

  refreshDesk();
  return { ok: true as const };
}

export async function deleteProduct(id: string) {
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

function isId(id: string) {
  return typeof id === "string" && id.length > 0 && id.length <= 64;
}

function refreshDesk() {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}
