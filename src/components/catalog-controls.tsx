"use client";

import type { CodDrawerProps } from "@/components/cod-drawer";
import { pieceCount, type Dictionary } from "@/lib/messages";
import { categories, categoryFromHash, hashForCategory, moods, type Category, type Mood } from "@/lib/products";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";

const chip =
  "type-nav border px-4 py-3 text-foreground/80 transition-colors hover:border-gold-bright hover:text-gold-bright";

export function CatalogControls({ total, copy, freeShippingThreshold = 0 }: { total: number; copy: Dictionary; freeShippingThreshold?: number }) {
  const [category, setCategory] = useState<Category>("All");
  const [mood, setMood] = useState<Mood>("All");
  const [shown, setShown] = useState(total);
  const [Drawer, setDrawer] = useState<ComponentType<CodDrawerProps> | null>(null);
  const [line, setLine] = useState<CodDrawerProps["line"] | null>(null);

  useEffect(() => {
    const applyHash = () => {
      const next = categoryFromHash(window.location.hash);
      if (next) setCategory(next);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    const pieces = document.querySelectorAll<HTMLElement>("[data-piece]");
    let count = 0;
    pieces.forEach((piece) => {
      const categoryOk =
        category === "All" ||
        (category === "Special Offers" ? piece.dataset.offer === "true" : piece.dataset.category === category);
      const moodsOnPiece = piece.dataset.moods?.split("|") ?? [];
      const moodOk = mood === "All" || moodsOnPiece.includes(mood);
      const visible = categoryOk && moodOk;
      piece.hidden = !visible;
      if (visible) count += 1;
    });
    setShown(count);
  }, [category, mood]);

  useEffect(() => {
    const section = document.getElementById("edit");
    if (!section) return;

    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-order]");
      if (!button) return;
      const productId = button.dataset.order ?? "";
      if (!productId) return;
      setLine({
        productId,
        shadeId: button.dataset.shade ?? "",
        quantity: 1,
        name: button.dataset.name ?? "",
        detail: `${button.dataset.badge ?? ""} · ×1`,
        merchandise: Number(button.dataset.price ?? 0),
      });
      void import("@/components/cod-drawer").then((mod) => setDrawer(() => mod.CodDrawer));
    };

    section.addEventListener("click", onClick);
    return () => section.removeEventListener("click", onClick);
  }, []);

  function selectCategory(next: Category) {
    setCategory(next);
    const hash = hashForCategory(next);
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }

  const countLabel = pieceCount(copy.catalog, shown);

  return (
    <>
      <div className="flex flex-col gap-8 border-y border-gold/20 py-8">
        <FilterGroup legend={copy.catalog.categories}>
          {categories.map((item) => (
            <FilterChip
              key={item}
              id={
                item === "Makeup"
                  ? "makeup"
                  : item === "Parfums"
                    ? "parfums"
                    : item === "Skin Care"
                      ? "skin-care"
                      : item === "Special Offers"
                        ? "offers"
                        : undefined
              }
              pressed={category === item}
              onClick={() => selectCategory(item)}
            >
              {copy.category[item]}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup legend={copy.catalog.moods}>
          {moods.map((item) => (
            <FilterChip key={item} pressed={mood === item} onClick={() => setMood(item)}>
              {item === "All" ? copy.catalog.allLooks : copy.mood[item]}
            </FilterChip>
          ))}
        </FilterGroup>
      </div>

      <p className="type-caption mt-8" aria-live="polite">
        {countLabel}
      </p>

      {shown === 0 ? (
        <div className="mt-8 border border-gold/20 bg-card px-6 py-12 text-center">
          <p className="type-title">{copy.catalog.emptyTitle}</p>
          <p className="type-body mx-auto mt-3 max-w-md">{copy.catalog.emptyBody}</p>
          <button
            type="button"
            className={`${chip} mt-8 border-gold text-gold-bright`}
            onClick={() => {
              selectCategory("All");
              setMood("All");
            }}
          >
            {copy.catalog.showAll}
          </button>
        </div>
      ) : null}

      {Drawer && line ? <Drawer open onClose={() => setLine(null)} line={line} freeShippingThreshold={freeShippingThreshold} /> : null}
    </>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="type-eyebrow mb-4">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function FilterChip({
  id,
  pressed,
  onClick,
  children,
}: {
  id?: string;
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`${chip} scroll-mt-36 ${pressed ? "border-gold-bright bg-gold/10 text-gold-bright" : "border-gold/25"}`}
    >
      {children}
    </button>
  );
}
