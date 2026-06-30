"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function ProductOfferBanner({
  discount,
  countdownMinutes,
}: {
  discount: number;
  countdownMinutes: number;
}) {
  const totalSeconds = countdownMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : totalSeconds));
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#c7092b] to-[#8b0520] px-5 py-4 flex items-center justify-between gap-4">
      <svg className="absolute -right-4 -bottom-6 w-28 h-28 text-white/10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="relative">
        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-0.5">Ofertă limitată</p>
        <p className="text-white text-lg font-extrabold leading-tight">-{discount}% reducere azi</p>
      </div>
      <div className="relative flex items-center gap-1.5 bg-black/20 rounded-xl px-3 py-2 text-white text-sm font-bold tabular-nums shrink-0">
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
        </svg>
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </div>
    </div>
  );
}
