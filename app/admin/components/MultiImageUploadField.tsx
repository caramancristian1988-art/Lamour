"use client";

import { useState } from "react";
import Image from "next/image";

export default function MultiImageUploadField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string[];
}) {
  const [urls, setUrls] = useState<string[]>(defaultValue ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Eroare la încărcare.");
        uploaded.push(data.url);
      }
      setUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la încărcare.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeAt(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-gray-600">{label}</span>
      <input type="hidden" name={name} value={urls.join("\n")} />

      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-1">
          {urls.map((url, i) => (
            <div key={url + i} className="relative w-16 h-16 rounded-xl bg-[#f6f8fb] border border-gray-200 overflow-hidden group">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Elimină imaginea"
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="self-start inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-sm font-semibold text-[#1d2353] px-4 py-2.5 rounded-xl cursor-pointer transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 7.5L12 3m0 0L7.5 7.5M12 3v13.5" />
        </svg>
        {uploading ? "Se încarcă..." : "Adaugă imagini"}
        <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={uploading} className="hidden" />
      </label>
      {error && <p className="text-xs text-[#c7092b]">{error}</p>}
    </div>
  );
}
