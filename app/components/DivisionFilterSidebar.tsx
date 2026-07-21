"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface FacetGroup {
  title: string;
  paramKey: string;
  options: FacetOption[];
}

interface Props {
  groups: FacetGroup[];
}

export default function DivisionFilterSidebar({ groups }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedByKey = new Map(groups.map((g) => [g.paramKey, searchParams.get(g.paramKey)?.split(",").filter(Boolean) ?? []]));

  function go(params: URLSearchParams) {
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    if (next.length > 0) params.set(key, next.join(",")); else params.delete(key);
    go(params);
  }

  function removeValue(key: string, value: string) {
    toggle(key, value);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    groups.forEach((g) => params.delete(g.paramKey));
    go(params);
  }

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  groups.forEach((g) => {
    (selectedByKey.get(g.paramKey) ?? []).forEach((value) => {
      const opt = g.options.find((o) => o.value === value);
      if (opt) activeChips.push({ key: `${g.paramKey}-${value}`, label: opt.label, onRemove: () => removeValue(g.paramKey, value) });
    });
  });
  const hasActive = activeChips.length > 0;

  const sidebarContent = (
    <div className="flex flex-col gap-6">
      {hasActive && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary mb-3">Filtre active</p>
          <div className="flex flex-col gap-2 mb-3">
            {activeChips.map((chip) => (
              <Badge key={chip.key} variant="outline" className="w-full justify-between normal-case font-semibold text-primary">
                {chip.label}
                <button onClick={chip.onRemove} aria-label={`Elimină filtrul ${chip.label}`} className="text-muted-foreground hover:text-accent transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" aria-hidden />
                </button>
              </Badge>
            ))}
          </div>
          <Button onClick={clearAll} variant="primary" size="sm" className="w-full">
            Șterge tot
          </Button>
        </div>
      )}

      {groups.map((g) => {
        if (g.options.length === 0) return null;
        const selected = selectedByKey.get(g.paramKey) ?? [];
        return (
          <div key={g.paramKey}>
            <p className="text-xs font-bold uppercase tracking-wide text-primary mb-3">{g.title}</p>
            <div className="flex flex-col gap-3">
              {g.options.map((opt) => {
                const id = `${g.paramKey}-${opt.value}`;
                return (
                  <label key={opt.value} htmlFor={id} className="flex items-center justify-between gap-2 text-sm text-foreground cursor-pointer hover:text-accent">
                    <span className="flex items-center gap-2.5">
                      <Checkbox id={id} checked={selected.includes(opt.value)} onCheckedChange={() => toggle(g.paramKey, opt.value)} />
                      {opt.label}
                    </span>
                    <span className="text-xs text-muted-foreground">({opt.count})</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="lg:hidden mb-3">
        <Button onClick={() => setMobileOpen(true)} variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="w-4 h-4" aria-hidden />
          Filtre {hasActive && `(${activeChips.length})`}
        </Button>
      </div>

      <aside className="hidden lg:block w-64 shrink-0">{sidebarContent}</aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="lg:hidden overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtre</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
