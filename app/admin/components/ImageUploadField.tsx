"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Label } from "@/app/components/ui/label";

export default function ImageUploadField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <input type="hidden" name={name} value={url} />

      <div className="flex items-center gap-3 flex-wrap">
        {url && (
          <div className="relative w-16 h-16 rounded-xl bg-muted border border-border overflow-hidden shrink-0">
            <Image src={url} alt="" fill className="object-contain" />
          </div>
        )}
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
    </div>
  );
}
