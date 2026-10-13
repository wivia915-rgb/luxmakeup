import { CouponsDesk } from "@/components/admin/coupons-desk";
import { getCouponDesk } from "@/lib/admin-coupons";
import { deskIsOpen } from "@/lib/admin-gate";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Coupons",
  description: "Lux Makeup coupon book for the atelier desk.",
};

export default async function AdminCouponsPage() {
  if (!(await deskIsOpen())) return null;
  const desk = await getCouponDesk();

  return (
    <main id="main">
      <CouponsDesk connected={desk.connected} coupons={desk.coupons} />
    </main>
  );
}
