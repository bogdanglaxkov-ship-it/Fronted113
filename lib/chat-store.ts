"use client";
import { create } from "zustand";
interface ChatState {
  pendingMessage: string | null;
  setPendingMessage: (msg: string) => void;
  consumePending: () => string | null;
}
export const useChat = create<ChatState>((set, get) => ({
  pendingMessage: null,
  setPendingMessage: (msg) => set({ pendingMessage: msg }),
  consumePending: () => {
    const m = get().pendingMessage;
    if (m) set({ pendingMessage: null });
    return m;
  },
}));
