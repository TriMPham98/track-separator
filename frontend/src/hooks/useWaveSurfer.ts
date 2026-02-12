"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { AudioEngine } from "@/audio/AudioEngine";

interface UseWaveSurferOptions {
  url: string;
  container: HTMLElement | null;
  waveColor?: string;
  progressColor?: string;
  height?: number;
}

export function useWaveSurfer({
  url,
  container,
  waveColor = "#6366f1",
  progressColor = "#818cf8",
  height = 64,
}: UseWaveSurferOptions) {
  const wsRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!container) return;

    const ws = WaveSurfer.create({
      container,
      url,
      waveColor,
      progressColor,
      height,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      cursorWidth: 0,
      interact: false,
      normalize: true,
      backend: "WebAudio",
      media: document.createElement("audio"), // dummy, we don't use WS for playback
    });

    wsRef.current = ws;

    // Sync playhead position via rAF
    let raf: number;
    const syncPlayhead = () => {
      try {
        const engine = AudioEngine.getInstance();
        const duration = ws.getDuration();
        if (duration > 0) {
          const progress = engine.currentTime / duration;
          ws.seekTo(Math.min(1, Math.max(0, progress)));
        }
      } catch {}
      raf = requestAnimationFrame(syncPlayhead);
    };
    raf = requestAnimationFrame(syncPlayhead);

    return () => {
      cancelAnimationFrame(raf);
      ws.destroy();
      wsRef.current = null;
    };
  }, [url, container, waveColor, progressColor, height]);

  return wsRef;
}
