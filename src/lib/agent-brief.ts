import { textIn } from "@/lib/piece-locales";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";
import type { Locale } from "@/lib/locale";

const briefs = new Map<Locale, { prompt: string; catalog: string; at: number }>();
const freshFor = 20_000;

export function clearAgentBrief() {
  briefs.clear();
}

export async function agentBrief(locale: Locale) {
  const cached = briefs.get(locale);
  if (cached && Date.now() - cached.at < freshFor) return cached;

  const [settings, rows] = await Promise.all([
    getStoreSettings(),
    prisma.product.findMany({
      where: { available: true },
      orderBy: [{ featured: "desc" }, { title: "asc" }],
      take: 12,
      select: {
        title: true,
        price: true,
        discountPrice: true,
        titleLocales: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  const prompt = settings.connected && settings.agentEnabled ? settings.agentPrompt.trim() : "";
  const catalog = rows
    .map((row) => {
      const payable = row.discountPrice != null && row.discountPrice > 0 && row.discountPrice < row.price ? row.discountPrice : row.price;
      return `${textIn(row.titleLocales, locale, row.title)} · ${row.category.name} · ${payable} DH`;
    })
    .join("\n");
  const brief = { prompt, catalog, at: Date.now() };
  if (prompt) briefs.set(locale, brief);
  return brief;
}
