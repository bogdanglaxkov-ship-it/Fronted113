// ─────────────────────────────────────────────
//  API SERVICE — подключается к FastAPI бэкенду
//  Все эндпоинты из main.py
// ─────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    let message = `HTTP ${res.status}`
    if (body) {
      const d = body.detail
      if (typeof d === "string") message = d
      else if (Array.isArray(d)) message = d.join(", ")
      else if (typeof d === "object" && d !== null) message = JSON.stringify(d)
      else if (typeof body.message === "string") message = body.message
      else if (Array.isArray(body.message)) message = body.message.join(", ")
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

// ─── ТИПЫ ────────────────────────────────────

export interface Tender {
  id: string
  title: string
  organization?: string
  price?: number
  region?: string
  district?: string
  status: "active" | "completed" | "canceled" | "paused"
  url?: string
  keyword?: string
  published_at?: string
  deadline?: string
  participants?: number
  description?: string
  requirements?: string[]
  documents?: { name: string; url: string }[]
  contact?: string
}

export interface TenderFilters {
  region?: string
  district?: string
  price_min?: number
  price_max?: number
  keyword?: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface AnalyticsTrends {
  total_active: number
  top_categories: string[]
  average_price_drop_percentage: number
  active_tenders_count: number
}

export interface DistrictData {
  name: string
  tender_count: number
  total_budget_kzt: number
  intensity: "high" | "medium" | "low"
}

export interface AnalyticsMap {
  city: string
  total_tenders: number
  districts: DistrictData[]
}

export interface MarginResult {
  pure_profit_kzt: number
  margin_percentage: number
  roi: string
}

// ─── ТЕНДЕРЫ ──────────────────────────────────

export const getTenders = () =>
  req<{ items: Tender[] }>("/api/tenders")

export const getTender = (id: string) =>
  req<Tender>(`/api/tenders/${id}`)

export const searchTenders = (filters: TenderFilters) =>
  req<{ total_count: number; items: Tender[] }>("/api/tenders/search", {
    method: "POST",
    body: JSON.stringify({ filters }),
  })

export const createTender = (tender: Omit<Tender, "id"> & { id: string }) =>
  req<{ status: string; id: string }>("/api/tenders", {
    method: "POST",
    body: JSON.stringify(tender),
  })

// ─── ЧАТ ──────────────────────────────────────

export const sendChat = (message: string, session_id = "user_1") =>
  req<{ reply: string; session_id: string }>("/chat", {
    method: "POST",
    body: JSON.stringify({ message, session_id }),
  })

export const getChatHistory = (session_id = "user_1") =>
  req<{ session_id: string; messages: ChatMessage[]; count: number }>(
    `/history/${session_id}`
  )

// ─── АНАЛИТИКА ────────────────────────────────

export const getAnalyticsTrends = () =>
  req<AnalyticsTrends>("/api/analytics/trends")

export const getAnalyticsMap = () =>
  req<AnalyticsMap>("/api/analytics/map")

// ─── КАЛЬКУЛЯТОР ──────────────────────────────

export const calcMargin = (tender_price: number, my_cost: number) =>
  req<MarginResult>("/api/calculator/margin", {
    method: "POST",
    body: JSON.stringify({ tender_price, my_cost }),
  })

// ─── ПОДПИСКИ ─────────────────────────────────

export const getSubscription = (user_id: number) =>
  req<unknown>(`/api/subscriptions/${user_id}`)

export const getAllSubscriptions = () =>
  req<{ subscriptions: unknown[] }>("/api/subscriptions")
