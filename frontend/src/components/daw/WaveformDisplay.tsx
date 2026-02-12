"use client";

import { useRef, useCallback } from "react";
import { useWaveSurfer } from "@/hooks/useWaveSurfer";

interface WaveformDisplayProps {
  url: string;
  color: string;
}

export default function WaveformDisplay({ url, color }: WaveformDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useWaveSurfer({
    url,
    container: containerRef.current,
    waveColor: color,
    progressColor: color + "80",
    height: 64,
  });

  return (
    <div ref={containerRef} className="w-full h-16" />
  );
}
