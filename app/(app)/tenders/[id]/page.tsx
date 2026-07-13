"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, Bookmark, Check, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  fetchTenderDetail,
  fetchRelatedTenders,
  calculateMargin,
  type LotDetail,
  type Tender,
  type MarginResult,
} from "@/lib/api";
import { useCalculator } from "@/lib/calculator-store";
import { useOylanChat } from "@/lib/use-oylan-chat";
import { formatPrice } from "@/lib/format";
import { LOT_TYPE_CONFIG, classifyLotType } from "@/lib/lot-type";
import LotDocumentsTab from "@/components/LotDocumentsTab";
import LotAiAssistant from "@/components/LotAiAssistant";
import TenderCard from "@/components/TenderCard";

type TabKey = "docs" | "margin" | "customer" | "related";
const TABS: { key: TabKey; label: string }[] = [
  { key: "docs", label: "Документация" },
  { key: "margin", label: "Калькулятор маржи" },
  { key: "customer", label: "Анализ заказчика" },
  { key: "related", label: "Другие лоты" },
];

function InfoRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${accent ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}

export default function TenderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  // useParams() не декодирует non-ASCII сегменты URL (кириллические id вида
  // "demo-услуги-..." остаются percent-encoded) — раскодируем один раз здесь,
  // иначе tender_id в теле /chat не совпадает со строкой в БД.
  const tenderId = decodeURIComponent(params.id);

  const [lot, setLot] = useState<LotDetail | null>(null);
  const [related, setRelated] = useState<Tender[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("docs");

  const add = useCalculator((s) => s.add);
  const inCalc = useCalculator((s) => (lot ? s.items.some((x) => x.id === lot.id) : false));
  const { messages, loading: chatLoading, send } = useOylanChat(`lot-${tenderId}`, tenderId);

  useEffect(() => {
    setLot(null);
    setError(null);
    fetchTenderDetail(tenderId)
      .then(setLot)
      .catch((e) => setError(e.message));
    fetchRelatedTenders(tenderId)
      .then(setRelated)
      .catch(() => setRelated([]));
  }, [tenderId]);

  function handleSave() {
    if (!lot || inCalc) return;
    add({ id: lot.id, title: lot.title, tender_price: lot.amount, my_cost: 0, logistics: 0, other_costs: 0 });
    toast.success('Лот сохранён в "Мои лоты"');
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Ссылка скопирована");
  }

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!lot) return <p className="text-sm text-muted-foreground">Загрузка...</p>;

  const lotType = LOT_TYPE_CONFIG[classifyLotType(lot.title)];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} /> Назад
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Share2 size={13} /> Поделиться
            </button>
            <button
              onClick={handleSave}
              aria-label="Сохранить лот"
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                inCalc ? "border-emerald/40 text-emerald" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {inCalc ? <Check size={14} /> : <Bookmark size={14} />}
            </button>
            {lot.source_url && (
              <a
                href={lot.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ExternalLink size={13} /> Госзакуп
              </a>
            )}
          </div>
        </div>

        <div className="mb-5 flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border ${lotType.bg}`}>
            <lotType.icon size={22} className={lotType.text} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-snug text-foreground">{lot.title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{lot.description}</p>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Классификация</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Номер лота</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(lot.lot_number);
                  toast.success("Номер лота скопирован");
                }}
                className="flex items-center gap-1 font-mono text-sm text-foreground hover:text-primary transition-colors"
              >
                {lot.lot_number} <Copy size={11} />
              </button>
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Тип</p>
              <p className="text-sm text-foreground">{lot.type}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Категория</p>
              <p className="truncate text-sm text-foreground">{lot.category}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Подкатегория</p>
              <p className="truncate text-sm text-foreground">{lot.subcategory}</p>
            </div>
          </div>
        </div>

        <div className="mb-5 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Заказчик и условия</p>
            <InfoRow label="Заказчик" value={lot.customer} />
            <InfoRow label="Рейтинг заказчика" value={`${lot.customer_rating}/100`} accent="text-emerald" />
            <InfoRow label="Регион" value={lot.region ?? "Не указан"} />
            <InfoRow label="Дедлайн" value={lot.deadline_text} accent="text-crimson" />
            <InfoRow label="Статус" value={lot.status_label} accent="text-emerald" />
            <InfoRow label="Метод закупки" value={lot.purchase_method} />
            <InfoRow label="Тип торгов" value={lot.trade_type} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Финансы</p>
            <InfoRow label="Сумма" value={formatPrice(lot.amount)} />
            <InfoRow label="Количество" value={lot.quantity} />
            <InfoRow label="Цена за единицу" value={formatPrice(lot.price_per_unit)} />
            <InfoRow label="Маржа" value={`${lot.margin_percent}%`} accent="text-gold" />
            <InfoRow label="Прибыль" value={formatPrice(lot.profit)} accent="text-emerald" />
            <InfoRow label="Конкуренция" value={`${lot.competition.toFixed(1)} уч.`} accent="text-emerald" />
            <InfoRow
              label="Демпинг"
              value={`${lot.dumping_percent > 0 ? "+" : ""}${lot.dumping_percent}%`}
              accent={lot.dumping_percent < 0 ? "text-crimson" : "text-emerald"}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-5 flex flex-wrap gap-1 border-b border-border pb-3">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === t.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "docs" && (
            <LotDocumentsTab
              lot={lot}
              onAiAnalyze={(doc) =>
                void send(`Прочитай «${doc.name}» и кратко перескажи, что в нём важного для участия в лоте «${lot.title}».`)
              }
            />
          )}
          {tab === "margin" && <MarginCalculatorTab lot={lot} />}
          {tab === "customer" && <CustomerAnalysisTab lot={lot} />}
          {tab === "related" && <RelatedLotsTab related={related} />}
        </div>
      </div>

      <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
        <LotAiAssistant lot={lot} messages={messages} loading={chatLoading} send={send} />
      </div>
    </div>
  );
}

