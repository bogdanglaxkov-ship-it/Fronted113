"use client";

import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 90;
const FRAME_PATH = (i: number) => `/road-animation/frame-${String(i).padStart(4, "0")}.jpg`;

export default function RoadScrollReveal() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnRef = useRef(0);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    let cancelled = false;
    const images: HTMLImageElement[] = [];

    const first = new Image();
    first.onload = () => !cancelled && setStatus("ready");
    first.onerror = () => !cancelled && setStatus("missing");
    first.src = FRAME_PATH(1);
    images[0] = first;

    for (let i = 2; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      images[i - 1] = img;
    }
    imagesRef.current = images;

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status !== "ready" || reducedMotion) return;
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !wrapper || !ctx) return;

    function draw(frameIndex: number) {
      const candidates = [frameIndex, lastDrawnRef.current];
      const img = candidates.map((i) => imagesRef.current[i]).find((im) => im?.complete && im.naturalWidth > 0);
      if (!img) return;
      if (canvas!.width !== img.naturalWidth) {
        canvas!.width = img.naturalWidth;
        canvas!.height = img.naturalHeight;
      }
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.drawImage(img, 0, 0);
      lastDrawnRef.current = frameIndex;
    }

    function onScroll() {
      const rect = wrapper!.getBoundingClientRect();
      const total = wrapper!.offsetHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      draw(Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT)));
    }

    draw(0);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [status, reducedMotion]);

  if (status !== "ready") return null;

  if (reducedMotion) {
    return (
      <div className="relative my-4 h-[70vh] w-screen ml-[calc(50%-50vw)] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FRAME_PATH(FRAME_COUNT)} alt="Дорога превращается в современную трассу" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative" style={{ height: "220vh" }}>
      <div className="sticky top-20 h-[75vh] w-screen ml-[calc(50%-50vw)] overflow-hidden">
        <canvas ref={canvasRef} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
