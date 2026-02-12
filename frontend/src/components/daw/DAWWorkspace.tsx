"use client";

import { useEffect, useState } from "react";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { AudioEngine } from "@/audio/AudioEngine";
import { useStore } from "@/store";
import TransportBar from "./TransportBar";
import Timeline from "./Timeline";
import TrackList from "./TrackList";
import MixerPanel from "./MixerPanel";
import EffectsRack from "./EffectsRack";
import ExportDialog from "./ExportDialog";
import { Sliders } from "lucide-react";

export default function DAWWorkspace() {
  const { ready, initEngine } = useAudioEngine();
  const toggleEffects = useStore((s) => s.toggleEffects);
  const effectsOpen = useStore((s) => s.effectsOpen);
  const [duration, setDuration] = useState(0);

  // Update duration when tracks load
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      try {
        const d = AudioEngine.getInstance().duration;
        if (d > 0) setDuration(d);
      } catch {}
    }, 500);
    return () => clearInterval(interval);
  }, [ready]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        const { isPlaying, setPlaying } = useStore.getState();
        const engine = AudioEngine.getInstance();
        if (isPlaying) {
          engine.pause();
          setPlaying(false);
        } else {
          engine.play();
          setPlaying(true);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button
          onClick={initEngine}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition-colors"
        >
          Click to Start Audio Engine
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <TransportBar />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Timeline duration={duration} />
          <TrackList />
        </div>

        {/* Effects toggle */}
        <button
          onClick={toggleEffects}
          className={`px-2 border-l border-zinc-800 hover:bg-zinc-800 transition-colors ${
            effectsOpen ? "bg-zinc-800" : ""
          }`}
          aria-label="Toggle effects"
        >
          <Sliders className="w-4 h-4 text-zinc-400" />
        </button>

        <EffectsRack />
      </div>

      <MixerPanel />
      <ExportDialog />
    </div>
  );
}
