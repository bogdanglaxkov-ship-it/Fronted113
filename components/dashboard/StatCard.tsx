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
  const TrendIcon = positive ? TrendingUp : TrendingDown;

  return (
    <div className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <TrendIcon size={16} className={positive ? "text-primary" : "text-crimson"} />
      </div>
      <p className="mt-4 text-2xl font-bold text-foreground">{format(stat.value)}</p>
      <div className="mt-4">
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
