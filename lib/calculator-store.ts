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
  open: boolean;
  items: CalcTender[];
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  add: (t: CalcTender) => void;
  remove: (id: string) => void;
  clear: () => void;
}
export const useCalculator = create<CalculatorState>((set, get) => ({
  open: false,
  items: [],
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
  toggleModal: () => set({ open: !get().open }),
  add: (t) =>
    set((s) =>
      s.items.find((x) => x.id === t.id)
        ? { ...s, open: true }
        : { items: [...s.items, t].slice(-5), open: true },
    ),
  remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
  clear: () => set({ items: [] }),
}));
