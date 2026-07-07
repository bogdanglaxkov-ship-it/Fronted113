"use client";

import { useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Calculator, UserPlus, LogIn, LogOut } from "lucide-react";
import { useCalculator } from "@/lib/calculator-store";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const openCalc = useCalculator((s) => s.openModal);
  const items = useCalculator((s) => s.items);
  const openChat = useChat((s) => s.openChat);
  const { user, hydrated, hydrate, logout } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const base = "px-4 py-1.5 rounded-md text-sm font-medium transition-colors";
  const inactive = "text-muted-foreground hover:text-foreground";
  const inactiveCls = `${base} ${inactive}`;
  const active = `${base} font-semibold text-primary border border-primary/60 bg-primary/10`;

  const cls = (href: string) => (pathname?.startsWith(href) ? active : inactiveCls);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            T
          </div>
          <span className="font-semibold text-foreground">TenderAI</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/tenders" className={cls("/tenders")}>Тендеры</Link>
          <Link href="/analytics" className={cls("/analytics")}>Аналитика</Link>
          <button onClick={openCalc} className={`${inactiveCls} relative`}>
            <span className="inline-flex items-center gap-1.5">
              <Calculator size={14} />
              Калькулятор
              {items.length > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {items.length}
                </span>
              )}
            </span>
          </button>
        </nav>

        {/* Контейнер для кнопки Oylan AI и переключателя темы */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => openChat()}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <MessageSquare size={14} />
            Oylan AI
          </button>

          {hydrated && user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:border-crimson hover:text-crimson transition-colors"
              >
                <LogOut size={14} />
                Выйти
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}