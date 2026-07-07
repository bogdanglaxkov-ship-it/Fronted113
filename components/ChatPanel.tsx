'use client';

import { useState, useEffect, useRef } from "react";
import { Send, Trash2, X } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useChat } from "@/lib/chat-store";
const SESSION_ID = "user_1";
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
const SUGGESTIONS = [
  "Помощь с анализом тендера",
  "Как написать коммерческое предложение?",
  "Какие тендеры сейчас актуальны?",
  "Посоветуй стратегию участия",
];
export default function ChatPanel() {
  const open = useChat((s) => s.open);
  const close = useChat((s) => s.closeChat);
  const consumePending = useChat((s) => s.consumePending);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || historyLoaded) return;
    fetch(`${API_URL}/history/${SESSION_ID}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages ?? []);
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [open, historyLoaded]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  async function send(text: string) {
    const msg = text.trim();
    if (!msg || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, session_id: SESSION_ID }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? data.detail ?? "Нет ответа" },
      ]);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Неизвестная ошибка";
      setMessages((prev) => [...prev, { role: "assistant", content: `Ошибка: ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  }
  // Consume pending message (from TenderModal "Консультация с Oylan")
  useEffect(() => {
    if (!open) return;
    const pending = consumePending();
    if (pending) void send(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }
  if (!open) return null;
  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 flex w-full sm:w-96 flex-col border-l border-border bg-card shadow-2xl"
      aria-label="AI ассистент Oylan"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            O
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Oylan</p>
            <p className="text-[10px] text-muted-foreground">AI ассистент</p>
          </div>
          <span className="ml-1 w-2 h-2 rounded-full bg-emerald animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMessages([])}
            title="Очистить"
            className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={close}
            title="Закрыть"
            className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center pt-4">
              Привет! Я Oylan — твой ассистент по тендерам. Чем помочь?
            </p>
            <div className="space-y-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="w-full text-left px-3 py-2 text-xs text-foreground/80 bg-background border border-border rounded-lg hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
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
            <div className="bg-background border border-border rounded-xl rounded-bl-sm px-4 py-2.5">
              <div className="flex items-center gap-1">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Напишите сообщение..."
            rows={2}
            className="flex-1 resize-none py-2 px-3 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => void send(input)}
            disabled={loading || !input.trim()}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Enter — отправить · Shift+Enter — перенос
        </p>
      </div>
    </aside>
  );
}