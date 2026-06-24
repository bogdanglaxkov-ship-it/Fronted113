"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { searchTenders, getTenders } from "@/lib/api"
import type { Tender, TenderFilters } from "@/lib/api"

import FilterPanel from "@/components/FilterPanel"
import TenderCard from "@/components/TenderCard"
import TenderModal from "@/components/TenderModal"
import ChatPanel, { type ChatPanelHandle } from "@/components/ChatPanel"
import AnalyticsDashboard from "@/components/AnalyticsDashboard"
import MarginCalculator from "@/components/MarginCalculator"

const PAGE_SIZE = 20

type Tab = "tenders" | "analytics" | "calculator"

export default function TenderAIPage() {
  const [tab, setTab] = useState<Tab>("tenders")
  const [tenders, setTenders] = useState<Tender[]>([])
  const [allTenders, setAllTenders] = useState<Tender[]>([])
  const [filters, setFilters] = useState<TenderFilters>({})
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedTender, setSelectedTender] = useState<Tender | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const chatRef = useRef<ChatPanelHandle>(null)

  // Load all tenders initially
  useEffect(() => {
    setLoading(true)
    getTenders()
      .then(data => {
        setAllTenders(data.items)
        setTenders(data.items)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Search/filter on change (debounced)
  useEffect(() => {
    const isEmpty = !filters.keyword && !filters.region && !filters.price_min && !filters.price_max
    if (isEmpty) {
      setTenders(allTenders)
      setPage(1)
      return
    }
    const timer = setTimeout(() => {
      setLoading(true)
      searchTenders(filters)
        .then(data => {
          setTenders(data.items)
          setPage(1)
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [filters, allTenders])

  const paginated = tenders.slice(0, page * PAGE_SIZE)
  const hasMore = paginated.length < tenders.length

  function openChat(msg?: string) {
    setChatOpen(true)
    if (msg) {
      setTimeout(() => chatRef.current?.sendMessage(msg), 300)
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "tenders", label: "Тендеры" },
    { key: "analytics", label: "Аналитика" },
    { key: "calculator", label: "Калькулятор" },
  ]

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ── Navbar ── */}
      <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-md bg-[#c89b3c] flex items-center justify-center">
              <svg className="w-4 h-4 text-[#0b1629]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-foreground tracking-wide">TenderAI</span>
          </div>

          {/* Tabs */}
          <nav className="hidden sm:flex items-center gap-1 ml-4">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  tab === t.key
                    ? "bg-[#1e3150] text-[#c89b3c] font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Chat toggle */}
        <button
          onClick={() => setChatOpen(v => !v)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            chatOpen
              ? "border-[#c89b3c] text-[#c89b3c] bg-[#2a2010]"
              : "border-border text-muted-foreground hover:border-[#c89b3c44] hover:text-foreground"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="hidden sm:inline">Oylan AI</span>
        </button>
      </header>

      {/* Mobile tabs */}
      <div className="sm:hidden flex border-b border-border shrink-0">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              tab === t.key
                ? "text-[#c89b3c] border-b-2 border-[#c89b3c]"
                : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === "tenders" && (
            <>
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                totalFound={tenders.length}
                totalAll={allTenders.length}
              />

              {error && (
                <div className="mb-4 bg-[#2e1a1a] border border-[#a8453a] rounded-lg p-3 text-[#e05a4e] text-sm">
                  {error} — убедитесь, что бэкенд запущен и NEXT_PUBLIC_API_URL указан верно.
                </div>
              )}

              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-40 rounded-lg bg-card border border-border animate-pulse" />
                  ))}
                </div>
              )}

              {!loading && tenders.length === 0 && !error && (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  Тендеры не найдены. Попробуйте изменить фильтры.
                </div>
              )}

              {!loading && tenders.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {paginated.map(t => (
                      <TenderCard key={t.id} tender={t} onClick={setSelectedTender} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setPage(p => p + 1)}
                        className="px-6 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:border-[#c89b3c44] hover:text-foreground transition-colors"
                      >
                        Загрузить ещё ({tenders.length - paginated.length} осталось)
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {tab === "analytics" && <AnalyticsDashboard />}

          {tab === "calculator" && (
            <div className="max-w-md">
              <MarginCalculator />
            </div>
          )}
        </main>

        {/* Chat panel */}
        <ChatPanel ref={chatRef} open={chatOpen} onClose={() => setChatOpen(false)} />
      </div>

      {/* Tender detail modal */}
      <TenderModal
        tender={selectedTender}
        onClose={() => setSelectedTender(null)}
        onOpenChat={(msg) => openChat(msg)}
      />
    </div>
  )
}
