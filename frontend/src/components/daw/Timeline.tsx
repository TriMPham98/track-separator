"use client";

import { useRef, useEffect, useCallback } from "react";
import { AudioEngine } from "@/audio/AudioEngine";

interface TimelineProps {
  duration: number;
  headerWidth: number;
}

export default function Timeline({ duration, headerWidth }: TimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, width, height);

    if (duration <= 0) return;

    const trackAreaWidth = width - headerWidth;
    const pxPerSec = trackAreaWidth / duration;

    ctx.fillStyle = "#52525b";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";

    const step = pxPerSec > 50 ? 1 : pxPerSec > 10 ? 5 : 10;
    for (let t = 0; t <= duration; t += step) {
      const x = headerWidth + t * pxPerSec;
      ctx.fillStyle = "#3f3f46";
      ctx.fillRect(x, height - 8, 1, 8);
      if (t % (step * 2) === 0) {
        ctx.fillStyle = "#71717a";
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        ctx.fillText(`${m}:${s.toString().padStart(2, "0")}`, x, height - 12);
      }
    }
  }, [duration, headerWidth]);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || duration <= 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - headerWidth;
      const trackAreaWidth = rect.width - headerWidth;
      if (x < 0) return;
      const time = (x / trackAreaWidth) * duration;
      AudioEngine.getInstance().seekTo(Math.max(0, time));
    },
    [duration, headerWidth]
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="w-full h-8 cursor-pointer flex-shrink-0"
    />
  );
}
