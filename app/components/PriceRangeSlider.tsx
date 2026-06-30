"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  min: number;
  max: number;
  selectedMin: number;
  selectedMax: number;
  onCommit: (min: number, max: number) => void;
}

// Allow the slider and manual input to go well above the current
// top product price so the user can filter e.g. "above 50 000 MDL"
// even when the catalogue's current ceiling is lower.
const ABSOLUTE_MAX = 200_000;

export default function PriceRangeSlider({ min, max, selectedMin, selectedMax, onCommit }: Props) {
  const sliderMax = Math.max(max, ABSOLUTE_MAX);
  const [localMin, setLocalMin] = useState(selectedMin);
  const [localMax, setLocalMax] = useState(selectedMax);
  const [inputMin, setInputMin] = useState(String(Math.round(selectedMin)));
  const [inputMax, setInputMax] = useState(String(Math.round(selectedMax)));
  const commitRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalMin(selectedMin);
    setLocalMax(selectedMax);
    setInputMin(String(Math.round(selectedMin)));
    setInputMax(String(Math.round(selectedMax)));
  }, [selectedMin, selectedMax]);

  function scheduleCommit(nextMin: number, nextMax: number) {
    if (commitRef.current) clearTimeout(commitRef.current);
    commitRef.current = setTimeout(() => onCommit(nextMin, nextMax), 500);
  }

  function applyMin(raw: number) {
    const v = Math.max(min, Math.min(raw, localMax));
    setLocalMin(v);
    setInputMin(String(Math.round(v)));
    scheduleCommit(v, localMax);
  }

  function applyMax(raw: number) {
    const v = Math.max(localMin, Math.min(raw, sliderMax));
    setLocalMax(v);
    setInputMax(String(Math.round(v)));
    scheduleCommit(localMin, v);
  }

  function commitInputMin() {
    const parsed = parseInt(inputMin.replace(/\D/g, ""), 10);
    if (!isNaN(parsed)) applyMin(parsed);
    else setInputMin(String(Math.round(localMin)));
  }

  function commitInputMax() {
    const parsed = parseInt(inputMax.replace(/\D/g, ""), 10);
    if (!isNaN(parsed)) applyMax(parsed);
    else setInputMax(String(Math.round(localMax)));
  }

  const range = sliderMax - min || 1;
  const leftPct = ((localMin - min) / range) * 100;
  const rightPct = ((localMax - min) / range) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={inputMin}
            onChange={(e) => setInputMin(e.target.value)}
            onBlur={commitInputMin}
            onKeyDown={(e) => e.key === "Enter" && commitInputMin()}
            aria-label="Preț minim"
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 text-center focus:outline-none focus:border-[#c7092b] focus:ring-1 focus:ring-[#c7092b]/20"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">MDL</span>
        </div>
        <span className="text-gray-400 text-xs shrink-0">—</span>
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={inputMax}
            onChange={(e) => setInputMax(e.target.value)}
            onBlur={commitInputMax}
            onKeyDown={(e) => e.key === "Enter" && commitInputMax()}
            aria-label="Preț maxim"
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 text-center focus:outline-none focus:border-[#c7092b] focus:ring-1 focus:ring-[#c7092b]/20"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">MDL</span>
        </div>
      </div>

      <div className="price-range-slider relative h-5">
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gray-200 rounded-full" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 bg-[#c7092b] rounded-full"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={sliderMax}
          step={Math.max(100, Math.round((sliderMax - min) / 100))}
          value={localMin}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), localMax);
            setLocalMin(v);
            setInputMin(String(Math.round(v)));
            scheduleCommit(v, localMax);
          }}
          aria-label="Preț minim slider"
          className="absolute top-0 left-0 w-full h-5"
        />
        <input
          type="range"
          min={min}
          max={sliderMax}
          step={Math.max(100, Math.round((sliderMax - min) / 100))}
          value={localMax}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), localMin);
            setLocalMax(v);
            setInputMax(String(Math.round(v)));
            scheduleCommit(localMin, v);
          }}
          aria-label="Preț maxim slider"
          className="absolute top-0 left-0 w-full h-5"
        />
      </div>
    </div>
  );
}
