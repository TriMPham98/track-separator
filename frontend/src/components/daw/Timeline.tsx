"use client";

import { useRef, useEffect, useCallback } from "react";
import { AudioEngine } from "@/audio/AudioEngine";

interface TimelineProps {
  duration: number;
}

export default function Timeline({ duration }: TimelineProps) {
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

    // Draw time markers every second
    const pxPerSec = width / duration;
    ctx.fillStyle = "#52525b";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";

    const step = pxPerSec > 50 ? 1 : pxPerSec > 10 ? 5 : 10;
    for (let t = 0; t <= duration; t += step) {
      const x = t * pxPerSec;
      ctx.fillStyle = "#3f3f46";
      ctx.fillRect(x, height - 8, 1, 8);
      if (t % (step * 2) === 0) {
        ctx.fillStyle = "#71717a";
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        ctx.fillText(`${m}:${s.toString().padStart(2, "0")}`, x, height - 12);
      }
    }

    // Draw playhead
    try {
      const engine = AudioEngine.getInstance();
      const playheadX = engine.currentTime * pxPerSec;
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(playheadX, 0, 2, height);
    } catch {}
  }, [duration]);

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
      const x = e.clientX - rect.left;
      const time = (x / rect.width) * duration;
      AudioEngine.getInstance().seekTo(Math.max(0, time));
    },
    [duration]
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="w-full h-8 cursor-pointer"
    />
  );
}
