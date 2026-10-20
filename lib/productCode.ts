// „Cod produs": un singur loc pentru regulile codului, ca formularul din admin, importul din Excel și API-ul de catalog să accepte
// exact aceleași coduri. Litere și cifre, iar între grupuri se pot pune separatori: spațiu, punct, cratimă, bară (/) sau liniuță
// jos (_) — ex. „LT-141”, „LT 141.5”, „A12/B”. Nu poate începe sau se termina cu separator.
export const PRODUCT_CODE_RE = /^[A-Z0-9]+(?:[ ._/-]+[A-Z0-9]+)*$/;

export const PRODUCT_CODE_HELP = "litere și cifre, cu spațiu, punct, cratimă, / sau _ între ele (ex. LT-141, LT 141.5)";

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
