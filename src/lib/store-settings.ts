import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

export type StoreSettings = {
  connected: boolean;
  announcement: string;
  freeShippingThreshold: number;
  whatsapp: string;
  supportEmail: string;
  maintenanceMode: boolean;
};

export type StoreSettingsInput = {
  announcement: string;
  freeShippingThreshold: string;
  whatsapp: string;
  supportEmail: string;
  maintenanceMode: boolean;
};

export const emptyStoreSettings: StoreSettings = {
  connected: false,
  announcement: "",
  freeShippingThreshold: 0,
  whatsapp: "",
  supportEmail: "",
  maintenanceMode: false,
};

const STORE_ID = "store";

export async function getStoreSettings(): Promise<StoreSettings> {
  await connection();
  try {
    const row = await prisma.storeSettings.findUnique({ where: { id: STORE_ID } });
    if (!row) return { ...emptyStoreSettings, connected: true };
    return {
      connected: true,
      announcement: row.announcement,
      freeShippingThreshold: row.freeShippingThreshold,
      whatsapp: row.whatsapp,
      supportEmail: row.supportEmail,
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
  const announcement = input.announcement.trim().replace(/\s+/g, " ");
  if (announcement.length > 180) {
    return { ok: false, error: "Keep the banner under 180 characters." };
  }

  const thresholdText = input.freeShippingThreshold.trim();
  if (!/^\d+$/.test(thresholdText)) {
    return { ok: false, error: "Free shipping is a whole amount in DH." };
  }
  const freeShippingThreshold = Number(thresholdText);
  if (freeShippingThreshold > 100000) {
    return { ok: false, error: "Free shipping cannot pass 100 000 DH." };
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

  return {
    ok: true,
    value: {
      announcement,
      freeShippingThreshold,
      whatsapp,
      supportEmail,
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
