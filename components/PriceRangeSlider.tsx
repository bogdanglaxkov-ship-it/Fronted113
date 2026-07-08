"use client";

import { fmtKzt } from "@/lib/format";

interface Props {
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  histogram: number[];
}

const THUMB_CLS =
  "pointer-events-none absolute inset-0 h-1 w-full appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 " +
  "[&::-webkit-slider-thumb]:border-emerald [&::-webkit-slider-thumb]:bg-card [&::-webkit-slider-thumb]:shadow " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 " +
  "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald [&::-moz-range-thumb]:bg-card";

export default function PriceRangeSlider({ min, max, value, onChange, histogram }: Props) {
  const [lo, hi] = value;
  const span = Math.max(1, max - min);
  const loPct = ((lo - min) / span) * 100;
  const hiPct = ((hi - min) / span) * 100;
  const peak = Math.max(1, ...histogram);

  return (
    <div className="pt-1">
      <div className="mb-1 flex h-8 items-end gap-px">
        {histogram.map((c, i) => (
          <div
            key={i}
            className="w-full rounded-[1px] bg-emerald"
            style={{ height: `${c === 0 ? 2 : Math.max(6, (c / peak) * 100)}%` }}
          />
        ))}
      </div>
      <div className="relative h-1">
        <div className="absolute inset-0 rounded-full bg-border" />
        <div
          className="absolute h-full rounded-full bg-emerald"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
          className={THUMB_CLS}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
          className={THUMB_CLS}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-emerald">
        <span>{fmtKzt(lo)}</span>
        <span>{fmtKzt(hi)}</span>
      </div>
    </div>
  );
}
