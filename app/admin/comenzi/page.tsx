import Link from "next/link";
import {
  EXTRACTION,
  EXTRACTION_LABELS,
  describeOrderForSpeech,
  expireStaleExports,
  formatDateTime,
  formatMoney,
  listActiveExports,
  listExports,
  listRegistry,
  registryCounts,
  type RegistryFilter,
} from "@/lib/orderRegistry";
import AdminPageHeader from "../components/AdminPageHeader";
import ExportPanel, { type ActiveExport } from "./ExportPanel";

export const dynamic = "force-dynamic";

type Query = { [key: string]: string | string[] | undefined };

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

function parseStatus(v: string): RegistryFilter {
  return v === "toate" || v === EXTRACTION.NEW || v === EXTRACTION.RESERVED || v === EXTRACTION.DONE ? v : EXTRACTION.NEW;
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? `1 ${one}` : `${n} ${many}`;
}

const FILTER_LABELS: Record<RegistryFilter, string> = {
  toate: "Toate comenzile",
  neextrasa: "Neextrase",
  rezervata: "Rezervate pentru extragere",
  extrasa: "Extrase",
};

export default async function RegistryPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const status = parseStatus(first(query.status));
  const view = first(query.view) === "lista" ? "lista" : "tabel";
  const q = first(query.q).trim();
  const includeArchived = first(query.arhivate) === "1";
  const page = Math.max(1, Number(first(query.page)) || 1);

  await expireStaleExports().catch(() => 0);
  const [counts, active, history, list] = await Promise.all([
    registryCounts(),
    listActiveExports(),
    listExports(10),
    listRegistry({ status, q, includeArchived, page, pageSize: 20 }),
  ]);

  const activeForPanel: ActiveExport[] = active.map((e) => ({
    id: e.id,
    number: e.number,
    orderCount: e.orderCount,
    initiatedByName: e.initiatedByName,
    createdAtText: formatDateTime(e.createdAt),
    reservedUntilText: formatDateTime(e.reservedUntil),
  }));

  function pageHref(p: number): string {
    const params = new URLSearchParams();
    if (status !== EXTRACTION.NEW) params.set("status", status);
    if (view !== "tabel") params.set("view", view);
    if (q) params.set("q", q);
    if (includeArchived) params.set("arhivate", "1");
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/admin/comenzi${s ? `?${s}` : ""}`;
  }

  return (
    <div>
      <AdminPageHeader
        title="Registrul de comenzi"
        description="Toate comenzile din coș, păstrate permanent. Același registru este disponibil și în Telegram."
      />

      <p className="mb-4 text-base font-semibold text-foreground">
        {counts.neextrase === 0
          ? "Nu există comenzi noi, neextrase."
          : `Aveți ${plural(counts.neextrase, "comandă nouă, neextrasă", "comenzi noi, neextrase")}.`}{" "}
        În total în registru: {plural(counts.total, "comandă", "comenzi")}, din care {counts.extrase} extrase
        {counts.rezervate > 0 ? ` și ${counts.rezervate} rezervate pentru extragere` : ""}.
      </p>

      <ExportPanel initialActive={activeForPanel} newCount={counts.neextrase} />

      <section aria-labelledby="registru-titlu" className="mb-8">
        <h2 id="registru-titlu" className="text-lg font-extrabold text-primary mb-3">
          Comenzile din registru
        </h2>

        <form method="get" action="/admin/comenzi" className="bg-card border border-border rounded-2xl p-4 mb-4 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="filtru-status" className="text-sm font-bold text-primary">
              Status extragere
            </label>
            <select id="filtru-status" name="status" defaultValue={status} className="h-11 rounded-xl border-2 border-input bg-card px-3 text-sm">
              {(Object.keys(FILTER_LABELS) as RegistryFilter[]).map((k) => (
                <option key={k} value={k}>
                  {FILTER_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="filtru-cautare" className="text-sm font-bold text-primary">
              Caută după număr, nume sau telefon
            </label>
            <input id="filtru-cautare" name="q" type="search" defaultValue={q} className="h-11 rounded-xl border-2 border-input bg-card px-3 text-sm w-64" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="filtru-mod" className="text-sm font-bold text-primary">
              Mod de afișare
            </label>
            <select id="filtru-mod" name="view" defaultValue={view} className="h-11 rounded-xl border-2 border-input bg-card px-3 text-sm">
              <option value="tabel">Tabel</option>
              <option value="lista">Listă accesibilă</option>
            </select>
          </div>
          <label className="flex items-center gap-2 h-11 text-sm">
            <input type="checkbox" name="arhivate" value="1" defaultChecked={includeArchived} className="h-4 w-4" />
            Include comenzile arhivate
          </label>
          <button type="submit" className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
            Aplică filtrele
          </button>
        </form>

        <p role="status" className="text-sm text-muted-foreground mb-3">
          {list.total === 0
            ? "Nicio comandă nu corespunde filtrelor alese."
            : `${FILTER_LABELS[status]}: ${plural(list.total, "comandă", "comenzi")}. Pagina ${list.page} din ${list.pages}.`}
        </p>

        {/* Descărcarea Excel: un BUTON real (<button type="submit"> într-un formular), nu un simplu link — cititoarele de ecran îl
            găsesc în lista de butoane/controale, iar grupul are nume și explicație. Aceeași listă, cu filtrele alese mai sus,
            pentru toate paginile; este doar o copie (nu marchează nimic ca extras). */}
        <form
          method="get"
          action="/api/admin/comenzi/lista-excel"
          role="group"
          aria-labelledby="excel-titlu"
          className="mb-4 flex flex-wrap items-center gap-3"
        >
          <input type="hidden" name="status" value={status} />
          {q && <input type="hidden" name="q" value={q} />}
          {includeArchived && <input type="hidden" name="arhivate" value="1" />}
          <h3 id="excel-titlu" className="sr-only">
            Descărcare în Excel
          </h3>
          <button
            type="submit"
            disabled={list.total === 0}
            aria-describedby="excel-info"
            className="h-11 px-5 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            Descarcă lista în Excel
          </button>
          <p id="excel-info" className="text-sm text-muted-foreground">
            {list.total === 0
              ? "Nu există comenzi de descărcat cu filtrele alese."
              : `Se descarcă toate cele ${plural(list.total, "comandă", "comenzi")} din lista filtrată, pe toate paginile, ca fișier Excel. Este doar o copie: nu marchează nimic ca extras.`}
          </p>
        </form>

        {list.orders.length > 0 && view === "tabel" && (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card" tabIndex={0} role="region" aria-label="Tabelul comenzilor, derulabil pe orizontală">
            <table className="w-full text-sm text-left">
              <caption className="sr-only">
                Registrul de comenzi, {FILTER_LABELS[status].toLowerCase()}, pagina {list.page} din {list.pages}. Fiecare rând este o comandă.
              </caption>
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-3 py-2 font-bold">Comanda</th>
                  <th scope="col" className="px-3 py-2 font-bold">Data</th>
                  <th scope="col" className="px-3 py-2 font-bold">Client</th>
                  <th scope="col" className="px-3 py-2 font-bold">Produse</th>
                  <th scope="col" className="px-3 py-2 font-bold">Total</th>
                  <th scope="col" className="px-3 py-2 font-bold">Status comandă</th>
                  <th scope="col" className="px-3 py-2 font-bold">Status extragere</th>
                  <th scope="col" className="px-3 py-2 font-bold">Detalii</th>
                </tr>
              </thead>
              <tbody>
                {list.orders.map((o) => (
                  <tr key={o.id} className="border-t border-border align-top">
                    <th scope="row" className="px-3 py-2 font-bold">
                      {o.ref}
                      {o.archived ? " (arhivată)" : ""}
                    </th>
                    <td className="px-3 py-2">{formatDateTime(o.createdAt)}</td>
                    <td className="px-3 py-2">{o.name}</td>
                    <td className="px-3 py-2">{plural(o.itemCount, "bucată", "bucăți")}</td>
                    <td className="px-3 py-2">{formatMoney(o.total)}</td>
                    <td className="px-3 py-2">{o.stageLabel}</td>
                    <td className="px-3 py-2">{o.extractionLabel}</td>
                    <td className="px-3 py-2">
                      <Link href={`/admin/comenzi/${o.id}`} className="font-bold text-accent underline underline-offset-2">
                        Detaliile comenzii {o.ref}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {list.orders.length > 0 && view === "lista" && (
          <ol className="flex flex-col gap-3">
            {list.orders.map((o) => (
              <li key={o.id}>
                <article aria-labelledby={`comanda-${o.id}`} className="bg-card border border-border rounded-2xl p-4">
                  <h3 id={`comanda-${o.id}`} className="text-base font-extrabold text-primary">
                    Comanda {o.ref}
                    {o.archived ? ", arhivată" : ""}
                  </h3>
                  <p className="mt-1 text-sm">{describeOrderForSpeech(o)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Plasată la {formatDateTime(o.createdAt)}. Status comandă: {o.stageLabel}.
                  </p>
                  <Link href={`/admin/comenzi/${o.id}`} className="mt-2 inline-block font-bold text-accent underline underline-offset-2 text-sm">
                    Citește detaliile comenzii {o.ref}
                  </Link>
                </article>
              </li>
            ))}
          </ol>
        )}

        {list.pages > 1 && (
          <nav aria-label="Paginare comenzi" className="mt-4 flex items-center gap-4 flex-wrap">
            {list.page > 1 ? (
              <Link href={pageHref(list.page - 1)} className="font-bold text-accent underline underline-offset-2">
                Comenzile anterioare
              </Link>
            ) : (
              <span className="text-muted-foreground">Comenzile anterioare (nu există)</span>
            )}
            <span aria-current="page">
              Pagina {list.page} din {list.pages}
            </span>
            {list.page < list.pages ? (
              <Link href={pageHref(list.page + 1)} className="font-bold text-accent underline underline-offset-2">
                Următoarele comenzi
              </Link>
            ) : (
              <span className="text-muted-foreground">Următoarele comenzi (nu există)</span>
            )}
          </nav>
        )}
      </section>

      <section aria-labelledby="istoric-titlu">
        <h2 id="istoric-titlu" className="text-lg font-extrabold text-primary mb-3">
          Istoricul extragerilor
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nu a fost făcută nicio extragere încă.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card" tabIndex={0} role="region" aria-label="Istoricul extragerilor, derulabil pe orizontală">
            <table className="w-full text-sm text-left">
              <caption className="sr-only">Ultimele {history.length} extrageri, de la cea mai recentă.</caption>
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-3 py-2 font-bold">Export</th>
                  <th scope="col" className="px-3 py-2 font-bold">Status</th>
                  <th scope="col" className="px-3 py-2 font-bold">Comenzi</th>
                  <th scope="col" className="px-3 py-2 font-bold">Pornit de</th>
                  <th scope="col" className="px-3 py-2 font-bold">Canal</th>
                  <th scope="col" className="px-3 py-2 font-bold">Creat la</th>
                  <th scope="col" className="px-3 py-2 font-bold">Confirmat</th>
                </tr>
              </thead>
              <tbody>
                {history.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <th scope="row" className="px-3 py-2 font-bold">Numărul {e.number}</th>
                    <td className="px-3 py-2">{e.statusLabel}</td>
                    <td className="px-3 py-2">{e.orderCount}</td>
                    <td className="px-3 py-2">{e.initiatedByName}</td>
                    <td className="px-3 py-2">{e.channel === "telegram" ? "Telegram" : "Site"}</td>
                    <td className="px-3 py-2">{formatDateTime(e.createdAt)}</td>
                    <td className="px-3 py-2">
                      {e.confirmedAt ? `${formatDateTime(e.confirmedAt)}, de ${e.confirmedByName ?? "necunoscut"}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="sr-only">Statusuri posibile ale extragerii: {Object.values(EXTRACTION_LABELS).join(", ")}.</p>
    </div>
  );
}
