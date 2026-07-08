"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { CUSTOMER_ROWS, type CustomerRow } from "@/lib/demo-customers-data";
import { KAZAKHSTAN_REGIONS } from "@/lib/regions";
import { fmtKzt } from "@/lib/format";
import { sortRows, type SortDir } from "@/lib/table-utils";

const COLUMNS: { key: keyof CustomerRow; label: string }[] = [
  { key: "rating", label: "Рейтинг" },
  { key: "volume", label: "Объём" },
  { key: "lots", label: "Лоты" },
  { key: "active", label: "Акт." },
  { key: "avgCheck", label: "Чек" },
  { key: "participation", label: "Уч." },
  { key: "competition", label: "Конк." },
  { key: "successRate", label: "Усп." },
  { key: "deviationRate", label: "Откл." },
];

function ratingColor(rating: number) {
  if (rating >= 90) return "text-emerald bg-emerald/10 border-emerald/30";
  if (rating >= 75) return "text-gold bg-gold-muted border-gold/30";
  return "text-crimson bg-crimson/10 border-crimson/30";
}

export default function CustomerTable() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [sortKey, setSortKey] = useState<keyof CustomerRow>("rating");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let rows = CUSTOMER_ROWS;
    if (region !== "all") rows = rows.filter((r) => r.region === region);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }
    return sortRows(rows, sortKey, sortDir);
  }, [query, region, sortKey, sortDir]);

  function toggleSort(key: keyof CustomerRow) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-popover p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию заказчика, БИН..."
            className="w-full rounded-md border border-border bg-input py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
        >
          <option value="all">Все регионы</option>
          {KAZAKHSTAN_REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Заказчик
              </th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="pb-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {col.label}
                    <ArrowUpDown size={10} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                <td className="py-2.5 pr-4 max-w-[280px]">
                  <p className="truncate text-sm text-foreground">{row.name}</p>
                  <p className="text-[11px] text-muted-foreground">{row.region}</p>
                </td>
                <td className="py-2.5 pr-4">
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold border ${ratingColor(row.rating)}`}>
                    {row.rating}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-sm text-foreground">{fmtKzt(row.volume)}</td>
                <td className="py-2.5 pr-4 text-sm text-foreground">{row.lots}</td>
                <td className="py-2.5 pr-4 text-sm text-foreground">{row.active}</td>
                <td className="py-2.5 pr-4 text-sm text-foreground">{fmtKzt(row.avgCheck)}</td>
                <td className="py-2.5 pr-4 text-sm text-crimson">{row.participation.toFixed(1)}</td>
                <td className="py-2.5 pr-4 text-sm text-emerald">{row.competition}</td>
                <td className="py-2.5 pr-4 text-sm text-emerald">{row.successRate}</td>
                <td className="py-2.5 text-sm text-emerald">{row.deviationRate}%</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="py-6 text-center text-sm text-muted-foreground">
                  Ничего не найдено.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
