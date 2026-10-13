"use client";

import { CodDrawer } from "@/components/cod-drawer";
import { CouponField, type AppliedCoupon } from "@/components/coupon-field";
import { PiecePhoto } from "@/components/piece-photo";
import { ProductStage } from "@/components/product-stage";
import type { IngredientIcon, ProductPageData, Shade } from "@/lib/product-story";
import { addToBag } from "@/lib/bag-store";
import { defaultShippingRates, type ShippingRates } from "@/lib/cod";
import type { Dictionary } from "@/lib/messages";
import { formatDh, type Category, type Mood } from "@/lib/products";
import type { StorefrontPiece } from "@/lib/storefront-catalog";
import { trackCommerce } from "@/lib/meta";
import { ChevronLeft, ChevronRight, Droplets, Flower2, Gem, Leaf, Minus, Plus, Sparkles, SunMedium } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

const icons = {
  droplet: Droplets,
  spark: Sparkles,
  leaf: Leaf,
  sun: SunMedium,
  gem: Gem,
  flower: Flower2,
} as const;

export function ProductDetail({
  product,
  shippingRates = defaultShippingRates,
  image = "",
  images = [],
  related = [],
  copy,
}: {
  product: ProductPageData;
  shippingRates?: ShippingRates;
  image?: string;
  images?: string[];
  related?: StorefrontPiece[];
  copy: Dictionary;
}) {
  const photos = images.length > 0 ? images : image ? [image] : [];
  const [photo, setPhoto] = useState(0);
  const [shade, setShade] = useState<Shade>(product.shades[0]);
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [added, setAdded] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const merchandise = product.price * quantity;
  const goods = Math.max(0, merchandise - (coupon?.discountDh ?? 0));

  useEffect(() => {
    trackCommerce("ViewContent", {
      id: product.id,
      name: product.name,
      category: product.category,
      value: product.price,
      unitPrice: product.price,
      quantity: 1,
    });
  }, [product.category, product.id, product.name, product.price]);

  function openOrder() {
    setOrdering(true);
  }

  function putInBag() {
    addToBag({
      id: product.id,
      name: product.name,
      price: product.price,
      image,
      shadeId: shade.id,
      quantity,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <>
      <article className="px-5 pt-8 pb-28 md:px-10 md:pt-12 md:pb-20">
        <p className="type-caption">
          <Link href="/#edit" className="text-gold-bright hover:text-foreground">
            {copy.product.collection}
          </Link>
          <span aria-hidden> · </span>
          {knownCategory(copy, product.category)}
        </p>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          {photos.length > 0 ? (
            <div>
              <div className="relative aspect-[4/5] overflow-hidden border border-gold/20 bg-background">
                <img
                  src={photos[Math.min(photo, photos.length - 1)]}
                  alt={`${product.name} ${photo + 1}`}
                  className="size-full object-cover"
                />
                {photos.length > 1 ? (
                  <>
                    <button
                      type="button"
                      aria-label={copy.product.previousPhoto}
                      onClick={() => setPhoto((index) => (index - 1 + photos.length) % photos.length)}
                      className="absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center border border-[#E5C158]/80 bg-black/55 text-[#E5C158] backdrop-blur-sm transition-colors hover:bg-black/75"
                    >
                      <ChevronLeft strokeWidth={1.25} size={20} />
                    </button>
                    <button
                      type="button"
                      aria-label={copy.product.nextPhoto}
                      onClick={() => setPhoto((index) => (index + 1) % photos.length)}
                      className="absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center border border-[#E5C158]/80 bg-black/55 text-[#E5C158] backdrop-blur-sm transition-colors hover:bg-black/75"
                    >
                      <ChevronRight strokeWidth={1.25} size={20} />
                    </button>
                  </>
                ) : null}
              </div>
              {photos.length > 1 ? (
                <div className="mt-3 flex gap-2">
                  {photos.map((src, index) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setPhoto(index)}
                      aria-pressed={index === photo}
                      className={`size-16 overflow-hidden border ${index === photo ? "border-gold-bright" : "border-gold/20"}`}
                    >
                      <img src={src} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <ProductStage motif={product.motif} swatch={shade.swatch} name={product.name} />
          )}

          <div>
            <p className="type-eyebrow">{copy.badges[product.badge] ?? product.badge}</p>
            <h1 className="type-headline mt-4">{product.name}</h1>
            <p className="type-italic mt-3 text-2xl text-gold-bright">{product.moods.map((mood) => knownMood(copy, mood)).join(" · ")}</p>
            <p className="type-lead mt-6 max-w-xl">{product.description}</p>
            <p className="type-price mt-6">{formatDh(coupon ? goods : product.price)}</p>
            {coupon ? <p className="type-caption mt-1 line-through">{formatDh(merchandise)}</p> : null}
            <div className="mt-6 max-w-md">
              <CouponField merchandiseDh={merchandise} copy={copy.checkout} applied={coupon} onApplied={setCoupon} />
            </div>

            <ShadeSelector shades={product.shades} shade={shade} onChange={setShade} label={copy.product.shade} />
            <QuantitySelector quantity={quantity} onChange={setQuantity} copy={copy.product} />

            <div className="mt-8 hidden items-center gap-3 md:flex">
              <button type="button" className="type-nav bg-[#D4AF37] px-8 py-4 text-[#0D0D0D] transition-colors hover:bg-[#E5C158]" onClick={openOrder}>
                {copy.product.order}
              </button>
              <button type="button" className="type-nav border border-gold-bright px-6 py-4 text-gold-bright" onClick={putInBag}>
                {added ? copy.tools.added : copy.tools.addToBag}
              </button>
            </div>
            <p className="type-caption mt-4 hidden max-w-sm md:block">{copy.product.orderNote}</p>
          </div>
        </div>

        <IngredientBreakdown ingredients={product.ingredients} copy={copy.product} />
        <RelatedPieces pieces={related} copy={copy} />
      </article>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/40 bg-background/92 px-4 py-3 backdrop-blur-xl md:hidden">
        <p className="type-caption truncate text-foreground/80">
          {product.name} · {shade.name} · ×{quantity}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="type-price">{formatDh(goods)}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="type-nav border border-gold-bright px-3 py-3 text-[0.68rem] tracking-[0.14em] text-gold-bright"
              onClick={putInBag}
            >
              {added ? copy.tools.added : copy.tools.addToBag}
            </button>
            <button
              type="button"
              className="type-nav bg-[#D4AF37] px-4 py-3 text-[0.68rem] tracking-[0.14em] text-[#0D0D0D]"
              onClick={openOrder}
            >
              {copy.product.order}
            </button>
          </div>
        </div>
      </div>

      <CodDrawer
        open={ordering}
        onClose={() => setOrdering(false)}
        line={{
          productId: product.id,
          shadeId: shade.id,
          quantity,
          name: product.name,
          detail: `${shade.name} · ×${quantity}`,
          merchandise,
          couponCode: coupon?.code ?? "",
          discountDh: coupon?.discountDh ?? 0,
        }}
        shippingRates={shippingRates}
        copy={copy.checkout}
      />
    </>
  );
}

function ShadeSelector({
  shades,
  shade,
  onChange,
  label,
}: {
  shades: Shade[];
  shade: Shade;
  onChange: (shade: Shade) => void;
  label: string;
}) {
  return (
    <fieldset className="mt-10">
      <legend className="type-eyebrow">{label} · {shade.name}</legend>
      <div className="mt-4 flex flex-wrap gap-3">
        {shades.map((item) => {
          const selected = item.id === shade.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              aria-label={item.name}
              onClick={() => onChange(item)}
              className={`size-11 border ${selected ? "border-gold-bright" : "border-gold/30"}`}
              style={{ backgroundColor: item.swatch }}
            />
          );
        })}
      </div>
    </fieldset>
  );
}

function QuantitySelector({
  quantity,
  onChange,
  copy,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  copy: Dictionary["product"];
}) {
  return (
    <fieldset className="mt-8">
      <legend className="type-eyebrow">{copy.quantity}</legend>
      <div className="mt-4 flex w-fit items-center border border-gold/30">
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center text-foreground hover:text-gold-bright"
          onClick={() => onChange(Math.max(1, quantity - 1))}
          aria-label={copy.decrease}
        >
          <Minus strokeWidth={1.25} size={16} />
        </button>
        <span className="type-nav min-w-10 text-center text-foreground" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center text-foreground hover:text-gold-bright"
          onClick={() => onChange(Math.min(8, quantity + 1))}
          aria-label={copy.increase}
        >
          <Plus strokeWidth={1.25} size={16} />
        </button>
      </div>
    </fieldset>
  );
}

function IngredientBreakdown({ ingredients, copy }: { ingredients: ProductPageData["ingredients"]; copy: Dictionary["product"] }) {
  if (ingredients.length === 0) return null;
  return (
    <section className="mt-16 border-t border-gold/20 pt-12 md:mt-20">
      <p className="type-eyebrow">{copy.formula}</p>
      <h2 className="type-headline mt-4">{copy.ingredients}</h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ingredients.map((ingredient) => (
          <li key={ingredient.name}>
            <IngredientTip name={ingredient.name} benefit={ingredient.benefit} icon={ingredient.icon} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedPieces({ pieces, copy }: { pieces: StorefrontPiece[]; copy: Dictionary }) {
  if (pieces.length === 0) return null;
  return (
    <section className="mt-16 border-t border-gold/20 pt-12 md:mt-20">
      <p className="type-eyebrow">{copy.product.collection}</p>
      <h2 className="type-headline mt-4">{copy.product.related}</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {pieces.map((piece) => (
          <article key={piece.id} className="group flex h-full flex-col border border-gold/20 bg-card">
            <Link
              href={`/product/${piece.id}`}
              className="relative block aspect-[4/5] overflow-hidden bg-background"
              aria-label={copy.catalog.view.replace("{name}", piece.name)}
            >
              <div className="absolute inset-0 origin-center transition-transform duration-700 ease-out group-hover:scale-[1.04]">
                <PiecePhoto src={piece.image} name={piece.name} motif={piece.motif} />
              </div>
              {piece.offer ? (
                <span className="type-caption absolute top-4 left-4 bg-[#D4AF37] px-2.5 py-1 text-[#0D0D0D]">{copy.catalog.offer}</span>
              ) : null}
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <p className="type-caption">{copy.category[piece.category]}</p>
              <h3 className="type-title mt-3 text-[1.65rem]">
                <Link href={`/product/${piece.id}`}>{piece.name}</Link>
              </h3>
              <p className="type-price mt-6">{formatDh(piece.price)}</p>
              {piece.compareAt ? <p className="type-caption mt-1 line-through">{formatDh(piece.compareAt)}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function knownCategory(copy: Dictionary, category: string) {
  return category in copy.category ? copy.category[category as Category] : category;
}

function knownMood(copy: Dictionary, mood: string) {
  return mood in copy.mood ? copy.mood[mood as Mood] : mood;
}

function IngredientTip({ name, benefit, icon }: { name: string; benefit: string; icon: IngredientIcon }) {
  const [open, setOpen] = useState(false);
  const tipId = useId();
  const Icon = icons[icon];

  return (
    <div
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setOpen(false);
      }}
    >
      <button
        type="button"
        className="flex w-full items-center gap-4 border border-gold/25 bg-card px-4 py-4 text-start"
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onClick={() => {
          if (window.matchMedia("(hover: none)").matches) setOpen((value) => !value);
        }}
      >
        <span
          aria-hidden
          className={`inline-flex size-11 shrink-0 items-center justify-center border border-gold text-gold-bright ${open ? "lux-tip" : ""}`}
        >
          <Icon strokeWidth={1.25} size={18} />
        </span>
        <span className="type-title text-[1.35rem]">{name}</span>
      </button>
      {open && benefit ? (
        <p
          id={tipId}
          role="tooltip"
          className="type-body absolute bottom-[calc(100%+0.75rem)] start-0 z-20 w-full border border-gold-bright bg-card px-4 py-3 text-foreground shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          {benefit}
        </p>
      ) : null}
    </div>
  );
}

