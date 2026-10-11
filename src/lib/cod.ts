export const STANDARD_DELIVERY_DH = 35;

const cities = [
  { name: "Fès", aliases: ["fes", "fez"] },
  { name: "Casablanca", aliases: ["casa"] },
  { name: "Rabat", aliases: [] },
  { name: "Salé", aliases: ["sale"] },
  { name: "Témara", aliases: ["temara"] },
  { name: "Marrakech", aliases: ["marrakesh"] },
  { name: "Tanger", aliases: ["tangier", "tangiers"] },
  { name: "Agadir", aliases: [] },
  { name: "Meknès", aliases: ["meknes"] },
  { name: "Oujda", aliases: [] },
  { name: "Tétouan", aliases: ["tetouan"] },
  { name: "Kénitra", aliases: ["kenitra"] },
  { name: "Mohammedia", aliases: [] },
  { name: "Safi", aliases: [] },
  { name: "El Jadida", aliases: ["eljadida"] },
  { name: "Nador", aliases: [] },
  { name: "Beni Mellal", aliases: ["beni-mellal"] },
  { name: "Khouribga", aliases: [] },
  { name: "Taza", aliases: [] },
  { name: "Settat", aliases: [] },
  { name: "Larache", aliases: [] },
  { name: "Essaouira", aliases: [] },
  { name: "Ouarzazate", aliases: [] },
  { name: "Al Hoceïma", aliases: ["alhoceima", "al hoceima"] },
  { name: "Errachidia", aliases: [] },
  { name: "Laâyoune", aliases: ["laayoune"] },
  { name: "Dakhla", aliases: [] },
] as const;

export const moroccanCities = cities.map((city) => city.name);

export type CodFields = {
  name: string;
  phone: string;
  city: string;
  address: string;
};

export type CodErrors = Partial<Record<keyof CodFields, string>>;

export function foldCity(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/g, "");
}

export function resolveCity(query: string): string | null {
  const folded = foldCity(query);
  if (!folded) return null;
  const match = cities.find((city) => foldCity(city.name) === folded || city.aliases.some((alias) => foldCity(alias) === folded));
  return match?.name ?? null;
}

export function filterCities(query: string): string[] {
  const folded = foldCity(query);
  if (!folded) return [...moroccanCities];
  return cities
    .filter((city) => foldCity(city.name).includes(folded) || city.aliases.some((alias) => foldCity(alias).includes(folded)))
    .map((city) => city.name);
}

export function deliveryFee(city: string, merchandiseDh = 0, freeShippingThreshold = 0): number | null {
  const resolved = resolveCity(city);
  if (!resolved) return null;
  if (freeShippingThreshold > 0 && merchandiseDh >= freeShippingThreshold) return 0;
  return foldCity(resolved) === foldCity("Fès") ? 0 : STANDARD_DELIVERY_DH;
}

export function validateCod(fields: CodFields): { errors: CodErrors; delivery: number | null; valid: boolean } {
  const errors: CodErrors = {};
  const name = fields.name.trim();
  const nameParts = name.split(/\s+/).filter(Boolean);
  if (nameParts.length < 2 || !/^[\p{L}][\p{L}\s'.-]{2,80}$/u.test(name)) {
    errors.name = "Enter your full name.";
  }

  const phone = fields.phone.replace(/[\s.-]/g, "");
  const moroccanMobile = /^(?:0|\+?212)[5-7]\d{8}$/;
  if (!moroccanMobile.test(phone)) {
    errors.phone = "Use a Moroccan mobile number, like 06 12 34 56 78.";
  }

  const city = resolveCity(fields.city);
  if (!city) {
    errors.city = "Choose a city from the list.";
  }

  const address = fields.address.trim();
  if (address.length < 8 || !/\p{L}/u.test(address)) {
    errors.address = "Add a street and neighbourhood.";
  }

  const delivery = city ? deliveryFee(city) : null;
  return { errors, delivery, valid: Object.keys(errors).length === 0 && delivery !== null };
}
