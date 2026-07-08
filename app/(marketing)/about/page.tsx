export default function AboutPage() {
  return (
    <div className="-mx-4 -my-6 bg-[#0a0a0a]">
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-white/50">О нас</p>
        <h1 className="mt-4 font-serif text-4xl font-bold text-white sm:text-5xl">
          Делаем госзакупки
          <br />
          понятными
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-white/60">
          Мы создали платформу, которая превращает хаос государственных тендеров в простую и
          понятную аналитику. Машинное обучение делает за вас то, на что раньше уходили часы
          ручной работы.
        </p>
      </section>

      <section className="border-t border-white/10 px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-wide text-white/50">Миссия</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-white">Зачем мы это делаем</h2>
          <div className="mt-6 border-t border-white/10 pt-8 space-y-5 text-white/60">
            <p>
              Рынок госзакупок Казахстана — это <strong className="text-white">$20 миллиардов в год</strong>.
              Огромные возможности для бизнеса, но разобраться в них почти невозможно: тысячи
              тендеров каждый день, сложные документы, непрозрачные условия.
            </p>
            <p>
              Мы верим, что доступ к качественной аналитике не должен быть привилегией крупных
              компаний. Поэтому создали платформу, где ML-модели анализируют каждый тендер и
              простым языком объясняют: стоит ли участвовать, какие риски, какая потенциальная
              маржа.
            </p>
            <p>
              Наши модели обучены на <strong className="text-white">2 годах исторических данных</strong> и
              прогнозируют уровень конкуренции, потенциальный демпинг и маржинальность на основе
              алгоритмов машинного обучения.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
