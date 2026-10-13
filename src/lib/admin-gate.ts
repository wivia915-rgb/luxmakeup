import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const DESK_COOKIE = "lux-desk";
export const DESK_MAX_AGE = 60 * 60 * 24 * 30;

export function adminCodeConfigured() {
  return Boolean(process.env.ADMIN_CODE?.trim());
}

export function codeMatches(input: string) {
  const code = process.env.ADMIN_CODE?.trim() ?? "";
  if (!code || !input.trim()) return false;
  const given = createHash("sha256").update(input.trim()).digest();
  const expected = createHash("sha256").update(code).digest();
  return timingSafeEqual(given, expected);
}

export function signDesk(now = Date.now()) {
  const code = process.env.ADMIN_CODE?.trim() ?? "";
  if (!code) return null;
  const exp = String(now + DESK_MAX_AGE * 1000);
  const sig = createHmac("sha256", code).update(exp).digest("hex");
  return `${exp}.${sig}`;
}

export function deskTokenValid(value: string | undefined, code = process.env.ADMIN_CODE?.trim() ?? "") {
  if (!code || !value) return false;
  const dot = value.indexOf(".");
  if (dot <= 0) return false;
  const exp = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!/^\d{10,16}$/.test(exp) || !/^[a-f0-9]{64}$/.test(sig)) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = createHmac("sha256", code).update(exp).digest("hex");
  const given = Buffer.from(sig);
  const actual = Buffer.from(expected);
  if (given.length !== actual.length) return false;
  return timingSafeEqual(given, actual);
}

export async function deskIsOpen() {
  const jar = await cookies();
  return deskTokenValid(jar.get(DESK_COOKIE)?.value);
}

export async function requireDesk() {
  if (!(await deskIsOpen())) return { ok: false as const, error: "The desk is locked." };
  return null;
}
