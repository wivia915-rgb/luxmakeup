export function openStorefrontHash(event: { preventDefault(): void }, href: string) {
  if (window.location.pathname !== "/") return;
  const hash = href.startsWith("/#") ? href.slice(1) : href.startsWith("#") ? href : "";
  if (!hash) return;
  event.preventDefault();
  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
  document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "auto", block: "start" });
}
