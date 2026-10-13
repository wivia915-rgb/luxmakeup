import { DeskOverview } from "@/components/admin/desk-overview";
import { getAdminDesk } from "@/lib/admin-desk";
import { deskIsOpen } from "@/lib/admin-gate";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Desk",
  description: "Lux Makeup atelier desk for orders, revenue, cities, and the collection.",
};

export default async function AdminPage() {
  if (!(await deskIsOpen())) return null;
  const desk = await getAdminDesk();
  return <DeskOverview desk={desk} />;
}
