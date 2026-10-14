import { createHash } from "node:crypto";
import type { Locale } from "@/lib/locale";

export type TextLocales = Record<Locale, string>;
export type IngredientLocales = Record<Locale, { name: string; benefit: string }>;

export function pieceHash(
  title: string,
  description: string,
  ingredients: { name: string; benefit: string }[],
  highlights: string[] = [],
  traits: string[] = [],
) {
  const source = JSON.stringify({
    title: title.trim(),
    description: description.trim(),
    ingredients: ingredients.map((item) => [item.name.trim(), item.benefit.trim()]),
    highlights: highlights.map((line) => line.trim()),
    traits: traits.map((line) => line.trim()),
  });
  return createHash("sha256").update(source).digest("hex");
}

export function linesIn(locales: unknown, group: "highlights" | "traits", locale: Locale, fallback: string[]) {
  if (!locales || typeof locales !== "object") return fallback;
  const bucket = (locales as Record<string, unknown>)[group];
  if (!bucket || typeof bucket !== "object") return fallback;
  const value = (bucket as Record<string, unknown>)[locale];
  if (!Array.isArray(value)) return fallback;
  const lines = value.flatMap((item) => (typeof item === "string" && item.trim() ? [item.trim()] : []));
  return lines.length > 0 ? lines : fallback;
}

export function textIn(locales: unknown, locale: Locale, fallback: string) {
  if (!locales || typeof locales !== "object") return fallback;
  const value = (locales as Record<string, unknown>)[locale];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function ingredientIn(locales: unknown, locale: Locale) {
  if (!locales || typeof locales !== "object") return null;
  const value = (locales as Record<string, unknown>)[locale];
  if (!value || typeof value !== "object") return null;
  const row = value as { name?: unknown; benefit?: unknown };
  const name = typeof row.name === "string" ? row.name.trim() : "";
  const benefit = typeof row.benefit === "string" ? row.benefit.trim() : "";
  if (!name) return null;
  return { name, benefit };
}

export async function translateTitles(titles: string[]) {
  const key = process.env.OPENAI_API_KEY?.trim();
  const source = titles.map((title) => title.trim()).filter(Boolean);
  if (!key || source.length === 0) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "title_locales",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              titles: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: { ar: { type: "string" }, fr: { type: "string" }, en: { type: "string" } },
                  required: ["ar", "fr", "en"],
                },
              },
            },
            required: ["titles"],
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "Translate each Lux Makeup product title into Arabic, French, and English. Keep numerals such as 24K. Translate the descriptive words. If a title is already in a language, keep that version close to the original. Return one object per title, in the same order.",
        },
        { role: "user", content: JSON.stringify({ titles: source }) },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });
  const payload = (await response.json().catch(() => null)) as { choices?: { message?: { content?: string } }[] } | null;
  if (!response.ok) return null;
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as { titles?: unknown };
    if (!Array.isArray(parsed.titles) || parsed.titles.length < source.length) return null;
    const translated: TextLocales[] = [];
    for (const item of parsed.titles.slice(0, source.length)) {
      const row = textLocales(item, true, 120);
      if (!row) return null;
      translated.push(row);
    }
    return translated;
  } catch {
    return null;
  }
}

