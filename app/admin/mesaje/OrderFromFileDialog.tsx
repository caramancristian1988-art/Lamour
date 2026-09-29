"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, CheckCircle2, XCircle, Search, X } from "lucide-react";
import type { ParsedOrderFile, ParsedOrderRow, OrderFileProduct } from "@/lib/orderFileImport";
import { unitPriceFor } from "@/lib/pricing";
import { analyzeOrderFileAction, createOrderFromFileAction } from "@/lib/adminOrderFileActions";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";

type Step = "pick" | "checking" | "review" | "creating" | "done";

interface RowState {
  line: number;
  raw: string;
  quantity: number;
  productId: string | null;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function formatPriceShort(v: number): string {
  return `${(Math.round(v * 100) / 100).toLocaleString("ro-MD")} MDL`;
}

// Combobox simplu (căutare + listă) pentru a alege manual produsul unui rând — catalogul întreg (~300 produse)
// e deja pe client (trimis de analyzeOrderFileAction), deci căutarea e instantă, fără cereri noi la server.
function ProductPicker({
  products,
  byId,
  value,
  onChange,
}: {
  products: OrderFileProduct[];
  byId: Map<string, OrderFileProduct>;
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? byId.get(value) ?? null : null;
  const results = useMemo(() => {
    if (!open) return [];
    const q = normalize(query.trim());
    const pool = q ? products.filter((p) => normalize(p.name).includes(q) || (p.code && normalize(p.code).includes(q))) : products;
    return pool.slice(0, 30);
  }, [open, query, products]);

  return (
    <div ref={ref} className="relative min-w-[220px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          value={open ? query : selected?.name ?? ""}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setQuery(""); setOpen(true); }}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder="— alege produsul —"
          aria-label="Alege produsul"
          className={`h-9 w-full rounded-lg border bg-card pl-7 pr-7 text-xs font-semibold outline-none focus-visible:border-accent ${
            selected ? "border-border text-foreground" : "border-amber-300 bg-amber-50 text-amber-800"
          }`}
        />
        {selected && !open && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onChange(null); }}
            aria-label="Elimină produsul ales"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
      {open && (
        <div role="listbox" className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-xl">
          {results.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">Niciun produs găsit.</p>}
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              role="option"
              aria-selected={p.id === value}
              onMouseDown={(e) => { e.preventDefault(); onChange(p.id); setOpen(false); }}
              className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs hover:bg-muted"
            >
              <span className="truncate">
                {p.name} {p.code && <span className="text-muted-foreground">({p.code})</span>}
              </span>
              <span className="shrink-0 font-bold text-primary">{formatPriceShort(p.price)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Comandă nouă din fișier (Excel/CSV/PDF): clientul trimite lista de produse gata scrisă (Excel exportat, PDF cu
// tabel etc.) — recunoaștem produsele și cantitățile, operatorul verifică/corectează, apoi comanda intră pe fluxul
// obișnuit (apare în Telegram ca oricare alta). Aceeași creare mai există și direct din Telegram (fără acest pas de
// verificare — vezi app/api/telegram/webhook/route.ts), pentru operatorii care nu prea deschid site-ul.
export default function OrderFromFileDialog() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedOrderFile | null>(null);
  const [rows, setRows] = useState<RowState[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [note, setNote] = useState("");
  const [needsInvoice, setNeedsInvoice] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyIdno, setCompanyIdno] = useState("");
  // Implicit "livrăm noi" (fără AWB), cât timp fișierul nu cere explicit EVS — la fel ca din Telegram.
  const [evsDelivery, setEvsDelivery] = useState(false);
  const [paymentByTransfer, setPaymentByTransfer] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  function reset() {
    setStep("pick");
    setFile(null);
    setError(null);
    setParsed(null);
    setRows([]);
    setName("");
    setPhone("");
    setLocality("");
    setAddress("");
    setZip("");
    setNote("");
    setNeedsInvoice(false);
    setCompanyName("");
    setCompanyIdno("");
    setEvsDelivery(false);
    setPaymentByTransfer(false);
    setOrderNumber(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onOpenChange(next: boolean) {
    if (!next && step === "creating") return;
    setOpen(next);
    if (!next) {
      if (step === "done") router.refresh();
      reset();
    }
  }

  const byId = useMemo(() => new Map((parsed?.products ?? []).map((p) => [p.id, p])), [parsed]);

  async function check() {
    if (!file) return;
    setError(null);
    setStep("checking");
    const body = new FormData();
    body.set("file", file);
    const result = await analyzeOrderFileAction(body);
    if (!result.ok) {
      setError(result.error);
      setStep("pick");
      return;
    }
    setParsed(result.data);
    setRows(result.data.rows.map((r: ParsedOrderRow) => ({ line: r.line, raw: r.raw, quantity: r.quantity, productId: r.matchedProductId })));
    // Fișierul are adesea deja Client/Adresa/Telefon/„Necesită E-Factură” — le pre-completăm, dar operatorul
    // tot le poate corecta înainte de a crea comanda (nimic nu se scrie automat fără verificare aici).
    const h = result.data.header;
    if (h.clientName) setName(h.clientName);
    if (h.clientPhone) setPhone(h.clientPhone);
    if (h.clientAddress) setAddress(h.clientAddress);
    if (h.needsInvoice) setNeedsInvoice(true);
    if (h.companyName) setCompanyName(h.companyName);
    if (h.companyIdno) setCompanyIdno(h.companyIdno);
    setEvsDelivery(h.deliveryMethod === "evs");
    setPaymentByTransfer(h.paymentByTransfer);
    setStep("review");
  }

  function updateRow(line: number, patch: Partial<RowState>) {
    setRows((prev) => prev.map((r) => (r.line === line ? { ...r, ...patch } : r)));
  }

  const included = rows.filter((r) => r.productId);
  const subtotal = included.reduce((sum, r) => {
    const p = byId.get(r.productId!);
    if (!p) return sum;
    return sum + unitPriceFor(p.price, p.priceTiers, r.quantity) * r.quantity;
  }, 0);

  async function create() {
    setError(null);
    setStep("creating");
    const result = await createOrderFromFileAction({
      name,
      phone,
      deliveryLocality: locality || undefined,
      deliveryAddress: address || undefined,
      deliveryZip: zip || undefined,
      note: note || undefined,
      filename: file?.name,
      externalOrderNumber: parsed?.header.externalOrderNumber ?? undefined,
      items: included.map((r) => ({ productId: r.productId as string, quantity: r.quantity })),
      needsInvoice,
      companyName: needsInvoice ? companyName || undefined : undefined,
      companyIdno: needsInvoice ? companyIdno || undefined : undefined,
      ownDelivery: !evsDelivery,
      paymentByTransfer,
    });
    if (!result.ok) {
      setError(result.error ?? "Nu am putut crea comanda.");
      setStep("review");
      return;
    }
    setOrderNumber(result.orderNumber ?? null);
    setStep("done");
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FileUp className="w-4 h-4" aria-hidden />
        Comandă nouă din fișier
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Comandă nouă din fișier</DialogTitle>
            <DialogDescription className="text-sm">
              Un client trimite lista de produse ca Excel sau PDF (cu tabel) — o citim automat, verifici produsele și cantitățile, apoi
              comanda pleacă direct la depozitar (fără pasul de confirmare din Telegram) și apare în grup ca oricare alta.
            </DialogDescription>
          </DialogHeader>

          {(step === "pick" || step === "checking") && (
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-primary">
                Fișier (.xlsx, .csv sau .pdf)
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  disabled={step === "checking"}
                  className="text-sm font-normal text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-secondary-foreground"
                />
              </label>
              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {error}
                </p>
              )}
              <Button onClick={check} disabled={!file || step === "checking"} className="self-start">
                {step === "checking" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Se citește…
                  </>
                ) : (
                  "Verifică fișierul"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Numele clientului și telefonul le completezi la pasul următor. Nimic nu se creează până nu apeși „Creează comanda”.
              </p>
            </div>
          )}

          {(step === "review" || step === "creating") && parsed && (
            // min-w-0: DialogContent e grid, iar un element de grid nu se micșorează implicit sub lățimea tabelului
            // (picker-ul are min-w-[220px]) — pe telefon lărgea tot dialogul și tăia câmpurile din dreapta.
            <div className="flex min-w-0 flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                {included.length} din {rows.length} rânduri recunoscute
                {rows.length > included.length && <span className="text-amber-700"> — restul sunt evidențiate, alege produsul manual sau lasă-le neatribuite (nu vor intra în comandă)</span>}.
              </p>

              <div className="max-h-[32vh] overflow-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-bold">Text din fișier</th>
                      <th className="px-3 py-2 font-bold w-20">Cant.</th>
                      <th className="px-3 py-2 font-bold">Produs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((r) => (
                      <tr key={r.line} className={!r.productId ? "bg-amber-50/60" : undefined}>
                        <td className="px-3 py-2 max-w-[220px] truncate text-muted-foreground" title={r.raw}>{r.raw}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={1}
                            value={r.quantity}
                            onChange={(e) => updateRow(r.line, { quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                            aria-label={`Cantitate pentru ${r.raw}`}
                            className="h-9 w-16 rounded-lg border border-border bg-card px-2 text-xs font-bold outline-none focus-visible:border-accent"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <ProductPicker products={parsed.products} byId={byId} value={r.productId} onChange={(id) => updateRow(r.line, { productId: id })} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Input placeholder="Nume complet client" aria-label="Nume complet client" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Telefon" aria-label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input placeholder="Localitate (opțional)" aria-label="Localitate" value={locality} onChange={(e) => setLocality(e.target.value)} />
                <Input placeholder="Adresă (opțional)" aria-label="Adresă" value={address} onChange={(e) => setAddress(e.target.value)} />
                <Input placeholder="Cod poștal (opțional)" aria-label="Cod poștal" value={zip} onChange={(e) => setZip(e.target.value)} />
                <Input
                  placeholder={`Notă internă (implicit: „Comandă introdusă din fișierul „${file?.name ?? ""}”${
                    parsed?.header.externalOrderNumber ? ` (nr. extern ${parsed.header.externalOrderNumber})` : ""
                  }.”)`}
                  aria-label="Notă internă"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={needsInvoice}
                  onChange={(e) => setNeedsInvoice(e.target.checked)}
                  aria-label="Necesită factură"
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                Necesită factură (companie) — se trimite automat contabilului
              </label>
              {needsInvoice && (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <Input placeholder="Denumire companie" aria-label="Denumire companie" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  <Input placeholder="IDNO / Cod fiscal" aria-label="IDNO / Cod fiscal" value={companyIdno} onChange={(e) => setCompanyIdno(e.target.value)} />
                </div>
              )}

              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={evsDelivery}
                  onChange={(e) => setEvsDelivery(e.target.checked)}
                  aria-label="Livrare prin curier EVS"
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                Livrare prin curier EVS (se creează AWB — are nevoie de adresă și cod poștal); nebifat = livrăm noi
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={paymentByTransfer}
                  onChange={(e) => setPaymentByTransfer(e.target.checked)}
                  aria-label="Plată prin transfer bancar"
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                Plată prin transfer bancar (fără ramburs la livrare)
              </label>

              <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-3 py-2 text-sm">
                <span>
                  <b>{included.length}</b> produse incluse
                </span>
                <span className="font-bold text-primary">Subtotal: {formatPriceShort(subtotal)}</span>
              </div>

              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={create} disabled={included.length === 0 || !name.trim() || !phone.trim() || step === "creating"}>
                  {step === "creating" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Se creează…
                    </>
                  ) : (
                    `Creează comanda (${included.length} produse)`
                  )}
                </Button>
                <Button variant="ghost" onClick={reset} disabled={step === "creating"}>
                  Alt fișier
                </Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-2 text-base font-bold text-primary">
                <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
                {orderNumber ? `Comanda #${orderNumber} a fost creată` : "Comanda a fost creată"}
              </p>
              <p className="text-sm text-muted-foreground">A plecat direct la depozitar (fără pasul de confirmare) și apare în grupul de Telegram.</p>
              <Button onClick={() => onOpenChange(false)} className="self-start">
                Închide
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
