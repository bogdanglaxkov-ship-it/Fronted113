"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Check, RefreshCw, Search, PieChart, FileText, Filter, X } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { getMcpKey, rotateMcpKey, API_URL } from "@/lib/api";

interface Props {
  provider: "claude" | "chatgpt";
  onClose: () => void;
}

const PROVIDER_CONFIG = {
  claude: {
    label: "Claude MCP",
    accentClass: "bg-gradient-to-br from-orange-400 to-amber-600",
    connectSteps: [
      <>Откройте <b>Settings → Connectors</b> в Claude Desktop.</>,
      <>Пункт <b>Edit config</b> → впишите блок ниже в <code className="text-xs">mcp.json</code>.</>,
      <>Перезапустите Claude Desktop — инструменты TenderAI появятся в чате.</>,
    ],
  },
  chatgpt: {
    label: "ChatGPT MCP",
    accentClass: "bg-gradient-to-br from-emerald-400 to-teal-600",
    connectSteps: [
      <>Кастомные MCP-коннекторы доступны в ChatGPT с поддержкой Connectors (Plus/Pro/Business), может понадобиться режим разработчика.</>,
      <>Settings → Connectors → <b>Create</b> → тип подключения <b>Server URL</b>.</>,
      <>Вставьте адрес сервера и заголовок авторизации из блока ниже.</>,
    ],
  },
} as const;

const FEATURES = [
  { icon: Search, title: "Поиск лотов", desc: "Госзакуп, Самрук и TenderPlan.Kz — отдельно. По названию, региону, сумме, категории." },
  { icon: PieChart, title: "Разбор лота", desc: "Карточка лота с базовой финансовой оценкой: налог, обеспечение, чистая маржа." },
  { icon: FileText, title: "Чтение тех. спецификации", desc: "Если к лоту прикреплён документ — сервер вернёт ссылку на него." },
  { icon: Filter, title: "Фильтры", desc: "Доступные значения фильтров (регионы, типы лотов), чтобы искать точнее." },
];

const EXAMPLE_QUERIES = [
  "Найди лоты по запросу «ноутбуки» в госзакупе",
  "Открой лот 42018513 и сделай разбор: сумма, налог, чистая прибыль",
  "Покажи лоты по медоборудованию в Алматы до 5 млн ₸",
  "Какие регионы и типы лотов вообще доступны для поиска?",
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      aria-label="Скопировать"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
    </button>
  );
}

export default function McpPanel({ provider, onClose }: Props) {
  const { user, token, hydrated, hydrate } = useAuth();
  const cfg = PROVIDER_CONFIG[provider];
  const [keyData, setKeyData] = useState<{ server_url: string; key: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || !user || !token) return;
    setLoading(true);
    getMcpKey(token)
      .then(setKeyData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [hydrated, user, token]);

  async function rotate() {
    if (!token) return;
    setLoading(true);
    try {
      setKeyData(await rotateMcpKey(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось перевыпустить ключ");
    } finally {
      setLoading(false);
    }
  }

  const serverUrl = keyData?.server_url ?? `${API_URL}/mcp/`;
  const configJson = keyData
    ? JSON.stringify(
        { mcpServers: { "TenderAI": { url: keyData.server_url, headers: { Authorization: `Bearer ${keyData.key}` } } } },
        null,
        2,
      )
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 py-8 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cfg.accentClass}`} />
            <div>
              <h2 className="font-serif text-lg text-foreground">{cfg.label}</h2>
              <p className="text-xs text-muted-foreground">
                Подключите TenderAI к {provider === "claude" ? "Claude" : "ChatGPT"} и анализируйте тендеры в диалоге
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Закрыть" className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <p className="mb-5 rounded-lg border border-border bg-popover p-3 text-sm leading-relaxed text-muted-foreground">
          MCP-коннектор подключает данные TenderAI (госзакуп, самрук, tenderplan) прямо в{" "}
          {provider === "claude" ? "Claude" : "ChatGPT"}. Дальше вы пишете обычным языком — «найди лоты по…», «разбери
          этот лот» — а модель сама ищет лоты и анализирует их. Доступ только на чтение.
        </p>

        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Что умеет</h3>
        <div className="mb-5 grid grid-cols-2 gap-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-popover p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <f.icon size={13} className="text-primary" />
                {f.title}
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Как подключить</h3>

        <label className="mb-1 block text-[11px] text-muted-foreground">Адрес MCP-сервера</label>
        <div className="mb-3 flex items-center gap-1 rounded-md border border-border bg-input px-2.5 py-1.5">
          <code className="flex-1 truncate text-xs text-foreground">{serverUrl}</code>
          <CopyButton value={serverUrl} />
        </div>

        <ol className="mb-4 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
          {cfg.connectSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>

        {!hydrated ? null : !user ? (
          <div className="rounded-lg border border-border bg-popover p-3 text-sm text-muted-foreground">
            <Link href="/login" onClick={onClose} className="text-primary hover:underline">
              Войдите
            </Link>
            , чтобы получить личный ключ для подключения.
          </div>
        ) : (
          <>
            <label className="mb-1 block text-[11px] text-muted-foreground">Ваш личный ключ</label>
            <div className="mb-3 flex items-center gap-1 rounded-md border border-border bg-input px-2.5 py-1.5">
              <code className="flex-1 truncate text-xs text-foreground">
                {loading && !keyData ? "Загрузка..." : keyData?.key ?? "—"}
              </code>
              {keyData && <CopyButton value={keyData.key} />}
              <button
                onClick={rotate}
                disabled={loading}
                aria-label="Перевыпустить ключ"
                title="Перевыпустить ключ (старый перестанет работать)"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            {error && <p className="mb-3 text-xs text-crimson">{error}</p>}

            {configJson && (
              <>
                <label className="mb-1 block text-[11px] text-muted-foreground">Конфиг (mcp.json)</label>
                <div className="relative mb-4">
                  <pre className="overflow-x-auto rounded-md border border-border bg-input p-3 text-[11px] text-foreground">
                    {configJson}
                  </pre>
                  <div className="absolute right-2 top-2">
                    <CopyButton value={configJson} />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Примеры запросов</h3>
        <div className="flex flex-col gap-1.5">
          {EXAMPLE_QUERIES.map((q) => (
            <div key={q} className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-muted-foreground">
              {q}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
