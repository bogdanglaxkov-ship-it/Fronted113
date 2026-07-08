"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, LogIn, LogOut, Home, Info } from "lucide-react";
import { useAuth } from "@/lib/auth-store";

export default function UserMenu() {
  const router = useRouter();
  const { user, hydrated, hydrate, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  if (!hydrated) return <div className="h-8 w-8" />;

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <LogIn size={14} />
          Войти
        </Link>
        <Link
          href="/register"
          className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <UserPlus size={14} />
          Регистрация
        </Link>
      </div>
    );
  }

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Меню профиля"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
      >
        {initials}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-border py-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground/90 hover:bg-accent"
            >
              <Home size={15} />
              Домой
            </Link>
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground/90 hover:bg-accent"
            >
              <Info size={15} />
              О нас
            </Link>
          </div>
          <div className="border-t border-border py-1">
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
                router.push("/");
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground/90 hover:bg-accent hover:text-crimson"
            >
              <LogOut size={15} />
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
