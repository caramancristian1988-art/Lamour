"use client";

import { useState } from "react";

export default function FaqAccordion({ faqs }: { faqs: string[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-200">
      {faqs.map((q, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {q}
            <span className="text-gray-400 text-base ml-4">
              {openFaq === i ? "∧" : "∨"}
            </span>
          </button>
          {openFaq === i && (
            <div className="px-6 pb-4 text-sm text-gray-500">
              Răspunsul va fi adăugat în curând.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
