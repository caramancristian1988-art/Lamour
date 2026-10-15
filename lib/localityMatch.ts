import { MOLDOVA_LOCALITIES } from "./moldovaLocalities";

// Normalizare comună pentru comparații: minuscule, fără diacritice, spații
// curățate — "Chșinău", "chisinau", "CHIȘINĂU" ajung toate la "chisinau".
export function normalizeLocality(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

const NORMALIZED_TO_CANONICAL = new Map<string, string>(
  MOLDOVA_LOCALITIES.map((name) => [normalizeLocality(name), name])
);

// Distanța Levenshtein (câte inserări/ștergeri/înlocuiri separă două
// cuvinte) — folosită ca să sugerăm localitatea corectă pentru typo-uri
// ("Chsinau" -> "Chisinau"), nu doar pentru potriviri exacte.
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Prag proporțional cu lungimea — un singur typo la un nume de 4 litere
// schimbă cuvântul complet (toleranță mică), un nume lung poate avea 2-3
// litere greșite și tot să fie recognoscibil.
function maxDistanceFor(length: number): number {
  if (length <= 4) return 1;
  if (length <= 8) return 2;
  return 3;
}

export interface LocalityMatchResult {
  /** Forma canonică (exact cum apare la EVS), dacă localitatea e recunoscută direct. */
  exact: string | null;
  /** Cele mai apropiate localități reale, dacă nu e potrivire exactă. */
  suggestions: string[];
}

// Verificare completă — de folosit la blur/submit. Localitate necunoscută
// și fără nicio sugestie apropiată => e chiar o localitate inventată/greșită.
export function matchLocality(input: string): LocalityMatchResult {
  const normalized = normalizeLocality(input);
  if (!normalized) return { exact: null, suggestions: [] };

  const exact = NORMALIZED_TO_CANONICAL.get(normalized) ?? null;
  if (exact) return { exact, suggestions: [] };

  const maxDist = maxDistanceFor(normalized.length);
  const scored: { name: string; dist: number }[] = [];
  for (const [norm, canonical] of NORMALIZED_TO_CANONICAL) {
    if (Math.abs(norm.length - normalized.length) > maxDist) continue;
    const dist = levenshtein(normalized, norm);
    if (dist <= maxDist) scored.push({ name: canonical, dist });
  }
  scored.sort((a, b) => a.dist - b.dist || a.name.localeCompare(b.name));

  return { exact: null, suggestions: scored.slice(0, 4).map((s) => s.name) };
}

// Sugestii "live" cât timp operatorul tastează — potrivire pe prefix/
// conținut, mai permisivă decât matchLocality (gândită pentru blur/submit).
export function suggestLocalities(input: string, limit = 8): string[] {
  const normalized = normalizeLocality(input);
  if (normalized.length < 2) return [];

  const starts: string[] = [];
  const contains: string[] = [];
  for (const name of MOLDOVA_LOCALITIES) {
    const norm = normalizeLocality(name);
    if (norm.startsWith(normalized)) {
      starts.push(name);
      if (starts.length >= limit) break;
    } else if (norm.includes(normalized) && contains.length < limit) {
      contains.push(name);
    }
  }
  return [...starts, ...contains].slice(0, limit);
}
