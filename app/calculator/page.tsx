"use client";
import { useEffect } from "react";
import { useCalculator } from "@/lib/calculator-store";
export default function CalculatorPage() {
  const openModal = useCalculator((s) => s.openModal);
  useEffect(() => {
    openModal();
  }, [openModal]);
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">
        Калькулятор открывается в окне по центру экрана.
      </p>
    </div>
  );
}