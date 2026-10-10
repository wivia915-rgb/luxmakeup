export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      return new URL("http://localhost:3000");
    }
  }
  return new URL("http://localhost:3000");
}
