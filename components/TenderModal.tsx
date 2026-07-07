'use client';

import { useEffect } from "react";
import { Plus, Check } from "lucide-react";
import type { Tender } from "@/lib/api";
import { useCalculator } from "@/lib/calculator-store";
import { toast } from "sonner";
const STATUS_CONFIG = {
  active: { label: "АКТИВНЫЙ", text: "text-emerald", border: "border-emerald", bg: "bg-emerald/15" },
  completed: { label: "ЗАВЕРШЁН", text: "text-paused", border: "border-paused", bg: "bg-paused/15" },
  canceled: { label: "ОТМЕНЁН", text: "text-crimson", border: "border-crimson", bg: "bg-crimson/15" },
  paused: { label: "НА ПАУЗЕ", text: "text-primary", border: "border-primary", bg: "bg-gold-muted" },
} as const;
function formatPrice(price?: number) {
  if (!price) return "—";
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
}
interface Props {
  tender: Tender | null;
  onClose: () => void;
  onOpenChat: (msg: string) => void;
}
export default function TenderModal({ tender, onClose, onOpenChat }: Props) {
  const add = useCalculator((s) => s.add);
  const inCalc = useCalculator((s) =>
    tender ? s.items.some((x) => x.id === tender.id) : false,
  );
  useEffect(() => {
    if (!tender) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tender, onClose]);
  if (!tender) return null;
  const s = STATUS_CONFIG[tender.status] ?? STATUS_CONFIG.completed;
  function handleAdd() {
    if (!tender || inCalc) return;
    add({
      id: tender.id,
      title: tender.title,
      tender_price: tender.price ?? 0,
      my_cost: 0,
      logistics: 0,
      other_costs: 0,
    });
    toast.success("Добавлено в калькулятор");
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl my-8">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {tender.keyword && (
                <span className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
                  {tender.keyword}
                </span>
              )}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${s.bg} ${s.text} ${s.border}`}
              >
                {s.label}
              </span>
            </div>
            <h2 className="text-foreground text-lg font-bold leading-snug">{tender.title}</h2>
            {tender.organization && (
              <p className="text-muted-foreground text-sm mt-1">{tender.organization}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-background border border-border rounded-lg p-3">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Цена</span>
              <p className="font-mono text-base font-bold text-primary mt-0.5">
                {formatPrice(tender.price)}
              </p>
            </div>
            {tender.region && (
              <div className="bg-background border border-border rounded-lg p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Город</span>
                <p className="text-sm font-semibold mt-0.5">{tender.region}</p>
              </div>
            )}
            {tender.district && (
              <div className="bg-background border border-border rounded-lg p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Район</span>
                <p className="text-sm font-semibold mt-0.5">{tender.district}</p>
              </div>
            )}
            {tender.organization && (
              <div className="bg-background border border-border rounded-lg p-3 sm:col-span-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Компания</span>
                <p className="text-sm font-semibold mt-0.5 truncate">{tender.organization}</p>
              </div>
            )}
            {tender.deadline && (
              <div className="bg-background border border-border rounded-lg p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Дедлайн</span>
                <p className="font-mono text-sm mt-0.5 text-crimson">{tender.deadline}</p>
              </div>
            )}
            {tender.published_at && (
              <div className="bg-background border border-border rounded-lg p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Публикация</span>
                <p className="font-mono text-sm mt-0.5">{tender.published_at}</p>
              </div>
            )}
            {typeof tender.participants === "number" && (
              <div className="bg-background border border-border rounded-lg p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Участники</span>
                <p className="text-sm font-semibold mt-0.5">{tender.participants}</p>
              </div>
            )}
            {tender.contact && (
              <div className="bg-background border border-border rounded-lg p-3 sm:col-span-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Контакт</span>
                <p className="text-sm mt-0.5">{tender.contact}</p>
              </div>
            )}
          </div>
          {tender.description && (
            <div>
              <h4 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Описание</h4>
              <p className="text-sm text-foreground/85 leading-relaxed">{tender.description}</p>
            </div>
          )}
          {tender.url && (
            <div>
              <h4 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Ссылка</h4>
              <a
                href={tender.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {tender.url}
              </a>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 p-6 pt-0">
          <button
            onClick={handleAdd}
            disabled={inCalc}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-semibold transition-colors ${
              inCalc
                ? "border border-emerald/40 text-emerald cursor-default"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {inCalc ? <Check size={14} /> : <Plus size={14} />}
            {inCalc ? "В калькуляторе" : "В калькулятор"}
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenChat(
                `Проанализируй тендер "${tender.title}" (ID: ${tender.id}, цена: ${formatPrice(
                  tender.price,
                )}, регион: ${tender.region ?? "—"}). Стоит ли участвовать?`,
              );
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            Консультация с Oylan
          </button>
        </div>
      </div>
    </div>
  );
}