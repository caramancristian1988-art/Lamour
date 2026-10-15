// Ordinea de afișare a categoriilor: întâi după „Ordine de afișare” (număr mai mic = mai sus; lipsă = 0), apoi după data
// creării. Astfel categoriile fără număr păstrează ordinea veche, iar una cu un număr mare (ex. 100) ajunge ultima.
// Fără import de prisma — poate fi folosit și din componente client.
interface Orderable {
  displayOrder?: number | null;
  createdAt: Date | string;
}

export function compareCategories(a: Orderable, b: Orderable): number {
  const byOrder = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  if (byOrder !== 0) return byOrder;
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

export function sortCategories<T extends Orderable>(list: T[]): T[] {
  return [...list].sort(compareCategories);
}
