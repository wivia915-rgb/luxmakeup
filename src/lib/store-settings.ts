import type { Locale } from "@/lib/locale";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

export type StoreSettings = {
  connected: boolean;
  announcement: string;
  announcementAr: string;
  announcementFr: string;
  announcementEn: string;
  freeShippingThreshold: number;
  localShippingFee: number;
  standardShippingFee: number;
  remoteShippingFee: number;
  whatsapp: string;
  supportEmail: string;
  facebookPixelId: string;
  tiktokPixelId: string;
  maintenanceMode: boolean;
};

export type StoreSettingsInput = {
  announcementAr: string;
  announcementFr: string;
  announcementEn: string;
  freeShippingThreshold: string;
  localShippingFee: string;
  standardShippingFee: string;
  remoteShippingFee: string;
  whatsapp: string;
  supportEmail: string;
  facebookPixelId: string;
  tiktokPixelId: string;
  maintenanceMode: boolean;
};

export const emptyStoreSettings: StoreSettings = {
  connected: false,
  announcement: "",
  announcementAr: "",
  announcementFr: "",
  announcementEn: "",
  freeShippingThreshold: 0,
  localShippingFee: 0,
  standardShippingFee: 35,
  remoteShippingFee: 45,
  whatsapp: "",
  supportEmail: "",
  facebookPixelId: "",
  tiktokPixelId: "",
  maintenanceMode: false,
};

const STORE_ID = "store";

export function announcementFor(settings: Pick<StoreSettings, "announcement" | "announcementAr" | "announcementFr" | "announcementEn">, locale: Locale) {
  if (locale === "ar") return settings.announcementAr;
  if (locale === "fr") return settings.announcementFr;
  return settings.announcementEn || settings.announcement;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  await connection();
  try {
    const row = await prisma.storeSettings.findUnique({ where: { id: STORE_ID } });
    if (!row) return { ...emptyStoreSettings, connected: true };
    return {
      connected: true,
      announcement: row.announcement,
      announcementAr: row.announcementAr,
      announcementFr: row.announcementFr,
      announcementEn: row.announcementEn,
      freeShippingThreshold: row.freeShippingThreshold,
      localShippingFee: row.localShippingFee,
      standardShippingFee: row.standardShippingFee,
      remoteShippingFee: row.remoteShippingFee,
      whatsapp: row.whatsapp,
      supportEmail: row.supportEmail,
      facebookPixelId: row.facebookPixelId,
      tiktokPixelId: row.tiktokPixelId,
      maintenanceMode: row.maintenanceMode,
    };
  } catch (error) {
    console.error("Store settings could not be loaded", error instanceof Error ? error.name : "unknown");
    return emptyStoreSettings;
  }
}

export function parseStoreSettings(
  input: StoreSettingsInput,
): { ok: true; value: Omit<StoreSettings, "connected"> } | { ok: false; error: string } {
  const announcementAr = cleanBanner(input.announcementAr);
  const announcementFr = cleanBanner(input.announcementFr);
  const announcementEn = cleanBanner(input.announcementEn);
  if (announcementAr === null || announcementFr === null || announcementEn === null) {
    return { ok: false, error: "Keep each banner under 180 characters." };
  }

  const freeShippingThreshold = wholeDh(input.freeShippingThreshold, 100000);
  if (freeShippingThreshold === null) {
    return { ok: false, error: "Free shipping is a whole amount in DH, up to 100 000." };
  }
  const localShippingFee = wholeDh(input.localShippingFee, 9999);
  if (localShippingFee === null) {
    return { ok: false, error: "The Fès fee is a whole amount in DH, up to 9 999." };
  }
  const standardShippingFee = wholeDh(input.standardShippingFee, 9999);
  if (standardShippingFee === null) {
    return { ok: false, error: "The main-city fee is a whole amount in DH, up to 9 999." };
  }
  const remoteShippingFee = wholeDh(input.remoteShippingFee, 9999);
  if (remoteShippingFee === null) {
    return { ok: false, error: "The remote fee is a whole amount in DH, up to 9 999." };
  }

  const whatsapp = input.whatsapp.replace(/\D/g, "");
  if (whatsapp && !/^\d{8,15}$/.test(whatsapp)) {
    return { ok: false, error: "WhatsApp needs a country code and number, such as 212612345678." };
  }

  const supportEmail = input.supportEmail.trim().toLowerCase();
  if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
    return { ok: false, error: "Support email needs a valid address." };
  }
  if (supportEmail.length > 120) {
    return { ok: false, error: "Support email is too long." };
  }

  const facebookPixelId = input.facebookPixelId.trim();
  if (facebookPixelId && !/^\d{5,20}$/.test(facebookPixelId)) {
    return { ok: false, error: "Facebook Pixel ID is 5 to 20 digits." };
  }

  const tiktokPixelId = input.tiktokPixelId.trim().toUpperCase();
  if (tiktokPixelId && !/^[A-Z0-9]{8,32}$/.test(tiktokPixelId)) {
    return { ok: false, error: "TikTok Pixel ID is 8 to 32 letters and digits." };
  }

  return {
    ok: true,
    value: {
      announcement: announcementEn,
      announcementAr,
      announcementFr,
      announcementEn,
      freeShippingThreshold,
      localShippingFee,
      standardShippingFee,
      remoteShippingFee,
      whatsapp,
      supportEmail,
      facebookPixelId,
      tiktokPixelId,
      maintenanceMode: input.maintenanceMode === true,
    },
  };
}

export async function saveStoreSettingsRow(value: Omit<StoreSettings, "connected">) {
  await prisma.storeSettings.upsert({
    where: { id: STORE_ID },
    create: { id: STORE_ID, ...value },
    update: value,
  });
}

function cleanBanner(value: string) {
  const text = value.trim().replace(/\s+/g, " ");
  if (text.length > 180) return null;
  return text;
}

function wholeDh(value: string, max: number) {
  const text = value.trim();
  if (!/^\d+$/.test(text)) return null;
  const amount = Number(text);
  if (amount > max) return null;
  return amount;
}
