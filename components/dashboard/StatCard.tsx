import { TrendingUp, TrendingDown } from "lucide-react";
import Sparkline from "./Sparkline";
import type { StatSeries } from "@/lib/demo-market-data";

interface Props {
  label: string;
  stat: StatSeries;
  format: (v: number) => string;
}

export default function StatCard({ label, stat, format }: Props) {
  const first = stat.series[0];
  const last = stat.series[stat.series.length - 1];
  const deltaPct = first ? ((last - first) / first) * 100 : 0;
  const positive = deltaPct >= 0;
  const color = positive ? "var(--emerald)" : "var(--crimson)";

  return (
    <div className="rounded-xl border border-border bg-popover p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold text-foreground">{format(stat.value)}</p>
        <Sparkline data={stat.series} color={color} />
      </div>
      <p
        className={`mt-2 flex items-center gap-1 text-xs font-medium ${
          positive ? "text-emerald" : "text-crimson"
        }`}
      >
        {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(deltaPct).toFixed(1)}% за 24 часа
      </p>
    </div>
  );
}
