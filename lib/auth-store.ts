"use client";
import { create } from "zustand";
import type { AuthUser } from "./api";

const STORAGE_KEY = "auth";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) : null;
      set({ user: stored?.user ?? null, token: stored?.token ?? null, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  setAuth: (user, token) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    set({ user, token, hydrated: true });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, token: null });
  },
}));
