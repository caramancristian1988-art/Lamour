// Preț pe praguri de cantitate ("de la 10 buc. 25 lei/bucată").
//
// Un singur loc care decide ce preț plătește clientul, ca pagina produsului,
// coșul, checkout-ul și mesajul de Telegram să nu poată ajunge la sume diferite.
// Pragurile se aplică pe linie de produs — cantitatea unui produs din coș NU se
// adună cu a altor produse.

export interface PriceTier {
  minQty: number;
  price: number;
}

/** Sursa pragurilor: forma nouă (priceTiers) sau pragul unic vechi (bulkMinQty/bulkPrice). */
export interface TierSource {
  priceTiers?: PriceTier[] | null;
  bulkMinQty?: number | null;
  bulkPrice?: number | null;
}

/**
 * Praguri curate și sortate crescător după cantitate.
 * Elimină rândurile incomplete, cantitățile <= 1 (acelea sunt prețul de bază)
 * și păstrează un singur prag per cantitate (ultimul câștigă).
 */
export function normalizeTiers(source: TierSource | null | undefined): PriceTier[] {
  if (!source) return [];

  const raw: PriceTier[] =
    source.priceTiers && source.priceTiers.length > 0
      ? source.priceTiers
      : source.bulkMinQty != null && source.bulkPrice != null
      ? [{ minQty: source.bulkMinQty, price: source.bulkPrice }]
      : [];

  const byQty = new Map<number, number>();
  for (const tier of raw) {
    const minQty = Math.floor(Number(tier?.minQty));
    const price = Number(tier?.price);
    if (!Number.isFinite(minQty) || !Number.isFinite(price)) continue;
    if (minQty < 2 || price <= 0) continue;
    byQty.set(minQty, price);
  }

  return [...byQty.entries()]
    .map(([minQty, price]) => ({ minQty, price }))
    .sort((a, b) => a.minQty - b.minQty);
}

/** Prețul per bucată pentru o cantitate dată: cel mai avantajos prag atins. */
export function unitPriceFor(basePrice: number, tiers: PriceTier[], quantity: number): number {
  let price = basePrice;
  for (const tier of tiers) {
    if (quantity >= tier.minQty) price = tier.price;
  }
  // Un prag nu are voie să scumpească comanda, indiferent cum a fost completat în admin.
  return Math.min(price, basePrice);
}

/** Totalul unei linii din coș, cu pragul aplicat. */
export function lineTotal(basePrice: number, tiers: PriceTier[], quantity: number): number {
  return unitPriceFor(basePrice, tiers, quantity) * quantity;
}

/** Cât la sută se economisește per bucată față de prețul de bază. 0 dacă nu e reducere. */
export function savingsPercent(basePrice: number, tierPrice: number): number {
  if (!(basePrice > 0) || tierPrice >= basePrice) return 0;
  return Math.round((1 - tierPrice / basePrice) * 100);
}

/**
 * Următorul prag pe care clientul nu l-a atins încă — pentru un îndemn de tipul
 * „mai adaugă 4 buc. și plătești 25 lei/bucată (−17%)”.
 */
export function nextTier(
  basePrice: number,
  tiers: PriceTier[],
  quantity: number
): { tier: PriceTier; missingQty: number; percent: number } | null {
  const upcoming = tiers.find((t) => quantity < t.minQty && t.price < unitPriceFor(basePrice, tiers, quantity));
  if (!upcoming) return null;
  return {
    tier: upcoming,
    missingQty: upcoming.minQty - quantity,
    percent: savingsPercent(basePrice, upcoming.price),
  };
}

/**
 * Citește un preț scris de om: acceptă și „20,50” (virgulă, cum se scrie în
 * română), și „20.50”. Întoarce NaN pentru text gol sau invalid, ca apelantul
 * să poată decide între 0 și „necompletat”.
 */
export function parseDecimalInput(raw: unknown): number {
  const text = String(raw ?? "").trim().replace(/\s/g, "");
  if (text === "") return NaN;
  return Number(text.replace(",", "."));
}

/** Formatare unitară a sumelor (ex: "20,50 MDL", "930 MDL"). */
export function formatPrice(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return rounded.toLocaleString("ro-MD", {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
