"use client";

import { generateAgentPrompt, saveAgentSettings } from "@/app/actions/atelier-agent";
import { useAdminCopy, useDeskError } from "@/components/admin/admin-locale";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

const fieldClass =
  "mt-2 w-full border border-gold/30 bg-card px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-gold-bright";

export function AgentDesk({ prompt, enabled, connected }: { prompt: string; enabled: boolean; connected: boolean }) {
  const router = useRouter();
  const copy = useAdminCopy().agent;
  const explain = useDeskError();
  const [draft, setDraft] = useState(prompt);
  const [shown, setShown] = useState(enabled);
  const [notice, setNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, startSave] = useTransition();
  const [writing, startWrite] = useTransition();

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setSaved(false);
    startSave(async () => {
      const result = await saveAgentSettings({ prompt: draft, enabled: shown });
      if (!result.ok) {
        setNotice(explain(result.error));
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  function writePrompt() {
    setNotice(null);
    setSaved(false);
    startWrite(async () => {
      const result = await generateAgentPrompt();
      if (!result.ok) {
        setNotice(explain(result.error));
        return;
      }
      setDraft(result.prompt);
    });
  }

  return (
    <div className="bg-card px-5 py-8 md:px-8 md:py-10">
      <p className="type-eyebrow">{copy.eyebrow}</p>
      <h1 className="type-headline mt-3">{copy.title}</h1>
      <p className="type-body mt-4 max-w-xl">{copy.lead}</p>
      {!connected ? <p className="type-body mt-6 max-w-xl">{copy.waiting}</p> : null}

      <form onSubmit={save} className="mt-8 max-w-3xl">
        <label className="block">
          <span className="type-eyebrow">{copy.prompt}</span>
          <textarea value={draft} onChange={(event) => { setDraft(event.target.value); setSaved(false); }} rows={14} maxLength={4000} className={fieldClass} />
        </label>
        <button type="button" onClick={writePrompt} disabled={writing} className="type-nav mt-4 border border-gold-bright px-5 py-3 text-gold-bright disabled:opacity-50">
          {writing ? copy.generating : copy.generate}
        </button>
        <label className="mt-6 flex items-center gap-3">
          <input type="checkbox" checked={shown} onChange={(event) => { setShown(event.target.checked); setSaved(false); }} className="size-4 accent-[#E2187A]" />
          <span className="type-body">{copy.enabled}</span>
        </label>
        {notice ? <p className="type-body mt-4 text-gold-bright">{notice}</p> : null}
        {saved ? <p className="type-body mt-4">{copy.saved}</p> : null}
        <button type="submit" disabled={saving} className="type-nav mt-6 bg-[#E2187A] px-6 py-3 text-white disabled:opacity-50">
          {saving ? copy.saving : copy.save}
        </button>
      </form>
    </div>
  );
}
