"use client";

import { Play, Pause, Square, Repeat, Download } from "lucide-react";
import { useTransport } from "@/hooks/useTransport";
import { useStore } from "@/store";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

export default function TransportBar() {
  const { isPlaying, togglePlayPause, stop, currentTime, loop, toggleLoop, bpm, setBpm } =
    useTransport();
  const setExportOpen = useStore((s) => s.setExportOpen);

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlayPause}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>
        <button
          onClick={stop}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          aria-label="Stop"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>

      <div className="font-mono text-lg text-zinc-200 min-w-[100px]">
        {formatTime(currentTime)}
      </div>

      <button
        onClick={toggleLoop}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
          loop ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
        }`}
        aria-label="Toggle loop"
      >
        <Repeat className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2">
        <label className="text-xs text-zinc-500">BPM</label>
        <input
          type="number"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
          className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-center"
          min={20}
          max={300}
        />
      </div>

      <div className="flex-1" />

      <button
        onClick={() => setExportOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  );
}
