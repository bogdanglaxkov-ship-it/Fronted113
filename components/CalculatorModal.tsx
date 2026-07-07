'use client';

import { useEffect } from "react";
import { X } from "lucide-react";
import { useCalculator } from "@/lib/calculator-store";
import MarginCalculator from "./MarginCalculator";
export default function CalculatorModal() {
  const open = useCalculator((s) => s.open);
  const close = useCalculator((s) => s.closeModal);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, close]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="relative mx-auto w-full max-w-3xl my-8">
        <button
          onClick={close}
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>
        <MarginCalculator />
      </div>
    </div>
  );
}