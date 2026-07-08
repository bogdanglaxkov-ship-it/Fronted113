"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import NotificationsMenu from "./NotificationsMenu";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();

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
          <Link href="/dashboard" className={cls("/dashboard")}>Кабинет</Link>
          <Link href="/tenders" className={cls("/tenders")}>Тендеры</Link>
          <Link href="/analytics" className={cls("/analytics")}>Аналитика</Link>
        </nav>

        <div className="flex items-center gap-3">
          <NotificationsMenu />
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
