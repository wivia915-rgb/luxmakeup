"use client";

import { saveStoreSettings } from "@/app/actions/store-settings";
import { useAdminCopy, useDeskError } from "@/components/admin/admin-locale";
import type { StoreSettings, StoreSettingsInput } from "@/lib/store-settings";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

const fieldClass =
  "mt-2 w-full border border-gold/30 bg-card px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-gold-bright";

const tabIds = ["general", "shipping", "marketing"] as const;

type TabId = (typeof tabIds)[number];

type Draft = StoreSettingsInput;

export function SettingsDesk({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const copy = useAdminCopy().settings;
  const explain = useDeskError();
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
        setNotice(explain(result.error));
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="bg-card px-5 py-8 md:px-8 md:py-10">
      <p className="type-eyebrow">{copy.eyebrow}</p>
      <h1 className="type-headline mt-3">{copy.title}</h1>
      <p className="type-body mt-4 max-w-xl">{copy.lead}</p>

      {!settings.connected ? (
        <p className="type-body mt-6 max-w-xl">{copy.waiting}</p>
      ) : null}

      <form onSubmit={save} className="mt-8 max-w-3xl">
        <div role="tablist" aria-label={copy.tabs} className="flex flex-wrap gap-2">
          {tabIds.map((id) => {
            const selected = tab === id;
            const label = id === "general" ? copy.general : id === "shipping" ? copy.shipping : copy.marketing;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(id)}
                className={`type-nav border px-4 py-3 ${selected ? "border-gold-bright text-gold-bright" : "border-gold/25 text-foreground/70 hover:border-gold/50"}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <section hidden={tab !== "general"} className="mt-4 border border-gold/25 bg-card px-5 py-6 md:px-6">
          <h2 className="font-serif text-3xl tracking-[-0.03em] text-gold-bright">{copy.general}</h2>
          <p className="type-caption mt-2">{copy.bannerLead}</p>
          <div className="mt-6 grid gap-5">
            <BannerField
              label={copy.bannerAr}
              value={draft.announcementAr}
              placeholder="لزبائن الدار · نقش مجاني على العطر"
              onChange={(value) => setField("announcementAr", value)}
            />
            <BannerField
              label={copy.bannerFr}
              value={draft.announcementFr}
              placeholder="Clientèle privée · Gravure offerte sur le parfum"
              onChange={(value) => setField("announcementFr", value)}
            />
            <BannerField
              label={copy.bannerEn}
              value={draft.announcementEn}
              placeholder="Private clientele · Complimentary engraving on parfum"
              onChange={(value) => setField("announcementEn", value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label={copy.whatsapp} value={draft.whatsapp} placeholder="212612345678" inputMode="tel" onChange={(value) => setField("whatsapp", value)} />
              <TextField
                label={copy.email}
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
                <span className="type-eyebrow">{copy.maintenance}</span>
                <span className="type-caption mt-2 block">{copy.maintenanceBody}</span>
              </span>
            </label>
          </div>
        </section>

        <section hidden={tab !== "shipping"} className="mt-4 border border-gold/25 bg-card px-5 py-6 md:px-6">
          <h2 className="font-serif text-3xl tracking-[-0.03em] text-gold-bright">{copy.shipping}</h2>
          <p className="type-caption mt-2">{copy.shippingLead}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <TextField
              label={copy.fes}
              value={draft.localShippingFee}
              placeholder="0"
              inputMode="numeric"
              onChange={(value) => setField("localShippingFee", value)}
              hint={copy.fesHint}
            />
            <TextField
              label={copy.main}
              value={draft.standardShippingFee}
              placeholder="35"
              inputMode="numeric"
              onChange={(value) => setField("standardShippingFee", value)}
              hint={copy.mainHint}
            />
            <TextField
              label={copy.remote}
              value={draft.remoteShippingFee}
              placeholder="45"
              inputMode="numeric"
              onChange={(value) => setField("remoteShippingFee", value)}
              hint={copy.remoteHint}
            />
          </div>
          <div className="mt-5 max-w-sm">
            <TextField
              label={copy.threshold}
              value={draft.freeShippingThreshold}
              placeholder="0"
              inputMode="numeric"
              onChange={(value) => setField("freeShippingThreshold", value)}
              hint={copy.thresholdHint}
            />
          </div>
        </section>

        <section hidden={tab !== "marketing"} className="mt-4 border border-gold/25 bg-card px-5 py-6 md:px-6">
          <h2 className="font-serif text-3xl tracking-[-0.03em] text-gold-bright">{copy.marketing}</h2>
          <p className="type-caption mt-2">{copy.pixelsLead}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <TextField
              label={copy.facebook}
              value={draft.facebookPixelId}
              placeholder="123456789012345"
              inputMode="numeric"
              onChange={(value) => setField("facebookPixelId", value)}
            />
            <TextField
              label={copy.tiktok}
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
        {saved ? <p className="type-caption mt-4 text-gold-bright">{copy.saved}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="type-nav mt-6 border border-gold-bright px-4 py-3 text-gold-bright disabled:opacity-40"
        >
          {isPending ? copy.saving : copy.save}
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
