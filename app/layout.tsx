import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "TenderAI — Платформа государственных закупок",
  description: "Анализ и фильтрация тендеров с AI ассистентом Oylan",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0b1629",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
