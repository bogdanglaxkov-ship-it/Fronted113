"use client"

import type { Tender } from "@/lib/api"

const STATUS_CONFIG = {
  active:    { label: "АКТИВНЫЙ",   bg: "bg-[#1f3a1a]",  text: "text-[#4caf74]",  border: "border-[#4caf74]" },
  completed: { label: "ЗАВЕРШЁН",   bg: "bg-[#1a1a2e]",  text: "text-[#7a90b0]",  border: "border-[#7a90b0]" },
  canceled:  { label: "ОТМЕНЁН",    bg: "bg-[#2e1a1a]",  text: "text-[#e05a4e]",  border: "border-[#e05a4e]" },
  paused:    { label: "НА ПАУЗЕ",   bg: "bg-[#2e2a1a]",  text: "text-[#c89b3c]",  border: "border-[#c89b3c]" },
} as const

function formatPrice(price?: number) {
  if (!price) return "—"
  return new Intl.NumberFormat("ru-KZ", { style: "currency", currency: "KZT", maximumFractionDigits: 0 }).format(price)
}

interface Props {
  tender: Tender
  onClick: (t: Tender) => void
}

export default function TenderCard({ tender, onClick }: Props) {
  const s = STATUS_CONFIG[tender.status] ?? STATUS_CONFIG.completed

  return (
    <button
      onClick={() => onClick(tender)}
      className="w-full text-left bg-card border border-border rounded-lg p-4 hover:border-[#c89b3c44] hover:bg-[#162847] transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {/* Top row: ID + Status */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="font-mono text-[11px] text-muted-foreground tracking-widest shrink-0">
          #{tender.id.slice(0, 12).toUpperCase()}
        </span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${s.bg} ${s.text} ${s.border} shrink-0`}>
          {s.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-foreground text-sm font-semibold leading-snug mb-2 group-hover:text-[#c89b3c] transition-colors line-clamp-2">
        {tender.title}
      </h3>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
        {tender.organization && (
          <div className="col-span-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Организация</span>
            <p className="text-xs text-foreground/80 truncate">{tender.organization}</p>
          </div>
        )}
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Цена</span>
          <p className="font-mono text-sm font-semibold text-[#c89b3c]">{formatPrice(tender.price)}</p>
        </div>
        {tender.region && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Регион</span>
            <p className="text-xs text-foreground/80">{tender.region}</p>
          </div>
        )}
        {tender.deadline && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Дедлайн</span>
            <p className="font-mono text-xs text-foreground/70">{tender.deadline}</p>
          </div>
        )}
        {tender.participants !== undefined && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Участников</span>
            <p className="text-xs text-foreground/70">{tender.participants}</p>
          </div>
        )}
      </div>
    </button>
  )
}
