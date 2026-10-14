"use server";

import { productAcceptsReviews } from "@/lib/product-reviews";
import { prisma } from "@/lib/prisma";
import { classifyReview } from "@/lib/review-sentiment";

export type ReviewDraft = {
  id: string;
  authorName: string;
  stars: number;
  body: string;
  imageUrl: string | null;
  createdAt: string;
};

const maxPhotoBytes = 1_000_000;

export async function submitProductReview(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  const body = String(formData.get("body") ?? "").trim().replace(/\s+/g, " ");
  const stars = Number(formData.get("stars"));
  const image = formData.get("image");

  if (!/^[a-z0-9-]{1,80}$/i.test(slug)) return { ok: false as const, error: "save" as const };
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return { ok: false as const, error: "stars" as const };
  if (name.length < 2 || name.length > 40) return { ok: false as const, error: "name" as const };
  if (body.length < 2 || body.length > 400) return { ok: false as const, error: "body" as const };

  let mediaId = "";
  try {
    if (!(await productAcceptsReviews(slug))) return { ok: false as const, error: "save" as const };
    const imageUrl = image instanceof File && image.size > 0 ? await saveReviewPhoto(image) : null;
    if (imageUrl === false) return { ok: false as const, error: "photo" as const };
    mediaId = imageUrl ? imageUrl.split("/").pop() ?? "" : "";
    const reading = await classifyReview({ stars, body });
    const review = await prisma.productReview.create({
      data: { productSlug: slug, authorName: name, stars, body, imageUrl, sentiment: reading.sentiment, note: reading.note },
      select: { id: true, authorName: true, stars: true, body: true, imageUrl: true, createdAt: true, sentiment: true },
    });
    if (review.sentiment !== "positive") return { ok: true as const, published: false as const };
    return {
      ok: true as const,
      published: true as const,
      review: {
        id: review.id,
        authorName: review.authorName,
        stars: review.stars,
        body: review.body,
        imageUrl: review.imageUrl,
        createdAt: review.createdAt.toISOString(),
      } satisfies ReviewDraft,
    };
  } catch (error) {
    if (mediaId) await prisma.productMedia.delete({ where: { id: mediaId } }).catch(() => undefined);
    console.error("Review could not be saved", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "save" as const };
  }
}

async function saveReviewPhoto(file: File): Promise<string | false | null> {
  if (file.size > maxPhotoBytes) return false;
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = photoMime(bytes);
  if (!mime) return false;
  const saved = await prisma.productMedia.create({
    data: { mime, bytes },
    select: { id: true },
  });
  return `/media/${saved.id}`;
}

function photoMime(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}