function MarginCalculatorTab({ lot }: { lot: LotDetail }) {
  const [myCost, setMyCost] = useState(Math.round(lot.amount * 0.7));
  const [logistics, setLogistics] = useState(0);
  const [otherCosts, setOtherCosts] = useState(0);
  const [result, setResult] = useState<MarginResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function calc() {
    setBusy(true);
    try {
      const res = await calculateMargin(lot.amount, myCost + logistics + otherCosts);
      setResult(res);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Не удалось рассчитать");
    } finally {
      setBusy(false);
    }
  }

  const fields: [string, number, (v: number) => void][] = [
    ["Себестоимость", myCost, setMyCost],
    ["Логистика", logistics, setLogistics],
    ["Прочие расходы", otherCosts, setOtherCosts],
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-background p-3">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Сумма лота</span>
          <p className="font-mono text-base font-bold text-foreground">{formatPrice(lot.amount)}</p>
        </div>
        {fields.map(([label, value, setValue]) => (
          <label key={label} className="block">
            <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
        ))}
        <button
          onClick={calc}
          disabled={busy}
          className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          Рассчитать
        </button>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        {result ? (
          <div className="space-y-3">
            <InfoRow label="Чистая прибыль" value={formatPrice(result.pure_profit_kzt)} accent="text-emerald" />
            <InfoRow label="Маржа" value={`${result.margin_percentage}%`} accent="text-gold" />
            <InfoRow label="Оценка" value={result.roi} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Заполните расходы и нажмите «Рассчитать».</p>
        )}
      </div>
    </div>
  );
}

function CustomerAnalysisTab({ lot }: { lot: LotDetail }) {
  const rating = lot.customer_rating;
  const completed = 15 + (rating % 60);
  const onTimeRate = Math.min(98, 40 + rating);
  const avgTenders = 2 + (rating % 12);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-border bg-background p-4">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Рейтинг заказчика</span>
        <p className="text-2xl font-bold text-emerald">{rating}/100</p>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Завершённых закупок</span>
        <p className="text-2xl font-bold text-foreground">{completed}</p>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Своевременная оплата</span>
        <p className="text-2xl font-bold text-gold">{onTimeRate}%</p>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Лотов в среднем/год</span>
        <p className="text-2xl font-bold text-foreground">{avgTenders}</p>
      </div>
      <p className="text-xs text-muted-foreground sm:col-span-2">
        Оценка построена по демо-данным заказчика «{lot.customer}» и не отражает реальную историю закупок.
      </p>
    </div>
  );
}

function RelatedLotsTab({ related }: { related: Tender[] | null }) {
  const router = useRouter();
  if (related === null) return <p className="text-sm text-muted-foreground">Загрузка...</p>;
  if (related.length === 0) return <p className="text-sm text-muted-foreground">Похожих лотов не найдено.</p>;
  return (
    <div className="flex flex-col gap-3">
      {related.map((t) => (
        <TenderCard key={t.id} tender={t} onClick={(tender) => router.push(`/tenders/${tender.id}`)} />
      ))}
    </div>
  );
}
