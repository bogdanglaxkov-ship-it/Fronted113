# TENDERAI — Полный гайд по подключению фронтенда к бэкенду

## Структура проекта

```
/
├── app/
│   ├── layout.tsx          ← метаданные, шрифты
│   ├── page.tsx            ← главная страница (всё приложение)
│   └── globals.css         ← цвета, темы, шрифты
├── components/
│   ├── FilterPanel.tsx     ← поиск и фильтры тендеров
│   ├── TenderCard.tsx      ← карточка тендера
│   ├── TenderModal.tsx     ← модалка с деталями тендера
│   ├── ChatPanel.tsx       ← AI чат Oylan (боковая панель)
│   ├── AnalyticsDashboard.tsx ← аналитика и карта районов
│   └── MarginCalculator.tsx   ← калькулятор маржи
├── lib/
│   └── api.ts              ← ВСЕ вызовы к бэкенду (FastAPI)
└── .env.local              ← переменные окружения (создай сам)
```

---

## ШАГ 1 — Создай файл .env.local

В корне проекта (рядом с package.json) создай файл `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Если бэкенд на другом адресе (например, Railway, Render, VPS), поменяй:
```env
NEXT_PUBLIC_API_URL=https://твой-домен.com
```

> ВАЖНО: переменная должна начинаться с `NEXT_PUBLIC_` — иначе она недоступна в браузере.

---

## ШАГ 2 — Настрой CORS в main.py

В твоём `main.py` уже есть CORS middleware. Добавь адрес фронтенда:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",       # Vite dev
        "http://localhost:3000",       # Next.js dev
        "https://твой-сайт.vercel.app" # продакшн
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

> ВАЖНО: этот блок должен быть в конце файла, ПОСЛЕ всех роутов.

---

## ШАГ 3 — Запуск

### Бэкенд (FastAPI):
```bash
cd папка-с-бэкендом
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Проверь что работает: открой http://localhost:8000/ — должен вернуть `{"message": "Oylan assistant is running!"}`

### Фронтенд (Next.js):
```bash
cd папка-с-фронтендом
npm install          # или pnpm install
npm run dev          # или pnpm dev
```

Открой http://localhost:3000

---

## ШАГ 4 — Эндпоинты которые подключены

Файл `lib/api.ts` подключает ВСЕ эндпоинты из твоего main.py:

| Эндпоинт FastAPI              | Что делает в интерфейсе                     |
|-------------------------------|---------------------------------------------|
| `GET /api/tenders`            | Загрузка всех тендеров при старте           |
| `POST /api/tenders/search`    | Поиск по ключевому слову, региону, цене     |
| `GET /api/tenders/{id}`       | (резерв, используется при deeplink)         |
| `POST /chat`                  | Отправка сообщения Oylan                    |
| `GET /history/{session_id}`   | Загрузка истории чата при открытии панели   |
| `GET /api/analytics/trends`   | Статистика — вкладка "Аналитика"            |
| `GET /api/analytics/map`      | Карта районов — вкладка "Аналитика"         |
| `POST /api/calculator/margin` | Расчёт прибыли — вкладка "Калькулятор"      |

---

## ШАГ 5 — Если у тебя Vite (старый React проект)

Если хочешь использовать старый Vite фронтенд вместо Next.js:

1. Скопируй `lib/api.ts` → переименуй в `src/api.ts`
2. В Chat.jsx замени строки:
   ```js
   const API_URL = import.meta.env.VITE_API_URL
   // на импорт из api.ts:
   import { sendChat, getChatHistory } from "./api"
   ```
3. Создай `.env` в корне Vite проекта:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

---

## ШАГ 6 — Деплой на продакшн

### Фронтенд → Vercel:
1. Пуш в GitHub
2. Подключи репо в https://vercel.com
3. В Settings → Environment Variables добавь:
   - `NEXT_PUBLIC_API_URL` = `https://твой-бэкенд.com`

### Бэкенд → Railway / Render / VPS:
1. Добавь `Procfile` или `railway.toml`:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
2. В CORS добавь домен Vercel
3. Убедись что база данных (oylan.db / SQLite) персистентна

---

## ШАГ 7 — Добавление новых тендеров

Через API (из кода или Postman):
```http
POST http://localhost:8000/api/tenders
Content-Type: application/json

{
  "id": "TND-001",
  "title": "Поставка оборудования",
  "price": 5000000,
  "region": "Алматы",
  "status": "active",
  "url": "https://goszakup.gov.kz/..."
}
```

---

## Частые ошибки

| Ошибка                         | Решение                                          |
|--------------------------------|--------------------------------------------------|
| CORS error в браузере          | Добавь `http://localhost:3000` в CORS allow_origins |
| `NEXT_PUBLIC_API_URL` undefined | Создай `.env.local` файл с нужным адресом       |
| `fetch failed` в терминале     | Бэкенд не запущен или порт другой               |
| Пустой список тендеров         | `GET /api/tenders` вернул `{"items": []}` — добавь данные |
| История чата не грузится       | `GET /history/user_1` — проверь SQLite базу     |

---

## Сессия чата

По умолчанию используется `SESSION_ID = "user_1"`. 
Если нужна авторизация — замени `"user_1"` на реальный user_id в `components/ChatPanel.tsx`:

```tsx
const SESSION_ID = "user_1"  // ← поменяй на свой ID
```

---

## Файлы которые НЕ нужно трогать

- `app/layout.tsx` — шрифты и метаданные (уже настроены)
- `app/globals.css` — цветовая тема TenderAI (уже настроена)
- `lib/utils.ts` — утилиты shadcn

---

Всё готово. Запусти бэкенд → запусти фронтенд → открой http://localhost:3000
