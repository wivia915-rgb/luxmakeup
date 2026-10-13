import { NextResponse, type NextRequest } from "next/server";

const DESK_COOKIE = "lux-desk";

export async function middleware(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();
  const code = process.env.ADMIN_CODE?.trim() ?? "";
  const token = request.cookies.get(DESK_COOKIE)?.value;
  if (code && (await tokenValid(token, code))) return NextResponse.next();
  if (request.nextUrl.pathname === "/admin") return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/admin";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

async function tokenValid(value: string | undefined, code: string) {
  if (!value) return false;
  const dot = value.indexOf(".");
  if (dot <= 0) return false;
  const exp = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!/^\d{10,16}$/.test(exp) || !/^[a-f0-9]{64}$/.test(sig)) return false;
  if (Number(exp) < Date.now()) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(exp));
  const expected = [...new Uint8Array(signed)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (expected.length !== sig.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) mismatch |= expected.charCodeAt(index) ^ sig.charCodeAt(index);
  return mismatch === 0;
}
