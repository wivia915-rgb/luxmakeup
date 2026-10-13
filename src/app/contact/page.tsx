import { LegalDocumentView } from "@/components/legal-document";
import { getLocale } from "@/lib/get-locale";
import { legalDocument } from "@/lib/legal";
import { getStoreSettings } from "@/lib/store-settings";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = legalDocument(await getLocale(), "contact");
  return { title: page.title, description: page.lead };
}

export default async function ContactPage() {
  const locale = await getLocale();
  const settings = await getStoreSettings();
  return <LegalDocumentView page={legalDocument(locale, "contact")} email={settings.supportEmail} whatsapp={settings.whatsapp} />;
}
