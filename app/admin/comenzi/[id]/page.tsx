import Link from "next/link";
import { notFound } from "next/navigation";
import { findRegistryOrder, formatDateTime, formatMoney, describeOrderForSpeech } from "@/lib/orderRegistry";
import { archiveOrderAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await findRegistryOrder(id);
  if (!order) notFound();

  const rows: { label: string; value: string }[] = [
    { label: "Număr comandă", value: order.ref },
    { label: "Plasată la", value: formatDateTime(order.createdAt) },
    { label: "Status comandă", value: order.stageLabel },
    { label: "Status extragere", value: order.extractionLabel },
    {
      label: "Extrasă la",
      value: order.extractedAt ? `${formatDateTime(order.extractedAt)}${order.extractedBy ? `, de ${order.extractedBy}` : ""}` : "Nu a fost extrasă",
    },
    { label: "Client", value: order.name },
    { label: "Telefon", value: order.phone },
    { label: "Email", value: order.email ?? "Nu a fost completat" },
    { label: "Adresa de livrare", value: order.address || "Nu a fost completată" },
    { label: "Metoda de plată", value: order.paymentMethod },
    { label: "Total", value: formatMoney(order.total) },
    { label: "Arhivată", value: order.archived ? "Da" : "Nu" },
  ];

  return (
    <div>
      <p className="mb-3">
        <Link href="/admin/comenzi" className="font-bold text-accent underline underline-offset-2 text-sm">
          Înapoi la registrul de comenzi
        </Link>
      </p>

      <h1 className="text-2xl font-extrabold text-primary tracking-tight">Comanda {order.ref}</h1>
      <p className="mt-1 text-base">{describeOrderForSpeech(order)}</p>

      <section aria-labelledby="date-titlu" className="mt-6 bg-card border border-border rounded-2xl p-5 max-w-2xl">
        <h2 id="date-titlu" className="text-lg font-extrabold text-primary mb-3">
          Datele comenzii
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-x-4 gap-y-2 text-sm">
          {rows.map((r) => (
            <div key={r.label} className="contents">
              <dt className="font-bold text-primary">{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="produse-titlu" className="mt-6 max-w-3xl">
        <h2 id="produse-titlu" className="text-lg font-extrabold text-primary mb-3">
          Produsele comenzii
        </h2>
        {order.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nu sunt produse înregistrate pentru această comandă.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card" tabIndex={0} role="region" aria-label="Produsele comenzii, derulabil pe orizontală">
            <table className="w-full text-sm text-left">
              <caption className="sr-only">
                Produsele comenzii {order.ref}: {order.items.length} {order.items.length === 1 ? "produs" : "produse"}.
              </caption>
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-3 py-2 font-bold">Produs</th>
                  <th scope="col" className="px-3 py-2 font-bold">Cantitate</th>
                  <th scope="col" className="px-3 py-2 font-bold">Preț unitar</th>
                  <th scope="col" className="px-3 py-2 font-bold">Total produs</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, i) => (
                  <tr key={i} className="border-t border-border">
                    <th scope="row" className="px-3 py-2 font-semibold">
                      {it.name}
                      {it.estimated && <span className="block text-xs font-normal text-muted-foreground">Preț calculat din catalogul actual (comandă veche)</span>}
                    </th>
                    <td className="px-3 py-2">{it.quantity}</td>
                    <td className="px-3 py-2">{formatMoney(it.unitPrice)}</td>
                    <td className="px-3 py-2">{formatMoney(it.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="arhiva-titlu" className="mt-6 max-w-2xl">
        <h2 id="arhiva-titlu" className="text-lg font-extrabold text-primary mb-2">
          Arhivare
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          Comenzile nu se șterg. Arhivarea doar o ascunde din lista implicită; comanda rămâne în registru și în exporturi.
        </p>
        <form action={archiveOrderAction}>
          <input type="hidden" name="id" value={order.id} />
          <input type="hidden" name="archived" value={order.archived ? "false" : "true"} />
          <button type="submit" className="h-11 px-5 rounded-xl border-2 border-primary text-primary text-sm font-semibold">
            {order.archived ? `Scoate comanda ${order.ref} din arhivă` : `Arhivează comanda ${order.ref}`}
          </button>
        </form>
      </section>
    </div>
  );
}
