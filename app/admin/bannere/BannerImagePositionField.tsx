"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Label } from "@/app/components/ui/label";

export default function BannerImagePositionField({
  imageDefault,
  ctaLabelDefault,
  posXDefault,
  posYDefault,
}: {
  imageDefault?: string | null;
  ctaLabelDefault?: string | null;
  posXDefault?: number;
  posYDefault?: number;
}) {
  const [url, setUrl] = useState(imageDefault ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [posX, setPosX] = useState(posXDefault ?? 15);
  const [posY, setPosY] = useState(posYDefault ?? 85);
  const previewRef = useRef<HTMLDivElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la încărcare.");
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la încărcare.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function setPositionFromPoint(clientX: number, clientY: number) {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    setPosX(Math.round(x));
    setPosY(Math.round(y));
  }

  function startDrag(clientX: number, clientY: number) {
    setPositionFromPoint(clientX, clientY);

    function onMouseMove(e: MouseEvent) {
      setPositionFromPoint(e.clientX, e.clientY);
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      if (t) setPositionFromPoint(t.clientX, t.clientY);
    }
    function stop() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stop);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", stop);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Imagine banner</Label>
      <input type="hidden" name="image" value={url} />
      <input type="hidden" name="ctaPositionX" value={posX} />
      <input type="hidden" name="ctaPositionY" value={posY} />

      <div className="flex items-center gap-3 flex-wrap">
        <label className="inline-flex items-center gap-2 border-2 border-input hover:bg-muted text-sm font-semibold text-primary px-4 py-2.5 rounded-xl cursor-pointer transition-colors">
          <Upload className="w-4 h-4" aria-hidden />
          {uploading ? "Se încarcă..." : url ? "Schimbă imaginea" : "Alege din calculator"}
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
        </label>
        {url && !uploading && (
          <button type="button" onClick={() => setUrl("")} className="text-sm text-muted-foreground hover:text-accent transition-colors">
            Elimină
          </button>
        )}
      </div>
      {error && <p className="text-sm text-accent">{error}</p>}

      {url && (
        <>
          <p className="text-xs text-muted-foreground mt-2">
            Trage marcajul roșu ca să poziționezi butonul exact unde vrei pe banner.
          </p>
          <div
            ref={previewRef}
            className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border-2 border-border bg-muted cursor-crosshair select-none touch-none"
            onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              const t = e.touches[0];
              if (t) startDrag(t.clientX, t.clientY);
            }}
          >
            <Image src={url} alt="" fill className="object-cover pointer-events-none" />
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none"
              style={{ left: `${posX}%`, top: `${posY}%` }}
            >
              <div className="bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap">
                {ctaLabelDefault || "Buton"}
              </div>
              <div className="w-3 h-3 rounded-full bg-accent border-2 border-white shadow" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
