import type { Tender } from "@/lib/api";
import { Package, Briefcase, Wrench, type LucideIcon } from "lucide-react";

export type LotType = "goods" | "services" | "works";

export const LOT_TYPE_CONFIG: Record<
  LotType,
  { label: string; icon: LucideIcon; text: string; bg: string }
> = {
  goods: { label: "Товар", icon: Package, text: "text-primary", bg: "bg-primary/15" },
  services: { label: "Услуга", icon: Briefcase, text: "text-gold", bg: "bg-gold-muted" },
  works: { label: "Работа", icon: Wrench, text: "text-emerald", bg: "bg-emerald/15" },
};

const WORKS_RE = /(работ|строит|ремонт|монтаж|реконструкц|возвед|благоустрой)/i;
const SERVICES_RE = /(услуг|обслужива|сопровожд|консалт|аренд|перевозк|охран|клининг|питани|разработ|поддержк)/i;

export function classifyLotType(title: string): LotType {
  if (WORKS_RE.test(title)) return "works";
  if (SERVICES_RE.test(title)) return "services";
  return "goods";
}

export function countByLotType(tenders: Tender[]): Record<LotType, number> {
  const counts: Record<LotType, number> = { goods: 0, services: 0, works: 0 };
  for (const t of tenders) counts[classifyLotType(t.title)]++;
  return counts;
}
