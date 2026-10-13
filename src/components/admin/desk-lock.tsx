"use client";

import { lockDesk, unlockDesk } from "@/app/actions/admin-gate";
import { useAdminCopy, useDeskError } from "@/components/admin/admin-locale";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

export function DeskLock() {
  const copy = useAdminCopy().gate;
  const explain = useDeskError();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    startTransition(async () => {
      const result = await unlockDesk(code);
      if (!result.ok) {
        setNotice(explain(result.error));
        return;
      }
      setCode("");
      router.refresh();
    });
  }

  return (
    <main className="grid min-h-[calc(100svh-5.5rem)] place-items-center bg-card px-5 py-16">
      <form onSubmit={submit} className="w-full max-w-md border border-gold/30 bg-card px-6 py-8 sm:px-8">
        <p className="type-eyebrow">{copy.eyebrow}</p>
        <h1 className="mt-3 font-serif text-4xl text-foreground">{copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-foreground/70">{copy.lead}</p>
        <label className="mt-8 block">
          <span className="type-eyebrow">{copy.field}</span>
          <input
            type="password"
            name="code"
            autoComplete="current-password"
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="mt-2 w-full border border-gold/30 bg-background px-3 py-3 text-sm text-foreground outline-none focus:border-gold-bright"
          />
        </label>
        {notice ? (
          <p className="mt-3 text-xs tracking-wide text-[#E7B4A8]" role="alert">
            {notice}
          </p>
        ) : null}
        <button type="submit" disabled={pending || code.trim().length === 0} className="type-nav mt-6 border border-gold-bright px-4 py-3 text-gold-bright disabled:opacity-40">
          {pending ? copy.opening : copy.enter}
        </button>
      </form>
    </main>
  );
}

export function DeskLockButton() {
  const copy = useAdminCopy().gate;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await lockDesk();
          router.refresh();
        });
      }}
      className="type-nav text-start text-foreground/50 hover:text-gold-bright disabled:opacity-40"
    >
      {copy.lock}
    </button>
  );
}
