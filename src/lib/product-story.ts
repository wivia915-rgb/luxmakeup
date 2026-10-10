import { getProduct, type Product } from "@/lib/products";

export type Shade = {
  id: string;
  name: string;
  swatch: string;
};

export type IngredientIcon = "droplet" | "spark" | "leaf" | "sun" | "gem" | "flower";

export type Ingredient = {
  name: string;
  benefit: string;
  icon: IngredientIcon;
};

export type ProductPageData = Product & {
  shades: Shade[];
  ingredients: Ingredient[];
};

const stories: Record<string, { shades: Shade[]; ingredients: Ingredient[] }> = {
  "atelier-rouge": {
    shades: [
      { id: "nuit", name: "Rouge Nuit", swatch: "#6E1E24" },
      { id: "or", name: "Rouge Or", swatch: "#8C3A2A" },
      { id: "nude", name: "Nude Lacquer", swatch: "#C48A78" },
    ],
    ingredients: [
      { name: "Candelilla wax", benefit: "Holds the lacquer in place without a dry, tight finish.", icon: "leaf" },
      { name: "Castor oil", benefit: "Keeps pigment supple so the mouth does not feel coated.", icon: "droplet" },
      { name: "Rouge pigment", benefit: "A dense red that stays true from afternoon into evening.", icon: "gem" },
    ],
  },
  "noir-ligne": {
    shades: [
      { id: "noir", name: "Noir", swatch: "#141414" },
      { id: "brun", name: "Brun", swatch: "#4A3428" },
      { id: "graphite", name: "Graphite", swatch: "#3E3E3E" },
    ],
    ingredients: [
      { name: "Carbon black", benefit: "A graphic line with depth, not a flat ink stain.", icon: "gem" },
      { name: "Jojoba", benefit: "Glides along the lash line without tugging.", icon: "droplet" },
      { name: "Film former", benefit: "Keeps the stroke sharp through heat and long evenings.", icon: "spark" },
    ],
  },
  veil: {
    shades: [
      { id: "porcelaine", name: "Porcelaine", swatch: "#F3E6D8" },
      { id: "sable", name: "Sable", swatch: "#D7B89A" },
      { id: "ambre", name: "Ambre", swatch: "#C4926A" },
    ],
    ingredients: [
      { name: "Hyaluronic acid", benefit: "A fine water cushion so tint sits like skin, not powder.", icon: "droplet" },
      { name: "Squalane", benefit: "Softens the finish so light reads as skin, not shine.", icon: "sun" },
      { name: "Sheer pigment", benefit: "Evens tone while the face still looks like itself.", icon: "flower" },
    ],
  },
  "peche-satin": {
    shades: [
      { id: "peche", name: "Pêche", swatch: "#E7A48A" },
      { id: "rose", name: "Rose Chaud", swatch: "#C97878" },
      { id: "miel", name: "Miel", swatch: "#C9956A" },
    ],
    ingredients: [
      { name: "Peach ester", benefit: "A soft fruit warmth that melts into the cheek.", icon: "flower" },
      { name: "Shea", benefit: "Cushions dry skin so color does not catch on texture.", icon: "leaf" },
      { name: "Fine mica", benefit: "A satin slip of light, never a glitter flash.", icon: "spark" },
    ],
  },
  "or-de-soir": {
    shades: [
      { id: "or", name: "Or", swatch: "#D4AF37" },
      { id: "champagne", name: "Champagne", swatch: "#E5C158" },
      { id: "bronze", name: "Bronze", swatch: "#8C6239" },
    ],
    ingredients: [
      { name: "Gold mica", benefit: "Metal that catches light only where the face turns.", icon: "spark" },
      { name: "Pearl", benefit: "A soft inner glow under the metal, not a mirror shine.", icon: "gem" },
      { name: "Jojoba", benefit: "Lets the powders blend with a fingertip, no chalk.", icon: "droplet" },
    ],
  },
  nocturne: {
    shades: [
      { id: "ambre", name: "Ambre", swatch: "#8C5A2A" },
      { id: "resine", name: "Résine", swatch: "#5C3A32" },
      { id: "nuit", name: "Nuit", swatch: "#3A2A28" },
    ],
    ingredients: [
      { name: "Rose absolute", benefit: "A deep floral heart that stays close to the skin.", icon: "flower" },
      { name: "Benzoin", benefit: "Warm resin that rounds the rose and lengthens the trail.", icon: "gem" },
      { name: "Amber", benefit: "The evening note: skin, warmth, and a little smoke.", icon: "sun" },
    ],
  },
  blanche: {
    shades: [
      { id: "lin", name: "Lin", swatch: "#E7E0D4" },
      { id: "petale", name: "Pétale", swatch: "#F4D7D2" },
      { id: "musc", name: "Musc", swatch: "#D9D3C7" },
    ],
    ingredients: [
      { name: "Neroli", benefit: "A clean citrus-floral opening that never turns sharp.", icon: "flower" },
      { name: "Iris", benefit: "Powdery softness, like fabric just pressed.", icon: "spark" },
      { name: "White musk", benefit: "The trail stays on skin and leaves cloth alone.", icon: "droplet" },
    ],
  },
  oree: {
    shades: [
      { id: "clair", name: "Clair", swatch: "#E7F0E4" },
      { id: "zeste", name: "Zeste", swatch: "#D7E08A" },
      { id: "eau", name: "Eau", swatch: "#C5D5D0" },
    ],
    ingredients: [
      { name: "Bergamot", benefit: "A bright peel note that feels cool on first spray.", icon: "sun" },
      { name: "Water lily", benefit: "An aquatic floral, sheer as a glass of cold water.", icon: "droplet" },
      { name: "Soft musk", benefit: "Keeps the freshness from vanishing in an hour.", icon: "flower" },
    ],
  },
  "lait-dor": {
    shades: [
      { id: "clair", name: "Clair", swatch: "#F6E7C4" },
      { id: "dore", name: "Doré", swatch: "#E5C158" },
      { id: "miel", name: "Miel", swatch: "#C9A15B" },
    ],
    ingredients: [
      { name: "Hyaluronic acid", benefit: "Draws water into the skin so it looks full, not wet.", icon: "droplet" },
      { name: "Niacinamide", benefit: "Evens the look of tone over days of steady use.", icon: "sun" },
      { name: "Squalane", benefit: "Seals the serum with a lucid, non-greasy slip.", icon: "leaf" },
    ],
  },
  rosee: {
    shades: [
      { id: "rose", name: "Rosée", swatch: "#F0D5D8" },
      { id: "claire", name: "Claire", swatch: "#E7EEF0" },
      { id: "or", name: "Or Léger", swatch: "#E8D7A8" },
    ],
    ingredients: [
      { name: "Glycerin", benefit: "A fine dew that makeup can sit on without sliding.", icon: "droplet" },
      { name: "Neroli water", benefit: "A quiet floral mist, refreshing and unsweet.", icon: "flower" },
      { name: "Panthenol", benefit: "Calms the feel of skin before color goes on.", icon: "leaf" },
    ],
  },
  "baume-nuit": {
    shades: [
      { id: "ivoire", name: "Ivoire", swatch: "#F3EBDD" },
      { id: "sable", name: "Sable", swatch: "#E0C7A4" },
      { id: "nuit", name: "Nuit", swatch: "#CDB89A" },
    ],
    ingredients: [
      { name: "Shea butter", benefit: "A rich cushion that melts in and does not sit on top.", icon: "leaf" },
      { name: "Ceramide", benefit: "Supports the skin barrier while you sleep.", icon: "gem" },
      { name: "Chamomile", benefit: "A calm floral note for skin that feels tight at night.", icon: "flower" },
    ],
  },
  "eclat-noir": {
    shades: [
      { id: "perle", name: "Perle", swatch: "#E8E4DC" },
      { id: "champagne", name: "Champagne", swatch: "#E5C158" },
      { id: "bronze", name: "Bronze Noir", swatch: "#7A5A3A" },
    ],
    ingredients: [
      { name: "Pearl", benefit: "Reflects evening light along cheek and lid.", icon: "spark" },
      { name: "Squalane", benefit: "Lets the highlight move with the skin, not flake.", icon: "droplet" },
      { name: "Vitamin E", benefit: "A light antioxidant cushion in the formula.", icon: "sun" },
    ],
  },
};

export function getProductPage(slug: string): ProductPageData | undefined {
  const product = getProduct(slug);
  const story = product ? stories[product.id] : undefined;
  if (!product || !story) return undefined;
  return { ...product, ...story };
}
