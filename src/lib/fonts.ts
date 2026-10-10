import { Cormorant_Garamond, Outfit } from "next/font/google";

/** Editorial serif for headlines. Preloaded because it paints the hero. */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

/** Italic companion for the hero line and editorial quotes. */
export const cormorantItalic = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-cormorant-italic",
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

/** Medium serif for product titles below the first screen. */
export const cormorantMedium = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "500",
  style: "normal",
  variable: "--font-cormorant-medium",
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

/** Geometric sans for navigation, body, and labels. */
export const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-outfit",
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

/** Light sans for introductory copy below the fold. */
export const outfitLight = Outfit({
  subsets: ["latin"],
  weight: "300",
  style: "normal",
  variable: "--font-outfit-light",
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});
