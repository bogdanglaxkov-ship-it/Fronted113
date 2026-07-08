"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const STILL_SRC = "/road-animation/frame-0001.jpg";

export default function RoadStillFrame() {
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    const img = new Image();
    img.onload = () => setStatus("ready");
    img.onerror = () => setStatus("missing");
    img.src = STILL_SRC;
  }, []);

  if (status === "ready") {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border lg:aspect-auto lg:h-[440px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={STILL_SRC} alt="Дорога в пустыне" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-card/40 lg:aspect-auto lg:h-[440px]">
      <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
        <Sparkles size={28} className="text-primary/70" />
        <p className="text-sm font-medium">Здесь будет 3D-анимация</p>
        <p className="font-mono text-xs">(добавьте кадры в /public/road-animation)</p>
      </div>
    </div>
  );
}
