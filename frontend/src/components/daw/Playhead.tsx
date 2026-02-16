"use client";

import { useRef, useEffect } from "react";
import { AudioEngine } from "@/audio/AudioEngine";

interface PlayheadProps {
  duration: number;
}

export default function Playhead({ duration }: PlayheadProps) {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    const update = () => {
      const el = lineRef.current;
      const parent = el?.parentElement;
      if (!el || !parent || duration <= 0) {
        raf = requestAnimationFrame(update);
        return;
      }

      try {
        const engine = AudioEngine.getInstance();

        // Find the first waveform container to measure the actual track area
        const waveformEl = parent.querySelector("[data-waveform]");
        if (waveformEl) {
          const parentRect = parent.getBoundingClientRect();
          const waveRect = waveformEl.getBoundingClientRect();
          const waveLeft = waveRect.left - parentRect.left;
          const waveWidth = waveRect.width;
          const x = waveLeft + (engine.currentTime / duration) * waveWidth;
          el.style.transform = `translateX(${x}px)`;
        }
      } catch {}
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  if (duration <= 0) return null;

  return (
    <div
      ref={lineRef}
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
      style={{ willChange: "transform" }}
    />
  );
}
