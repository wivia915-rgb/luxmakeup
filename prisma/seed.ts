import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Maquillage", slug: "maquillage" },
  { name: "Parfums", slug: "parfums" },
  { name: "Soin", slug: "soin" },
] as const;

const products = [
  {
    title: "Velvet Gold Lipstick",
    slug: "velvet-gold-lipstick",
    price: 250,
    discountPrice: 199,
    category: "maquillage",
    description:
      "Rouge à lèvres hydratant enrichi en micro-paillettes d'or 24k pour une finition satinée et une tenue longue durée.",
    ingredients: ["Jojoba Oil", "Vitamin E", "24k Gold Dust"],
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
    stock: 15,
    available: true,
    featured: true,
  },
  {
    title: "Luminous Silk Foundation",
    slug: "luminous-silk-foundation",
    price: 480,
    discountPrice: null,
    category: "maquillage",
    description:
      "Fond de teint fluide offrant une couvrance moyenne modulable et un fini éclatant naturel toute la journée.",
    ingredients: ["Hyaluronic Acid", "SPF 20", "Glycerin"],
    image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=800&q=80",
    stock: 20,
    available: true,
    featured: true,
  },
  {
    title: "Midnight Elixir Perfume (50ml)",
    slug: "midnight-elixir-perfume",
    price: 850,
    discountPrice: 720,
    category: "parfums",
    description:
      "Une fragrance envoûtante de bois d'ambre, d'oud précieux et de vanille noire. Gravure personnalisée offerte.",
    ingredients: ["Black Amber", "Oud", "Vanilla Tahitensis"],
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
    stock: 8,
    available: true,
    featured: true,
  },
  {
    title: "Royal Rose Eau De Parfum",
    slug: "royal-rose-eau-de-parfum",
    price: 920,
    discountPrice: null,
    category: "parfums",
    description: "Essence pure de rose de Damas mêlée aux notes douces de musk blanc et de bergamote.",
    ingredients: ["Damask Rose", "White Musk", "Bergamot"],
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
    stock: 12,
    available: true,
    featured: true,
  },
  {
    title: "24K Gold Rejuvenating Serum",
    slug: "24k-gold-rejuvenating-serum",
    price: 600,
    discountPrice: 490,
    category: "soin",
    description: "Sérum anti-âge concentré aux peptides et paillettes d'or pur pour régénérer et raffermir la peau.",
    ingredients: ["24K Gold Flakes", "Peptides", "Rosewater"],
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    stock: 10,
    available: true,
    featured: true,
  },
  {
    title: "Hydrating Night Miracle Cream",
    slug: "hydrating-night-miracle-cream",
    price: 420,
    discountPrice: null,
    category: "soin",
    description: "Soin de nuit ultra-nourrissant au beurre de karité et rétinol doux pour un teint repulpé au réveil.",
    ingredients: ["Shea Butter", "Retinol", "Ceramides"],
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
    stock: 14,
    available: true,
    featured: true,
  },
] as const;

async function main() {
  const categoryIds = new Map<string, string>();

  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: { name: category.name, slug: category.slug },
    });
    categoryIds.set(category.slug, saved.id);
  }

  for (const product of products) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Missing category ${product.category}`);

    const data = {
      title: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      categoryId,
      description: product.description,
      ingredients: [...product.ingredients],
      images: [product.image],
      stock: product.stock,
      available: product.available,
      featured: product.featured,
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: data,
      create: { slug: product.slug, ...data },
    });
  }

  console.log(`Seeded ${products.length} pieces in Maquillage, Parfums, and Soin.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : "Seed failed");
    await prisma.$disconnect();
    process.exit(1);
  });
