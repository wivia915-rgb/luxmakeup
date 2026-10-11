import { SettingsDesk } from "@/components/admin/settings-desk";
import { getStoreSettings } from "@/lib/store-settings";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  description: "Lux Makeup house settings for banners, delivery fees, and pixels.",
};

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <main id="main">
      <SettingsDesk settings={settings} />
    </main>
  );
}
