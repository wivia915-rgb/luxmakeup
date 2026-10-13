import { ProductsDesk } from "@/components/admin/products-desk";
import { getProductDesk } from "@/lib/admin-catalog";
import { deskIsOpen } from "@/lib/admin-gate";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Products",
  description: "Lux Makeup collection on the atelier desk, with shades, sizes, and stock.",
};

export default async function AdminProductsPage() {
  if (!(await deskIsOpen())) return null;
  const desk = await getProductDesk();

  return (
    <main id="main">
      <ProductsDesk connected={desk.connected} products={desk.products} />
    </main>
  );
}
