import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database...');
  try {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  } catch (e) {
    console.log('No data to clear or clean table state.');
  }

  console.log('Seeding categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Makeup', slug: 'makeup' },
    }),
    prisma.category.create({
      data: { name: 'Fragrance', slug: 'fragrance' },
    }),
    prisma.category.create({
      data: { name: 'Skincare', slug: 'skincare' },
    }),
  ]);

  const [makeup, fragrance, skincare] = categories;

  console.log('Seeding products...');
  await prisma.product.createMany({
    data: [
      {
        title: 'Velvet Gold Lipstick',
        slug: 'velvet-gold-lipstick',
        price: 250,
        discountPrice: 199,
        categoryId: makeup.id,
        ingredients: ['Jojoba Oil', 'Vitamin E', 'Gold Dust Pigments'],
        images: [
          'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800',
        ],
      },
      {
        title: 'Luminous Silk Foundation',
        slug: 'luminous-silk-foundation',
        price: 480,
        categoryId: makeup.id,
        ingredients: ['Hyaluronic Acid', 'SPF 20', 'Silk Extract'],
        images: [
          'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&q=80&w=800',
        ],
      },
      {
        title: 'Midnight Elixir Perfume (50ml)',
        slug: 'midnight-elixir-perfume',
        price: 850,
        discountPrice: 720,
        categoryId: fragrance.id,
        ingredients: ['Black Amber', 'Oud', 'Vanilla Pure Extract'],
        images: [
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
        ],
      },
      {
        title: 'Royal Rose Eau De Parfum',
        slug: 'royal-rose-eau-de-parfum',
        price: 920,
        categoryId: fragrance.id,
        ingredients: ['Damask Rose', 'White Musk', 'Bergamot'],
        images: [
          'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
        ],
      },
      {
        title: '24K Gold Rejuvenating Serum',
        slug: '24k-gold-rejuvenating-serum',
        price: 600,
        discountPrice: 490,
        categoryId: skincare.id,
        ingredients: ['24K Flakes', 'Peptides', 'Niacinamide'],
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
        ],
      },
      {
        title: 'Hydrating Night Miracle Cream',
        slug: 'hydrating-night-miracle-cream',
        price: 420,
        categoryId: skincare.id,
        ingredients: ['Shea Butter', 'Retinol', 'Ceramides'],
        images: [
          'https://images.unsplash.com/photo-1608248597263-00079e968393?auto=format&fit=crop&q=80&w=800',
        ],
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });