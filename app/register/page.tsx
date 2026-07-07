"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setMessage(null);

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Пароли не совпадают" });
      return;
    }
    if (password.length < 8) {
      setFieldErrors({ password: "Пароль должен быть не короче 8 символов" });
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({ name, email, password });
      setMessage({ text: res.message, ok: res.success });
      if (res.errors) setFieldErrors(res.errors);
      if (res.success) setDone(true);
    } catch {
      setMessage({ text: "Не удалось связаться с сервером. Попробуйте позже.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="font-serif text-xl text-foreground mb-1">Регистрация</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Создайте аккаунт, чтобы сохранять фильтры и получать уведомления о тендерах.
        </p>

        {done ? (
          <div className="rounded-md border border-emerald/40 bg-emerald/10 p-4 text-sm text-emerald">
            {message?.text}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Имя
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
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
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-crimson">{fieldErrors.email}</p>
              )}
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
                minLength={8}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-crimson">{fieldErrors.password}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Повторите пароль
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-crimson">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {message && !message.ok && (
              <div className="rounded-md border border-crimson/40 bg-crimson/10 p-3 text-sm text-crimson">
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Уже подтвердили почту, но забыли пароль?{" "}
          <Link href="/forgot-password" className="text-primary hover:underline">
            Восстановить пароль
          </Link>
        </p>
      </div>
    </div>
  );
}
