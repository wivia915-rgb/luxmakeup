import { ProductsDesk } from "@/components/admin/products-desk";
import { getProductDesk } from "@/lib/admin-catalog";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description: "Lux Makeup collection on the atelier desk.",
};

export default async function AdminProductsPage() {
  const desk = await getProductDesk();

  return (
    <main id="main">
      <ProductsDesk connected={desk.connected} products={desk.products} />
    </main>
  );
}
