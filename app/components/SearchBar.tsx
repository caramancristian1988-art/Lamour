"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (query.trim()) {
          router.push(`/produse?q=${encodeURIComponent(query)}`);
        }
      }}
      className="w-full"
    >
      <div className="relative flex items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută condiționere, sisteme multisplit..."
          className="w-full h-11 pl-4 pr-14 rounded-xl border border-gray-200 bg-[#f6f8fb] text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1d2353] focus:ring-2 focus:ring-[#1d2353]/10 transition-all"
        />
        <button
          type="submit"
          aria-label="Caută"
          className="absolute right-0 h-11 w-12 flex items-center justify-center rounded-r-xl bg-[#c7092b] text-white hover:bg-[#a5071f] transition-colors"
        >
          <svg
            className="w-4.5 h-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
