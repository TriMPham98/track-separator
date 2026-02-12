"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AudioEngine } from "@/audio/AudioEngine";
import { useStore } from "@/store";
import { api } from "@/lib/api";
import { createTrackFromStem } from "@/store/slices/tracksSlice";
import { StemName } from "@/types";

export function useAudioEngine() {
  const engineRef = useRef<AudioEngine | null>(null);
  const [ready, setReady] = useState(false);
  const project = useStore((s) => s.project);

  const initEngine = useCallback(async () => {
    const engine = AudioEngine.getInstance();
    await engine.start();
    engineRef.current = engine;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !project) return;

    const engine = engineRef.current!;
    const { setTracks, initMixer } = useStore.getState();

    const tracks = project.stems.map((stemName, i) => {
      const url = api.getStemUrl(project.id, stemName);
      const track = createTrackFromStem(stemName as StemName, project.id, url, i);
      engine.loadTrack(track.id, url);
      initMixer(track.id);
      return track;
    });

    setTracks(tracks);

    return () => {
      tracks.forEach((t) => engine.removeTrack(t.id));
    };
  }, [ready, project]);

  return { engine: engineRef.current, ready, initEngine };
}
