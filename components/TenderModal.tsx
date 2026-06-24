"use client"

import { useEffect } from "react"
import type { Tender } from "@/lib/api"

const STATUS_CONFIG = {
  active:    { label: "АКТИВНЫЙ",   text: "text-[#4caf74]",  border: "border-[#4caf74]", bg: "bg-[#1f3a1a]" },
  completed: { label: "ЗАВЕРШЁН",   text: "text-[#7a90b0]",  border: "border-[#7a90b0]", bg: "bg-[#1a1a2e]" },
  canceled:  { label: "ОТМЕНЁН",    text: "text-[#e05a4e]",  border: "border-[#e05a4e]", bg: "bg-[#2e1a1a]" },
  paused:    { label: "НА ПАУЗЕ",   text: "text-[#c89b3c]",  border: "border-[#c89b3c]", bg: "bg-[#2e2a1a]" },
} as const

function formatPrice(price?: number) {
  if (!price) return "—"
  return new Intl.NumberFormat("ru-KZ", { style: "currency", currency: "KZT", maximumFractionDigits: 0 }).format(price)
}

interface Props {
  tender: Tender | null
  onClose: () => void
  onOpenChat: (msg: string) => void
}

export default function TenderModal({ tender, onClose, onOpenChat }: Props) {
  useEffect(() => {
    if (!tender) return
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [tender, onClose])

  if (!tender) return null
  const s = STATUS_CONFIG[tender.status] ?? STATUS_CONFIG.completed

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/?tender=${tender!.id}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[11px] text-muted-foreground tracking-widest">
                #{tender.id.toUpperCase()}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
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
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Key figures */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-background border border-border rounded-lg p-3">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Цена</span>
              <p className="font-mono text-base font-bold text-[#c89b3c] mt-0.5">{formatPrice(tender.price)}</p>
            </div>
            {tender.region && (
              <div className="bg-background border border-border rounded-lg p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Регион</span>
                <p className="text-sm font-semibold mt-0.5">{tender.region}</p>
              </div>
            )}
            {tender.participants !== undefined && (
              <div className="bg-background border border-border rounded-lg p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Участников</span>
                <p className="text-sm font-semibold mt-0.5">{tender.participants}</p>
              </div>
            )}
            {tender.published_at && (
              <div className="bg-background border border-border rounded-lg p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Опубликован</span>
                <p className="font-mono text-sm mt-0.5">{tender.published_at}</p>
              </div>
            )}
            {tender.deadline && (
              <div className="bg-background border border-border rounded-lg p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Дедлайн</span>
                <p className="font-mono text-sm mt-0.5 text-[#e05a4e]">{tender.deadline}</p>
              </div>
            )}
            {tender.contact && (
              <div className="bg-background border border-border rounded-lg p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Контакт</span>
                <p className="text-sm mt-0.5 truncate">{tender.contact}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {tender.description && (
            <div>
              <h4 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Описание</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{tender.description}</p>
            </div>
          )}

          {/* Requirements */}
          {tender.requirements && tender.requirements.length > 0 && (
            <div>
              <h4 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Требования</h4>
              <ul className="space-y-1.5">
                {tender.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c89b3c] mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Documents */}
          {tender.documents && tender.documents.length > 0 && (
            <div>
              <h4 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Документы</h4>
              <div className="space-y-2">
                {tender.documents.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#c89b3c] hover:underline"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414L13.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
                    </svg>
                    {doc.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {tender.url && (
            <div>
              <h4 className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Ссылка на тендер</h4>
              <a
                href={tender.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#c89b3c] hover:underline break-all"
              >
                {tender.url}
              </a>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap gap-3 p-6 pt-0">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-[#c89b3c44] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M16 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2" />
            </svg>
            Поделиться
          </button>
          <button
            onClick={() => {
              onClose()
              onOpenChat(`Проанализируй тендер "${tender.title}" (ID: ${tender.id}, цена: ${formatPrice(tender.price)}, регион: ${tender.region ?? "—"}). Стоит ли участвовать?`)
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#c89b3c] text-[#0b1629] rounded-lg font-semibold hover:bg-[#e0b84d] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Консультация с Oylan
          </button>
        </div>
      </div>
    </div>
  )
}
