"use client";

import type { CodDrawerProps } from "@/components/cod-drawer";
import { ProductStage } from "@/components/product-stage";
import type { IngredientIcon, ProductPageData, Shade } from "@/lib/product-story";
import { formatDh } from "@/lib/products";
import { trackCommerce } from "@/lib/meta";
import { Droplets, Flower2, Gem, Leaf, Minus, Plus, Sparkles, SunMedium } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState, type ComponentType } from "react";

const icons = {
  droplet: Droplets,
  spark: Sparkles,
  leaf: Leaf,
  sun: SunMedium,
  gem: Gem,
  flower: Flower2,
} as const;

export function ProductDetail({ product }: { product: ProductPageData }) {
  const [shade, setShade] = useState<Shade>(product.shades[0]);
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [Drawer, setDrawer] = useState<ComponentType<CodDrawerProps> | null>(null);

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
    if (Drawer) return;
    void import("@/components/cod-drawer").then((mod) => setDrawer(() => mod.CodDrawer));
  }

  return (
    <>
      <article className="px-5 pt-8 pb-28 md:px-10 md:pt-12 md:pb-20">
        <p className="type-caption">
          <Link href="/#edit" className="text-gold-bright hover:text-foreground">
            Collection
          </Link>
          <span aria-hidden> · </span>
          {product.category}
        </p>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <ProductStage motif={product.motif} swatch={shade.swatch} name={product.name} />

          <div>
            <p className="type-eyebrow">{product.badge}</p>
            <h1 className="type-headline mt-4">{product.name}</h1>
            <p className="type-italic mt-3 text-2xl text-gold-bright">{product.moods.join(" · ")}</p>
            <p className="type-lead mt-6 max-w-xl">{product.description}</p>
            <p className="type-price mt-6">{formatDh(product.price)}</p>

            <ShadeSelector shades={product.shades} shade={shade} onChange={setShade} />
            <QuantitySelector quantity={quantity} onChange={setQuantity} />

            <button
              type="button"
              className="type-nav mt-8 hidden bg-[#D4AF37] px-8 py-4 text-[#0D0D0D] transition-colors hover:bg-[#E5C158] md:inline-flex"
              onClick={openOrder}
            >
              Instant Order (COD)
            </button>
            <p className="type-caption mt-4 hidden max-w-sm md:block">Cash on delivery. An advisor confirms the piece before it leaves the atelier.</p>
          </div>
        </div>

        <IngredientBreakdown ingredients={product.ingredients} />
      </article>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D4AF37]/40 bg-[#0D0D0D]/92 px-4 py-3 backdrop-blur-xl md:hidden">
        <p className="type-caption truncate text-foreground/80">
          {product.name} · {shade.name} · ×{quantity}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="type-price">{formatDh(product.price * quantity)}</p>
          <button
            type="button"
            className="type-nav bg-[#D4AF37] px-4 py-3 text-[0.68rem] tracking-[0.14em] text-[#0D0D0D]"
            onClick={openOrder}
          >
            Instant Order (COD)
          </button>
        </div>
      </div>

      {Drawer ? (
        <Drawer
          open={ordering}
          onClose={() => setOrdering(false)}
          line={{
            productId: product.id,
            shadeId: shade.id,
            quantity,
            name: product.name,
            detail: `${shade.name} · ×${quantity}`,
            merchandise: product.price * quantity,
          }}
        />
      ) : null}
    </>
  );
}

function ShadeSelector({
  shades,
  shade,
  onChange,
}: {
  shades: Shade[];
  shade: Shade;
  onChange: (shade: Shade) => void;
}) {
  return (
    <fieldset className="mt-10">
      <legend className="type-eyebrow">Shade · {shade.name}</legend>
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
              className={`size-11 border ${selected ? "border-[#E5C158]" : "border-gold/30"}`}
              style={{ backgroundColor: item.swatch }}
            />
          );
        })}
      </div>
    </fieldset>
  );
}

function QuantitySelector({ quantity, onChange }: { quantity: number; onChange: (quantity: number) => void }) {
  return (
    <fieldset className="mt-8">
      <legend className="type-eyebrow">Quantity</legend>
      <div className="mt-4 flex w-fit items-center border border-gold/30">
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center text-foreground hover:text-gold-bright"
          onClick={() => onChange(Math.max(1, quantity - 1))}
          aria-label="Decrease quantity"
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
          aria-label="Increase quantity"
        >
          <Plus strokeWidth={1.25} size={16} />
        </button>
      </div>
    </fieldset>
  );
}

function IngredientBreakdown({ ingredients }: { ingredients: ProductPageData["ingredients"] }) {
  return (
    <section className="mt-16 border-t border-gold/20 pt-12 md:mt-20">
      <p className="type-eyebrow">Formula</p>
      <h2 className="type-headline mt-4">Key Ingredients & Benefits</h2>
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
        className="flex w-full items-center gap-4 border border-gold/25 bg-card px-4 py-4 text-left"
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
          className={`inline-flex size-11 shrink-0 items-center justify-center border border-[#D4AF37] text-[#E5C158] ${open ? "lux-tip" : ""}`}
        >
          <Icon strokeWidth={1.25} size={18} />
        </span>
        <span className="type-title text-[1.35rem]">{name}</span>
      </button>
      {open ? (
        <p
          id={tipId}
          role="tooltip"
          className="type-body absolute bottom-[calc(100%+0.75rem)] left-0 z-20 w-full border border-[#E5C158] bg-[#1A1A1A] px-4 py-3 text-[#F8F8F8] shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          {benefit}
        </p>
      ) : null}
    </div>
  );
}

