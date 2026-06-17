"use client";

import { useState } from "react";
import Image from "next/image";

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
      <span className="text-xs font-bold text-gray-600">{label}</span>
      <input type="hidden" name={name} value={url} />

      <div className="flex items-center gap-3">
        {url && (
          <div className="relative w-16 h-16 rounded-xl bg-[#f6f8fb] border border-gray-200 overflow-hidden shrink-0">
            <Image src={url} alt="" fill className="object-contain" />
          </div>
        )}
        <label className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-sm font-semibold text-[#1d2353] px-4 py-2.5 rounded-xl cursor-pointer transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 7.5L12 3m0 0L7.5 7.5M12 3v13.5" />
          </svg>
          {uploading ? "Se încarcă..." : url ? "Schimbă imaginea" : "Alege din calculator"}
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
        </label>
        {url && !uploading && (
          <button type="button" onClick={() => setUrl("")} className="text-xs text-gray-400 hover:text-[#c7092b] transition-colors">
            Elimină
          </button>
        )}
      </div>
      {error && <p className="text-xs text-[#c7092b]">{error}</p>}
    </div>
  );
}
