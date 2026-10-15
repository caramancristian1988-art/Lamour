"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/app/components/ui/button";

const FORMATS = [
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "csv", label: "CSV (.csv)" },
  { value: "pdf", label: "PDF (.pdf)" },
] as const;

// Exportă comenzile din coș aflate încă în lucru (Nouă / Confirmată) — nu cele
// deja predate curierului sau anulate. Operatorii cer asta ca să le poată
// urmări în Excel, unde le e mai comod decât în lista din admin.
export default function OrdersExportButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
        <Download className="w-3.5 h-3.5" aria-hidden />
        Exportă comenzile nelivrate
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
            {FORMATS.map((f) => (
              <a
                key={f.value}
                href={`/api/admin/orders-export?format=${f.value}`}
                download
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                {f.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
