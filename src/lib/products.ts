export const categories = ["All", "Makeup", "Parfums", "Skin Care", "Special Offers"] as const;
export const moods = ["All", "Glam Evening", "Natural Glow", "Hydration Boost"] as const;

export type Category = (typeof categories)[number];
export type Mood = (typeof moods)[number];
export type ProductCategory = Exclude<Category, "All" | "Special Offers">;
export type ProductMood = Exclude<Mood, "All">;
export type Motif = "flacon" | "compact" | "tube" | "jar" | "palette";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  moods: ProductMood[];
  price: number;
  offer: boolean;
  badge: string;
  description: string;
  motif: Motif;
};

export const products: Product[] = [
  {
    id: "atelier-rouge",
    name: "Atelier Rouge",
    category: "Makeup",
    moods: ["Glam Evening"],
    price: 680,
    offer: true,
    badge: "Lip lacquer",
    description: "A low-sheen red with the weight of lacquer. One stroke, then nothing else.",
    motif: "tube",
  },
  {
    id: "noir-ligne",
    name: "Noir Ligne",
    category: "Makeup",
    moods: ["Glam Evening"],
    price: 420,
    offer: false,
    badge: "Eye liner",
    description: "A precise black line that stays graphic from dusk until the last light.",
    motif: "tube",
  },
  {
    id: "veil",
    name: "Veil",
    category: "Makeup",
    moods: ["Natural Glow"],
    price: 890,
    offer: false,
    badge: "Skin tint",
    description: "A weightless complexion veil. Light on the cheek, silent in photographs.",
    motif: "compact",
  },
  {
    id: "peche-satin",
    name: "Pêche Satin",
    category: "Makeup",
    moods: ["Natural Glow", "Hydration Boost"],
    price: 510,
    offer: false,
    badge: "Cheek",
    description: "A satin peach that reads as warmth, with a cushion of moisture underneath.",
    motif: "compact",
  },
  {
    id: "or-de-soir",
    name: "Or de Soir",
    category: "Makeup",
    moods: ["Glam Evening"],
    price: 1640,
    offer: true,
    badge: "Palette",
    description: "Four evening metals. Gold where the light should catch, and nowhere else.",
    motif: "palette",
  },
  {
    id: "nocturne",
    name: "Nocturne",
    category: "Parfums",
    moods: ["Glam Evening"],
    price: 2450,
    offer: false,
    badge: "Extrait",
    description: "Resinous florals worn close to the pulse. Night, without sweetness.",
    motif: "flacon",
  },
  {
    id: "blanche",
    name: "Blanche",
    category: "Parfums",
    moods: ["Natural Glow"],
    price: 1680,
    offer: true,
    badge: "Eau de parfum",
    description: "White florals washed sheer. A clean trail that stays on skin, not on cloth.",
    motif: "flacon",
  },
  {
    id: "oree",
    name: "Orée",
    category: "Parfums",
    moods: ["Hydration Boost"],
    price: 1890,
    offer: false,
    badge: "Eau fraîche",
    description: "Citrus peel and water lily. A fresh mist that feels like cool glass.",
    motif: "flacon",
  },
  {
    id: "lait-dor",
    name: "Lait d'Or",
    category: "Skin Care",
    moods: ["Hydration Boost"],
    price: 920,
    offer: false,
    badge: "Serum",
    description: "A gold-tinted serum that drinks in quickly and leaves the skin lucid.",
    motif: "jar",
  },
  {
    id: "rosee",
    name: "Rosée",
    category: "Skin Care",
    moods: ["Hydration Boost", "Natural Glow"],
    price: 760,
    offer: true,
    badge: "Mist",
    description: "A fine dew of glycerin and neroli. Makeup sits on it as if on rested skin.",
    motif: "flacon",
  },
  {
    id: "baume-nuit",
    name: "Baume Nuit",
    category: "Skin Care",
    moods: ["Natural Glow"],
    price: 1140,
    offer: false,
    badge: "Night balm",
    description: "A quiet overnight balm. By morning the face looks rested, not coated.",
    motif: "jar",
  },
  {
    id: "eclat-noir",
    name: "Éclat Noir",
    category: "Skin Care",
    moods: ["Glam Evening"],
    price: 980,
    offer: false,
    badge: "Illuminator",
    description: "A liquid highlight for cheek and lid. Evening light, bottled.",
    motif: "compact",
  },
];

const categoryHash: Record<string, Category> = {
  "#makeup": "Makeup",
  "#parfums": "Parfums",
  "#skin-care": "Skin Care",
  "#offers": "Special Offers",
  "#edit": "All",
};

export function categoryFromHash(hash: string): Category | null {
  return categoryHash[hash] ?? null;
}

export function hashForCategory(category: Category): string {
  if (category === "Makeup") return "#makeup";
  if (category === "Parfums") return "#parfums";
  if (category === "Skin Care") return "#skin-care";
  if (category === "Special Offers") return "#offers";
  return "#edit";
}

export function filterProducts(category: Category, mood: Mood, source: Product[] = products): Product[] {
  return source.filter((product) => {
    const categoryMatch =
      category === "All" ||
      (category === "Special Offers" ? product.offer : product.category === category);
    const moodMatch = mood === "All" || product.moods.includes(mood);
    return categoryMatch && moodMatch;
  });
}

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.id === slug);
}

export function formatDh(amount: number): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
  return `${grouped} DH`;
}
