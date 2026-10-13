"use server";

import { deskCategories } from "@/lib/admin-catalog";
import { requireDesk } from "@/lib/admin-gate";
import { getLocale } from "@/lib/get-locale";
import { ingredientIcons, type IngredientIcon } from "@/lib/product-story";

const languages = { ar: "Arabic", fr: "French", en: "English" } as const;

export async function generateProductCopy(input: { title: string; category: string }) {
  const gate = await requireDesk();
  if (gate) return gate;

  const title = input.title.trim().replace(/\s+/g, " ");
  if (title.length < 2 || title.length > 80) {
    return { ok: false as const, error: "Give the piece a name first." };
  }
  const category = deskCategories.find((item) => item.slug === input.category)?.name ?? "Makeup";
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return { ok: false as const, error: "Add OPENAI_API_KEY before generating copy." };

  try {
    const locale = await getLocale();
    const written = await requestCopy(key, title, category, languages[locale]);
    return { ok: true as const, ...written };
  } catch (error) {
    const message = error instanceof OpenAICopyError ? error.deskMessage : "OpenAI could not write that copy.";
    console.error("Product copy was not generated", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: message };
  }
}

async function requestCopy(key: string, title: string, category: string, language: string) {
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
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              description: { type: "string" },
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
            required: ["description", "ingredients"],
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You write for Lux Makeup, an ultra-high-end Moroccan beauty house. Tone: quiet, precise, sensory. No prices, no medical claims, no certifications, no slogans, no mention of AI. Description is one paragraph under 700 characters. Ingredients are real sensory notes or care ingredients for this kind of piece, each with a short benefit under 160 characters.",
        },
        {
          role: "user",
          content: `Write in ${language}. Piece: ${title}. Category: ${category}.`,
        },
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

function parseCopy(content: string) {
  let parsed: { description?: unknown; ingredients?: unknown };
  try {
    parsed = JSON.parse(content) as { description?: unknown; ingredients?: unknown };
  } catch {
    throw new OpenAICopyError("OpenAI could not write that copy.");
  }

  const description = String(parsed.description ?? "").trim().replace(/\s+/g, " ").slice(0, 800);
  if (description.length < 20) throw new OpenAICopyError("OpenAI could not write that copy.");

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
  return { description, ingredients };
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
