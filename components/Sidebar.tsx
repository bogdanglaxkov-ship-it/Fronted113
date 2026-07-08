"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Gavel,
  Landmark,
  Layers,
  UserSearch,
  MapPin,
  ChevronRight,
  Bookmark,
  Calculator,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { useCalculator } from "@/lib/calculator-store";
import { useAuth } from "@/lib/auth-store";
import McpPanel from "./McpPanel";
import { API_URL } from "@/lib/api";

const TOP_ITEMS = [
  { href: "/dashboard", label: "Обзор рынка", icon: Home },
  {
    href: "/tenders",
    label: "Лоты Госзакуп",
    icon: Gavel,
    badgeBg: "bg-gradient-to-br from-orange-400 to-red-500",
    countLabel: "2000+",
  },
  {
    href: "/tenders/samruk",
    label: "Лоты Самрук",
    icon: Landmark,
    badgeBg: "bg-gradient-to-br from-indigo-400 to-purple-500",
    countLabel: "2000+",
  },
  {
    href: "/tenders/tenderplan",
    label: "TenderPlan.Kz",
    icon: Layers,
    badgeBg: "bg-gradient-to-br from-sky-400 to-blue-600",
    countLabel: "2000+",
  },
  { href: "/customers", label: "Анализ заказчика", icon: UserSearch },
];

const MCP_ITEMS = [
  { key: "claude", label: "Claude MCP", accentClass: "bg-gradient-to-br from-orange-400 to-amber-600" },
  { key: "chatgpt", label: "ChatGPT MCP", accentClass: "bg-gradient-to-br from-emerald-400 to-teal-600" },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = useCalculator((s) => s.items);
  const { user, hydrated, hydrate } = useAuth();

  const [regionsOpen, setRegionsOpen] = useState(false);
  const [regions, setRegions] = useState<string[] | null>(null);
  const [mcpModal, setMcpModal] = useState<"claude" | "chatgpt" | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  function toggleRegions() {
    setRegionsOpen((v) => !v);
    if (!regions) {
      fetch(`${API_URL}/api/regions`)
        .then((r) => r.json())
        .then((data) => setRegions(data.items ?? []))
        .catch(() => setRegions([]));
    }
  }

  const ALL_HREFS = [...TOP_ITEMS.map((i) => i.href), "/analytics", "/my-lots", "/oylan", "/calculator"];
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (pathname === href) return true;
    if (!pathname.startsWith(`${href}/`)) return false;
    return !ALL_HREFS.some((h) => h !== href && h.startsWith(`${href}/`) && pathname.startsWith(h));
  };
  const linkCls = (href: string) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
      isActive(href)
        ? "bg-foreground/10 text-foreground font-bold"
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
    }`;

  return (
    <div className="flex h-full flex-col">
      <Link href="/" onClick={onNavigate} className="flex items-center gap-2 px-3 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
          T
        </div>
        <span className="font-semibold text-foreground">TenderAI</span>
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {TOP_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} onClick={onNavigate} className={`${linkCls(item.href)} justify-between`}>
            <span className="flex items-center gap-2.5">
              {item.badgeBg ? (
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.badgeBg}`}>
                  <item.icon size={12} className="text-white" />
                </span>
              ) : (
                <item.icon size={20} strokeWidth={1.75} />
              )}
              {item.label}
            </span>
            {item.countLabel && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {item.countLabel}
              </span>
            )}
          </Link>
        ))}

        <div className="my-2 border-t border-border" />

        <button
          type="button"
          onClick={toggleRegions}
          className={`${linkCls("/analytics")} w-full justify-between`}
        >
          <span className="flex items-center gap-2.5">
            <MapPin size={20} strokeWidth={1.75} />
            Регионы
          </span>
          <ChevronRight
            size={14}
            className={`text-muted-foreground/60 transition-transform ${regionsOpen ? "rotate-90" : ""}`}
          />
        </button>
        {regionsOpen && (
          <div className="ml-6 space-y-0.5 border-l border-border pl-2.5">
            {regions === null && <p className="px-2 py-1 text-xs text-muted-foreground">Загрузка...</p>}
            {regions?.map((r) => (
              <Link
                key={r}
                href={`/analytics?region=${encodeURIComponent(r)}`}
                onClick={onNavigate}
                className="block truncate rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {r}
              </Link>
            ))}
          </div>
        )}

        <div className="my-2 border-t border-border" />

        {hydrated && user && (
          <Link href="/my-lots" onClick={onNavigate} className={linkCls("/my-lots")}>
            <Bookmark size={20} strokeWidth={1.75} />
            Мои лоты
          </Link>
        )}

        <div className="my-2 border-t border-border" />

        <Link href="/oylan" onClick={onNavigate} className={`${linkCls("/oylan")} justify-between`}>
          <span className="flex items-center gap-2.5">
            <MessageSquare size={20} strokeWidth={1.75} className="text-emerald" />
            Oylan AI
          </span>
          <span className="text-[10px] text-muted-foreground">(AI-ассистент)</span>
        </Link>

        <div className="my-2 border-t border-border" />

        {MCP_ITEMS.map((mcp) => (
          <button
            key={mcp.key}
            type="button"
            onClick={() => setMcpModal(mcp.key)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <span className={`h-5 w-5 shrink-0 rounded-full ${mcp.accentClass}`} />
            {mcp.label}
          </button>
        ))}

        <div className="my-2 border-t border-border" />

        <Link href="/calculator" onClick={onNavigate} className={`${linkCls("/calculator")} justify-between`}>
          <span className="flex items-center gap-2.5">
            <Calculator size={20} strokeWidth={1.75} />
            Калькулятор
          </span>
          {items.length > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {items.length}
            </span>
          )}
        </Link>
      </nav>

      {mcpModal && <McpPanel provider={mcpModal} onClose={() => setMcpModal(null)} />}
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card md:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
            T
          </div>
          <span className="font-semibold text-foreground">TenderAI</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Открыть меню"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`relative flex h-full w-72 max-w-[80vw] flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Закрыть меню"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>
    </>
  );
}
