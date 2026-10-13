"use server";

import { adminCodeConfigured, codeMatches, DESK_COOKIE, DESK_MAX_AGE, signDesk } from "@/lib/admin-gate";
import { cookies } from "next/headers";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function unlockDesk(code: string) {
  if (!adminCodeConfigured()) return { ok: false as const, error: "The desk code is not set yet." };
  if (!codeMatches(code)) return { ok: false as const, error: "That code does not open the desk." };
  const token = signDesk();
  if (!token) return { ok: false as const, error: "The desk code is not set yet." };
  const jar = await cookies();
  jar.set(DESK_COOKIE, token, { ...cookieOptions, maxAge: DESK_MAX_AGE });
  return { ok: true as const };
}

export async function lockDesk() {
  const jar = await cookies();
  jar.set(DESK_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return { ok: true as const };
}
