import { LegalDocumentView } from "@/components/legal-document";
import { getLocale } from "@/lib/get-locale";
import { legalDocument } from "@/lib/legal";
import { getStoreSettings } from "@/lib/store-settings";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = legalDocument(await getLocale(), "terms");
  return { title: page.title, description: page.lead };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const settings = await getStoreSettings();
  return <LegalDocumentView page={legalDocument(locale, "terms")} email={settings.supportEmail} whatsapp={settings.whatsapp} />;
}
