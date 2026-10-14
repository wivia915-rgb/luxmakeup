import { MetaPixel } from "@/components/meta-pixel";
import { AtelierAgent } from "@/components/atelier-agent";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { StoreGate } from "@/components/store-gate";
import { cormorant, cormorantItalic, cormorantMedium, naskh, outfit, outfitLight } from "@/lib/fonts";
import { shippingRatesFrom } from "@/lib/cod";
import { getLocale } from "@/lib/get-locale";
import { getTheme } from "@/lib/get-theme";
import { messages } from "@/lib/messages";
import { getProductPage } from "@/lib/product-story";
import { products } from "@/lib/products";
import { getStorefrontPieces } from "@/lib/storefront-catalog";
import { siteUrl } from "@/lib/site";
import { announcementFor, getStoreSettings } from "@/lib/store-settings";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const description = "El Idrissi Parfumeur. Makeup, perfume, and beauty, composed in black, white, and lotus pink.";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "El Idrissi",
    template: "%s · El Idrissi",
  },
  description,
  applicationName: "El Idrissi",
  openGraph: {
    type: "website",
    siteName: "El Idrissi",
    locale: "en_MA",
    title: "El Idrissi",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "El Idrissi",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [locale, theme] = await Promise.all([getLocale(), getTheme()]);
  const copy = messages[locale];
  const [settings, stored] = await Promise.all([getStoreSettings(), getStorefrontPieces(locale)]);
  const source = stored.length > 0 ? stored : products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: "",
    shadeId: getProductPage(product.id)?.shades[0]?.id ?? "atelier",
  }));
  const pieces = source.map((piece) => ({
    id: piece.id,
    name: piece.name,
    price: piece.price,
    image: piece.image,
    shadeId: piece.shadeId,
  }));

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-theme={theme}
      className={`${outfit.variable} ${outfitLight.variable} ${cormorant.variable} ${cormorantItalic.variable} ${cormorantMedium.variable} ${naskh.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <MetaPixel facebookId={settings.facebookPixelId} tiktokId={settings.tiktokPixelId} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-gold focus:px-4 focus:py-2 focus:text-background"
        >
          {copy.skip}
        </a>
        <div className="mx-auto min-h-screen xl:max-w-[90rem] xl:border-x xl:border-gold/20">
          <SiteHeader
            locale={locale}
            theme={theme}
            copy={copy}
            banner={announcementFor(settings, locale)}
            whatsapp={settings.whatsapp}
            email={settings.supportEmail}
            pieces={pieces}
            shippingRates={shippingRatesFrom(settings)}
          />
          <StoreGate
            maintenance={settings.maintenanceMode}
            locale={locale}
            whatsapp={settings.whatsapp}
            email={settings.supportEmail}
          >
            {children}
          </StoreGate>
          <SiteFooter copy={copy} />
        </div>
        <WhatsAppButton label={copy.whatsappFloat} />
        <AtelierAgent copy={copy.agent} ready={settings.agentEnabled && settings.agentPrompt.trim().length > 0} />
      </body>
    </html>
  );
}
