"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Volume2, VolumeX } from "lucide-react";
import { useStore } from "@/store";
import { TrackState } from "@/types";
import WaveformDisplay from "./WaveformDisplay";

interface TrackLaneProps {
  track: TrackState;
}

export default function TrackLane({ track }: TrackLaneProps) {
  const mixer = useStore((s) => s.mixer[track.id]);
  const toggleMute = useStore((s) => s.toggleMute);
  const toggleSolo = useStore((s) => s.toggleSolo);
  const selectTrack = useStore((s) => s.selectTrack);
  const selectedTrackId = useStore((s) => s.selectedTrackId);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected = selectedTrackId === track.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-stretch bg-zinc-900 border-b border-zinc-800 ${
        isSelected ? "ring-1 ring-blue-500" : ""
      }`}
      onClick={() => selectTrack(track.id)}
    >
      {/* Track header */}
      <div className="w-48 flex-shrink-0 flex flex-col justify-center px-3 py-2 border-r border-zinc-800">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab text-zinc-600 hover:text-zinc-400"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: track.color }}
          />
          <span className="text-sm font-medium truncate">{track.name}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute(track.id);
            }}
            className={`px-2 py-0.5 text-xs rounded font-medium ${
              mixer?.mute
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            M
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSolo(track.id);
            }}
            className={`px-2 py-0.5 text-xs rounded font-medium ${
              mixer?.solo
                ? "bg-yellow-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            S
          </button>
        </div>
      </div>

      {/* Waveform */}
      <div className="flex-1 min-w-0" data-waveform>
        <WaveformDisplay url={track.url} color={track.color} />
      </div>
    </div>
  );
}
