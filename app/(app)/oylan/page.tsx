"use client";

import { useEffect, useRef } from "react";
import { Send, Trash2, FileText, BarChart3, Search, Calculator, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { useChat } from "@/lib/chat-store";
import { useOylanChat } from "@/lib/use-oylan-chat";

const SUGGESTIONS = [
  { label: "Мои тендеры", icon: FileText },
  { label: "Аналитика", icon: BarChart3 },
  { label: "Найти тендер", icon: Search },
  { label: "Помощь с расчётом", icon: Calculator },
];

export default function OylanPage() {
  const { user, hydrated, hydrate } = useAuth();
  const consumePending = useChat((s) => s.consumePending);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const sessionId = hydrated ? (user?.id ?? "guest") : "guest";
  const { messages, setMessages, loading, send } = useOylanChat(sessionId);

  useEffect(() => {
    if (!hydrated) return;
    const pending = consumePending();
    if (pending) void send(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
      setInput("");
    }
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              O
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Oylan AI</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ассистент по тендерам</p>
          </div>
          <span className="ml-1 h-2 w-2 rounded-full bg-emerald animate-pulse" />
        </div>
        <button
          onClick={() => setMessages([])}
          title="Очистить"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 && !loading && (
          <div className="space-y-5 pt-6 text-center">
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg animate-pulse" />
              <Sparkles size={22} className="relative text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                Привет{hydrated && user ? `, ${user.name}` : ""}!
              </p>
              <p className="text-sm text-muted-foreground">Чем помочь?</p>
            </div>
            <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2 pt-2">
              {SUGGESTIONS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => void send(label)}
                  className="flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-xs text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground font-medium rounded-br-sm"
                  : "bg-background border border-border text-foreground/90 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl rounded-bl-sm border border-border bg-background px-4 py-2.5">
              <div className="flex items-center gap-1">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-border p-4">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 transition-colors focus-within:border-primary">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Напишите сообщение..."
            rows={2}
            className="flex-1 resize-none border-none bg-transparent py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={() => {
              void send(input);
              setInput("");
            }}
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground/70">
          Enter — отправить · Shift+Enter — перенос
        </p>
      </div>
    </div>
  );
}
