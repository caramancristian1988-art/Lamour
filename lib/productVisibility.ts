import type { Prisma } from "@prisma/client";

// Produsele dezactivate din admin (ochișorul din lista de produse) rămân în baza de date și în admin,
// dar nu apar pe site. Câmpul `hidden` e opțional în schemă (produsele vechi nu-l au deloc în MongoDB),
// iar în Prisma + MongoDB nici `hidden: false`, nici `{ not: true }`, nici `null` nu potrivesc un câmp
// LIPSĂ — de aceea `isSet: false` e inclus explicit.
const VISIBLE_PRODUCT: Prisma.ProductWhereInput = {
  OR: [{ hidden: { isSet: false } }, { hidden: null }, { hidden: false }],
};

/** Condiția `where` pentru produsele vizibile pe site, combinată (AND) cu un filtru existent. */
export function onlyVisible(where: Prisma.ProductWhereInput = {}): Prisma.ProductWhereInput {
  return { AND: [VISIBLE_PRODUCT, where] };
}

export function isVisibleProduct(p: { hidden?: boolean | null }): boolean {
  return p.hidden !== true;
}
