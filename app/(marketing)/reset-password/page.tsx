"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api";
import { Button } from "@/components/ui/button";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    setMessage(null);

    if (!token) {
      setMessage({ text: "Ссылка неполная — не найден токен сброса пароля.", ok: false });
      return;
    }
    if (password !== confirmPassword) {
      setFieldError("Пароли не совпадают");
      return;
    }
    if (password.length < 8) {
      setFieldError("Пароль должен быть не короче 8 символов");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      setMessage({ text: res.message, ok: res.success });
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
        <h1 className="font-serif text-xl text-foreground mb-1">Новый пароль</h1>
        <p className="text-sm text-muted-foreground mb-6">Придумайте новый пароль для входа.</p>

        {done ? (
          <div className="rounded-md border border-emerald/40 bg-emerald/10 p-4 text-sm text-emerald">
            {message?.text}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Новый пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
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
              {fieldError && <p className="mt-1 text-xs text-crimson">{fieldError}</p>}
            </div>

            {message && !message.ok && (
              <div className="rounded-md border border-crimson/40 bg-crimson/10 p-3 text-sm text-crimson">
                {message.text}{" "}
                {!token && (
                  <>
                    Запросите новую ссылку на{" "}
                    <Link href="/forgot-password" className="underline">
                      странице восстановления
                    </Link>
                    .
                  </>
                )}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Сохраняем..." : "Сохранить новый пароль"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md text-sm text-muted-foreground">Загрузка...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
