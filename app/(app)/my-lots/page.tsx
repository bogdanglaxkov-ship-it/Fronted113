"use client";

import Link from "next/link";
import { Bookmark, Trash2, Calculator } from "lucide-react";
import { useCalculator } from "@/lib/calculator-store";
import { formatPrice } from "@/lib/format";

export default function MyLotsPage() {
  const items = useCalculator((s) => s.items);
  const remove = useCalculator((s) => s.remove);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Мои лоты</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Тендеры, добавленные закладкой из списка лотов.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-popover p-12 text-center">
          <Bookmark size={28} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Пока пусто. Добавляйте тендеры кнопкой-закладкой в списке «Лоты Госзакуп».
          </p>
          <Link href="/tenders" className="text-sm text-primary hover:underline">
            Перейти к лотам
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(t.tender_price)}</p>
              </div>
              <Link
                href="/calculator"
                aria-label="Открыть в калькуляторе"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Calculator size={14} />
              </Link>
              <button
                onClick={() => remove(t.id)}
                aria-label="Убрать"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-crimson hover:text-crimson"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
