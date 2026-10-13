import { ProductDetail } from "@/components/product-detail";
import { getLocale } from "@/lib/get-locale";
import type { Locale } from "@/lib/locale";
import { messages } from "@/lib/messages";
import { getProductPage, type ProductPageData } from "@/lib/product-story";
import { shippingRatesFrom } from "@/lib/cod";
import { getStoreSettings } from "@/lib/store-settings";
import { getRelatedPieces, getStorefrontPiece } from "@/lib/storefront-catalog";
import { formatDh, products } from "@/lib/products";
import { siteUrl } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { StorefrontPieceDetail } from "@/lib/storefront-catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const product = getProductPage(slug) ?? (await catalogPage(slug, locale));
  if (!product) {
    return { title: "Piece unavailable" };
  }

  const url = `/product/${product.id}`;
  const summary = `${product.description} ${formatDh(product.price)}.`;

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: "Lux Makeup",
      locale: "en_MA",
      title: `${product.name} · Lux Makeup`,
      description: summary,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} · Lux Makeup`,
      description: summary,
    },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "MAD",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const story = getProductPage(slug);
  const catalog = story ? null : await getStorefrontPiece(slug, locale);
  const product = story ?? (catalog ? catalogPageFrom(catalog) : null);
  if (!product) notFound();
  const [settings, related] = await Promise.all([
    getStoreSettings(),
    getRelatedPieces(product.id, product.category, locale),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    brand: { "@type": "Brand", name: "Lux Makeup" },
    offers: {
      "@type": "Offer",
      priceCurrency: "MAD",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: new URL(`/product/${product.id}`, siteUrl()).toString(),
    },
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductDetail
        product={product}
        shippingRates={shippingRatesFrom(settings)}
        image={catalog?.image ?? ""}
        images={catalog?.images ?? []}
        related={related}
        copy={messages[locale]}
      />
    </main>
  );
}

async function catalogPage(slug: string, locale: Locale): Promise<ProductPageData | null> {
  const piece = await getStorefrontPiece(slug, locale);
  return piece ? catalogPageFrom(piece) : null;
}

function catalogPageFrom(piece: StorefrontPieceDetail): ProductPageData {
  return {
    id: piece.id,
    name: piece.name,
    category: piece.category,
    moods: piece.moods,
    price: piece.price,
    offer: piece.offer,
    badge: piece.badge,
    description: piece.description,
    motif: piece.motif,
    shades: [{ id: "atelier", name: "Atelier", swatch: "#D4AF37" }],
    ingredients: piece.ingredients,
  };
}
