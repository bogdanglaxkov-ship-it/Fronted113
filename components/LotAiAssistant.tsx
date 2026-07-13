"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Paperclip, FileText, Bookmark } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import type { ChatMessage } from "@/lib/use-oylan-chat";
import { useCalculator } from "@/lib/calculator-store";
import type { LotDetail } from "@/lib/api";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Какая маржа у этого лота?",
  "Оцени конкуренцию",
  "Какие риски?",
  "Расскажи про заказчика",
];

interface Props {
  lot: LotDetail;
  messages: ChatMessage[];
  loading: boolean;
  send: (text: string) => Promise<void>;
}

export default function LotAiAssistant({ lot, messages, loading, send }: Props) {
  const { user, hydrated, hydrate } = useAuth();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const add = useCalculator((s) => s.add);
  const inCalc = useCalculator((s) => s.items.some((x) => x.id === lot.id));

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSaveLot() {
    if (inCalc) return;
    add({ id: lot.id, title: lot.title, tender_price: lot.amount, my_cost: 0, logistics: 0, other_costs: 0 });
    toast.success('Лот сохранён в "Мои лоты"');
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
      setInput("");
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            K
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">AI АССИСТЕНТ</p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Kepler AI · Онлайн
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && !loading && (
          <div className="space-y-3">
            <div className="rounded-xl rounded-tl-sm border border-border bg-background px-3.5 py-2.5 text-sm text-foreground/90">
              Сәлем{hydrated && user ? `, ${user.name}` : ""}! Я Kepler AI. Изучил этот лот и готов ответить на
              ваши вопросы.
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
              <Bookmark size={13} className="mt-0.5 shrink-0" />
              <span>
                Чат привязан к текущему лоту.{" "}
                <button onClick={handleSaveLot} className="font-medium text-primary hover:underline">
                  {inCalc ? "Уже сохранено" : "Сохрани"}
                </button>{" "}
                в «Мои лоты», чтобы вернуться позже.
              </span>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
              <Paperclip size={13} className="mt-0.5 shrink-0" />
              <span>Прикрепите документ лота ниже, чтобы я разобрал его содержание.</span>
            </div>
          </div>
        )}

        {messages.length === 0 && !loading && lot.documents.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">Документы лота</p>
            <div className="flex flex-wrap gap-1.5">
              {lot.documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => void send(`Прочитай «${doc.name}» и кратко перескажи, что в нём важного для участия в лоте «${lot.title}».`)}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <FileText size={11} />
                  {doc.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
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

      <div className="shrink-0 border-t border-border p-3">
        {messages.length === 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((label) => (
              <button
                key={label}
                onClick={() => void send(label)}
                className="rounded-full border border-border bg-background px-2.5 py-1.5 text-[11px] text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 transition-colors focus-within:border-primary">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Спросите о чём угодно..."
            rows={1}
            className="flex-1 resize-none border-none bg-transparent py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={() => {
              void send(input);
              setInput("");
            }}
            disabled={loading || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/70">Kepler AI может ошибаться. Проверяйте важные данные.</p>
      </div>
    </div>
  );
}
