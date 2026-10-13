import { Hero } from "@/components/hero";
import { ProductCatalog } from "@/components/product-catalog";
import { getLocale } from "@/lib/get-locale";
import { messages } from "@/lib/messages";

export default async function Home() {
  const copy = messages[await getLocale()];

  return (
    <>
      <main id="main">
        <Hero />
        <ProductCatalog />

        <section id="maison" className="scroll-mt-28 px-5 py-16 md:px-10 md:py-24">
          <div className="border border-line bg-card px-7 py-14 md:px-16 md:py-20">
            <p className="type-eyebrow">{copy.maisonEyebrow}</p>
            <blockquote className="type-quote mt-8 max-w-3xl">{copy.maisonQuote}</blockquote>
            <p className="type-body mt-8 max-w-xl">{copy.maisonBody}</p>
          </div>
        </section>
      </main>
    </>
  );
}
