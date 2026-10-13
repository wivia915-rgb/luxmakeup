import { ProductEditor } from "@/components/admin/products-desk";
import { deskIsOpen } from "@/lib/admin-gate";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "New piece",
};

export default async function NewProductPage() {
  if (!(await deskIsOpen())) return null;
  return (
    <main id="main">
      <ProductEditor product={null} />
    </main>
  );
}