export async function translatePiece(input: {
  title: string;
  description: string;
  ingredients: { name: string; benefit: string }[];
  highlights?: string[];
  traits?: string[];
}) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  const title = input.title.trim();
  const description = input.description.trim();
  const ingredients = input.ingredients.map((item) => ({ name: item.name.trim(), benefit: item.benefit.trim() }));
  const highlights = (input.highlights ?? []).map((line) => line.trim()).filter(Boolean);
  const traits = (input.traits ?? []).map((line) => line.trim()).filter(Boolean);
  if (!title) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "piece_locales",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: {
                type: "object",
                additionalProperties: false,
                properties: { ar: { type: "string" }, fr: { type: "string" }, en: { type: "string" } },
                required: ["ar", "fr", "en"],
              },
              description: {
                type: "object",
                additionalProperties: false,
                properties: { ar: { type: "string" }, fr: { type: "string" }, en: { type: "string" } },
                required: ["ar", "fr", "en"],
              },
              ingredients: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    ar: localeIngredient(),
                    fr: localeIngredient(),
                    en: localeIngredient(),
                  },
                  required: ["ar", "fr", "en"],
                },
              },
              highlights: lineGroupSchema(),
              traits: lineGroupSchema(),
            },
            required: ["title", "description", "ingredients", "highlights", "traits"],
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "Translate Lux Makeup product copy into Arabic, French, and English. Translate the title, the description, the ingredients, the feature lines, and the characteristic lines. Keep numerals such as 24K. Keep the meaning, the luxury tone, and every ingredient. If the source is already in a language, keep that version close to the original. Do not add medical claims, prices, or new ingredients. Return one ingredient object per source ingredient, in the same order. Return the same number of feature and characteristic lines, in the same order. Empty source lists stay empty arrays.",
        },
        {
          role: "user",
          content: JSON.stringify({ title, description, ingredients, highlights, traits }),
        },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });

  const payload = (await response.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[];
  } | null;
  if (!response.ok) return null;
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) return null;
  return parseTranslation(content, title, description, ingredients.length, highlights.length, traits.length);
}

function lineGroupSchema() {
  const lines = { type: "array", items: { type: "string" } };
  return {
    type: "object",
    additionalProperties: false,
    properties: { ar: lines, fr: lines, en: lines },
    required: ["ar", "fr", "en"],
  };
}

function localeIngredient() {
  return {
    type: "object",
    additionalProperties: false,
    properties: { name: { type: "string" }, benefit: { type: "string" } },
    required: ["name", "benefit"],
  };
}

function parseTranslation(
  content: string,
  sourceTitle: string,
  sourceDescription: string,
  count: number,
  highlightCount: number,
  traitCount: number,
) {
  let parsed: { title?: unknown; description?: unknown; ingredients?: unknown; highlights?: unknown; traits?: unknown };
  try {
    parsed = JSON.parse(content) as { title?: unknown; description?: unknown; ingredients?: unknown; highlights?: unknown; traits?: unknown };
  } catch {
    return null;
  }
  const title = textLocales(parsed.title, Boolean(sourceTitle), 120);
  const description = textLocales(parsed.description, Boolean(sourceDescription), 800);
  const highlights = lineLocales(parsed.highlights, highlightCount, 120);
  const traits = lineLocales(parsed.traits, traitCount, 120);
  if (!title || !description || !highlights || !traits) return null;
  if (!Array.isArray(parsed.ingredients) || parsed.ingredients.length < count) return null;
  const ingredients: IngredientLocales[] = [];
  for (const item of parsed.ingredients.slice(0, count)) {
    const row = ingredientLocales(item);
    if (!row) return null;
    ingredients.push(row);
  }
  return { title, description, ingredients, highlights, traits };
}

function lineLocales(value: unknown, count: number, max: number): Record<Locale, string[]> | null {
  if (count === 0) return { ar: [], fr: [], en: [] };
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const locales = ["ar", "fr", "en"] as const;
  const result = {} as Record<Locale, string[]>;
  for (const locale of locales) {
    const items = row[locale];
    if (!Array.isArray(items) || items.length < count) return null;
    const lines: string[] = [];
    for (const item of items.slice(0, count)) {
      const line = clean(item, max);
      if (!line) return null;
      lines.push(line);
    }
    result[locale] = lines;
  }
  return result;
}

function textLocales(value: unknown, required: boolean, max: number): TextLocales | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const ar = clean(row.ar, max);
  const fr = clean(row.fr, max);
  const en = clean(row.en, max);
  if (required && (!ar || !fr || !en)) return null;
  return { ar: ar ?? "", fr: fr ?? "", en: en ?? "" };
}

function ingredientLocales(value: unknown): IngredientLocales | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const locales = ["ar", "fr", "en"] as const;
  const result = {} as IngredientLocales;
  for (const locale of locales) {
    const item = row[locale];
    if (!item || typeof item !== "object") return null;
    const fields = item as { name?: unknown; benefit?: unknown };
    const name = clean(fields.name, 40);
    if (!name) return null;
    result[locale] = { name, benefit: clean(fields.benefit, 180) ?? "" };
  }
  return result;
}

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const text = value.trim().replace(/\s+/g, " ").slice(0, max);
  return text || null;
}
