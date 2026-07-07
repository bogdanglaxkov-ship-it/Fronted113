import { Plus, Check } from "lucide-react";
import type { Tender } from "@/lib/api";
import { useCalculator } from "@/lib/calculator-store";
import { toast } from "sonner";
const STATUS_CONFIG = {
  active: { label: "АКТИВНЫЙ", bg: "bg-emerald/15", text: "text-emerald", border: "border-emerald" },
  completed: { label: "ЗАВЕРШЁН", bg: "bg-paused/15", text: "text-paused", border: "border-paused" },
  canceled: { label: "ОТМЕНЁН", bg: "bg-crimson/15", text: "text-crimson", border: "border-crimson" },
  paused: { label: "НА ПАУЗЕ", bg: "bg-gold-muted", text: "text-primary", border: "border-primary" },
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
  tender: Tender;
  onClick: (t: Tender) => void;
}
export default function TenderCard({ tender, onClick }: Props) {
  const s = STATUS_CONFIG[tender.status] ?? STATUS_CONFIG.completed;
  const add = useCalculator((st) => st.add);
  const inCalc = useCalculator((st) => st.items.some((x) => x.id === tender.id));
  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (inCalc) return;
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
      onClick={() => onClick(tender)}
      className="cursor-pointer bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:bg-accent transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        {tender.keyword && (
          <span className="font-mono text-[11px] text-muted-foreground tracking-widest shrink-0 uppercase truncate">
            {tender.keyword}
          </span>
        )}
        <span
          className={`ml-auto inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${s.bg} ${s.text} ${s.border} shrink-0`}
        >
          {s.label}
        </span>
      </div>
      <h3 className="text-foreground text-sm font-semibold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {tender.title}
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
        {tender.organization && (
          <div className="col-span-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Компания</span>
            <p className="text-xs text-foreground/85 truncate">{tender.organization}</p>
          </div>
        )}
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Цена</span>
          <p className="font-mono text-sm font-semibold text-primary">{formatPrice(tender.price)}</p>
        </div>
        {tender.region && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Город</span>
            <p className="text-xs text-foreground/85">{tender.region}</p>
          </div>
        )}
        {tender.district && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Район</span>
            <p className="text-xs text-foreground/85">{tender.district}</p>
          </div>
        )}
        {tender.deadline && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Дедлайн</span>
            <p className="font-mono text-xs text-foreground/70">{tender.deadline}</p>
          </div>
        )}
        {tender.published_at && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Публикация</span>
            <p className="font-mono text-xs text-foreground/70">{tender.published_at}</p>
          </div>
        )}
        {typeof tender.participants === "number" && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Участники</span>
            <p className="text-xs text-foreground/85">{tender.participants}</p>
          </div>
        )}
      </div>
      <button
        onClick={handleAdd}
        disabled={inCalc}
        className={`mt-3 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
          inCalc
            ? "border-emerald/40 text-emerald cursor-default"
            : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        }`}
      >
        {inCalc ? <Check size={12} /> : <Plus size={12} />}
        {inCalc ? "В калькуляторе" : "В калькулятор"}
      </button>
    </div>
  );
}