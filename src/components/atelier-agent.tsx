"use client";

import { askAtelierAgent } from "@/app/actions/atelier-agent";
import type { Dictionary } from "@/lib/messages";
import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";

type Turn = { role: "user" | "assistant"; content: string };

export function AtelierAgent({ copy, ready }: { copy: Dictionary["agent"]; ready: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Turn[]>([]);
  const hidden = !ready || pathname.startsWith("/admin");
  const product = pathname.startsWith("/product/");

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    const history = [...messages, { role: "user" as const, content }];
    setMessages(history);
    setDraft("");
    setSending(true);
    const result = await askAtelierAgent({ messages: history });
    setSending(false);
    if (!result.ok) {
      setMessages((current) => [...current, { role: "assistant", content: copy.error }]);
      return;
    }
    setMessages((current) => [...current, { role: "assistant", content: result.reply }]);
  }

  if (hidden) return null;

  return (
    <div className={`fixed end-5 z-50 flex flex-col items-end gap-3 ${product ? "bottom-[11.5rem] md:bottom-24" : "bottom-24"}`}>
      {open ? (
        <section className="flex max-h-[min(28rem,calc(100svh-14rem))] w-[min(22rem,calc(100vw-2.5rem))] flex-col border border-gold/40 bg-card shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
          <header className="flex items-center justify-between gap-3 border-b border-gold/20 px-4 py-3">
            <p className="font-serif text-2xl text-foreground">{copy.title}</p>
            <button type="button" className="type-caption text-gold-bright" onClick={() => setOpen(false)}>
              {copy.close}
            </button>
          </header>
          <div className="flex min-h-40 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? <p className="type-body text-foreground/70">{copy.placeholder}</p> : null}
            {messages.map((message, index) => (
              <p
                key={`${message.role}-${index}`}
                className={`type-body max-w-[90%] px-3 py-2 ${message.role === "user" ? "self-end border border-gold/30 text-foreground" : "self-start text-foreground/85"}`}
              >
                {message.content}
              </p>
            ))}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-gold/20 p-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={copy.placeholder}
              maxLength={500}
              className="min-w-0 flex-1 border border-gold/30 bg-background px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-gold-bright"
            />
            <button type="submit" disabled={sending || draft.trim().length === 0} className="type-nav bg-[#D4AF37] px-4 py-3 text-[#0D0D0D] disabled:opacity-50">
              {sending ? copy.sending : copy.send}
            </button>
          </form>
        </section>
      ) : null}
      <button
        type="button"
        aria-label={open ? copy.close : copy.open}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="grid size-14 place-items-center rounded-full border border-gold-bright bg-[#0D0D0D] text-[#E5C158] shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-transform hover:scale-105"
      >
        <Sparkles strokeWidth={1.25} size={22} />
      </button>
    </div>
  );
}
