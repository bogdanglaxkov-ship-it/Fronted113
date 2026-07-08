"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Sparkles, Check, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { API_URL } from "@/lib/api";

interface NotificationItem {
  id: number;
  content: string;
  created_at: string;
}

function pluralRu(n: number, forms: [string, string, string]): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} ${pluralRu(minutes, ["минуту", "минуты", "минут"])} назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `около ${hours} ${pluralRu(hours, ["часа", "часов", "часов"])} назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${pluralRu(days, ["день", "дня", "дней"])} назад`;
  return new Date(iso).toLocaleDateString("ru-RU");
}

const READ_KEY_PREFIX = "notif_read_until:";

export default function NotificationsMenu() {
  const { user, hydrated, hydrate } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [lastReadId, setLastReadId] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const sessionId = hydrated ? (user?.id ?? "guest") : null;

  useEffect(() => {
    if (!sessionId) return;
    fetch(`${API_URL}/history/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        const assistantMsgs: NotificationItem[] = (data.messages ?? [])
          .filter((m: { role: string }) => m.role === "assistant")
          .slice(-10)
          .reverse();
        setItems(assistantMsgs);
      })
      .catch(() => setItems([]));

    const stored = Number(localStorage.getItem(`${READ_KEY_PREFIX}${sessionId}`) ?? 0);
    setLastReadId(stored);
  }, [sessionId]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unreadCount = items.filter((m) => m.id > lastReadId).length;

  function markAllRead() {
    const maxId = items.reduce((max, m) => Math.max(max, m.id), lastReadId);
    setLastReadId(maxId);
    if (sessionId) localStorage.setItem(`${READ_KEY_PREFIX}${sessionId}`, String(maxId));
  }

  if (!hydrated) return <div className="h-8 w-8" />;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Уведомления"
        className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-crimson px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Уведомления</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Check size={12} />
                Прочитать все
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">Пока нет уведомлений</p>
            ) : (
              items.map((m) => (
                <div
                  key={m.id}
                  className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-accent/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Sparkles size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">Ответ от Oylan AI</p>
                      {m.id > lastReadId && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{m.content}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                      <Clock size={11} />
                      {formatRelativeTime(m.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
