import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Bot,
  Check,
  Compass,
  Landmark,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MARKET_STATS = [
  { value: "77 654", label: "лотов в открытых закупках РК" },
  { value: "659 726", label: "пользователей на goszakup.gov.kz" },
  { value: "650 млрд ₸", label: "оборот закупок за год" },
  { value: "600 000+", label: "компаний в реестрах контрагентов" },
];

const PAIN_POINTS = [
  {
    icon: Landmark,
    title: "Госпортал объясняет регламент, а не выгоду",
    body: "Реестры и отчётность в порядке, но новичку никто не скажет, зачем ему конкретный лот.",
  },
  {
    icon: Banknote,
    title: "Агрегаторы берут деньги за то, что и так открыто",
    body: "Удобный интерфейс — поверх тех же бесплатных данных, только теперь по подписке.",
  },
  {
    icon: Compass,
    title: "Сильный продукт без единой подсказки, с чего начать",
    body: "Интеграции есть, а трёх понятных шагов для первого входа — нет.",
  },
];

const COMPARISON_ROWS = [
  { label: "Стоимость", tenderai: "Бесплатно", portal: "Бесплатно", agregator: "Платная подписка" },
  { label: "Онбординг новичка", tenderai: "3 шага", portal: "Слабый", agregator: "Обычно сильный" },
  { label: "Расчёт маржи ИИ", tenderai: true, portal: false, agregator: false },
  { label: "Тон коммуникации", tenderai: "Понятный", portal: "Бюрократический", agregator: "Продающий" },
];

const STEPS = [
  {
    n: "01",
    title: "Регистрация — 30 секунд",
    body: "Только email и пароль. Без звонка менеджеру и без банковской карты.",
  },
  {
    n: "02",
    title: "Настройте фильтры",
    body: "Регион, отрасль, бюджет — Oylan будет искать по вашим критериям.",
  },
  {
    n: "03",
    title: "Получайте лоты с расчётом маржи",
    body: "Oylan отбирает подходящие тендеры и сразу считает вашу потенциальную прибыль.",
  },
];

export default function LandingPage() {
  const updatedAt = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col gap-24 pb-16">
      {/* Hero */}
      <section className="relative isolate pt-8 sm:pt-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[radial-gradient(60%_55%_at_50%_0%,rgba(0,217,160,0.12),transparent)]"
        />
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Обновлено {updatedAt}
          </span>

          <h1 className="mt-6 text-4xl leading-[1.1] font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Аналитика <span className="text-primary">госзакупок</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            TenderAI собирает лоты из открытых реестров госзакупок, а ИИ-ассистент Oylan за секунды
            находит те, что вам выгодны — и сразу считает прибыль.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-5 text-[0.95rem]">
                Начать бесплатно
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/tenders">
              <Button size="lg" variant="outline" className="gap-2 px-5 text-[0.95rem]">
                <Search size={16} />
                Смотреть тендеры
              </Button>
            </Link>
          </div>

          <p className="mt-4 font-mono text-xs tracking-wide text-muted-foreground">
            Бесплатно, без банковской карты · Данные — из открытых реестров госзакупок
          </p>
        </div>
      </section>

      {/* Live stat row */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MARKET_STATS.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-lg border border-border bg-card/50 p-4 transition-colors hover:bg-card"
          >
            <span
              className={
                "h-2 w-2 shrink-0 rounded-full " +
                (i === 0 ? "bg-primary" : i === 1 ? "bg-ring" : i === 2 ? "bg-emerald" : "bg-gold")
              }
            />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="mt-1 font-mono text-lg font-semibold text-foreground">{s.value}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Pain points */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Почему искать тендеры до сих пор больно
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {PAIN_POINTS.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-card p-6">
              <p.icon size={22} className="text-primary" />
              <h3 className="mt-4 font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Критерий</th>
                <th className="px-5 py-3 font-semibold text-primary">TenderAI</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Гос. портал</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Платные агрегаторы</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={row.label} className={i !== COMPARISON_ROWS.length - 1 ? "border-b border-border" : ""}>
                  <td className="px-5 py-3 text-muted-foreground">{row.label}</td>
                  <td className="px-5 py-3 font-medium text-foreground">
                    {typeof row.tenderai === "boolean" ? (
                      row.tenderai ? <Check size={16} className="text-emerald" /> : <X size={16} className="text-muted-foreground" />
                    ) : (
                      row.tenderai
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {typeof row.portal === "boolean" ? (
                      row.portal ? <Check size={16} className="text-emerald" /> : <X size={16} className="text-muted-foreground" />
                    ) : (
                      row.portal
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {typeof row.agregator === "boolean" ? (
                      row.agregator ? <Check size={16} className="text-emerald" /> : <X size={16} className="text-muted-foreground" />
                    ) : (
                      row.agregator
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3-step onboarding */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Начать — 3 шага</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="relative rounded-xl border border-border bg-card p-6">
              <span className="font-mono text-3xl font-bold text-primary/25">{step.n}</span>
              <h3 className="mt-3 font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/register">
            <Button size="lg" className="gap-2 px-5 text-[0.95rem]">
              Зарегистрироваться
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Final CTA band */}
      <section className="relative isolate">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[radial-gradient(50%_100%_at_50%_50%,rgba(76,175,116,0.10),transparent)]"
        />
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <Bot size={28} className="text-primary" />
          <h2 className="max-w-xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Хватит платить за то, что и так в открытом доступе.
          </h2>
          <Link href="/register">
            <Button size="lg" className="gap-2 px-6 text-[0.95rem]">
              Начать бесплатно
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
