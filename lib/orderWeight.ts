// Greutatea unei comenzi = suma greutăților produselor × cantități. Se trimite la EVS (AWB) și se afișează în Telegram
// și pe fișa de tipărit. Fără dependențe de server: poate fi importat oriunde.

// Produsele fără greutate introdusă se socotesc la 1 kg/buc. (regula de dinainte de a exista greutatea pe produs).
export const DEFAULT_UNIT_WEIGHT_KG = 1;
const MIN_ORDER_WEIGHT_KG = 0.1;

export interface OrderWeight {
  totalKg: number;
  /** Câte rânduri din comandă n-au greutate pe produs și au fost socotite la valoarea implicită. */
  missing: number;
}

export function computeOrderWeightKg(
  items: { productId: string; quantity: number }[],
  weightById: Map<string, number | null | undefined>
): OrderWeight {
  let total = 0;
  let missing = 0;
  for (const item of items) {
    const w = weightById.get(item.productId);
    const unit = typeof w === "number" && Number.isFinite(w) && w > 0 ? w : null;
    if (unit === null) missing++;
    total += (unit ?? DEFAULT_UNIT_WEIGHT_KG) * Math.max(1, item.quantity);
  }
  // Rotunjit la 2 zecimale (grame la zeci), cu minim 0,1 kg — cât acceptă EVS.
  return { totalKg: Math.max(MIN_ORDER_WEIGHT_KG, Math.round(total * 100) / 100), missing };
}

/** "3,4 kg" — cu virgulă, fără zerouri inutile. */
export function formatKg(kg: number): string {
  return `${(Math.round(kg * 100) / 100).toString().replace(".", ",")} kg`;
}
