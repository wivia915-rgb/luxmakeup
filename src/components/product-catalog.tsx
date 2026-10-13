import { CatalogControls } from "@/components/catalog-controls";
import { PiecePhoto } from "@/components/piece-photo";
import { shippingRatesFrom } from "@/lib/cod";
import { getLocale } from "@/lib/get-locale";
import { getStoreSettings } from "@/lib/store-settings";
import { messages } from "@/lib/messages";
import { getProductPage } from "@/lib/product-story";
import { formatDh, products, type Product } from "@/lib/products";
import { getStorefrontPieces, type StorefrontPiece } from "@/lib/storefront-catalog";
import Link from "next/link";
import type { ReactNode } from "react";

export async function ProductCatalog() {
  const locale = await getLocale();
  const [settings, stored] = await Promise.all([getStoreSettings(), getStorefrontPieces(locale)]);
  const copy = messages[locale];
  const pieces = stored.length > 0 ? stored : products.map(memoryPiece);

  return (
    <section id="edit" className="scroll-mt-28 px-5 py-16 [content-visibility:auto] [contain-intrinsic-size:auto_2400px] md:px-10 md:py-20">
      <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="type-eyebrow">{copy.catalog.eyebrow}</p>
          <h2 className="type-headline mt-4">{copy.catalog.title}</h2>
        </div>
        <p className="type-body max-w-sm">{copy.catalog.lead}</p>
      </div>

      <CatalogControls total={pieces.length} copy={copy} shippingRates={shippingRatesFrom(settings)} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pieces.map((product) => (
          <article
            key={product.id}
            data-piece=""
            data-category={product.category}
            data-offer={product.offer ? "true" : "false"}
            data-moods={product.moods.join("|")}
            className="group flex h-full flex-col border border-gold/20 bg-card"
          >
            <Link
              href={`/product/${product.id}`}
              className="relative block aspect-[4/5] overflow-hidden bg-background"
              aria-label={copy.catalog.view.replace("{name}", product.name)}
            >
              <div className="absolute inset-0 origin-center transition-transform duration-700 ease-out group-hover:scale-[1.04] group-focus-within:scale-[1.04]">
                <PiecePhoto src={product.image} name={product.name} motif={product.motif} />
              </div>
              <div className="pointer-events-none absolute top-4 left-4 flex flex-wrap gap-2">
                {product.offer ? <GoldBadge solid>{copy.catalog.offer}</GoldBadge> : null}
                <GoldBadge>{copy.badges[product.badge] ?? product.badge}</GoldBadge>
              </div>
            </Link>

            <div className="flex flex-1 flex-col p-6 md:p-7">
              <p className="type-caption">{copy.category[product.category]}</p>
              <h3 className="type-title mt-3">
                <Link href={`/product/${product.id}`}>
                  {product.name}
                </Link>
              </h3>
              <p className="type-italic mt-2 text-lg text-gold-bright">
                {product.moods.map((mood) => copy.mood[mood]).join(" · ")}
              </p>
              <p className="type-body mt-4 flex-1">{copy.descriptions[product.id] ?? product.description}</p>
              <div className="mt-8 flex items-end justify-between gap-4">
                <div>
                  <p className="type-price">{formatDh(product.price)}</p>
                  {product.compareAt ? <p className="type-caption mt-1 line-through">{formatDh(product.compareAt)}</p> : null}
                </div>
                <button
                  type="button"
                  className="type-nav border border-gold/50 px-4 py-3 text-gold-bright transition-colors hover:border-gold-bright hover:bg-gold/10"
                  data-order={product.id}
                  data-shade={product.shadeId}
                  data-name={product.name}
                  data-badge={product.badge}
                  data-price={product.price}
                >
                  {copy.catalog.quickOrder}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function memoryPiece(product: Product): StorefrontPiece {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    moods: product.moods,
    price: product.price,
    compareAt: null,
    offer: product.offer,
    badge: product.badge,
    description: product.description,
    image: "",
    images: [],
    motif: product.motif,
    shadeId: getProductPage(product.id)?.shades[0]?.id ?? "atelier",
  };
}

function GoldBadge({ solid = false, children }: { solid?: boolean; children: ReactNode }) {
  return (
    <span
      className={
        solid
          ? "type-caption bg-[#D4AF37] px-2.5 py-1 text-[#0D0D0D]"
          : "type-caption border border-[#E5C158] bg-black/65 px-2.5 py-1 text-[#E5C158] backdrop-blur-sm"
      }
    >
      {children}
    </span>
  );
}
