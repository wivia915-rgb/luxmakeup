import { storeWhatsAppUrl } from "@/lib/store-contact";
import type { LegalDocument } from "@/lib/legal";
import Link from "next/link";

export function LegalDocumentView({
  page,
  email,
  whatsapp,
}: {
  page: LegalDocument;
  email: string;
  whatsapp: string;
}) {
  const whatsappUrl = storeWhatsAppUrl(whatsapp);

  return (
    <main id="main" className="px-5 py-16 md:px-10 md:py-24">
      <p className="type-caption">
        <Link href="/" className="text-gold-bright hover:text-foreground">
          El Idrissi
        </Link>
      </p>
      <p className="type-eyebrow mt-8">{page.eyebrow}</p>
      <h1 className="type-headline mt-4 max-w-3xl">{page.title}</h1>
      <p className="type-lead mt-6 max-w-2xl">{page.lead}</p>
      {whatsappUrl || email ? (
        <p className="type-caption mt-8 flex flex-wrap gap-x-5 gap-y-2">
          {whatsappUrl ? (
            <a href={whatsappUrl} className="type-nav border border-gold-bright px-4 py-3 text-gold-bright hover:text-foreground">
              WhatsApp
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className="type-caption border border-gold/40 px-4 py-3 text-gold-bright hover:text-foreground">
              {email}
            </a>
          ) : null}
        </p>
      ) : null}
      <div className="mt-12 max-w-3xl space-y-10">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="type-title">{section.heading}</h2>
            <p className="type-body mt-4">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
