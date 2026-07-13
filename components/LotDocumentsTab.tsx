"use client";

import { FileText, Sparkles, Eye, Download, Search } from "lucide-react";
import { toast } from "sonner";
import type { LotDetail, LotDocument } from "@/lib/api";
import { lotDocumentUrl } from "@/lib/api";

interface Props {
  lot: LotDetail;
  onAiAnalyze: (doc: LotDocument) => void;
}

function DocumentRow({ lot, doc, onAiAnalyze }: { lot: LotDetail; doc: LotDocument; onAiAnalyze: (doc: LotDocument) => void }) {
  const url = lotDocumentUrl(lot.id, doc.id);
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-crimson/10">
          <FileText size={16} className="text-crimson" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
          <p className="text-xs text-muted-foreground">{doc.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:shrink-0">
        <button
          onClick={() => onAiAnalyze(doc)}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Sparkles size={12} /> AI анализ
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Eye size={12} /> Смотреть
        </a>
        <a
          href={url}
          download
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Download size={12} /> Скачать
        </a>
        <button
          onClick={() => toast("Интеграция с Perplexity скоро появится")}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Search size={12} /> Perplexity
        </button>
      </div>
    </div>
  );
}

export default function LotDocumentsTab({ lot, onAiAnalyze }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 rounded-lg border border-emerald/30 bg-emerald/5 p-3.5">
          <p className="mb-1 text-sm font-medium text-foreground">Документы текущего лота</p>
          <p className="text-xs text-muted-foreground">Не тратьте время на скачивание — анализируйте и просматривайте документы прямо здесь.</p>
        </div>
        <div className="space-y-2.5">
          {lot.documents.map((doc) => (
            <DocumentRow key={doc.id} lot={lot} doc={doc} onAiAnalyze={onAiAnalyze} />
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <p className="mb-1 text-sm font-medium text-foreground">Документы других лотов в объявлении</p>
        <p className="mb-3 text-xs text-muted-foreground">В этом тендере несколько лотов — ниже документы, относящиеся к другим лотам объявления.</p>
        <div className="space-y-2.5">
          {lot.shared_documents.map((doc) => (
            <DocumentRow key={doc.id} lot={lot} doc={doc} onAiAnalyze={onAiAnalyze} />
          ))}
        </div>
      </div>
    </div>
  );
}
