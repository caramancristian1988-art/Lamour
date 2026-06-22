"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { submitContactMessageAction } from "@/lib/adminMessageActions";

interface CartItemLike {
  slug: string;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
}

type Status = "idle" | "error" | "success" | "pending";

function CartOrderFormPanel({
  items,
  subtotal,
  onSuccess,
}: {
  items: CartItemLike[];
  subtotal: number;
  onSuccess: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const extra = String(data.get("extraMessage") ?? "").trim();

    const missing = [!name && "numele", !phone && "numărul de telefon"].filter(Boolean);
    if (missing.length > 0) {
      setErrorMsg(`Lipsește ${missing.join(" și ")}.`);
      setStatus("error");
      return;
    }

    const itemsList = items
      .map((i) => `${i.quantity}x ${i.name} — ${i.price.toLocaleString("ro-MD")} MDL/buc`)
      .join("\n");
    const message = [
      "Produse comandate:",
      itemsList,
      "",
      `Total: ${subtotal.toLocaleString("ro-MD")} MDL`,
      extra ? `\nMesaj client: ${extra}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n");

    const submitData = new FormData();
    submitData.set("name", name);
    submitData.set("phone", phone);
    submitData.set("message", message);
    submitData.set("source", "Comandă din coș");

    setStatus("pending");
    const result = await submitContactMessageAction({}, submitData);

    if (result.error) {
      setErrorMsg(result.error);
      setStatus("error");
      return;
    }

    setStatus("success");
    setTimeout(onSuccess, 2200);
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="relative w-14 h-14 mb-4">
          <span className="absolute inset-0 rounded-full bg-green-200 animate-ping" />
          <div className="relative w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center animate-pop">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-extrabold text-[#1d2353] mb-1 animate-pop" style={{ animationDelay: "100ms" }}>
          Comanda ta a fost trimisă!
        </h3>
        <p className="text-sm text-gray-500 animate-pop" style={{ animationDelay: "180ms" }}>
          Te vom contacta în cel mai scurt timp pentru confirmare.
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-extrabold text-[#1d2353] text-center mb-5">Finalizează comanda</h2>

      <div className="flex flex-col gap-2.5 mb-5 max-h-48 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.slug} className="flex items-center gap-3 p-2.5 border border-gray-100 rounded-xl bg-[#fafbfc]">
            <span className="relative w-11 h-11 rounded-lg bg-white overflow-hidden shrink-0 border border-gray-100">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
              ) : (
                <svg className="w-5 h-5 text-gray-300 absolute inset-0 m-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
                </svg>
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1d2353] line-clamp-1">{item.name}</p>
              <p className="text-xs text-gray-400">{item.quantity} × {item.price.toLocaleString("ro-MD")} MDL</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mb-5">
        <span className="text-sm font-bold text-[#1d2353]">Total</span>
        <span className="font-extrabold text-lg text-[#1d2353]">{subtotal.toLocaleString("ro-MD")} MDL</span>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
        {status === "error" && (
          <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5 text-center">
            {errorMsg}
          </p>
        )}

        <input
          type="text"
          name="name"
          required
          placeholder="Nume complet"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
        <input
          type="tel"
          name="phone"
          required
          placeholder="Telefon"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
        <textarea
          name="extraMessage"
          placeholder="Mesaj suplimentar (opțional)"
          rows={2}
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400 resize-none"
        />

        <button
          type="submit"
          disabled={status === "pending"}
          className="bg-[#c7092b] hover:bg-[#a5071f] disabled:opacity-60 active:scale-95 text-white font-bold py-3 rounded-xl transition-all text-sm uppercase tracking-wide mt-1"
        >
          {status === "pending" ? "Se trimite..." : "Trimite comanda"}
        </button>
      </form>
    </>
  );
}

export default function CartOrderModal({
  items,
  subtotal,
  className,
  children,
}: {
  items: CartItemLike[];
  subtotal: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  function openModal() {
    setOpenCount((c) => c + 1);
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  }

  function closeModal() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open && mounted) {
      const timeout = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  return (
    <>
      <button
        onClick={openModal}
        className={
          className ??
          "w-full flex items-center justify-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold h-12 rounded-xl transition-colors text-sm uppercase tracking-wide"
        }
      >
        {children ?? "Finalizează comanda"}
      </button>

      {mounted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
            onClick={closeModal}
            aria-hidden
          />

          <div
            className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              open ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <button
              onClick={closeModal}
              aria-label="Închide"
              className="group absolute top-4 right-4 text-gray-400 hover:text-[#c7092b] transition-colors"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <CartOrderFormPanel key={openCount} items={items} subtotal={subtotal} onSuccess={closeModal} />
          </div>
        </div>
      )}
    </>
  );
}
