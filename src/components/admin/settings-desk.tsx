"use client";

import { saveStoreSettings } from "@/app/actions/store-settings";
import type { StoreSettings, StoreSettingsInput } from "@/lib/store-settings";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

const fieldClass =
  "mt-2 w-full border border-gold/30 bg-[#0a0a0a] px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-[#E5C158]";

const tabs = [
  { id: "general", label: "General & Banners" },
  { id: "shipping", label: "Shipping & Delivery" },
  { id: "marketing", label: "Marketing & Pixels" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type Draft = StoreSettingsInput;

export function SettingsDesk({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("general");
  const [draft, setDraft] = useState<Draft>(() => ({
    announcementAr: settings.announcementAr,
    announcementFr: settings.announcementFr,
    announcementEn: settings.announcementEn || settings.announcement,
    freeShippingThreshold: String(settings.freeShippingThreshold),
    localShippingFee: String(settings.localShippingFee),
    standardShippingFee: String(settings.standardShippingFee),
    remoteShippingFee: String(settings.remoteShippingFee),
    whatsapp: settings.whatsapp,
    supportEmail: settings.supportEmail,
    facebookPixelId: settings.facebookPixelId,
    tiktokPixelId: settings.tiktokPixelId,
    maintenanceMode: settings.maintenanceMode,
  }));
  const [notice, setNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveStoreSettings(draft);
      if (!result.ok) {
        setNotice(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="bg-[#0a0a0a] px-5 py-8 md:px-8 md:py-10">
      <p className="type-eyebrow">House</p>
      <h1 className="type-headline mt-3">Settings</h1>
      <p className="type-body mt-4 max-w-xl">Banners, delivery, and the pixels that watch the house.</p>

      {!settings.connected ? (
        <p className="type-body mt-6 max-w-xl">The house is waiting for the database. Connect PostgreSQL, then these settings will keep.</p>
      ) : null}

      <form onSubmit={save} className="mt-8 max-w-3xl">
        <div role="tablist" aria-label="Settings" className="flex flex-wrap gap-2">
          {tabs.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={`type-nav border px-4 py-3 ${selected ? "border-[#E5C158] text-[#E5C158]" : "border-gold/25 text-foreground/70 hover:border-gold/50"}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <section hidden={tab !== "general"} className="mt-4 border border-gold/25 bg-[#0a0a0a] px-5 py-6 md:px-6">
          <h2 className="font-serif text-3xl tracking-[-0.03em] text-[#E5C158]">General & Banners</h2>
          <p className="type-caption mt-2">Each language has its own line above the house. An empty line keeps the built-in translation.</p>
          <div className="mt-6 grid gap-5">
            <BannerField
              label="Arabic banner"
              value={draft.announcementAr}
              placeholder="لزبائن الدار · نقش مجاني على العطر"
              onChange={(value) => setField("announcementAr", value)}
            />
            <BannerField
              label="French banner"
              value={draft.announcementFr}
              placeholder="Clientèle privée · Gravure offerte sur le parfum"
              onChange={(value) => setField("announcementFr", value)}
            />
            <BannerField
              label="English banner"
              value={draft.announcementEn}
              placeholder="Private clientele · Complimentary engraving on parfum"
              onChange={(value) => setField("announcementEn", value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="WhatsApp" value={draft.whatsapp} placeholder="212612345678" inputMode="tel" onChange={(value) => setField("whatsapp", value)} />
              <TextField
                label="Support email"
                value={draft.supportEmail}
                placeholder="atelier@luxmakeup.com"
                type="email"
                onChange={(value) => setField("supportEmail", value)}
              />
            </div>
            <label className="flex items-start gap-3 border border-gold/20 px-4 py-4">
              <input
                type="checkbox"
                checked={draft.maintenanceMode}
                onChange={(event) => setField("maintenanceMode", event.target.checked)}
                className="mt-0.5 accent-[#D4AF37]"
              />
              <span>
                <span className="type-eyebrow">Maintenance mode</span>
                <span className="type-caption mt-2 block">The storefront closes. The desk stays open.</span>
              </span>
            </label>
          </div>
        </section>

        <section hidden={tab !== "shipping"} className="mt-4 border border-gold/25 bg-[#0a0a0a] px-5 py-6 md:px-6">
          <h2 className="font-serif text-3xl tracking-[-0.03em] text-[#E5C158]">Shipping & Delivery</h2>
          <p className="type-caption mt-2">Fès is local. Casablanca, Rabat, Marrakech, Tanger, Agadir, and the other main cities use the standard fee. The remaining cities are remote.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <TextField
              label="Fès fee (DH)"
              value={draft.localShippingFee}
              placeholder="0"
              inputMode="numeric"
              onChange={(value) => setField("localShippingFee", value)}
              hint="Local city. Default 0 DH."
            />
            <TextField
              label="Main cities (DH)"
              value={draft.standardShippingFee}
              placeholder="35"
              inputMode="numeric"
              onChange={(value) => setField("standardShippingFee", value)}
              hint="Standard fee. Default 35 DH."
            />
            <TextField
              label="Remote regions (DH)"
              value={draft.remoteShippingFee}
              placeholder="45"
              inputMode="numeric"
              onChange={(value) => setField("remoteShippingFee", value)}
              hint="Dakhla, Laâyoune, Ouarzazate, and the rest. Default 45 DH."
            />
          </div>
          <div className="mt-5 max-w-sm">
            <TextField
              label="Free shipping threshold (DH)"
              value={draft.freeShippingThreshold}
              placeholder="0"
              inputMode="numeric"
              onChange={(value) => setField("freeShippingThreshold", value)}
              hint="0 leaves the fees above in place. Any other amount makes delivery free once the pieces reach it."
            />
          </div>
        </section>

        <section hidden={tab !== "marketing"} className="mt-4 border border-gold/25 bg-[#0a0a0a] px-5 py-6 md:px-6">
          <h2 className="font-serif text-3xl tracking-[-0.03em] text-[#E5C158]">Marketing & Pixels</h2>
          <p className="type-caption mt-2">Loaded on the storefront only. The desk stays untracked.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <TextField
              label="Facebook Pixel ID"
              value={draft.facebookPixelId}
              placeholder="123456789012345"
              inputMode="numeric"
              onChange={(value) => setField("facebookPixelId", value)}
            />
            <TextField
              label="TikTok Pixel ID"
              value={draft.tiktokPixelId}
              placeholder="CTESTPIXEL1234"
              onChange={(value) => setField("tiktokPixelId", value)}
            />
          </div>
        </section>

        {notice ? (
          <p className="mt-4 text-xs tracking-wide text-[#E7B4A8]" role="alert">
            {notice}
          </p>
        ) : null}
        {saved ? <p className="type-caption mt-4 text-[#E5C158]">Saved.</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="type-nav mt-6 border border-gold-bright px-4 py-3 text-gold-bright disabled:opacity-40"
        >
          {isPending ? "Saving" : "Save settings"}
        </button>
      </form>
    </div>
  );
}

function BannerField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="type-eyebrow">{label}</span>
      <textarea value={value} rows={2} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} resize-y`} />
    </label>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
  hint,
  inputMode,
  type = "text",
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  hint?: string;
  inputMode?: "numeric" | "tel" | "text";
  type?: "text" | "email";
}) {
  return (
    <label className="block">
      <span className="type-eyebrow">{label}</span>
      <input type={type} value={value} inputMode={inputMode} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={fieldClass} />
      {hint ? <span className="type-caption mt-2 block">{hint}</span> : null}
    </label>
  );
}
