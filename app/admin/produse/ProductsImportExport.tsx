"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { ImportAnalysis, ImportResult, RowStatus } from "@/lib/productExcel";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";

const STATUS_LABEL: Record<RowStatus, string> = {
  new: "Nou",
  identical: "Identic",
  changed: "Diferă",
  duplicate: "Repetat",
  error: "Eroare",
};

const STATUS_VARIANT: Record<RowStatus, "success" | "muted" | "accent" | "destructive"> = {
  new: "success",
  identical: "muted",
  changed: "accent",
  duplicate: "muted",
  error: "destructive",
};

const MAX_ROWS_SHOWN = 300;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

type Step = "pick" | "checking" | "review" | "importing" | "done";

// Export / import de produse în Excel. Exportul e un simplu link (fișierul se generează pe server). Importul are doi pași,
// ca să nu se scrie nimic pe nevăzute: „Verifică fișierul” arată ce e nou, ce e identic (se sare) și ce are erori; abia apoi
// „Importă” scrie în baza de date.
export default function ProductsImportExport() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("pick");
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ImportAnalysis | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [filter, setFilter] = useState<RowStatus | "all">("all");

  function reset() {
    setFile(null);
    setStep("pick");
    setError(null);
    setAnalysis(null);
    setResult(null);
    setUpdateExisting(false);
    setFilter("all");
    if (fileRef.current) fileRef.current.value = "";
  }

  function onOpenChange(next: boolean) {
    if (!next && step === "importing") return; // nu se închide în mijlocul unui import
    setOpen(next);
    if (!next) {
      if (step === "done") router.refresh();
      reset();
    }
  }

  async function send(mode: "analyze" | "apply") {
    if (!file) return null;
    const body = new FormData();
    body.set("file", file);
    body.set("mode", mode);
    if (mode === "apply" && updateExisting) body.set("updateExisting", "1");
    const res = await fetch("/api/admin/products-import", { method: "POST", body });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; analysis?: ImportAnalysis; result?: ImportResult } | null;
    if (!res.ok || !json?.ok) throw new Error(json?.error ?? "Cererea a eșuat. Încearcă din nou.");
    return json;
  }

  async function check() {
    setError(null);
    setStep("checking");
    try {
      const json = await send("analyze");
      setAnalysis(json?.analysis ?? null);
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu am putut verifica fișierul.");
      setStep("pick");
    }
  }

  async function runImport() {
    setError(null);
    setStep("importing");
    try {
      const json = await send("apply");
      setResult(json?.result ?? null);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Importul a eșuat.");
      setStep("review");
    }
  }

  const s = analysis?.summary;
  const toWrite = s ? s.new + (updateExisting ? s.changed : 0) : 0;
  const visibleRows = (analysis?.rows ?? []).filter((r) => filter === "all" || r.status === filter);

  return (
    <>
      <Button variant="outline" asChild>
        <a href="/api/admin/products-export" download>
          <Download className="w-4 h-4" aria-hidden />
          Exportă Excel
        </a>
      </Button>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="w-4 h-4" aria-hidden />
        Importă Excel
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Importă produse din Excel</DialogTitle>
            <DialogDescription className="text-sm">
              Cel mai simplu: exportă produsele, editează fișierul și importă-l înapoi. Produsele identice cu cele din site nu se adaugă a doua oară.
            </DialogDescription>
          </DialogHeader>

          {(step === "pick" || step === "checking") && (
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-primary">
                Fișier Excel (.xlsx) sau CSV
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
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
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Se verifică…
                  </>
                ) : (
                  "Verifică fișierul"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Nu se scrie nimic până nu apeși „Importă”. Imaginile se păstrează ca link-uri (coloanele „Imagine principală” / „Imagini suplimentare”).
              </p>
            </div>
          )}

          {(step === "review" || step === "importing") && analysis && s && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrează rândurile">
                {(
                  [
                    ["all", `Toate (${s.total})`],
                    ["new", `Noi (${s.new})`],
                    ["identical", `Identice — sărite (${s.identical})`],
                    ["changed", `Diferite (${s.changed})`],
                    ["duplicate", `Repetate (${s.duplicate})`],
                    ["error", `Erori (${s.error})`],
                  ] as [RowStatus | "all", string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    aria-pressed={filter === value}
                    className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                      filter === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-accent"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {analysis.ignored.length > 0 && (
                <p className="text-xs text-muted-foreground">Coloane necunoscute (ignorate): {analysis.ignored.join(", ")}</p>
              )}

              <div className="max-h-[38vh] overflow-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-bold">Rând</th>
                      <th className="px-3 py-2 font-bold">Produs</th>
                      <th className="px-3 py-2 font-bold">Stare</th>
                      <th className="px-3 py-2 font-bold">Detalii</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visibleRows.slice(0, MAX_ROWS_SHOWN).map((r) => (
                      <tr key={r.line}>
                        <td className="px-3 py-2 tabular-nums text-muted-foreground">{r.line}</td>
                        <td className="px-3 py-2 font-semibold text-primary">
                          {r.name}
                          {r.code && <span className="ml-1 font-mono font-normal text-muted-foreground">{r.code}</span>}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={STATUS_VARIANT[r.status]} className="px-2 py-0.5 text-[10px]">
                            {STATUS_LABEL[r.status]}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{r.details}</td>
                      </tr>
                    ))}
                    {visibleRows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                          Niciun rând în această categorie.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {visibleRows.length > MAX_ROWS_SHOWN && (
                <p className="text-xs text-muted-foreground">Se afișează primele {MAX_ROWS_SHOWN} rânduri din {visibleRows.length}; importul le procesează pe toate.</p>
              )}

              {s.changed > 0 && (
                <label className="flex items-start gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    disabled={step === "importing"}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span>
                    <b>{s.changed === 1 ? "Actualizează și produsul care există deja, dar diferă" : `Actualizează și cele ${s.changed} produse care există deja, dar diferă`}</b> (prețuri, descrieri etc. — vezi „Detalii”). Fără bifă, rămân neschimbate.
                  </span>
                </label>
              )}

              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={runImport} disabled={toWrite === 0 || step === "importing"}>
                  {step === "importing" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Se importă…
                    </>
                  ) : toWrite === 0 ? (
                    "Nimic de importat"
                  ) : (
                    `Importă ${toWrite} ${toWrite === 1 ? "produs" : "produse"}`
                  )}
                </Button>
                <Button variant="ghost" onClick={reset} disabled={step === "importing"}>
                  Alt fișier
                </Button>
                {s.error > 0 && <span className="text-xs text-muted-foreground">Rândurile cu erori nu se importă.</span>}
              </div>
            </div>
          )}

          {step === "done" && result && (
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-2 text-base font-bold text-primary">
                <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
                Import terminat
              </p>
              <ul className="grid gap-1 text-sm">
                <li><b>{plural(result.created, "produs adăugat", "produse adăugate")}</b></li>
                <li><b>{plural(result.updated, "produs actualizat", "produse actualizate")}</b></li>
                <li><b>{plural(result.skippedIdentical, "identic", "identice")}</b> — sărite (nu s-au adăugat din nou)</li>
                {result.skippedChanged > 0 && <li><b>{plural(result.skippedChanged, "produs există", "produse există")}</b> deja, dar diferă — neschimbate</li>}
                {result.skippedDuplicate > 0 && <li><b>{plural(result.skippedDuplicate, "rând repetat", "rânduri repetate")}</b> în fișier — sărite</li>}
                {result.errors.length > 0 && <li className="text-destructive"><b>{plural(result.errors.length, "rând", "rânduri")}</b> cu erori — neimportate</li>}
              </ul>
              {result.errors.length > 0 && (
                <ul className="max-h-40 overflow-auto rounded-xl border border-border p-3 text-xs text-destructive">
                  {result.errors.map((e, i) => (
                    <li key={i}>Rândul {e.line} ({e.name}): {e.message}</li>
                  ))}
                </ul>
              )}
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
