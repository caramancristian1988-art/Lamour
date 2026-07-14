"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  min: number;
  max: number;
  selectedMin: number;
  selectedMax: number;
  onCommit: (min: number, max: number) => void;
}

// Allow the slider and manual input to go somewhat above the current
// top product price so the user can filter near the catalogue's ceiling
// even as it shifts.
const ABSOLUTE_MAX = 10_000;

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

  const numberInputClass =
    "w-full border-2 border-input rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground text-center focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <label className="sr-only" htmlFor="price-min">Preț minim</label>
          <input
            id="price-min"
            type="text"
            inputMode="numeric"
            value={inputMin}
            onChange={(e) => setInputMin(e.target.value)}
            onBlur={commitInputMin}
            onKeyDown={(e) => e.key === "Enter" && commitInputMin()}
            className={numberInputClass}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">MDL</span>
        </div>
        <span className="text-muted-foreground text-xs shrink-0" aria-hidden>—</span>
        <div className="relative flex-1">
          <label className="sr-only" htmlFor="price-max">Preț maxim</label>
          <input
            id="price-max"
            type="text"
            inputMode="numeric"
            value={inputMax}
            onChange={(e) => setInputMax(e.target.value)}
            onBlur={commitInputMax}
            onKeyDown={(e) => e.key === "Enter" && commitInputMax()}
            className={numberInputClass}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">MDL</span>
        </div>
      </div>

      <div className="price-range-slider relative h-5">
        <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 bg-border rounded-full" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 bg-accent rounded-full"
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
