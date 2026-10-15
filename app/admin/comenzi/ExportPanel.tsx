"use client";

import { useRef, useState, useTransition } from "react";
import { prepareExportAction, confirmExportAction, cancelExportAction, type ExportActionResult } from "./actions";
import { Button } from "@/app/components/ui/button";

export interface ActiveExport {
  id: string;
  number: number;
  orderCount: number;
  initiatedByName: string;
  createdAtText: string;
  reservedUntilText: string;
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? `1 ${one}` : `${n} ${many}`;
}

// Etichete lungi (citite integral de cititorul de ecran) trebuie să poată trece pe mai multe rânduri.
const WRAP = "h-auto whitespace-normal text-left py-2";

// Fluxul de extragere pe site: Pregătește → Descarcă → Confirmă (sau Anulează). Gândit pentru cititor de ecran:
//  • rezultatul fiecărei acțiuni e anunțat într-o zonă aria-live (status = politicos, alertă = erori);
//  • nu există ferestre modale — confirmarea e o casetă bifată + un buton cu etichetă explicită;
//  • focusul nu dispare: după pregătire merge pe titlul exportului, după confirmare/anulare revine pe butonul principal;
//  • descărcarea e un link normal; NU anunțăm „descărcare completă” (browserul nu ne poate confirma asta).
export default function ExportPanel({ initialActive, newCount }: { initialActive: ActiveExport[]; newCount: number }) {
  const [active, setActive] = useState<ActiveExport[]>(initialActive);
  const [status, setStatus] = useState("");
  const [alert, setAlert] = useState("");
  const [pending, startTransition] = useTransition();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const prepareButtonRef = useRef<HTMLButtonElement>(null);
  const headingRefs = useRef<Record<string, HTMLHeadingElement | null>>({});
  const checkboxRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function show(result: ExportActionResult) {
    if (result.ok) {
      setAlert("");
      setStatus(result.message);
    } else {
      setStatus("");
      setAlert(result.message);
    }
  }

  function prepare() {
    setStatus("Se pregătește exportul. Așteptați puțin.");
    setAlert("");
    startTransition(async () => {
      const result = await prepareExportAction();
      show(result);
      if (result.ok && result.exportId && result.exportNumber !== undefined) {
        const id = result.exportId;
        const entry: ActiveExport = {
          id,
          number: result.exportNumber,
          orderCount: result.orderCount ?? 0,
          initiatedByName: "dumneavoastră",
          createdAtText: "acum",
          reservedUntilText: "24 de ore",
        };
        setActive((prev) => (prev.some((e) => e.id === id) ? prev : [entry, ...prev]));
        // După randare mutăm focusul pe titlul exportului, ca utilizatorul să audă imediat ce a apărut.
        setTimeout(() => headingRefs.current[id]?.focus(), 50);
      }
    });
  }

  function confirm(exp: ActiveExport) {
    if (!checked[exp.id]) {
      setStatus("");
      setAlert("Bifați mai întâi caseta care confirmă că ați primit fișierul și îl puteți folosi.");
      checkboxRefs.current[exp.id]?.focus();
      return;
    }
    setStatus("Se confirmă extragerea. Așteptați puțin.");
    setAlert("");
    startTransition(async () => {
      const result = await confirmExportAction(exp.id);
      show(result);
      if (result.ok || result.kind === "closed") {
        setActive((prev) => prev.filter((e) => e.id !== exp.id));
        setTimeout(() => prepareButtonRef.current?.focus(), 50);
      }
    });
  }

  function cancel(exp: ActiveExport) {
    setStatus("Se anulează exportul. Așteptați puțin.");
    setAlert("");
    startTransition(async () => {
      const result = await cancelExportAction(exp.id);
      show(result);
      if (result.ok || result.kind === "closed") {
        setActive((prev) => prev.filter((e) => e.id !== exp.id));
        setTimeout(() => prepareButtonRef.current?.focus(), 50);
      }
    });
  }

  return (
    <section aria-labelledby="extragere-titlu" className="bg-card border border-border rounded-2xl p-5 mb-6">
      <h2 id="extragere-titlu" className="text-lg font-extrabold text-primary">
        Extragere în Excel
      </h2>
      <p className="mt-1 text-sm text-foreground">
        {newCount === 0
          ? "Nu există comenzi noi pentru extragere."
          : `Aveți ${plural(newCount, "comandă nouă, neextrasă", "comenzi noi, neextrase")}.`}{" "}
        Extragerea include doar comenzile neextrase. Comenzile rămân în registru și după extragere.
      </p>

      <div className="mt-3">
        <Button ref={prepareButtonRef} type="button" variant="accent" onClick={prepare} disabled={pending} className={WRAP}>
          Pregătește exportul comenzilor neextrase
        </Button>
      </div>

      {/* Zone anunțate de cititorul de ecran: rămân mereu în pagină, doar textul se schimbă. */}
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-sm font-semibold text-foreground min-h-5">
        {status}
      </p>
      <p role="alert" className="text-sm font-semibold text-destructive">
        {alert}
      </p>

      {active.length > 0 && (
        <div className="mt-4">
          <h3 className="text-base font-bold text-primary">Exporturi în curs, neconfirmate</h3>
          <ul className="mt-2 flex flex-col gap-4">
            {active.map((exp) => (
              <li key={exp.id} className="border border-border rounded-xl p-4">
                <h4
                  ref={(el) => {
                    headingRefs.current[exp.id] = el;
                  }}
                  tabIndex={-1}
                  className="text-base font-bold text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                >
                  Export numărul {exp.number}, {plural(exp.orderCount, "comandă", "comenzi")}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Pornit de {exp.initiatedByName}, {exp.createdAtText}. Rezervarea comenzilor expiră în {exp.reservedUntilText}; dacă nu confirmați,
                  comenzile revin singure la statusul neextrasă.
                </p>

                <ol className="mt-3 flex flex-col gap-3 list-decimal pl-5 text-sm">
                  <li>
                    <a href={`/api/admin/comenzi/export/${exp.id}/file`} download className="font-bold text-accent underline underline-offset-2">
                      Descarcă fișierul Excel al exportului {exp.number}
                    </a>
                    <span className="block text-muted-foreground">
                      Se poate descărca de oricâte ori; conține mereu aceleași comenzi. Verificați că fișierul s-a deschis corect.
                    </span>
                  </li>
                  <li>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        ref={(el) => {
                          checkboxRefs.current[exp.id] = el;
                        }}
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={Boolean(checked[exp.id])}
                        onChange={(e) => setChecked((prev) => ({ ...prev, [exp.id]: e.target.checked }))}
                      />
                      <span>Am primit fișierul exportului {exp.number} și îl pot folosi.</span>
                    </label>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <Button type="button" variant="primary" size="sm" onClick={() => confirm(exp)} disabled={pending} className={WRAP}>
                        Confirm extragerea celor {exp.orderCount} {exp.orderCount === 1 ? "comandă" : "comenzi"}
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => cancel(exp)} disabled={pending} className={WRAP}>
                        Anulează exportul {exp.number}
                      </Button>
                    </div>
                  </li>
                </ol>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
