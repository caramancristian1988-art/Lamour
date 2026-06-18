"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  min: number;
  max: number;
  selectedMin: number;
  selectedMax: number;
  onCommit: (min: number, max: number) => void;
}

export default function PriceRangeSlider({ min, max, selectedMin, selectedMax, onCommit }: Props) {
  const [localMin, setLocalMin] = useState(selectedMin);
  const [localMax, setLocalMax] = useState(selectedMax);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalMin(selectedMin);
    setLocalMax(selectedMax);
  }, [selectedMin, selectedMax]);

  const step = Math.max(1, Math.round((max - min) / 100));

  function scheduleCommit(nextMin: number, nextMax: number) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onCommit(nextMin, nextMax), 400);
  }

  function handleMinChange(value: number) {
    const next = Math.min(value, localMax);
    setLocalMin(next);
    scheduleCommit(next, localMax);
  }

  function handleMaxChange(value: number) {
    const next = Math.max(value, localMin);
    setLocalMax(next);
    scheduleCommit(localMin, next);
  }

  const range = max - min || 1;
  const leftPct = ((localMin - min) / range) * 100;
  const rightPct = ((localMax - min) / range) * 100;

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-3">
        <span>{Math.round(localMin).toLocaleString("ro-MD")} MDL</span>
        <span>{Math.round(localMax).toLocaleString("ro-MD")} MDL</span>
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
          max={max}
          step={step}
          value={localMin}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          aria-label="Preț minim"
          className="absolute top-0 left-0 w-full h-5"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          aria-label="Preț maxim"
          className="absolute top-0 left-0 w-full h-5"
        />
      </div>
    </div>
  );
}
