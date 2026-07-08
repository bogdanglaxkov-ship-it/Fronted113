"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, ArrowUpDown } from "lucide-react";
import { CATEGORY_ROWS, type CategoryRow } from "@/lib/demo-market-data";
import { fmtKzt } from "@/lib/format";
import { sortRows, type SortDir } from "@/lib/table-utils";

const TABS = [
  { key: "goods", label: "Товары" },
  { key: "services", label: "Услуги" },
  { key: "works", label: "Работы" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const COLUMNS: { key: keyof CategoryRow; label: string }[] = [
  { key: "volume", label: "Объём" },
  { key: "count", label: "Кол-во" },
  { key: "marginPct", label: "Маржа" },
  { key: "profit", label: "Прибыль" },
  { key: "avgPrice", label: "Ср. цена" },
  { key: "competitionRatio", label: "Конк." },
];

export default function CategoryTable() {
  const [tab, setTab] = useState<TabKey>("goods");
  const [sortKey, setSortKey] = useState<keyof CategoryRow>("volume");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const rows = sortRows(CATEGORY_ROWS[tab], sortKey, sortDir);

  function toggleSort(key: keyof CategoryRow) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function toggleExpand(id: string) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderRow(row: CategoryRow, depth = 0): React.ReactElement {
    const hasChildren = !!row.subcategories?.length;
    const isOpen = expanded.has(row.id);
    return (
      <Fragment key={row.id}>
        <tr className="border-b border-border last:border-0 hover:bg-accent/40">
          <td className="py-2.5 pr-4">
            <div className="flex items-center gap-1.5" style={{ paddingLeft: depth * 20 }}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(row.id)}
                  className="flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
              ) : (
                <span className="w-4" />
              )}
              <span className="truncate text-sm text-foreground">{row.name}</span>
            </div>
          </td>
          <td className="py-2.5 pr-4 text-sm font-medium text-foreground">{fmtKzt(row.volume)}</td>
          <td className="py-2.5 pr-4 text-sm text-foreground">{row.count.toLocaleString("ru-RU")}</td>
          <td className="py-2.5 pr-4 text-sm font-medium text-gold">{row.marginPct.toFixed(1)}%</td>
          <td className="py-2.5 pr-4 text-sm text-foreground">{fmtKzt(row.profit)}</td>
          <td className="py-2.5 pr-4 text-sm text-foreground">{fmtKzt(row.avgPrice)}</td>
          <td className="py-2.5 text-sm font-medium text-emerald">{row.competitionRatio.toFixed(2)}</td>
        </tr>
        {hasChildren &&
          isOpen &&
          row.subcategories!.map((sub) => renderRow(sub, depth + 1))}
      </Fragment>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-popover p-5">
      <h3 className="mb-4 font-serif text-lg text-foreground">Аналитика категорий</h3>
      <div className="mb-4 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Категория / Подкатегория
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
          <tbody>{rows.map((row) => renderRow(row))}</tbody>
        </table>
      </div>
    </div>
  );
}
