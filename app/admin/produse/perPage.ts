// Câte produse apar pe pagină în lista din admin. Alegerea se ține minte într-un cookie, pentru că după o salvare adminul
// e trimis înapoi la /admin/produse fără parametri — altfel ar reveni la 10 de fiecare dată. (Modul simplu, fără
// "use client": îl folosesc și pagina de pe server, și filtrele din browser.)
export const PER_PAGE_OPTIONS = [10, 25, 50, 100, 200];
export const DEFAULT_PER_PAGE = 10;
export const PER_PAGE_COOKIE = "admin_products_per_page";

/** ?per=25 din URL, altfel ultima alegere (cookie), altfel 10. Doar valorile din listă sunt acceptate. */
export function resolvePerPage(param: string | string[] | undefined, cookieValue: string | undefined): number {
  const fromParam = Number(Array.isArray(param) ? param[0] : param);
  if (PER_PAGE_OPTIONS.includes(fromParam)) return fromParam;
  const fromCookie = Number(cookieValue);
  return PER_PAGE_OPTIONS.includes(fromCookie) ? fromCookie : DEFAULT_PER_PAGE;
}
