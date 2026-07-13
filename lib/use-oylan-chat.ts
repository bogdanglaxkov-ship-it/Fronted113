"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { useCalculator } from "@/lib/calculator-store";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatAction {
  type: "add_lot";
  tender: { id: string; title: string; tender_price: number };
}

export function useOylanChat(sessionId: string, tenderId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    setHistoryLoaded(false);
    setMessages([]);
    fetch(`${API_URL}/history/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages ?? []);
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [sessionId]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, session_id: sessionId, tender_id: tenderId }),
      });
      const data = await res.json();
      const action = data.action as ChatAction | null | undefined;
      if (action?.type === "add_lot" && action.tender) {
        useCalculator.getState().add({
          id: action.tender.id,
          title: action.tender.title,
          tender_price: action.tender.tender_price ?? 0,
          my_cost: 0,
          logistics: 0,
          other_costs: 0,
        });
      }
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

  return { messages, setMessages, loading, historyLoaded, send };
}
