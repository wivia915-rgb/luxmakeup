"use server";

import { deskCategories } from "@/lib/admin-catalog";
import { requireDesk } from "@/lib/admin-gate";
import { getLocale } from "@/lib/get-locale";
import { prisma } from "@/lib/prisma";
import { ingredientIcons, type IngredientIcon } from "@/lib/product-story";

const languages = { ar: "Arabic", fr: "French", en: "English" } as const;

export async function generateProductCopy(input: { title: string; category: string; imageUrl?: string }) {
  const gate = await requireDesk();
  if (gate) return gate;

  const title = input.title.trim().replace(/\s+/g, " ");
  const image = await productPhoto(input.imageUrl ?? "");
  if (image === null) return { ok: false as const, error: "That photo could not be read." };
  if (!image && (title.length < 2 || title.length > 80)) {
    return { ok: false as const, error: "Give the piece a name first." };
  }
  const category = deskCategories.find((item) => item.slug === input.category)?.name ?? "Makeup";
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return { ok: false as const, error: "Add OPENAI_API_KEY before generating copy." };

  try {
    const locale = await getLocale();
    const written = await requestCopy(key, title, category, languages[locale], image);
    return { ok: true as const, ...written };
  } catch (error) {
    const message = error instanceof OpenAICopyError ? error.deskMessage : "OpenAI could not write that copy.";
    console.error("Product copy was not generated", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: message };
  }
}

async function productPhoto(imageUrl: string) {
  const url = imageUrl.trim();
  if (!url) return "";
  const id = url.match(/^\/media\/([a-z0-9]{20,32})$/i)?.[1];
  try {
    if (id) {
      const media = await prisma.productMedia.findUnique({ where: { id }, select: { mime: true, bytes: true } });
      if (!media || media.bytes.byteLength === 0 || media.bytes.byteLength > 1_500_000) return null;
      const mime = media.mime === "image/png" || media.mime === "image/webp" ? media.mime : "image/jpeg";
      return `data:${mime};base64,${Buffer.from(media.bytes).toString("base64")}`;
    }
    if (!/^https:\/\//.test(url)) return null;
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) return null;
    const mime = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
    if (mime !== "image/jpeg" && mime !== "image/png" && mime !== "image/webp") return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > 1_500_000) return null;
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch (error) {
    console.error("Product photo was not read", error instanceof Error ? error.name : "unknown");
    return null;
  }
}

async function requestCopy(key: string, title: string, category: string, language: string, image: string | null) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "piece_copy",
          strict: true,
          schema: copySchema(),
        },
      },
      messages: [
        {
          role: "system",
          content: `You write for Lux Makeup, an ultra-high-end Moroccan beauty house. ${
            image
              ? "A product photo is attached. Read the packaging. Use the printed name when it is readable. Describe only what the photo and that kind of piece support."
              : "No photo is attached. Write from the piece name and category."
          } Write in the requested language. title under 80 characters. description is one persuasive sales paragraph under 700 characters: sensory desire, the ritual of use, the felt result, and a quiet reason to choose this piece. highlights are 4 short features, each a reason to want it, under 110 characters. traits are 4 characteristics such as texture, finish, wear, scent, or shade, under 110 characters. ingredients are 3 to 6 real care ingredients or fragrance notes, each with a benefit under 160 characters. category is makeup, parfums, skin-care, or maison. No prices, no certifications, no fake scarcity, no reviews, no mention of AI. Cosmetic language only: glow, comfort, texture, finish, scent, and shade. Repeat a fact printed on the package, such as SPF. Do not claim healing, clinical results, or protection from disease.`,
        },
        image
          ? {
              role: "user",
              content: [
                { type: "text", text: `Write in ${language}. Current category hint: ${category}.` },
                { type: "image_url", image_url: { url: image, detail: "high" } },
              ],
            }
          : { role: "user", content: `Write in ${language}. Piece: ${title}. Category: ${category}.` },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: { code?: string; type?: string };
    choices?: { message?: { content?: string } }[];
  } | null;

  if (!response.ok) {
    console.error("OpenAI copy failed", response.status, payload?.error?.code ?? payload?.error?.type ?? "unknown");
    throw new OpenAICopyError(deskMessageFor(response.status, payload?.error?.code));
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new OpenAICopyError("OpenAI could not write that copy.");
  return parseCopy(content);
}

function copySchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      category: { type: "string", enum: deskCategories.map((item) => item.slug) },
      highlights: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } },
      traits: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } },
      ingredients: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            benefit: { type: "string" },
            icon: { type: "string", enum: [...ingredientIcons] },
          },
          required: ["name", "benefit", "icon"],
        },
      },
    },
    required: ["title", "description", "category", "highlights", "traits", "ingredients"],
  };
}

function parseCopy(content: string) {
  let parsed: { title?: unknown; description?: unknown; category?: unknown; highlights?: unknown; traits?: unknown; ingredients?: unknown };
  try {
    parsed = JSON.parse(content) as typeof parsed;
  } catch {
    throw new OpenAICopyError("OpenAI could not write that copy.");
  }

  const title = String(parsed.title ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
  const description = String(parsed.description ?? "").trim().replace(/\s+/g, " ").slice(0, 800);
  const category = deskCategories.find((item) => item.slug === parsed.category)?.slug;
  if (title.length < 2 || description.length < 20 || !category) throw new OpenAICopyError("OpenAI could not write that copy.");

  const highlights = linesOf(parsed.highlights);
  const traits = linesOf(parsed.traits);
  if (highlights.length < 3 || traits.length < 3) throw new OpenAICopyError("OpenAI could not write that copy.");

  if (!Array.isArray(parsed.ingredients)) throw new OpenAICopyError("OpenAI could not write that copy.");
  const seen = new Set<string>();
  const ingredients: { name: string; benefit: string; icon: IngredientIcon }[] = [];
  for (const item of parsed.ingredients) {
    if (!item || typeof item !== "object") continue;
    const row = item as { name?: unknown; benefit?: unknown; icon?: unknown };
    const name = String(row.name ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
    const benefit = String(row.benefit ?? "").trim().replace(/\s+/g, " ").slice(0, 180);
    const icon = ingredientIcons.find((mark) => mark === row.icon);
    if (name.length < 2 || benefit.length < 8 || !icon) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    ingredients.push({ name, benefit, icon });
    if (ingredients.length === 6) break;
  }
  if (ingredients.length < 3) throw new OpenAICopyError("OpenAI could not write that copy.");
  return { title, description, category, highlights, traits, ingredients };
}

function linesOf(value: unknown) {
  if (!Array.isArray(value)) return [];
  const lines: string[] = [];
  for (const item of value) {
    const line = String(item ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
    if (line.length < 4) continue;
    lines.push(line);
    if (lines.length === 6) break;
  }
  return lines;
}

function deskMessageFor(status: number, code: string | undefined) {
  if (status === 401) return "OpenAI refused the API key.";
  if (code === "insufficient_quota" || code === "billing_hard_limit_reached") return "OpenAI billing blocked this request.";
  if (status === 429) return "OpenAI is busy. Try again in a moment.";
  return "OpenAI could not write that copy.";
}

class OpenAICopyError extends Error {
  constructor(readonly deskMessage: string) {
    super(deskMessage);
    this.name = "OpenAICopyError";
  }
}
