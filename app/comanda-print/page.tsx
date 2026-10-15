import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseCartOrderMessage } from "@/lib/orderMessage";
import { CART_ORDER_SOURCE, orderStageLabel } from "@/lib/orderStages";
import { formatKg } from "@/lib/orderWeight";
import PrintControls from "./PrintControls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fișă de comandă",
  robots: { index: false, follow: false },
};

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

function tokensMatch(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function normalize(name: string): string {
  return name.replace(/\s+/g, " ").trim().toLowerCase();
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ro-MD", {
    timeZone: "Europe/Chisinau",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Fișa de comandă pentru depozitar (de tipărit): cine, unde, ce produse (cu cod), cât se încasează, factură.
// Acces: admin logat SAU linkul cu token al comenzii (butonul "🖨 Printează" din Telegram) — depozitarul nu are cont.
export default async function OrderPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string; auto?: string }>;
}) {
  const { id = "", token = "", auto } = await searchParams;
  if (!OBJECT_ID_RE.test(id)) notFound();

  const order = await prisma.contactMessage.findUnique({ where: { id } });
  if (!order || order.source !== CART_ORDER_SOURCE) notFound();

  const user = await getSession();
  const authorized = Boolean(user?.isAdmin) || Boolean(token && order.editToken && tokensMatch(token, order.editToken));
  // 404, nu 403: nu confirmăm existența comenzii cuiva fără drept de acces.
  if (!authorized) notFound();

  const parsed = order.message ? parseCartOrderMessage(order.message) : null;
  const products = order.productIds.length
    ? await prisma.product.findMany({ where: { id: { in: order.productIds } }, select: { id: true, name: true, code: true, weightKg: true } })
    : [];
  const byId = new Map(products.map((p) => [p.id, p]));
  const byName = new Map(products.map((p) => [normalize(p.name), p]));

  // Codul produsului pentru fiecare rând: după ordinea din orderItems (aceeași cu a liniilor din mesaj) când
  // numărul coincide, altfel după nume.
  const stored = Array.isArray(order.orderItems) ? (order.orderItems as { productId?: string }[]) : [];
  const productFor = (index: number, name: string) => {
    const aligned = parsed && stored.length === parsed.items.length ? byId.get(stored[index]?.productId ?? "") : undefined;
    return aligned ?? byName.get(normalize(name));
  };
  // Rânduri fără greutate pe produs: în greutatea comenzii s-au socotit la 1 kg/buc. (vezi lib/orderWeight.ts).
  const missingWeight = parsed ? parsed.items.filter((it, i) => !productFor(i, it.name)?.weightKg).length : 0;

  const cancelled = order.orderStage === "anulata";
  const ref = order.orderNumber ? `#${order.orderNumber}` : "";

  return (
    <main className="bg-white text-black min-h-screen print:min-h-0">
      <div className="max-w-3xl mx-auto px-6 py-8 print:p-0 print:max-w-none">
        <PrintControls auto={auto === "1"} />

        <header className="flex items-start justify-between gap-4 border-b-2 border-black pb-3 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest">LuminTehnica — fișă de comandă</p>
            <h1 className="text-3xl font-extrabold mt-1">Comanda {ref || "(fără număr)"}</h1>
          </div>
          <div className="text-right text-sm">
            <p>Plasată: <b>{formatDate(order.createdAt)}</b></p>
            <p>Etapă: <b>{orderStageLabel(order.orderStage)}</b></p>
            {order.awbCode && <p>AWB: <b className="font-mono">{order.awbCode}</b></p>}
          </div>
        </header>

        {cancelled && (
          <p className="mb-5 border-2 border-black px-3 py-2 text-center font-extrabold uppercase tracking-widest">Comandă anulată — nu se pregătește</p>
        )}

        <section className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest border-b border-black mb-2 pb-1">Client</h2>
            <p className="text-base font-bold">{order.name}</p>
            <p>Tel: <b>{order.phone}</b></p>
            {order.email && <p>Email: {order.email}</p>}
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest border-b border-black mb-2 pb-1">Livrare</h2>
            <p className="text-base font-bold">{order.deliveryLocality ?? "—"}</p>
            <p>{order.deliveryAddress ?? parsed?.address ?? "—"}</p>
            {order.deliveryZip && <p>Cod poștal: {order.deliveryZip}</p>}
          </div>
        </section>

        {parsed ? (
          <section className="mb-6">
            <h2 className="text-xs font-extrabold uppercase tracking-widest border-b border-black mb-2 pb-1">Produse de pregătit</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th className="border border-black px-2 py-1.5 w-8 text-center">✔</th>
                  <th className="border border-black px-2 py-1.5 w-24">Cod</th>
                  <th className="border border-black px-2 py-1.5">Denumire</th>
                  <th className="border border-black px-2 py-1.5 w-16 text-center">Cant.</th>
                  <th className="border border-black px-2 py-1.5 w-16 text-right">Kg</th>
                  <th className="border border-black px-2 py-1.5 w-24 text-right">Preț</th>
                  <th className="border border-black px-2 py-1.5 w-24 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {parsed.items.map((it, i) => {
                  const product = productFor(i, it.name);
                  const lineKg = product?.weightKg ? product.weightKg * (Number(it.qty) || 0) : null;
                  return (
                  <tr key={i} className="break-inside-avoid">
                    <td className="border border-black px-2 py-2 text-center text-lg leading-none">☐</td>
                    <td className="border border-black px-2 py-2 font-mono font-bold">{product?.code ?? "—"}</td>
                    <td className="border border-black px-2 py-2">
                      {it.name}
                      {it.note && <span className="block text-xs italic">{it.note}</span>}
                    </td>
                    <td className="border border-black px-2 py-2 text-center text-base font-extrabold">{it.qty ?? "—"}</td>
                    <td className="border border-black px-2 py-2 text-right whitespace-nowrap">{lineKg ? formatKg(lineKg) : "—"}</td>
                    <td className="border border-black px-2 py-2 text-right whitespace-nowrap">{it.unit ?? "—"}</td>
                    <td className="border border-black px-2 py-2 text-right whitespace-nowrap font-bold">{it.total ?? "—"}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>

            {order.deliveryWeightKg ? (
              <p className="mt-3 text-sm text-right">
                Greutate totală (pentru AWB): <b>{formatKg(order.deliveryWeightKg)}</b>
                {missingWeight > 0 && (
                  <span className="block text-xs">(include {missingWeight} produs(e) fără greutate introdusă, socotite la 1 kg/buc.)</span>
                )}
              </p>
            ) : null}

            <div className="mt-3 ml-auto max-w-xs text-sm">
              {parsed.totals.subtotal && <p className="flex justify-between"><span>Produse</span><span>{parsed.totals.subtotal}</span></p>}
              {parsed.totals.savings && <p className="flex justify-between"><span>Economie</span><span>{parsed.totals.savings}</span></p>}
              {parsed.totals.delivery && (
                <p className="flex justify-between">
                  <span>Livrare{parsed.totals.deliveryLabel ? ` (${parsed.totals.deliveryLabel})` : ""}</span>
                  <span>{parsed.totals.delivery}</span>
                </p>
              )}
              {parsed.totals.total && (
                <p className="flex justify-between border-t-2 border-black mt-1 pt-1 text-base font-extrabold">
                  <span>De încasat</span>
                  <span>{parsed.totals.total}</span>
                </p>
              )}
            </div>
          </section>
        ) : (
          // Format necunoscut: arătăm textul comenzii ca atare, ca fișa să nu rămână goală.
          <section className="mb-6">
            <h2 className="text-xs font-extrabold uppercase tracking-widest border-b border-black mb-2 pb-1">Comanda</h2>
            <pre className="whitespace-pre-wrap text-sm font-sans">{order.message}</pre>
          </section>
        )}

        {parsed && parsed.invoice.length > 0 && (
          <section className="mb-6 border border-black p-3 text-sm break-inside-avoid">
            <h2 className="text-xs font-extrabold uppercase tracking-widest mb-1">Factură pe companie</h2>
            {parsed.invoice.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </section>
        )}

        {parsed?.clientNote && (
          <section className="mb-6 text-sm break-inside-avoid">
            <h2 className="text-xs font-extrabold uppercase tracking-widest border-b border-black mb-2 pb-1">Mesajul clientului</h2>
            <p className="whitespace-pre-line">{parsed.clientNote}</p>
          </section>
        )}

        <footer className="mt-10 grid grid-cols-2 gap-6 text-sm break-inside-avoid">
          <p className="border-t border-black pt-1">Pregătit de (nume, semnătură)</p>
          <p className="border-t border-black pt-1">Data / ora predării către curier</p>
        </footer>
      </div>
    </main>
  );
}
