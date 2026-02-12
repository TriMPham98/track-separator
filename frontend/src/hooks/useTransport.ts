"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { AudioEngine } from "@/audio/AudioEngine";
import { useStore } from "@/store";

export function useTransport() {
  const isPlaying = useStore((s) => s.isPlaying);
  const setPlaying = useStore((s) => s.setPlaying);
  const loop = useStore((s) => s.loop);
  const toggleLoop = useStore((s) => s.toggleLoop);
  const bpm = useStore((s) => s.bpm);
  const setBpm = useStore((s) => s.setBpm);
  const currentTimeRef = useRef(0);
  const [displayTime, setDisplayTime] = useState(0);

  const play = useCallback(() => {
    const engine = AudioEngine.getInstance();
    engine.play();
    setPlaying(true);
  }, [setPlaying]);

  const pause = useCallback(() => {
    const engine = AudioEngine.getInstance();
    engine.pause();
    setPlaying(false);
  }, [setPlaying]);

  const stop = useCallback(() => {
    const engine = AudioEngine.getInstance();
    engine.stop();
    setPlaying(false);
  }, [setPlaying]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const seekTo = useCallback((time: number) => {
    AudioEngine.getInstance().seekTo(time);
  }, []);

  // Update time display via rAF
  useEffect(() => {
    let raf: number;
    const update = () => {
      try {
        const engine = AudioEngine.getInstance();
        const t = engine.currentTime;
        currentTimeRef.current = t;
        setDisplayTime(t);
      } catch {}
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return {
    isPlaying,
    play,
    pause,
    stop,
    togglePlayPause,
    seekTo,
    currentTime: displayTime,
    currentTimeRef,
    loop,
    toggleLoop,
    bpm,
    setBpm,
  };
}
