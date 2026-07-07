import { useState, useEffect } from "react";
import { Scale, TrendingUp, TrendingDown, Sparkles, Loader2, X } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useCalculator, type CalcTender } from "../lib/calculator-store";
interface MarginInput {
  tender_price: number;
  my_cost: number;
  logistics: number;
  other_costs: number;
}
interface MarginResult {
  tender_price: number;
  total_cost: number;
  tax_kzt: number;
  fee_kzt: number;
  pure_profit_kzt: number;
  margin_percentage: number;
  roi: string;
}
interface CompareResult {
  tender_a: MarginResult;
  tender_b: MarginResult;
  better: "tender_a" | "tender_b";
  diff_kzt: number;
}
const EMPTY_INPUT: MarginInput = { tender_price: 0, my_cost: 0, logistics: 0, other_costs: 0 };
function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center rounded-md border border-border bg-input px-3 py-2 focus-within:border-primary transition-colors">
        <input
          type="number"
          inputMode="numeric"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder="0"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <span className="ml-2 text-xs text-muted-foreground">₸</span>
      </div>
    </label>
  );
}
function fmt(n: number) {
  return Math.round(n).toLocaleString("ru-RU");
}
function Row({ label, value, dim }: { label: string; value: number; dim?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={dim ? "text-muted-foreground text-xs" : "text-muted-foreground"}>{label}</span>
      <span className={dim ? "text-muted-foreground text-xs" : "text-foreground"}>{fmt(value)} ₸</span>
    </div>
  );
}
function ResultCard({
  title,
  result,
  isBetter,
}: {
  title: string;
  result: MarginResult;
  isBetter?: boolean;
}) {
  const positive = result.pure_profit_kzt > 0;
  return (
    <div
      className={`rounded-lg border p-4 ${
        isBetter
          ? "border-primary bg-secondary shadow-[0_0_0_1px] shadow-primary/30"
          : "border-border bg-card"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {isBetter && (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
            Выгоднее
          </span>
        )}
      </div>
      <div className="space-y-1.5 text-sm">
        <Row label="Цена тендера" value={result.tender_price} />
        <Row label="Все расходы" value={result.total_cost} />
        <Row label="Налог (12%)" value={result.tax_kzt} dim />
        <Row label="Обеспечение (1%)" value={result.fee_kzt} dim />
        <div className="my-2 border-t border-border" />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Чистая прибыль</span>
          <span
            className={`flex items-center gap-1 font-semibold ${
              positive ? "text-emerald" : "text-crimson"
            }`}
          >
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {fmt(result.pure_profit_kzt)} ₸
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Маржа</span>
          <span className="text-muted-foreground">{result.margin_percentage}%</span>
        </div>
      </div>
    </div>
  );
}
export default function MarginCalculator() {
  const items = useCalculator((s) => s.items);
  const remove = useCalculator((s) => s.remove);
  const [compareMode, setCompareMode] = useState(false);
  const [inputA, setInputA] = useState<MarginInput>(EMPTY_INPUT);
  const [inputB, setInputB] = useState<MarginInput>(EMPTY_INPUT);
  const [resultSingle, setResultSingle] = useState<MarginResult | null>(null);
  const [resultCompare, setResultCompare] = useState<CompareResult | null>(null);
  const [aiVerdict, setAiVerdict] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  // Auto-fill from added tenders
  useEffect(() => {
    if (items[0]) {
      const { id, title, ...inp } = items[0];
      void id;
      void title;
      setInputA(inp);
    }
    if (items[1]) {
      const { id, title, ...inp } = items[1];
      void id;
      void title;
      setInputB(inp);
      setCompareMode(true);
    }
  }, [items]);
  function loadInto(slot: "A" | "B", t: CalcTender) {
    const inp = {
      tender_price: t.tender_price,
      my_cost: t.my_cost,
      logistics: t.logistics,
      other_costs: t.other_costs,
    };
    if (slot === "A") setInputA(inp);
    else {
      setInputB(inp);
      setCompareMode(true);
    }
  }
  async function calculate() {
    setLoading(true);
    setAiVerdict(null);
    try {
      if (compareMode) {
        const res = await fetch(`${API_URL}/api/calculator/margin/compare`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tender_a: inputA, tender_b: inputB }),
        });
        const data: CompareResult = await res.json();
        setResultCompare(data);
        setResultSingle(null);
      } else {
        const res = await fetch(`${API_URL}/api/calculator/margin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputA),
        });
        const data: MarginResult = await res.json();
        // Backend single endpoint returns partial; fill missing fields
        const full: MarginResult = {
          tender_price: inputA.tender_price,
          total_cost: inputA.my_cost + inputA.logistics + inputA.other_costs,
          tax_kzt: inputA.tender_price * 0.12,
          fee_kzt: inputA.tender_price * 0.01,
          pure_profit_kzt: data.pure_profit_kzt ?? 0,
          margin_percentage: data.margin_percentage ?? 0,
          roi: data.roi ?? "—",
        };
        setResultSingle(full);
        setResultCompare(null);
      }
    } catch (e) {
      console.error("Ошибка расчёта:", e);
    } finally {
      setLoading(false);
    }
  }
  async function askOylan() {
    setAiLoading(true);
    try {
      const summary = compareMode
        ? `Сравни тендеры. A: цена ${inputA.tender_price} ₸, себестоимость ${inputA.my_cost} ₸, логистика ${inputA.logistics} ₸, прочее ${inputA.other_costs} ₸. B: цена ${inputB.tender_price} ₸, себестоимость ${inputB.my_cost} ₸, логистика ${inputB.logistics} ₸, прочее ${inputB.other_costs} ₸. Какой выгоднее?`
        : `Оцени тендер: цена ${inputA.tender_price} ₸, себестоимость ${inputA.my_cost} ₸, логистика ${inputA.logistics} ₸, прочее ${inputA.other_costs} ₸.`;
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: summary, session_id: "calculator" }),
      });
      const data = await res.json();
      setAiVerdict(data.reply || "Не удалось получить вердикт.");
    } catch {
      setAiVerdict("Ошибка связи с Oylan AI.");
    } finally {
      setAiLoading(false);
    }
  }
  return (
    <div className="rounded-xl border border-border bg-popover p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale size={18} className="text-primary" />
          <h3 className="font-serif text-lg text-foreground">Калькулятор маржи</h3>
        </div>
        <button
          onClick={() => {
            setCompareMode((v) => !v);
            setResultSingle(null);
            setResultCompare(null);
            setAiVerdict(null);
          }}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          {compareMode ? "Один тендер" : "Сравнить два"}
        </button>
      </div>
      {items.length > 0 && (
        <div className="mb-4 rounded-md border border-border bg-input p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Добавленные тендеры
          </p>
          <div className="flex flex-wrap gap-1.5">
            {items.map((t) => (
              <div
                key={t.id}
                className="group flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground"
              >
                <span className="max-w-[180px] truncate">{t.title}</span>
                <span className="text-primary">{fmt(t.tender_price)} ₸</span>
                <button
                  onClick={() => loadInto("A", t)}
                  className="text-[10px] text-muted-foreground hover:text-primary underline"
                  title="В Тендер A"
                >
                  A
                </button>
                <button
                  onClick={() => loadInto("B", t)}
                  className="text-[10px] text-muted-foreground hover:text-primary underline"
                  title="В Тендер B"
                >
                  B
                </button>
                <button
                  onClick={() => remove(t.id)}
                  className="text-muted-foreground hover:text-crimson"
                  title="Убрать"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={compareMode ? "grid gap-4 sm:grid-cols-2" : ""}>
        <div className="space-y-3">
          {compareMode && (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Тендер A
            </p>
          )}
          <NumberField
            label="Цена тендера"
            value={inputA.tender_price}
            onChange={(v) => setInputA((p) => ({ ...p, tender_price: v }))}
          />
          <NumberField
            label="Себестоимость"
            value={inputA.my_cost}
            onChange={(v) => setInputA((p) => ({ ...p, my_cost: v }))}
          />
          <NumberField
            label="Логистика"
            value={inputA.logistics}
            onChange={(v) => setInputA((p) => ({ ...p, logistics: v }))}
          />
          <NumberField
            label="Прочие расходы"
            value={inputA.other_costs}
            onChange={(v) => setInputA((p) => ({ ...p, other_costs: v }))}
          />
        </div>
        {compareMode && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Тендер B
            </p>
            <NumberField
              label="Цена тендера"
              value={inputB.tender_price}
              onChange={(v) => setInputB((p) => ({ ...p, tender_price: v }))}
            />
            <NumberField
              label="Себестоимость"
              value={inputB.my_cost}
              onChange={(v) => setInputB((p) => ({ ...p, my_cost: v }))}
            />
            <NumberField
              label="Логистика"
              value={inputB.logistics}
              onChange={(v) => setInputB((p) => ({ ...p, logistics: v }))}
            />
            <NumberField
              label="Прочие расходы"
              value={inputB.other_costs}
              onChange={(v) => setInputB((p) => ({ ...p, other_costs: v }))}
            />
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={calculate}
          disabled={loading}
          className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Считаю..." : "Рассчитать"}
        </button>
        <button
          onClick={askOylan}
          disabled={aiLoading}
          className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-primary transition-colors disabled:opacity-50"
        >
          {aiLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} className="text-primary" />
          )}
          Спросить Oylan
        </button>
      </div>
      {resultSingle && (
        <div className="mt-5">
          <ResultCard title="Результат" result={resultSingle} />
        </div>
      )}
      {resultCompare && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ResultCard
            title="Тендер A"
            result={resultCompare.tender_a}
            isBetter={resultCompare.better === "tender_a"}
          />
          <ResultCard
            title="Тендер B"
            result={resultCompare.tender_b}
            isBetter={resultCompare.better === "tender_b"}
          />
        </div>
      )}
      {aiVerdict && (
        <div className="mt-4 rounded-md border border-primary/30 bg-secondary p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles size={12} /> Вердикт Oylan AI
          </div>
          <p className="text-sm leading-relaxed text-foreground">{aiVerdict}</p>
        </div>
      )}
    </div>
  );
}