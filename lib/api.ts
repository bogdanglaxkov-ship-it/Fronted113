export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
export type TenderStatus = "active" | "completed" | "canceled" | "paused";
export interface Tender {
  id: string;
  title: string;
  price?: number;
  region?: string;
  district?: string | null;
  organization?: string | null;
  city?: string | null;
  keyword?: string | null;
  status: TenderStatus;
  url?: string;
  deadline?: string;
  published_at?: string;
  participants?: number;
  contact?: string;
  description?: string;
  requirements?: string[];
  documents?: { name: string; url: string }[];
}
export interface TenderFilters {
  region: string | null;
  district: string | null;
  price_min: number | null;
  price_max: number | null;
  keyword: string | null;
}
export type TenderSource = "goszakup" | "samruk" | "tenderplan";

export async function fetchTenders(source?: TenderSource): Promise<Tender[]> {
  const url = source ? `${API_URL}/api/tenders?source=${source}` : `${API_URL}/api/tenders`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Сервер ответил ${res.status}`);
  const data = await res.json();
  return (data.items ?? []) as Tender[];
}
export async function searchTenders(filters: TenderFilters): Promise<Tender[]> {
  const res = await fetch(`${API_URL}/api/tenders/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filters }),
  });
  if (!res.ok) throw new Error(`Сервер ответил ${res.status}`);
  const data = await res.json();
  return (data.items ?? data.results ?? []) as Tender[];
}

export interface LotDocument {
  id: string;
  name: string;
  description: string;
}

export interface LotDetail {
  id: string;
  title: string;
  description: string;
  lot_number: string;
  type: string;
  category: string;
  subcategory: string;
  customer: string;
  customer_rating: number;
  region?: string | null;
  deadline_text: string;
  status_label: string;
  purchase_method: string;
  trade_type: string;
  amount: number;
  quantity: number;
  price_per_unit: number;
  margin_percent: number;
  profit: number;
  competition: number;
  dumping_percent: number;
  source_url?: string | null;
  documents: LotDocument[];
  shared_documents: LotDocument[];
}

export async function fetchTenderDetail(id: string): Promise<LotDetail> {
  const res = await fetch(`${API_URL}/api/tenders/${encodeURIComponent(id)}/detail`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Сервер ответил ${res.status}`);
  return res.json();
}

export async function fetchRelatedTenders(id: string): Promise<Tender[]> {
  const res = await fetch(`${API_URL}/api/tenders/${encodeURIComponent(id)}/related`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Сервер ответил ${res.status}`);
  const data = await res.json();
  return (data.items ?? []) as Tender[];
}

export function lotDocumentUrl(tenderId: string, docId: string): string {
  return `${API_URL}/api/tenders/${encodeURIComponent(tenderId)}/documents/${encodeURIComponent(docId)}`;
}

export interface MarginResult {
  pure_profit_kzt: number;
  margin_percentage: number;
  roi: string;
}

export async function calculateMargin(tender_price: number, my_cost: number): Promise<MarginResult> {
  const res = await fetch(`${API_URL}/api/calculator/margin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tender_price, my_cost }),
  });
  if (!res.ok) throw new Error(`Сервер ответил ${res.status}`);
  return res.json();
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
}
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
  errors?: Record<string, string>;
}

async function postAuth(path: string, body: unknown): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as AuthResponse;
}

export function registerUser(data: { name: string; email: string; password: string }) {
  return postAuth("register", data);
}
export function loginUser(data: { email: string; password: string }) {
  return postAuth("login", data);
}
export function verifyEmail(token: string) {
  return postAuth("verify-email", { token });
}
export function forgotPassword(email: string) {
  return postAuth("forgot-password", { email });
}
export function resetPassword(token: string, password: string) {
  return postAuth("reset-password", { token, password });
}

export interface McpKeyResponse {
  server_url: string;
  key: string;
}

export async function getMcpKey(authToken: string): Promise<McpKeyResponse> {
  const res = await fetch(`${API_URL}/api/mcp/key`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  if (!res.ok) throw new Error(`Сервер ответил ${res.status}`);
  return res.json();
}

export async function rotateMcpKey(authToken: string): Promise<McpKeyResponse> {
  const res = await fetch(`${API_URL}/api/mcp/key/rotate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${authToken}` },
  });
  if (!res.ok) throw new Error(`Сервер ответил ${res.status}`);
  return res.json();
}
