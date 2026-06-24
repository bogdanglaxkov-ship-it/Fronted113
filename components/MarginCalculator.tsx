"use client"

import { useState } from "react"
import { calcMargin } from "@/lib/api"
import type { MarginResult } from "@/lib/api"

function formatKZT(n: number) {
  return new Intl.NumberFormat("ru-KZ", { style: "currency", currency: "KZT", maximumFractionDigits: 0 }).format(n)
}

export default function MarginCalculator() {
  const [tenderPrice, setTenderPrice] = useState("")
  const [myCost, setMyCost] = useState("")
  const [result, setResult] = useState<MarginResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function calculate() {
    const price = parseFloat(tenderPrice)
    const cost = parseFloat(myCost)
    if (!price || !cost) return
    setLoading(true)
    setError(null)
    try {
      const res = await calcMargin(price, cost)
      setResult(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка расчёта")
    } finally {
      setLoading(false)
    }
  }

  const isProfit = result && result.pure_profit_kzt > 0

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h3 className="text-[11px] text-muted-foreground uppercase tracking-wider">Калькулятор маржи</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Цена тендера (KZT)
          </label>
          <input
            type="number"
            placeholder="10 000 000"
            value={tenderPrice}
            onChange={e => setTenderPrice(e.target.value)}
            className="w-full py-2 px-3 text-sm font-mono bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Мои затраты (KZT)
          </label>
          <input
            type="number"
            placeholder="7 000 000"
            value={myCost}
            onChange={e => setMyCost(e.target.value)}
            className="w-full py-2 px-3 text-sm font-mono bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          onClick={calculate}
          disabled={loading || !tenderPrice || !myCost}
          className="w-full py-2 text-sm font-semibold bg-[#c89b3c] text-[#0b1629] rounded-md hover:bg-[#e0b84d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Считаем..." : "Рассчитать"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-[#e05a4e]">{error}</p>
      )}

      {result && (
        <div className="space-y-2 pt-2 border-t border-border">
          <div className={`rounded-lg p-3 border ${isProfit ? "bg-[#1f3a1a] border-[#4caf74]" : "bg-[#2e1a1a] border-[#e05a4e]"}`}>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Чистая прибыль</span>
            <p className={`font-mono text-lg font-bold mt-0.5 ${isProfit ? "text-[#4caf74]" : "text-[#e05a4e]"}`}>
              {formatKZT(result.pure_profit_kzt)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-background border border-border rounded-md p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Маржа</span>
              <p className="font-mono text-sm font-bold text-[#c89b3c] mt-0.5">{result.margin_percentage}%</p>
            </div>
            <div className="bg-background border border-border rounded-md p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Оценка</span>
              <p className={`text-xs font-semibold mt-0.5 ${isProfit ? "text-[#4caf74]" : "text-[#e05a4e]"}`}>
                {result.roi}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            * Учтены НДС 12% и комиссия площадки 1%
          </p>
        </div>
      )}
    </div>
  )
}
