"use client";
import { create } from "zustand";
interface ChatState {
  open: boolean;
  pendingMessage: string | null;
  openChat: (msg?: string) => void;
  closeChat: () => void;
  consumePending: () => string | null;
}
export const useChat = create<ChatState>((set, get) => ({
  open: false,
  pendingMessage: null,
  openChat: (msg) => set({ open: true, pendingMessage: msg ?? null }),
  closeChat: () => set({ open: false }),
  consumePending: () => {
    const m = get().pendingMessage;
    if (m) set({ pendingMessage: null });
    return m;
  },
}));
