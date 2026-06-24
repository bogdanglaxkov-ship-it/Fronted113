"use client"

import { useState } from "react"
import type { TenderFilters } from "@/lib/api"

const REGIONS = ["Астана", "Алматы", "Шымкент", "Актобе", "Атырау", "Костанай", "Павлодар", "Семей", "Усть-Каменогорск", "Кокшетау"]
const STATUSES = ["active", "completed", "canceled", "paused"] as const

interface Props {
  filters: TenderFilters
  onChange: (f: TenderFilters) => void
  totalFound: number
  totalAll: number
}

export default function FilterPanel({ filters, onChange, totalFound, totalAll }: Props) {
  const [open, setOpen] = useState(false)

  function clear() {
    onChange({ keyword: "", region: undefined, price_min: undefined, price_max: undefined })
  }

  const hasActive = !!(filters.keyword || filters.region || filters.price_min || filters.price_max)

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4">
      {/* Search row */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Поиск по названию, описанию..."
            value={filters.keyword ?? ""}
            onChange={e => onChange({ ...filters, keyword: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-md transition-colors ${open ? "border-[#c89b3c] text-[#c89b3c] bg-[#2a2010]" : "border-border text-muted-foreground hover:border-[#c89b3c44]"}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
          </svg>
          Фильтры
          {hasActive && <span className="w-2 h-2 rounded-full bg-[#c89b3c]" />}
        </button>
        {hasActive && (
          <button
            onClick={clear}
            className="px-3 py-2 text-sm text-muted-foreground border border-border rounded-md hover:text-foreground hover:border-[#c89b3c44] transition-colors"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border">
          {/* Region */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Регион</label>
            <select
              value={filters.region ?? ""}
              onChange={e => onChange({ ...filters, region: e.target.value || undefined })}
              className="w-full py-2 px-3 text-sm bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Все регионы</option>
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Price min */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Цена от (KZT)</label>
            <input
              type="number"
              placeholder="0"
              value={filters.price_min ?? ""}
              onChange={e => onChange({ ...filters, price_min: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full py-2 px-3 text-sm bg-background border border-border rounded-md text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Price max */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Цена до (KZT)</label>
            <input
              type="number"
              placeholder="∞"
              value={filters.price_max ?? ""}
              onChange={e => onChange({ ...filters, price_max: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full py-2 px-3 text-sm bg-background border border-border rounded-md text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {/* Count */}
      <div className="mt-3 text-[11px] text-muted-foreground font-mono">
        Найдено <span className="text-[#c89b3c] font-bold">{totalFound}</span> из {totalAll} тендеров
      </div>
    </div>
  )
}
