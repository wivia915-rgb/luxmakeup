import { Hero } from "@/components/hero";
import { ProductCatalog } from "@/components/product-catalog";

export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <ProductCatalog />

        <section id="maison" className="scroll-mt-28 px-5 py-16 md:px-10 md:py-24">
          <div className="border border-line bg-card px-7 py-14 md:px-16 md:py-20">
            <p className="type-eyebrow">The maison</p>
            <blockquote className="type-quote mt-8 max-w-3xl">
              We finish the face the way a perfumer finishes a formula — one precise note at a time.
            </blockquote>
            <p className="type-body mt-8 max-w-xl">
              Lux Makeup is an ultra-high-end house of complexion, fragrance, and color. The room stays dark so gold, pigment, and skin can speak.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-gold/20 px-5 py-10 md:px-10 md:py-14">
        <hr className="rule-gold mb-10" />
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="font-serif text-3xl tracking-[0.16em] text-foreground uppercase">Lux Makeup</p>
          <p className="type-caption max-w-xs">
            Makeup, perfume, and beauty. Composed in a dark atelier.
          </p>
        </div>
      </footer>
    </>
  );
}
