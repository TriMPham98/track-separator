"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

interface UseWaveSurferOptions {
  url: string;
  container: HTMLElement | null;
  waveColor?: string;
  height?: number;
}

export function useWaveSurfer({
  url,
  container,
  waveColor = "#6366f1",
  height = 64,
}: UseWaveSurferOptions) {
  const wsRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!container) return;

    const ws = WaveSurfer.create({
      container,
      url,
      waveColor,
      progressColor: waveColor, // same as wave — no progress shading
      height,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      cursorWidth: 0,
      interact: false,
      normalize: true,
    });

    wsRef.current = ws;

    return () => {
      ws.destroy();
      wsRef.current = null;
    };
  }, [url, container, waveColor, height]);

  return wsRef;
}
