"use client";

import { useRef, useEffect } from "react";
import * as Tone from "tone";

interface MeterBridgeProps {
  meter: Tone.Meter | null;
  height?: number;
  width?: number;
}

export default function MeterBridge({
  meter,
  height = 100,
  width = 12,
}: MeterBridgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!meter) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf: number;
    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#27272a";
      ctx.fillRect(0, 0, width, height);

      const raw = meter.getValue();
      const db = typeof raw === "number" ? raw : raw[0];
      // Map dB (-60 to 0) to pixel height
      const normalized = Math.max(0, Math.min(1, (db + 60) / 60));
      const meterHeight = normalized * height;

      // Gradient: green -> yellow -> red
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, "#22c55e");
      gradient.addColorStop(0.6, "#eab308");
      gradient.addColorStop(0.85, "#ef4444");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, height - meterHeight, width, meterHeight);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [meter, height, width]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="rounded-sm"
    />
  );
}
