"use server";

import { prisma } from "@/lib/prisma";

const maxBytes = 1_500_000;
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadProductImage(formData: FormData) {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "Choose a JPEG, PNG, or WebP image." };
  }
  if (!allowed.has(file.type)) {
    return { ok: false as const, error: "Choose a JPEG, PNG, or WebP image." };
  }
  if (file.size > maxBytes) {
    return { ok: false as const, error: "Each image must be under 2 MB." };
  }

  try {
    const saved = await prisma.productMedia.create({
      data: {
        mime: file.type,
        bytes: Buffer.from(await file.arrayBuffer()),
      },
      select: { id: true },
    });
    return { ok: true as const, url: `/media/${saved.id}` };
  } catch (error) {
    console.error("Product image was not saved", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "That image could not be saved." };
  }
}
