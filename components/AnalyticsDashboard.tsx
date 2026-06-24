"use client"

import { useState, useEffect } from "react"
import { getAnalyticsTrends, getAnalyticsMap } from "@/lib/api"
import type { AnalyticsTrends, AnalyticsMap } from "@/lib/api"

function formatBudget(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} млрд`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} млн`
  return `${n.toLocaleString("ru")}`
}

const INTENSITY_COLORS: Record<string, string> = {
  high:   "bg-[#c89b3c]",
  medium: "bg-[#1f7a5c]",
  low:    "bg-[#1e3150]",
}

const INTENSITY_LABEL: Record<string, string> = {
  high: "Высокая",
  medium: "Средняя",
  low: "Низкая",
}

export default function AnalyticsDashboard() {
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null)
  const [map, setMap] = useState<AnalyticsMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getAnalyticsTrends(), getAnalyticsMap()])
      .then(([t, m]) => {
        setTrends(t)
        setMap(m)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 rounded-lg bg-card border border-border animate-pulse" />
      ))}
    </div>
  )

  if (error) return (
    <div className="bg-[#2e1a1a] border border-[#a8453a] rounded-lg p-4 text-[#e05a4e] text-sm">
      Ошибка загрузки аналитики: {error}
    </div>
  )

  const maxCount = map ? Math.max(...map.districts.map(d => d.tender_count)) : 1

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-foreground">Аналитика рынка</h2>

      {/* Stats cards */}
      {trends && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-lg p-4">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Активных тендеров</span>
            <p className="font-mono text-2xl font-bold text-[#c89b3c] mt-1">{trends.active_tenders_count.toLocaleString("ru")}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Снижение цен</span>
            <p className="font-mono text-2xl font-bold text-[#4caf74] mt-1">−{trends.average_price_drop_percentage}%</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 col-span-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-2">Топ категории</span>
            <div className="flex flex-wrap gap-2">
              {trends.top_categories.map(cat => (
                <span
                  key={cat}
                  className="px-2 py-0.5 text-xs rounded bg-[#1e3150] text-foreground/80 border border-border"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* District map */}
      {map && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Районы — {map.city}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              Всего: {map.total_tenders.toLocaleString("ru")}
            </span>
          </div>
          <div className="space-y-2.5">
            {map.districts.map(d => {
              const pct = Math.round((d.tender_count / maxCount) * 100)
              return (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground/80">{d.name}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${INTENSITY_COLORS[d.intensity]} ${d.intensity === "high" ? "text-[#0b1629]" : "text-foreground/70"}`}>
                        {INTENSITY_LABEL[d.intensity]}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground w-16 text-right">
                        {d.tender_count.toLocaleString("ru")}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${INTENSITY_COLORS[d.intensity]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Бюджет: {formatBudget(d.total_budget_kzt)} ₸
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
