"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { submitContactMessageAction } from "@/lib/adminMessageActions";

type Status = "idle" | "error" | "success" | "pending";

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    data.set("source", pathname);
    const name = (data.get("name") as string).trim();
    const phone = (data.get("phone") as string).trim();

    const missing = [!name && "numele", !phone && "numărul de telefon"].filter(Boolean);

    if (missing.length > 0) {
      setMessage(`Lipsește ${missing.join(" și ")}.`);
      setStatus("error");
      return;
    }

    setStatus("pending");
    const result = await submitContactMessageAction({}, data);

    if (result.error) {
      setMessage(result.error);
      setStatus("error");
      return;
    }

    setStatus("success");
    setMessage("Mesajul a fost trimis! Te vom contacta în cel mai scurt timp.");
    formRef.current?.reset();

    setTimeout(() => setStatus("idle"), 5000);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          status === "idle" ? "max-h-0 opacity-0" : "max-h-24 opacity-100"
        }`}
      >
        {status === "error" && (
          <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {message}
          </p>
        )}
        {status === "success" && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Nume complet"
          className="border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#E31E24] placeholder:text-gray-400"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Telefon"
          className="border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#E31E24] placeholder:text-gray-400"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email (opțional)"
          className="border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#E31E24] placeholder:text-gray-400"
        />
        <input
          type="text"
          name="subject"
          placeholder="Subiect (opțional)"
          className="border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#E31E24] placeholder:text-gray-400"
        />
      </div>
      <textarea
        name="message"
        placeholder="Mesajul tău (opțional)"
        rows={5}
        className="border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#E31E24] resize-none placeholder:text-gray-400"
      />
      <div>
        <button
          type="submit"
          disabled={status === "success" || status === "pending"}
          className={`text-white text-sm font-bold px-8 py-3 rounded flex items-center gap-2 transition-all duration-300 ${
            status === "success" ? "bg-green-600" : "bg-[#E31E24] hover:bg-red-700 active:scale-95 disabled:opacity-60"
          }`}
        >
          {status === "success" ? (
            <>
              Trimis
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </>
          ) : status === "pending" ? (
            "Se trimite..."
          ) : (
            "TRIMITE MESAJ →"
          )}
        </button>
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          Datele tale sunt în siguranță. Nu le vom folosi în alte scopuri.
        </p>
      </div>
    </form>
  );
}
