"use client";
import { create } from "zustand";
export interface CalcTender {
  id: string;
  title: string;
  tender_price: number;
  my_cost: number;
  logistics: number;
  other_costs: number;
}
interface CalculatorState {
  items: CalcTender[];
  add: (t: CalcTender) => void;
  remove: (id: string) => void;
  clear: () => void;
}
export const useCalculator = create<CalculatorState>((set) => ({
  items: [],
  add: (t) =>
    set((s) =>
      s.items.find((x) => x.id === t.id) ? s : { items: [...s.items, t].slice(-5) },
    ),
  remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
  clear: () => set({ items: [] }),
}));
