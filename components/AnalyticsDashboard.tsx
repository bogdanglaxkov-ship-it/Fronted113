"use client";

import { useEffect, useState } from "react";
import { MapPin, X, Loader2 } from "lucide-react";

interface District {
  name: string;
  tender_count: number;
  total_budget_kzt: number;
  intensity: "high" | "medium" | "low";
}

interface MapData {
  city: string;
  total_tenders: number;
  districts: District[];
}

interface Tender {
  id: string;
  title: string;
  price: number;
  region: string;
  district: string | null;
  url: string;
}

const INTENSITY_COLOR: Record<District["intensity"], string> = {
  high: "var(--primary)",
  medium: "var(--gold)",
  low: "var(--gold-muted)",
};

const INTENSITY_OPACITY: Record<District["intensity"], string> = {
  high: "1",
  medium: "0.65",
  low: "0.35",
};

// ─────────────────────────────────────────────
//  data теперь необязателен — если не передали,
//  компонент сам загрузит /api/analytics/map.
//  Это убирает краш "Cannot read properties of
//  undefined (reading 'city')" когда page.tsx
//  рендерит компонент раньше чем данные готовы.
// ─────────────────────────────────────────────
interface Props {
  data?: MapData;
}

export default function AnalyticsDashboard({ data: dataProp }: Props) {
  const [data, setData] = useState<MapData | null>(dataProp ?? null);
  const [dataLoading, setDataLoading] = useState(!dataProp);
  const [dataError, setDataError] = useState<string | null>(null);

  const [selected, setSelected] = useState<District | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Если данные не передали пропом — грузим сами
  useEffect(() => {
    if (dataProp) return;

    let cancelled = false;
    setDataLoading(true);
    setDataError(null);

    fetch(`${API}/api/analytics/map`)
      .then((res) => {
        if (!res.ok) throw new Error(`Сервер ответил ${res.status}`);
        return res.json();
      })
      .then((json: MapData) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setDataError(err.message || "Не удалось загрузить аналитику");
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataProp, API]);

  async function handleDistrictClick(district: District) {
    setSelected(district);
    setLoading(true);
    setTenders([]);
    try {
      const res = await fetch(
        `${API}/api/analytics/districts/${encodeURIComponent(district.name)}`
      );
      const json = await res.json();
      setTenders(json.items || []);
    } catch (e) {
      console.error("Не удалось загрузить тендеры района:", e);
    } finally {
      setLoading(false);
    }
  }

  function closePanel() {
    setSelected(null);
    setTenders([]);
  }

  // ── Состояние загрузки ──────────────────────
  if (dataLoading) {
    return (
      <div className="rounded-xl border border-border bg-popover p-5">
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Загружаю аналитику по районам...
        </div>
      </div>
    );
  }

  // ── Состояние ошибки ────────────────────────
  if (dataError || !data) {
    return (
      <div className="rounded-xl border border-border bg-popover p-5">
        <p className="py-6 text-center text-sm text-crimson">
          {dataError || "Нет данных для отображения"}
        </p>
      </div>
    );
  }

  // ── Основной рендер — data гарантированно определена ──
  return (
    <div className="rounded-xl border border-border bg-popover p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg text-foreground">
          Тендеры по районам — {data.city}
        </h3>
        <span className="text-xs text-muted-foreground">
          Всего: {data.total_tenders.toLocaleString("ru-RU")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {data.districts.map((d) => (
          <button
            key={d.name}
            onClick={() => handleDistrictClick(d)}
            className={`rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5 ${
              selected?.name === d.name
                ? "border-primary bg-secondary"
                : "border-border bg-card hover:border-muted-foreground/40"
            }`}
          >
            <div
              className="mb-2 h-1.5 w-full rounded-full"
              style={{
                backgroundColor: INTENSITY_COLOR[d.intensity],
                opacity: Number(INTENSITY_OPACITY[d.intensity]),
              }}
            />
            <p className="text-xs font-medium text-foreground leading-tight">{d.name}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {d.tender_count.toLocaleString("ru-RU")} тендеров
            </p>
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground">
        <LegendDot color={INTENSITY_COLOR.high} label="Высокая активность" />
        <LegendDot color={INTENSITY_COLOR.medium} label="Средняя" />
        <LegendDot color={INTENSITY_COLOR.low} label="Низкая" />
      </div>

      {selected && (
        <div className="mt-5 rounded-lg border border-border bg-input p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                {selected.name} район
              </h4>
            </div>
            <button
              onClick={closePanel}
              className="text-muted-foreground hover:text-crimson transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              Загружаю тендеры...
            </div>
          )}

          {!loading && tenders.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              В базе пока нет тендеров для этого района.
            </p>
          )}

          {!loading && tenders.length > 0 && (
            <div className="space-y-2">
              {tenders.map((t) => (
                <a
                  key={t.id}
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-md border border-border bg-popover p-3 transition-colors hover:border-primary"
                >
                  <p className="text-sm text-foreground line-clamp-2">{t.title}</p>
                  <p className="mt-1 text-xs text-primary">
                    {Math.round(t.price).toLocaleString("ru-RU")} ₸
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  );
}