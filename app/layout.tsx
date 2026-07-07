import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import AppHeader from "@/components/AppHeader"
import CalculatorModal from "@/components/CalculatorModal"
import ChatPanel from "@/components/ChatPanel"
import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "TenderAI — Платформа государственных закупок",
  description: "Анализ и фильтрация тендеров с AI ассистентом Oylan",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

const themeScript = `
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} bg-background`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <CalculatorModal />
        <ChatPanel />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}