import { ProductEditor } from "@/components/admin/products-desk";
import { getDeskProduct } from "@/lib/admin-catalog";
import { deskIsOpen } from "@/lib/admin-gate";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Edit piece",
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await deskIsOpen())) return null;
  const { id } = await params;
  const product = await getDeskProduct(id);
  if (!product) notFound();

  return (
    <main id="main">
      <ProductEditor product={product} />
    </main>
  );
}
