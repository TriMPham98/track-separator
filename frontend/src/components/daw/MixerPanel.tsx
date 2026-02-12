"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useStore } from "@/store";
import { AudioEngine } from "@/audio/AudioEngine";
import ChannelStrip from "./ChannelStrip";
import MeterBridge from "./MeterBridge";
import Slider from "@/components/ui/Slider";

export default function MixerPanel() {
  const mixerOpen = useStore((s) => s.mixerOpen);
  const toggleMixer = useStore((s) => s.toggleMixer);
  const tracks = useStore((s) => s.tracks);
  const masterVolume = useStore((s) => s.masterVolume);
  const setMasterVolume = useStore((s) => s.setMasterVolume);

  let masterMeter = null;
  try {
    masterMeter = AudioEngine.getInstance().getMasterBus().meter;
  } catch {}

  return (
    <div className="border-t border-zinc-800">
      <button
        onClick={toggleMixer}
        className="w-full flex items-center justify-between px-4 py-2 bg-zinc-900 hover:bg-zinc-800 transition-colors"
      >
        <span className="text-sm font-medium text-zinc-300">Mixer</span>
        {mixerOpen ? (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-zinc-500" />
        )}
      </button>

      {mixerOpen && (
        <div className="flex gap-2 p-4 bg-zinc-950 overflow-x-auto">
          {tracks.map((track) => (
            <ChannelStrip
              key={track.id}
              trackId={track.id}
              name={track.name}
              color={track.color}
            />
          ))}

          {/* Master channel */}
          <div className="flex flex-col items-center gap-2 px-3 py-3 bg-zinc-800 rounded-lg min-w-[80px] border border-zinc-700">
            <span className="text-xs font-bold text-zinc-200">Master</span>
            <div className="flex items-center gap-1">
              <MeterBridge meter={masterMeter} height={80} />
              <Slider
                value={masterVolume}
                min={-60}
                max={6}
                step={0.5}
                onChange={setMasterVolume}
                vertical
              />
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {masterVolume > 0 ? "+" : ""}
              {masterVolume.toFixed(1)} dB
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
