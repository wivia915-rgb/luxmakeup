import type { Locale } from "@/lib/locale";

type ColorName = Record<Locale, string>;

const names = {
  white: { ar: "أبيض", fr: "Blanc", en: "White" },
  ivory: { ar: "عاجي", fr: "Ivoire", en: "Ivory" },
  cream: { ar: "كريمي", fr: "Crème", en: "Cream" },
  beige: { ar: "بيج", fr: "Beige", en: "Beige" },
  nude: { ar: "نيود", fr: "Nude", en: "Nude" },
  black: { ar: "أسود", fr: "Noir", en: "Black" },
  gray: { ar: "رمادي", fr: "Gris", en: "Gray" },
  silver: { ar: "فضي", fr: "Argent", en: "Silver" },
  gold: { ar: "ذهبي", fr: "Or", en: "Gold" },
  yellow: { ar: "أصفر", fr: "Jaune", en: "Yellow" },
  orange: { ar: "برتقالي", fr: "Orange", en: "Orange" },
  red: { ar: "أحمر", fr: "Rouge", en: "Red" },
  burgundy: { ar: "خمري", fr: "Bordeaux", en: "Burgundy" },
  brown: { ar: "بني", fr: "Brun", en: "Brown" },
  copper: { ar: "نحاسي", fr: "Cuivré", en: "Copper" },
  peach: { ar: "خوخي", fr: "Pêche", en: "Peach" },
  coral: { ar: "مرجاني", fr: "Corail", en: "Coral" },
  pink: { ar: "وردي", fr: "Rose", en: "Pink" },
  lightPink: { ar: "وردي فاتح", fr: "Rose clair", en: "Light pink" },
  fuchsia: { ar: "فوشيا", fr: "Fuchsia", en: "Fuchsia" },
  roseGold: { ar: "ذهبي وردي", fr: "Or rose", en: "Rose gold" },
  purple: { ar: "أرجواني", fr: "Pourpre", en: "Purple" },
  violet: { ar: "بنفسجي", fr: "Violet", en: "Violet" },
  blue: { ar: "أزرق", fr: "Bleu", en: "Blue" },
  navy: { ar: "كحلي", fr: "Bleu marine", en: "Navy" },
  sky: { ar: "سماوي", fr: "Bleu ciel", en: "Sky blue" },
  turquoise: { ar: "تركوازي", fr: "Turquoise", en: "Turquoise" },
  green: { ar: "أخضر", fr: "Vert", en: "Green" },
  olive: { ar: "زيتي", fr: "Olive", en: "Olive" },
} satisfies Record<string, ColorName>;

export function shadeNameForColor(value: string, locale: Locale): string {
  const parsed = /^#([0-9a-fA-F]{6})$/.exec(value.trim());
  if (!parsed) return "";
  const hex = parsed[1];
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return names[colorKey(r, g, b)][locale];
}

function colorKey(r: number, g: number, b: number): keyof typeof names {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  if (s < 0.1) {
    if (l >= 0.9) return "white";
    if (l <= 0.14) return "black";
    if (l > 0.72) return "silver";
    return "gray";
  }
  if (l <= 0.08) return "black";
  if (l >= 0.97) return "white";

  const warm = r >= g && g >= b;
  if (r > g && r > b && Math.abs(g - b) < 28 && s >= 0.18 && s <= 0.55 && l >= 0.5 && l <= 0.75 && (h >= 340 || h <= 8)) return "roseGold";
  if (warm && h >= 20 && h <= 55 && s >= 0.25 && s <= 0.72 && l >= 0.62 && l <= 0.9) return "beige";
  if (warm && h >= 12 && h <= 45 && s >= 0.18 && s <= 0.55 && l >= 0.45 && l < 0.68) return "nude";
  if (h >= 38 && h <= 68 && s >= 0.35 && l >= 0.32 && l < 0.6 && g / Math.max(r, 1) > 0.65) return "gold";

  if (h < 10 || h >= 348) {
    if (l < 0.28) return "burgundy";
    if (l > 0.78) return "lightPink";
    return "red";
  }
  if (h < 42) {
    if (l < 0.38) return "brown";
    if (s < 0.62 && l < 0.58) return "copper";
    if (l > 0.72) return "peach";
    if (l > 0.58 && s < 0.75) return "coral";
    return "orange";
  }
  if (h < 75) {
    if (l < 0.42) return "olive";
    if (l >= 0.6) return "yellow";
    return "gold";
  }
  if (h < 165) {
    if (s < 0.45 && l < 0.45) return "olive";
    return "green";
  }
  if (h < 195) return "turquoise";
  if (h < 255) {
    if (l < 0.32) return "navy";
    if (l > 0.58) return "sky";
    return "blue";
  }
  if (h < 320) {
    if (h >= 300 && s > 0.5 && l < 0.6) return "fuchsia";
    if (l > 0.62) return "violet";
    return "purple";
  }
  if (l < 0.36) return "burgundy";
  if (l > 0.75) return "lightPink";
  if (s > 0.55 && l < 0.55) return "fuchsia";
  return "pink";
}
