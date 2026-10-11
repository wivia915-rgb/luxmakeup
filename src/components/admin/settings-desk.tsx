"use client";

import { saveStoreSettings } from "@/app/actions/store-settings";
import type { StoreSettings } from "@/lib/store-settings";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

const fieldClass =
  "mt-2 w-full border border-gold/30 bg-[#0a0a0a] px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-[#E5C158]";

export function SettingsDesk({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [announcement, setAnnouncement] = useState(settings.announcement);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(String(settings.freeShippingThreshold));
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [notice, setNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveStoreSettings({
        announcement,
        freeShippingThreshold,
        whatsapp,
        supportEmail,
        maintenanceMode,
      });
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
      <p className="type-body mt-4 max-w-xl">The banner, delivery, and the way clients reach the atelier.</p>

      {!settings.connected ? (
        <p className="type-body mt-6 max-w-xl">The house is waiting for the database. Connect PostgreSQL, then these settings will keep.</p>
      ) : null}

      <form onSubmit={save} className="mt-8 max-w-2xl border border-gold/25 bg-[#0a0a0a] px-5 py-6 md:px-6">
        <label className="block">
          <span className="type-eyebrow">Announcement banner</span>
          <textarea
            value={announcement}
            onChange={(event) => {
              setAnnouncement(event.target.value);
              setSaved(false);
            }}
            rows={3}
            placeholder="Private clientele · Complimentary engraving on parfum"
            className={`${fieldClass} resize-y`}
          />
          <span className="type-caption mt-2 block">Shown above the house. Leave it empty to keep the translated line.</span>
        </label>

        <label className="mt-6 block">
          <span className="type-eyebrow">Free shipping threshold (DH)</span>
          <input
            value={freeShippingThreshold}
            inputMode="numeric"
            onChange={(event) => {
              setFreeShippingThreshold(event.target.value);
              setSaved(false);
            }}
            placeholder="0"
            className={fieldClass}
          />
          <span className="type-caption mt-2 block">0 keeps free delivery in Fès and 35 DH elsewhere. Any other amount makes delivery free once the pieces reach it.</span>
        </label>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="type-eyebrow">WhatsApp</span>
            <input
              value={whatsapp}
              inputMode="tel"
              onChange={(event) => {
                setWhatsapp(event.target.value);
                setSaved(false);
              }}
              placeholder="212612345678"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="type-eyebrow">Support email</span>
            <input
              type="email"
              value={supportEmail}
              onChange={(event) => {
                setSupportEmail(event.target.value);
                setSaved(false);
              }}
              placeholder="atelier@luxmakeup.com"
              className={fieldClass}
            />
          </label>
        </div>

        <label className="mt-6 flex items-start gap-3 border border-gold/20 px-4 py-4">
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(event) => {
              setMaintenanceMode(event.target.checked);
              setSaved(false);
            }}
            className="mt-0.5 accent-[#D4AF37]"
          />
          <span>
            <span className="type-eyebrow">Maintenance mode</span>
            <span className="type-caption mt-2 block">The storefront closes. The desk stays open.</span>
          </span>
        </label>

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
