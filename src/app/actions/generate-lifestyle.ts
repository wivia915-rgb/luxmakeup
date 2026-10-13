"use server";

import { isLifestylePerson, lifestylePrompt } from "@/lib/lifestyle-image";
import { requireDesk } from "@/lib/admin-gate";
import { prisma } from "@/lib/prisma";

const sourceLimit = 8_000_000;
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function generateLifestyleImage(input: { imageUrl: string; person: string; scene: string }) {
  const gate = await requireDesk();
  if (gate) return gate;
  if (!isLifestylePerson(input.person)) return { ok: false as const, error: "Choose a woman or a man." };
  const scene = input.scene.trim();
  if (scene.length > 400) return { ok: false as const, error: "The scene is too long." };

  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return { ok: false as const, error: "Add OPENAI_API_KEY before generating an image." };

  try {
    const source = await loadSource(input.imageUrl);
    if (!source) return { ok: false as const, error: "That product photo could not be read." };

    const image = await requestPortrait(key, source, lifestylePrompt(input.person, scene));
    const saved = await prisma.productMedia.create({
      data: { mime: imageMime(image), bytes: image },
      select: { id: true },
    });
    return { ok: true as const, url: `/media/${saved.id}` };
  } catch (error) {
    const message = error instanceof OpenAIImageError ? error.deskMessage : "OpenAI could not generate that image.";
    console.error("Lifestyle image was not generated", error instanceof Error ? error.name : "unknown");
    return { ok: false as const, error: message };
  }
}

async function loadSource(imageUrl: string) {
  const mediaId = /^\/media\/([a-z0-9]{20,32})$/i.exec(imageUrl)?.[1];
  if (mediaId) {
    const media = await prisma.productMedia.findUnique({ where: { id: mediaId }, select: { mime: true, bytes: true } });
    if (!media || !allowed.has(media.mime)) return null;
    return { bytes: Buffer.from(media.bytes), mime: media.mime };
  }

  let url: URL;
  try {
    url = new URL(imageUrl);
  } catch {
    return null;
  }
  if (!isPublicHttps(url)) return null;

  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!response.ok) return null;
  const mime = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!allowed.has(mime)) return null;
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0 || bytes.length > sourceLimit) return null;
  return { bytes, mime };
}

function isPublicHttps(url: URL) {
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;
  if (host === "metadata.google.internal" || host === "0.0.0.0" || host === "::1") return false;
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return true;
  const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
  if (a === 10 || a === 127 || a === 0) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  return true;
}

async function requestPortrait(key: string, source: { bytes: Buffer; mime: string }, prompt: string) {
  const extension = source.mime === "image/png" ? "png" : source.mime === "image/webp" ? "webp" : "jpg";
  const form = new FormData();
  form.set("model", "gpt-image-1.5");
  form.set("prompt", prompt);
  form.set("size", "1024x1536");
  form.set("quality", "medium");
  form.set("input_fidelity", "high");
  form.append("image[]", new File([new Uint8Array(source.bytes)], `product.${extension}`, { type: source.mime }));

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
    signal: AbortSignal.timeout(55000),
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: { code?: string; type?: string };
    data?: { b64_json?: string }[];
  } | null;

  if (!response.ok) {
    console.error("OpenAI image edit failed", response.status, payload?.error?.code ?? payload?.error?.type ?? "unknown");
    throw new OpenAIImageError(deskMessageFor(response.status, payload?.error?.code));
  }

  const encoded = payload?.data?.[0]?.b64_json;
  if (!encoded) throw new OpenAIImageError("OpenAI could not generate that image.");
  const image = Buffer.from(encoded, "base64");
  if (image.length < 32) throw new OpenAIImageError("OpenAI could not generate that image.");
  return image;
}

function deskMessageFor(status: number, code: string | undefined) {
  if (status === 401) return "OpenAI refused the API key.";
  if (code === "insufficient_quota" || code === "billing_hard_limit_reached") return "OpenAI billing blocked this image.";
  if (status === 429) return "OpenAI is busy. Try again in a moment.";
  return "OpenAI could not generate that image.";
}

class OpenAIImageError extends Error {
  constructor(readonly deskMessage: string) {
    super(deskMessage);
    this.name = "OpenAIImageError";
  }
}

function imageMime(image: Buffer) {
  if (image[0] === 0xff && image[1] === 0xd8) return "image/jpeg";
  if (image[0] === 0x89 && image[1] === 0x50) return "image/png";
  return "image/webp";
}
