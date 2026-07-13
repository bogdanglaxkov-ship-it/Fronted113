"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, MapPin, Search, X } from "lucide-react";
import { KAZAKHSTAN_REGIONS } from "@/lib/regions";
import { LOT_TYPE_CONFIG, classifyLotType, type LotType } from "@/lib/lot-type";
import PriceRangeSlider from "./PriceRangeSlider";
import type { Tender, TenderStatus } from "@/lib/api";

const STATUS_LABELS: Record<TenderStatus, string> = {
  active: "Активный",
  completed: "Завершён",
  canceled: "Отменён",
  paused: "На паузе",
};
const STATUS_ORDER: TenderStatus[] = ["active", "paused", "completed", "canceled"];
const HISTOGRAM_BUCKETS = 40;

export interface TenderFilterState {
  keyword: string;
  region: string | null;
  priceRange: [number, number];
  maxPrice: number;
  lotTypes: Set<LotType>;
  statuses: Set<TenderStatus>;
}

interface Props {
  allItems: Tender[];
  onFiltersChange: (filters: TenderFilterState) => void;
}

export default function FilterPanel({ allItems, onFiltersChange }: Props) {
  const maxPrice = useMemo(
    () => Math.max(1_000_000, ...allItems.map((t) => t.price ?? 0)),
    [allItems],
  );

  const [keywordInput, setKeywordInput] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [lotTypes, setLotTypes] = useState<Set<LotType>>(new Set());
  const [statuses, setStatuses] = useState<Set<TenderStatus>>(new Set());
  const [statusOpen, setStatusOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);

  const prevMaxRef = useRef(maxPrice);
  useEffect(() => {
    const prevMax = prevMaxRef.current;
    prevMaxRef.current = maxPrice;
    setPriceRange(([lo, hi]) => {
      const next: [number, number] =
        hi === prevMax ? [lo, maxPrice] : [Math.min(lo, maxPrice), Math.min(hi, maxPrice)];
      return next[0] === lo && next[1] === hi ? [lo, hi] : next;
    });
  }, [maxPrice]);

  useEffect(() => {
    onFiltersChange({ keyword: keywordInput, region, priceRange, maxPrice, lotTypes, statuses });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordInput, region, priceRange, maxPrice, lotTypes, statuses]);

  const lotTypeCounts = useMemo(() => {
    const counts: Record<LotType, number> = { goods: 0, services: 0, works: 0 };
    for (const t of allItems) counts[classifyLotType(t.title)]++;
    return counts;
  }, [allItems]);

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<TenderStatus, number>> = {};
    for (const t of allItems) counts[t.status] = (counts[t.status] ?? 0) + 1;
    return counts;
  }, [allItems]);

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of allItems) {
      if (!t.region) continue;
      counts[t.region] = (counts[t.region] ?? 0) + 1;
    }
    return counts;
  }, [allItems]);

  const histogram = useMemo(() => {
    const buckets = new Array(HISTOGRAM_BUCKETS).fill(0);
    const step = maxPrice / HISTOGRAM_BUCKETS;
    if (step <= 0) return buckets;
    for (const t of allItems) {
      const idx = Math.min(HISTOGRAM_BUCKETS - 1, Math.floor((t.price ?? 0) / step));
      buckets[idx]++;
    }
    return buckets;
  }, [allItems, maxPrice]);

  const hasActiveFilters =
    !!region || priceRange[0] > 0 || priceRange[1] < maxPrice || !!keywordInput || lotTypes.size > 0 || statuses.size > 0;

  function toggleLotType(key: LotType) {
    setLotTypes((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleStatus(key: TenderStatus) {
    setStatuses((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function reset() {
    setKeywordInput("");
    setRegion(null);
    setPriceRange([0, maxPrice]);
    setLotTypes(new Set());
    setStatuses(new Set());
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg text-foreground">Фильтры</h3>
        {hasActiveFilters && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-crimson transition-colors"
          >
            <X size={12} /> Сбросить
          </button>
        )}
      </div>

      <div className="mb-5">
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Search size={12} /> Ключевое слово
        </label>
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          placeholder="например: оборудование, ремонт..."
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary transition-colors"
        />
      </div>

      <div className="mb-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Тип лота</p>
        <div className="space-y-1.5">
          {(Object.keys(LOT_TYPE_CONFIG) as LotType[]).map((key) => {
            const cfg = LOT_TYPE_CONFIG[key];
            return (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1 text-sm hover:bg-accent/50"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={lotTypes.has(key)}
                    onChange={() => toggleLotType(key)}
                    className="h-3.5 w-3.5 rounded border-border accent-[color:var(--primary)]"
                  />
                  <cfg.icon size={13} className={cfg.text} />
                  <span className="text-foreground/90">{cfg.label}</span>
                </span>
                <span className="text-xs text-muted-foreground">{lotTypeCounts[key].toLocaleString("ru-RU")}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mb-5 border-t border-border pt-4">
        <button
          onClick={() => setStatusOpen((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          Статус
          {statusOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {statusOpen && (
          <div className="mt-2 space-y-1.5">
            {STATUS_ORDER.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1 text-sm hover:bg-accent/50"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={statuses.has(key)}
                    onChange={() => toggleStatus(key)}
                    className="h-3.5 w-3.5 rounded border-border accent-[color:var(--primary)]"
                  />
                  <span className="text-foreground/90">{STATUS_LABELS[key]}</span>
                </span>
                <span className="text-xs text-muted-foreground">{(statusCounts[key] ?? 0).toLocaleString("ru-RU")}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mb-5 border-t border-border pt-4">
        <button
          onClick={() => setRegionOpen((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-1.5">
            <MapPin size={12} /> Регион
          </span>
          {regionOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {regionOpen && (
          <div className="mt-2 max-h-52 space-y-1 overflow-y-auto pr-1">
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-accent/50">
              <input
                type="radio"
                checked={!region}
                onChange={() => setRegion(null)}
                className="h-3.5 w-3.5 accent-[color:var(--primary)]"
              />
              <span className="text-foreground/90">Все регионы</span>
            </label>
            {KAZAKHSTAN_REGIONS.map((r) => (
              <label
                key={r}
                className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1 text-sm hover:bg-accent/50"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={region === r}
                    onChange={() => setRegion(r)}
                    className="h-3.5 w-3.5 accent-[color:var(--primary)]"
                  />
                  <span className="truncate text-foreground/90">{r}</span>
                </span>
                <span className="text-xs text-muted-foreground">{(regionCounts[r] ?? 0).toLocaleString("ru-RU")}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-2 text-sm text-muted-foreground">Сумма лота</p>
        <PriceRangeSlider min={0} max={maxPrice} value={priceRange} onChange={setPriceRange} histogram={histogram} />
      </div>
    </div>
  );
}
