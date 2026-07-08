"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownWideNarrow, ChevronLeft, ChevronRight } from "lucide-react";
import FilterPanel, { type TenderFilterState } from "@/components/FilterPanel";
import TenderCard from "@/components/TenderCard";
import TenderModal from "@/components/TenderModal";
import { fetchTenders, type Tender, type TenderSource } from "@/lib/api";
import { classifyLotType } from "@/lib/lot-type";
import { useChat } from "@/lib/chat-store";

type SortKey = "price_desc" | "price_asc" | "deadline";

const PAGE_SIZE = 20;
const EMPTY_ITEMS: Tender[] = [];

export default function TendersListView({ source }: { source: TenderSource }) {
  const router = useRouter();
  const [allItems, setAllItems] = useState<Tender[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Tender | null>(null);
  const [filters, setFilters] = useState<TenderFilterState | null>(null);
  const [sort, setSort] = useState<SortKey>("price_desc");
  const [page, setPage] = useState(1);
  const setPendingMessage = useChat((s) => s.setPendingMessage);
  const listTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllItems(null);
    setError(null);
    fetchTenders(source)
      .then(setAllItems)
      .catch((e) => setError(e.message));
  }, [source]);

  const visible = useMemo(() => {
    if (!allItems) return null;
    const keyword = filters?.keyword.trim().toLowerCase() ?? "";
    const filtered = allItems.filter((t) => {
      if (filters?.region && t.region !== filters.region) return false;
      if (filters && (t.price ?? 0) < filters.priceRange[0]) return false;
      if (filters && filters.priceRange[1] < filters.maxPrice && (t.price ?? 0) > filters.priceRange[1]) return false;
      if (filters && filters.lotTypes.size > 0 && !filters.lotTypes.has(classifyLotType(t.title))) return false;
      if (filters && filters.statuses.size > 0 && !filters.statuses.has(t.status)) return false;
      if (keyword) {
        const haystack = `${t.title} ${t.organization ?? ""} ${t.keyword ?? ""}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
      if (sort === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
      return (a.deadline ?? "").localeCompare(b.deadline ?? "");
    });
  }, [allItems, filters, sort]);

  useEffect(() => {
    setPage(1);
  }, [filters, sort, source]);

  useEffect(() => {
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  const displayCount = useMemo(() => 2000 + Math.floor(Math.random() * 1500), [source]);
  const totalPages = visible ? Math.max(1, Math.ceil(visible.length / PAGE_SIZE)) : 1;
  const pageItems = visible?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <FilterPanel allItems={allItems ?? EMPTY_ITEMS} onFiltersChange={setFilters} />
      <div>
        <div ref={listTopRef} className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {visible ? `Найдено: ${displayCount.toLocaleString("ru-RU")}` : "Загрузка..."}
          </p>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowDownWideNarrow size={14} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-border bg-input px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="price_desc">По сумме (убыв.)</option>
              <option value="price_asc">По сумме (возр.)</option>
              <option value="deadline">По дедлайну</option>
            </select>
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {!visible && !error && <p className="text-sm text-muted-foreground">Загрузка...</p>}
        {visible && visible.length === 0 && (
          <p className="text-sm text-muted-foreground">Ничего не найдено.</p>
        )}
        <div className="flex flex-col gap-3">
          {pageItems?.map((t) => (
            <TenderCard key={t.id} tender={t} onClick={setSelected} />
          ))}
        </div>

        {visible && visible.length > PAGE_SIZE && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
              aria-label="Предыдущая страница"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm text-muted-foreground">
              Страница {page} из {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
              aria-label="Следующая страница"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
      <TenderModal
        tender={selected}
        onClose={() => setSelected(null)}
        onOpenChat={(msg: string) => {
          setPendingMessage(msg);
          router.push("/oylan");
        }}
      />
    </div>
  );
}
