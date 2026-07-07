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
export async function fetchTenders(): Promise<Tender[]> {
  const res = await fetch(`${API_URL}/api/tenders`, { cache: "no-store" });
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
