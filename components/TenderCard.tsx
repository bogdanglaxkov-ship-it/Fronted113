import { Bookmark, Check, ExternalLink, MapPin, Clock, Users, TrendingUp } from "lucide-react";
import type { Tender } from "@/lib/api";
import { useCalculator } from "@/lib/calculator-store";
import { formatPrice, pseudoMargin } from "@/lib/format";
import { LOT_TYPE_CONFIG, classifyLotType } from "@/lib/lot-type";
import { toast } from "sonner";

const STATUS_CONFIG = {
  active: { label: "АКТИВНЫЙ", bg: "bg-emerald/15", text: "text-emerald", border: "border-emerald" },
  completed: { label: "ЗАВЕРШЁН", bg: "bg-paused/15", text: "text-paused", border: "border-paused" },
  canceled: { label: "ОТМЕНЁН", bg: "bg-crimson/15", text: "text-crimson", border: "border-crimson" },
  paused: { label: "НА ПАУЗЕ", bg: "bg-gold-muted", text: "text-primary", border: "border-primary" },
} as const;

interface Props {
  tender: Tender;
  onClick: (t: Tender) => void;
}

export default function TenderCard({ tender, onClick }: Props) {
  const s = STATUS_CONFIG[tender.status] ?? STATUS_CONFIG.completed;
  const lotType = LOT_TYPE_CONFIG[classifyLotType(tender.title)];
  const margin = pseudoMargin(tender.id + tender.title);
  const add = useCalculator((st) => st.add);
  const inCalc = useCalculator((st) => st.items.some((x) => x.id === tender.id));

  function handleBookmark(e: React.MouseEvent) {
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
      className="group flex cursor-pointer items-start gap-4 rounded-lg border border-border bg-card p-5 transition-all duration-150 hover:border-primary/50"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border ${lotType.bg}`}>
        <lotType.icon size={22} className={lotType.text} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${lotType.bg} ${lotType.text}`}>
            {lotType.label}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${s.bg} ${s.text} ${s.border}`}
          >
            {s.label}
          </span>
          {tender.keyword && (
            <span className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {tender.keyword}
            </span>
          )}
        </div>

        <h3 className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {tender.title}
        </h3>

        {tender.organization && (
          <p className="mb-1.5 truncate text-xs text-foreground/70">{tender.organization}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {tender.region && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {tender.region}
              {tender.district ? `, ${tender.district}` : ""}
            </span>
          )}
          {tender.deadline && (
            <span className="flex items-center gap-1 text-crimson">
              <Clock size={11} />
              {tender.deadline}
            </span>
          )}
          {typeof tender.participants === "number" && (
            <span className="flex items-center gap-1">
              <Users size={11} />
              {tender.participants} уч.
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBookmark}
            aria-label={inCalc ? "В калькуляторе" : "В калькулятор"}
            className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
              inCalc
                ? "border-emerald/40 text-emerald"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {inCalc ? <Check size={13} /> : <Bookmark size={13} />}
          </button>
          {tender.url && (
            <a
              href={tender.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Открыть источник"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
        <p className="whitespace-nowrap font-mono text-sm font-semibold text-foreground">{formatPrice(tender.price)}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2.5 py-1 text-[11px] font-bold text-emerald">
          Маржа {margin}%
          <TrendingUp size={12} />
        </span>
      </div>
    </div>
  );
}
