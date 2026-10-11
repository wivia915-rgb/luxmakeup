import { CouponsDesk } from "@/components/admin/coupons-desk";
import { getCouponDesk } from "@/lib/admin-coupons";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Coupons",
  description: "Lux Makeup coupon book for the atelier desk.",
};

export default async function AdminCouponsPage() {
  const desk = await getCouponDesk();

  return (
    <main id="main">
      <CouponsDesk connected={desk.connected} coupons={desk.coupons} />
    </main>
  );
}
