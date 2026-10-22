// „Cod produs": un singur loc pentru regulile codului, ca formularul din admin, importul din Excel și API-ul de catalog să accepte
// exact aceleași coduri. Orice LITERE (și cu diacritice: ă, â, î, ș, ț; sau chirilice) și cifre, iar între grupuri se pot pune
// separatori: spațiu, punct, cratimă, bară (/) sau liniuță jos (_) — ex. „LT-141”, „LMP204”, „ȘTIRE 5.2”, „A12/B”.
// Nu poate începe sau se termina cu separator. Codul se salvează cu majuscule, deci „lmp204” și „LMP204” sunt același cod.
export const PRODUCT_CODE_RE = /^[\p{L}\p{N}]+(?:[ ._/-]+[\p{L}\p{N}]+)*$/u;

export const PRODUCT_CODE_HELP = "litere (mari sau mici, și cu diacritice) și cifre, cu spațiu, punct, cratimă, / sau _ între ele (ex. LMP204, LT-141, LT 141.5)";

const PRODUCT_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Majuscule, fără spații la capete, iar spațiile multiple (și cele „tari" copiate din Excel / Word) devin unul singur. */
export function normalizeProductCode(raw: string): string {
  return raw.replace(/[\s ]+/g, " ").trim().toUpperCase();
}

/** Cod automat de 6 caractere (pentru produsele la care cel care le adaugă nu a dat unul). */
export function randomProductCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += PRODUCT_CODE_CHARS[Math.floor(Math.random() * PRODUCT_CODE_CHARS.length)];
  return code;
}
