"use client";

import { useEffect, useState } from "react";
import FilterPanel from "@/components/FilterPanel";
import TenderCard from "@/components/TenderCard";
import TenderModal from "@/components/TenderModal";
import { fetchTenders, searchTenders, type Tender, type TenderFilters } from "@/lib/api";
import { useChat } from "@/lib/chat-store";
export default function TendersPage() {
  const [items, setItems] = useState<Tender[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Tender | null>(null);
  const openChat = useChat((s) => s.openChat);
  useEffect(() => {
    fetchTenders().then(setItems).catch((e) => setError(e.message));
  }, []);
  async function onSearch(filters: TenderFilters) {
    setSearching(true);
    try {
      const data = await searchTenders(filters);
      setItems(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <FilterPanel onSearch={onSearch} searching={searching} />
      <div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!items && !error && <p className="text-sm text-muted-foreground">Загрузка...</p>}
        {items && items.length === 0 && (
          <p className="text-sm text-muted-foreground">Ничего не найдено.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {items?.map((t) => (
            <TenderCard key={t.id} tender={t} onClick={setSelected} />
          ))}
        </div>
      </div>
      <TenderModal
        tender={selected} //
        onClose={() => setSelected(null)}
        onOpenChat={(msg: string) => openChat(msg)}
      />
    </div>
  );
}