"use server";

import { parseStoreSettings, saveStoreSettingsRow, type StoreSettingsInput } from "@/lib/store-settings";
import { revalidatePath } from "next/cache";

export async function saveStoreSettings(input: StoreSettingsInput) {
  const parsed = parseStoreSettings(input);
  if (!parsed.ok) return parsed;

  try {
    await saveStoreSettingsRow(parsed.value);
  } catch (error) {
    console.error("Store settings were not saved", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: "The house settings could not be saved." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true as const };
}
