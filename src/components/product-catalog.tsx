import { CatalogControls } from "@/components/catalog-controls";
import { ProductStill } from "@/components/product-still";
import { shippingRatesFrom } from "@/lib/cod";
import { getLocale } from "@/lib/get-locale";
import { getStoreSettings } from "@/lib/store-settings";
import { messages } from "@/lib/messages";
import { getProductPage } from "@/lib/product-story";
import { formatDh, products } from "@/lib/products";
import Link from "next/link";
import type { ReactNode } from "react";

export async function ProductCatalog() {
  const [copy, settings] = await Promise.all([getLocale().then((locale) => messages[locale]), getStoreSettings()]);

  return (
    <section id="edit" className="scroll-mt-28 px-5 py-16 [content-visibility:auto] [contain-intrinsic-size:auto_2400px] md:px-10 md:py-20">
      <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="type-eyebrow">{copy.catalog.eyebrow}</p>
          <h2 className="type-headline mt-4">{copy.catalog.title}</h2>
        </div>
        <p className="type-body max-w-sm">{copy.catalog.lead}</p>
      </div>

      <CatalogControls total={products.length} copy={copy} shippingRates={shippingRatesFrom(settings)} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
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
              prefetch={false}
              className="relative block aspect-[4/5] overflow-hidden"
              aria-label={copy.catalog.view.replace("{name}", product.name)}
            >
              <div className="absolute inset-0 origin-center transition-transform duration-700 ease-out group-hover:scale-110 group-focus-within:scale-110">
                <ProductStill motif={product.motif} name={product.name} />
              </div>
              <div className="pointer-events-none absolute top-4 left-4 flex flex-wrap gap-2">
                {product.offer ? <GoldBadge solid>{copy.catalog.offer}</GoldBadge> : null}
                <GoldBadge>{copy.badges[product.badge] ?? product.badge}</GoldBadge>
              </div>
            </Link>

            <div className="flex flex-1 flex-col p-6 md:p-7">
              <p className="type-caption">{copy.category[product.category]}</p>
              <h3 className="type-title mt-3">
                <Link href={`/product/${product.id}`} prefetch={false}>
                  {product.name}
                </Link>
              </h3>
              <p className="type-italic mt-2 text-lg text-gold-bright">
                {product.moods.map((mood) => copy.mood[mood]).join(" · ")}
              </p>
              <p className="type-body mt-4 flex-1">{copy.descriptions[product.id] ?? product.description}</p>
              <div className="mt-8 flex items-center justify-between gap-4">
                <p className="type-price">{formatDh(product.price)}</p>
                <button
                  type="button"
                  className="type-nav border border-gold/50 px-4 py-3 text-gold-bright transition-colors hover:border-gold-bright hover:bg-gold/10"
                  data-order={product.id}
                  data-shade={getProductPage(product.id)?.shades[0]?.id ?? ""}
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

function GoldBadge({ solid = false, children }: { solid?: boolean; children: ReactNode }) {
  return (
    <span
      className={
        solid
          ? "type-caption bg-[#D4AF37] px-2.5 py-1 text-[#0D0D0D]"
          : "type-caption border border-[#E5C158] bg-[#0D0D0D]/75 px-2.5 py-1 text-[#E5C158] backdrop-blur-sm"
      }
    >
      {children}
    </span>
  );
}
