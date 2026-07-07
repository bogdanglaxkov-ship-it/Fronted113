"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Подтверждаем email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Ссылка неполная — не найден токен подтверждения.");
      return;
    }
    verifyEmail(token)
      .then((res) => {
        setStatus(res.success ? "success" : "error");
        setMessage(res.message);
      })
      .catch(() => {
        setStatus("error");
        setMessage("Не удалось связаться с сервером. Попробуйте позже.");
      });
  }, [token]);

  const boxClass =
    status === "success"
      ? "border-emerald/40 bg-emerald/10 text-emerald"
      : status === "error"
        ? "border-crimson/40 bg-crimson/10 text-crimson"
        : "border-border bg-secondary text-muted-foreground";

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="font-serif text-xl text-foreground mb-4">Подтверждение email</h1>
        <div className={`rounded-md border p-4 text-sm ${boxClass}`}>{message}</div>
        {status === "success" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Можете вернуться на{" "}
            <Link href="/tenders" className="text-primary hover:underline">
              главную страницу
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md text-sm text-muted-foreground">Загрузка...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
