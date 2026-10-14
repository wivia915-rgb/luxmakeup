import { agentBrief } from "@/lib/agent-brief";
import { getLocale } from "@/lib/get-locale";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

type Turn = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { messages?: Turn[] } | null;
  const messages = cleanTurns(body?.messages ?? []);
  const last = messages.at(-1);
  if (!last || last.role !== "user") return new Response(null, { status: 400 });

  const locale = await getLocale();
  const brief = await agentBrief(locale);
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!brief.prompt || !key) return new Response(null, { status: 503 });

  const language = locale === "ar" ? "Arabic" : locale === "fr" ? "French" : "English";
  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4.1-nano",
      temperature: 0.2,
      max_tokens: 120,
      stream: true,
      messages: [
        {
          role: "system",
          content: `${brief.prompt}\nAnswer in the visitor's language (${language}), in at most two short sentences. Prices are whole DH and only these pieces. Cash on delivery. No medical claims.\n${brief.catalog || "No pieces are listed."}`,
        },
        ...messages,
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!upstream.ok || !upstream.body) return new Response(null, { status: 502 });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let sent = 0;
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";
      try {
        while (sent < 500) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const token = tokenFrom(line);
            if (!token) continue;
            const room = 500 - sent;
            const piece = token.slice(0, room);
            sent += piece.length;
            controller.enqueue(encoder.encode(piece));
            if (sent >= 500) break;
          }
        }
      } catch (error) {
        console.error("Agent stream stopped", error instanceof Error ? error.name : "unknown");
      } finally {
        reader.cancel().catch(() => undefined);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function tokenFrom(line: string) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return "";
  const data = trimmed.slice(5).trim();
  if (!data || data === "[DONE]") return "";
  try {
    const payload = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
    return payload.choices?.[0]?.delta?.content ?? "";
  } catch {
    return "";
  }
}

function cleanTurns(messages: Turn[]) {
  const turns: Turn[] = [];
  for (const message of messages.slice(-4)) {
    if (!message || (message.role !== "user" && message.role !== "assistant")) continue;
    const content = String(message.content ?? "").trim().replace(/\s+/g, " ").slice(0, 240);
    if (!content) continue;
    turns.push({ role: message.role, content });
  }
  return turns;
}
