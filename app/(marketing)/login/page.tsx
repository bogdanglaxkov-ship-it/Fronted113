"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.success && res.user && res.token) {
        setAuth(res.user, res.token);
        router.push("/tenders");
      } else {
        setMessage(res.message);
      }
    } catch {
      setMessage("Не удалось связаться с сервером. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="font-serif text-xl text-foreground mb-1">Вход</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Войдите, чтобы получить доступ к своему аккаунту.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>

          {message && (
            <div className="rounded-md border border-crimson/40 bg-crimson/10 p-3 text-sm text-crimson">
              {message}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Входим..." : "Войти"}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-1.5 text-xs text-muted-foreground">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Забыли пароль?
          </Link>
          <span>
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
