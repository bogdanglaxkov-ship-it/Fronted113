"use client";

import { useState } from "react";
import { forgotPassword } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await forgotPassword(email);
      setMessage({ text: res.message, ok: res.success });
    } catch {
      setMessage({ text: "Не удалось связаться с сервером. Попробуйте позже.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="font-serif text-xl text-foreground mb-1">Восстановление пароля</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Укажите email, с которым регистрировались — пришлём ссылку для сброса пароля.
        </p>

        {message?.ok ? (
          <div className="rounded-md border border-emerald/40 bg-emerald/10 p-4 text-sm text-emerald">
            {message.text}
          </div>
        ) : (
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

            {message && !message.ok && (
              <div className="rounded-md border border-crimson/40 bg-crimson/10 p-3 text-sm text-crimson">
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Отправляем..." : "Отправить ссылку"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
