import { ProductDetail } from "@/components/product-detail";
import { getProductPage } from "@/lib/product-story";
import { shippingRatesFrom } from "@/lib/cod";
import { getStoreSettings } from "@/lib/store-settings";
import { formatDh, products } from "@/lib/products";
import { siteUrl } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductPage(slug);
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
  const product = getProductPage(slug);
  if (!product) notFound();
  const settings = await getStoreSettings();

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
      <ProductDetail product={product} shippingRates={shippingRatesFrom(settings)} />
    </main>
  );
}
