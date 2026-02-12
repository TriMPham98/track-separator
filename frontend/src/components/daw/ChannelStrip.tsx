"use client";

import { useStore } from "@/store";
import { AudioEngine } from "@/audio/AudioEngine";
import Slider from "@/components/ui/Slider";
import Knob from "@/components/ui/Knob";
import MeterBridge from "./MeterBridge";

interface ChannelStripProps {
  trackId: string;
  name: string;
  color: string;
}

export default function ChannelStrip({ trackId, name, color }: ChannelStripProps) {
  const mixer = useStore((s) => s.mixer[trackId]);
  const setVolume = useStore((s) => s.setVolume);
  const setPan = useStore((s) => s.setPan);
  const toggleMute = useStore((s) => s.toggleMute);
  const toggleSolo = useStore((s) => s.toggleSolo);

  const engine = AudioEngine.getInstance();
  const track = engine.getTrack(trackId);

  if (!mixer) return null;

  return (
    <div className="flex flex-col items-center gap-2 px-3 py-3 bg-zinc-900 rounded-lg min-w-[80px]">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs font-medium text-zinc-300 truncate max-w-[70px]">
        {name}
      </span>

      <div className="flex items-center gap-1">
        <MeterBridge meter={track?.meter ?? null} height={80} />
        <Slider
          value={mixer.volume}
          min={-60}
          max={6}
          step={0.5}
          onChange={(v) => setVolume(trackId, v)}
          vertical
        />
      </div>

      <Knob
        value={mixer.pan}
        min={-1}
        max={1}
        onChange={(v) => setPan(trackId, v)}
        label="Pan"
        size={32}
      />

      <div className="flex gap-1">
        <button
          onClick={() => toggleMute(trackId)}
          className={`px-2 py-0.5 text-xs rounded font-medium ${
            mixer.mute
              ? "bg-red-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          M
        </button>
        <button
          onClick={() => toggleSolo(trackId)}
          className={`px-2 py-0.5 text-xs rounded font-medium ${
            mixer.solo
              ? "bg-yellow-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          S
        </button>
      </div>

      <span className="text-xs text-zinc-500 font-mono">
        {mixer.volume > 0 ? "+" : ""}
        {mixer.volume.toFixed(1)} dB
      </span>
    </div>
  );
}
