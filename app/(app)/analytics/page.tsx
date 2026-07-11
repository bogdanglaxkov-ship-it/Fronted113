import AnalyticsRegions from "@/components/AnalyticsRegions";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Региональная аналитика</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Обновлено{" "}
          {new Date().toLocaleString("ru-RU", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <AnalyticsRegions />
    </div>
  );
}