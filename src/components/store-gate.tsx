"use client";

import { storeWhatsAppUrl } from "@/lib/store-contact";
import type { Locale } from "@/lib/locale";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const closedCopy = {
  en: {
    eyebrow: "Atelier",
    title: "The house is closed",
    body: "The collection is being prepared. Please return shortly.",
  },
  fr: {
    eyebrow: "Atelier",
    title: "La maison est fermée",
    body: "La collection se prépare. Revenez dans un instant.",
  },
  ar: {
    eyebrow: "الدار",
    title: "الدار مغلقة",
    body: "المجموعة قيد التهيئة. عودوا بعد قليل.",
  },
} as const;

export function StoreGate({
  maintenance,
  locale,
  whatsapp,
  email,
  children,
}: {
  maintenance: boolean;
  locale: Locale;
  whatsapp: string;
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (!maintenance || pathname.startsWith("/admin") || pathname === "/terms" || pathname === "/usage" || pathname === "/about" || pathname === "/contact") return children;

  const copy = closedCopy[locale];
  const whatsappUrl = storeWhatsAppUrl(whatsapp);

  return (
    <main id="main" className="px-5 py-24 md:px-10 md:py-32">
      <p className="type-eyebrow">{copy.eyebrow}</p>
      <h1 className="type-headline mt-4 max-w-xl">{copy.title}</h1>
      <p className="type-body mt-6 max-w-md">{copy.body}</p>
      {whatsappUrl || email ? (
        <p className="type-caption mt-8 flex flex-wrap gap-x-5 gap-y-2">
          {whatsappUrl ? (
            <a href={whatsappUrl} className="text-gold-bright hover:text-foreground">
              WhatsApp
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className="text-gold-bright hover:text-foreground">
              {email}
            </a>
          ) : null}
        </p>
      ) : null}
    </main>
  );
}
