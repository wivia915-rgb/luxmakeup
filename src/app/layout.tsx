import { MetaPixel } from "@/components/meta-pixel";
import { SiteHeader } from "@/components/site-header";
import { cormorant, cormorantItalic, cormorantMedium, outfit, outfitLight } from "@/lib/fonts";
import { siteUrl } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const description =
  "Ultra-high-end makeup, perfume, and beauty. A dark maison of complexion, fragrance, and color.";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "Lux Makeup",
    template: "%s · Lux Makeup",
  },
  description,
  applicationName: "Lux Makeup",
  openGraph: {
    type: "website",
    siteName: "Lux Makeup",
    locale: "en_MA",
    title: "Lux Makeup",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Lux Makeup",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${outfitLight.variable} ${cormorant.variable} ${cormorantItalic.variable} ${cormorantMedium.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <MetaPixel />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-gold focus:px-4 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <div className="mx-auto min-h-screen xl:max-w-[90rem] xl:border-x xl:border-gold/20">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
