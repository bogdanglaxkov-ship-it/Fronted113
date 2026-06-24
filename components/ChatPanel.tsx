import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"

const SESSION_ID = "user_1"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const SUGGESTIONS = [
  "Помощь с анализом тендера",
  "Как написать коммерческое предложение?",
  "Какие тендеры сейчас актуальны?",
  "Посоветуй стратегию участия",
]

export interface ChatPanelHandle {
  sendMessage: (text: string) => void
}

interface Props {
  open: boolean
  onClose: () => void
}

const ChatPanel = forwardRef<ChatPanelHandle, Props>(function ChatPanel({ open, onClose }, ref) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load history on open
  useEffect(() => {
    if (!open || historyLoaded) return
    fetch(`${API_URL}/history/${SESSION_ID}`)
      .then(r => r.json())
      .then(data => {
        setMessages(data.messages ?? [])
        setHistoryLoaded(true)
      })
      .catch(() => setHistoryLoaded(true))
  }, [open, historyLoaded])

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function send(text: string) {
    const msg = text.trim()
    if (!msg || loading) return
    setMessages(prev => [...prev, { role: "user", content: msg }])
    setInput("")
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, session_id: SESSION_ID }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.reply ?? data.detail ?? "Нет ответа" }])
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Неизвестная ошибка"
      setMessages(prev => [...prev, { role: "assistant", content: `Ошибка: ${errMsg}` }])
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    sendMessage: (text: string) => {
      setInput(text)
      setTimeout(() => send(text), 50)
    },
  }))

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  function clearChat() {
    setMessages([])
  }

  return (
    <aside
      className={`flex flex-col bg-card border-l border-border transition-all duration-300 ease-in-out ${
        open ? "w-full sm:w-80 lg:w-96" : "w-0 overflow-hidden border-l-0"
      }`}
      aria-label="AI ассистент Oylan"
    >
      {open && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#c89b3c] flex items-center justify-center text-[#0b1629] text-xs font-bold">
                O
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Oylan</p>
                <p className="text-[10px] text-muted-foreground">AI ассистент</p>
              </div>
              <span className="ml-1 w-2 h-2 rounded-full bg-[#4caf74] animate-pulse" aria-hidden />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Очистить чат"
                className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={onClose}
                title="Закрыть"
                className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && !loading && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground text-center pt-4">
                  Привет! Я Oylan — твой ассистент по тендерам. Чем помочь?
                </p>
                <div className="space-y-2 pt-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full text-left px-3 py-2 text-xs text-foreground/70 bg-background border border-border rounded-lg hover:border-[#c89b3c44] hover:text-[#c89b3c] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#c89b3c] text-[#0b1629] font-medium rounded-br-sm"
                      : "bg-background border border-border text-foreground/90 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-background border border-border rounded-xl rounded-bl-sm px-4 py-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c89b3c] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c89b3c] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c89b3c] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Напишите сообщение..."
                rows={2}
                className="flex-1 resize-none py-2 px-3 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-[#c89b3c] text-[#0b1629] hover:bg-[#e0b84d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Отправить"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              Enter — отправить &nbsp;·&nbsp; Shift+Enter — перенос строки
            </p>
          </div>
        </>
      )}
    </aside>
  )
})

export default ChatPanel
