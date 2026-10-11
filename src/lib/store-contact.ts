export function storeWhatsAppUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!/^\d{8,15}$/.test(digits)) return null;
  return `https://wa.me/${digits}`;
}
