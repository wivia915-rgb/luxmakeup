export const STANDARD_DELIVERY_DH = 35;

const cities = [
  { name: "Fès", aliases: ["fes", "fez"], region: "local" },
  { name: "Casablanca", aliases: ["casa"], region: "standard" },
  { name: "Rabat", aliases: [], region: "standard" },
  { name: "Salé", aliases: ["sale"], region: "standard" },
  { name: "Témara", aliases: ["temara"], region: "standard" },
  { name: "Marrakech", aliases: ["marrakesh"], region: "standard" },
  { name: "Tanger", aliases: ["tangier", "tangiers"], region: "standard" },
  { name: "Agadir", aliases: [], region: "standard" },
  { name: "Meknès", aliases: ["meknes"], region: "standard" },
  { name: "Oujda", aliases: [], region: "standard" },
  { name: "Tétouan", aliases: ["tetouan"], region: "standard" },
  { name: "Kénitra", aliases: ["kenitra"], region: "standard" },
  { name: "Mohammedia", aliases: [], region: "standard" },
  { name: "Safi", aliases: [], region: "remote" },
  { name: "El Jadida", aliases: ["eljadida"], region: "remote" },
  { name: "Nador", aliases: [], region: "remote" },
  { name: "Beni Mellal", aliases: ["beni-mellal"], region: "remote" },
  { name: "Khouribga", aliases: [], region: "remote" },
  { name: "Taza", aliases: [], region: "remote" },
  { name: "Settat", aliases: [], region: "remote" },
  { name: "Larache", aliases: [], region: "remote" },
  { name: "Essaouira", aliases: [], region: "remote" },
  { name: "Ouarzazate", aliases: [], region: "remote" },
  { name: "Al Hoceïma", aliases: ["alhoceima", "al hoceima"], region: "remote" },
  { name: "Errachidia", aliases: [], region: "remote" },
  { name: "Laâyoune", aliases: ["laayoune"], region: "remote" },
  { name: "Dakhla", aliases: [], region: "remote" },
] as const;

export type ShippingRates = {
  localFee: number;
  standardFee: number;
  remoteFee: number;
  freeThreshold: number;
};

export const defaultShippingRates: ShippingRates = {
  localFee: 0,
  standardFee: STANDARD_DELIVERY_DH,
  remoteFee: 45,
  freeThreshold: 0,
};

export function shippingRatesFrom(input: {
  localShippingFee: number;
  standardShippingFee: number;
  remoteShippingFee: number;
  freeShippingThreshold: number;
}): ShippingRates {
  return {
    localFee: input.localShippingFee,
    standardFee: input.standardShippingFee,
    remoteFee: input.remoteShippingFee,
    freeThreshold: input.freeShippingThreshold,
  };
}

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

export function deliveryFee(city: string, merchandiseDh = 0, rates: ShippingRates = defaultShippingRates): number | null {
  const resolved = resolveCity(city);
  if (!resolved) return null;
  if (rates.freeThreshold > 0 && merchandiseDh >= rates.freeThreshold) return 0;
  const region = cities.find((item) => item.name === resolved)?.region ?? "remote";
  if (region === "local") return rates.localFee;
  if (region === "remote") return rates.remoteFee;
  return rates.standardFee;
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
