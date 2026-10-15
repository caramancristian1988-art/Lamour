// Slug de URL din text liber: fără diacritice (ă/â -> a, î -> i, ș/ş -> s, ț/ţ -> t), litere mici,
// iar tot ce nu e literă/cifră devine cratimă. Fără "server-only", ca să-l poată folosi și formularul din browser.
//
// `trimEdges: false` e pentru tastarea live în câmpul de slug: altfel cratima de la coadă ar fi tăiată
// imediat și nu s-ar putea scrie niciodată "ceva-altceva".
export function slugify(value: string, { trimEdges = true }: { trimEdges?: boolean } = {}): string {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
  return trimEdges ? slug.replace(/^-+|-+$/g, "") : slug.replace(/^-+/, "");
}
