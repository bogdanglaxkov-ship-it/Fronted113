'use client';

import { useEffect, useMemo, useState } from "react";
import { MapPin, Loader2, X, ChevronRight } from "lucide-react";
import { fetchTenders, type Tender } from "@/lib/api";
import { KAZAKHSTAN_REGIONS, ALMATY_DISTRICTS } from "@/lib/regions";
type Intensity = "high" | "medium" | "low";
interface RegionAgg {
  name: string;
  count: number;
  totalBudget: number;
  districts: Map<string, number>;
  tenders: Tender[];
  intensity: Intensity;
}
const INTENSITY_COLOR: Record<Intensity, string> = {
  high: "var(--primary)",
  medium: "var(--gold)",
  low: "var(--gold-muted)",
};
function fmtKzt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} млрд ₸`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн ₸`;
  return `${Math.round(n).toLocaleString("ru-RU")} ₸`;
}
export default function AnalyticsRegions() {
  const [tenders, setTenders] = useState<Tender[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchTenders()
      .then((items) => {
        if (!cancelled) setTenders(items);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Не удалось загрузить данные");
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const aggregated = useMemo<RegionAgg[]>(() => {
    if (!tenders) return [];
    const map = new Map<string, RegionAgg>();
    for (const r of KAZAKHSTAN_REGIONS) {
      map.set(r, {
        name: r,
        count: 0,
        totalBudget: 0,
        districts: new Map(),
        tenders: [],
        intensity: "low",
      });
    }
    for (const t of tenders) {
      const r = t.region;
      if (!r || !map.has(r)) continue;
      const initialSlot = map.get(r)!;
      const rawR = (t.region || "").toLowerCase();
      // Ищем, к какому из 17 регионов Казахстана относится тендер
      const matchedRegion = KAZAKHSTAN_REGIONS.find((reg) => {
        const lowerReg = reg.toLowerCase();
        if (rawR.includes(lowerReg)) return true;
        if (lowerReg === "астана" && (rawR.includes("нур-султан") || rawR.includes("нурсултан"))) return true;
        if (lowerReg === "алматы" && rawR.includes("алмат")) return true;
        if (lowerReg === "шымкент" && rawR.includes("шымкен")) return true;   
        return false;
      });
      if (!matchedRegion || !map.has(matchedRegion)) continue;
      const slot = map.get(matchedRegion)!;
      slot.count += 1;
      slot.totalBudget += t.price ?? 0;
      slot.tenders.push(t);
      if (t.district) {
        slot.districts.set(t.district, (slot.districts.get(t.district) ?? 0) + 1);
      }
    }
    const list = Array.from(map.values());
    const counts = list.map((x) => x.count).filter((c) => c > 0).sort((a, b) => b - a);
    const q1 = counts[Math.floor(counts.length / 3)] ?? 0;
    const q2 = counts[Math.floor((counts.length * 2) / 3)] ?? 0;
    for (const it of list) {
      if (it.count === 0) it.intensity = "low";
      else if (it.count >= q1) it.intensity = "high";
      else if (it.count >= q2) it.intensity = "medium";
      else it.intensity = "low";
    }
    list.sort((a, b) => b.count - a.count);
    return list;
  }, [tenders]);
  const total = tenders?.length ?? 0;
  const selectedAgg = aggregated.find((a) => a.name === selected) ?? null;
  if (error) {
    return (
      <div className="rounded-xl border border-border bg-popover p-5">
        <p className="py-6 text-center text-sm text-crimson">{error}</p>
      </div>
    );
  }
  if (!tenders) {
    return (
      <div className="rounded-xl border border-border bg-popover p-5">
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> Загружаю тендеры...
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-popover p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg text-foreground">Тендеры по регионам — Казахстан</h3>
          <span className="text-xs text-muted-foreground">
            Всего: {total.toLocaleString("ru-RU")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {aggregated.map((r) => {
            const isActive = selected === r.name;
            return (
              <button
                key={r.name}
                onClick={() => setSelected(isActive ? null : r.name)}
                className={`rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5 ${
                  isActive
                    ? "border-primary bg-secondary"
                    : "border-border bg-card hover:border-muted-foreground/40"
                }`}
              >
                <div
                  className="mb-2 h-1.5 w-full rounded-full"
                  style={{
                    backgroundColor: INTENSITY_COLOR[r.intensity],
                    opacity: r.count === 0 ? 0.2 : 1,
                  }}
                />
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-foreground leading-tight">{r.name}</p>
                  <ChevronRight size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {r.count.toLocaleString("ru-RU")} тендеров
                </p>
                {r.totalBudget > 0 && (
                  <p className="text-[10px] text-primary/80">{fmtKzt(r.totalBudget)}</p>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground">
          <LegendDot color={INTENSITY_COLOR.high} label="Высокая активность" />
          <LegendDot color={INTENSITY_COLOR.medium} label="Средняя" />
          <LegendDot color={INTENSITY_COLOR.low} label="Низкая" />
        </div>
      </div>
      {selectedAgg && (
        <div className="rounded-xl border border-border bg-popover p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              <h4 className="font-serif text-base text-foreground">{selectedAgg.name}</h4>
              <span className="text-xs text-muted-foreground">
                · {selectedAgg.count} тендеров · {fmtKzt(selectedAgg.totalBudget)}
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-muted-foreground hover:text-crimson transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          {selectedAgg.name === "Алматы" && (
            <div className="mb-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                По районам
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ALMATY_DISTRICTS.map((d) => {
                  const c = selectedAgg.districts.get(d) ?? 0;
                  return (
                    <div
                      key={d}
                      className="rounded-md border border-border bg-card p-2"
                    >
                      <p className="text-xs text-foreground">{d}</p>
                      <p className="text-[10px] text-muted-foreground">{c} тендеров</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {selectedAgg.districts.size > 0 && selectedAgg.name !== "Алматы" && (
            <div className="mb-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                По районам
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(selectedAgg.districts.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([d, c]) => (
                    <span
                      key={d}
                      className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground"
                    >
                      {d} <span className="text-primary">· {c}</span>
                    </span>
                  ))}
              </div>
            </div>
          )}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Тендеры региона
            </p>
            {selectedAgg.tenders.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                В этом регионе пока нет тендеров.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedAgg.tenders.slice(0, 20).map((t) => (
                  <a
                    key={t.id}
                    href={t.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md border border-border bg-input p-3 transition-colors hover:border-primary"
                  >
                    <p className="text-sm text-foreground line-clamp-2">{t.title}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <span className="text-primary">
                        {Math.round(t.price ?? 0).toLocaleString("ru-RU")} ₸
                      </span>
                      {t.district && <span className="text-muted-foreground">{t.district}</span>}
                      {t.organization && (
                        <span className="text-muted-foreground truncate">{t.organization}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}