'use client';

import { useState } from "react";
import { MapPin, DollarSign, Search, X, Loader2 } from "lucide-react";
import { KAZAKHSTAN_REGIONS, ALMATY_DISTRICTS, PRICE_PRESETS } from "@/lib/regions";
import type { TenderFilters } from "@/lib/api";
const EMPTY_FILTERS: TenderFilters = {
  region: null,
  district: null,
  price_min: null,
  price_max: null,
  keyword: null,
};
interface Props {
  onSearch: (filters: TenderFilters) => void;
  searching?: boolean;
}
export default function FilterPanel({ onSearch, searching }: Props) {
  const [filters, setFilters] = useState<TenderFilters>(EMPTY_FILTERS);
  const [keywordInput, setKeywordInput] = useState("");
  function set<K extends keyof TenderFilters>(key: K, value: TenderFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }
  function reset() {
    setFilters(EMPTY_FILTERS);
    setKeywordInput("");
    onSearch(EMPTY_FILTERS);
  }
  function apply() {
    onSearch({ ...filters, keyword: keywordInput || null });
  }
  const showDistricts = filters.region === "Алматы";
  return (
    <div className="rounded-xl border border-border bg-popover p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg text-foreground">Фильтры — РК</h3>
        {(filters.region || filters.price_min || filters.price_max || keywordInput) && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-crimson transition-colors"
          >
            <X size={12} /> Сбросить
          </button>
        )}
      </div>
      <div className="mb-4">
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
      <div className="mb-4">
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <MapPin size={12} /> Регион
        </label>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            label="Все"
            active={!filters.region}
            onClick={() => {
              set("region", null);
              set("district", null);
            }}
          />
          {KAZAKHSTAN_REGIONS.map((r) => (
            <Chip
              key={r}
              label={r}
              active={filters.region === r}
              onClick={() => {
                set("region", r);
                set("district", null);
              }}
            />
          ))}
        </div>
      </div>
      {showDistricts && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Район
          </label>
          <div className="flex flex-wrap gap-1.5">
            <Chip label="Весь регион" active={!filters.district} onClick={() => set("district", null)} />
            {ALMATY_DISTRICTS.map((d) => (
              <Chip
                key={d}
                label={d}
                active={filters.district === d}
                onClick={() => set("district", d)}
              />
            ))}
          </div>
        </div>
      )}
      <div className="mb-5">
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <DollarSign size={12} /> Цена
        </label>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            label="Любая"
            active={!filters.price_min && !filters.price_max}
            onClick={() => {
              set("price_min", null);
              set("price_max", null);
            }}
          />
          {PRICE_PRESETS.map((p) => (
            <Chip
              key={p.label}
              label={p.label}
              active={filters.price_min === p.min && filters.price_max === (p.max || null)}
              onClick={() => {
                set("price_min", p.min || null);
                set("price_max", p.max || null);
              }}
            />
          ))}
        </div>
      </div>
      <button
        onClick={apply}
        disabled={searching}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {searching && <Loader2 size={14} className="animate-spin" />}
        {searching ? "Ищу..." : "Найти тендеры"}
      </button>
    </div>
  );
}
function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:border-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}