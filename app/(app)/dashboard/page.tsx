import StatCard from "@/components/dashboard/StatCard";
import CategoryTable from "@/components/dashboard/CategoryTable";
import { MARKET_STATS } from "@/lib/demo-market-data";
import { fmtKzt } from "@/lib/format";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Ключевые показатели за 24 часа</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Обновлено {new Date().toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Объём" stat={MARKET_STATS.volume} format={fmtKzt} />
        <StatCard label="Количество" stat={MARKET_STATS.count} format={(v) => v.toLocaleString("ru-RU")} />
        <StatCard label="Прибыль" stat={MARKET_STATS.profit} format={fmtKzt} />
      </div>
      <CategoryTable />
    </div>
  );
}
