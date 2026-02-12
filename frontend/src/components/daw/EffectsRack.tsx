"use client";

import { X, Power } from "lucide-react";
import { useStore } from "@/store";
import { EffectType, EffectState } from "@/types";
import Slider from "@/components/ui/Slider";

const EFFECT_TYPES: { type: EffectType; label: string }[] = [
  { type: "eq3", label: "EQ3" },
  { type: "reverb", label: "Reverb" },
  { type: "delay", label: "Delay" },
  { type: "compressor", label: "Compressor" },
];

export default function EffectsRack() {
  const effectsOpen = useStore((s) => s.effectsOpen);
  const toggleEffects = useStore((s) => s.toggleEffects);
  const selectedTrackId = useStore((s) => s.selectedTrackId);
  const effects = useStore((s) =>
    selectedTrackId ? s.effects[selectedTrackId] || [] : []
  );
  const addEffect = useStore((s) => s.addEffect);
  const removeEffect = useStore((s) => s.removeEffect);
  const toggleBypass = useStore((s) => s.toggleBypass);
  const updateEffectParam = useStore((s) => s.updateEffectParam);
  const tracks = useStore((s) => s.tracks);

  if (!effectsOpen || !selectedTrackId) return null;

  const track = tracks.find((t) => t.id === selectedTrackId);

  return (
    <div className="w-72 bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="text-sm font-medium">
          Effects: {track?.name ?? ""}
        </span>
        <button onClick={toggleEffects} className="text-zinc-500 hover:text-zinc-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Add effect buttons */}
      <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-zinc-800">
        {EFFECT_TYPES.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => addEffect(selectedTrackId, type)}
            className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
          >
            + {label}
          </button>
        ))}
      </div>

      {/* Effect slots */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {effects.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-4">
            No effects added
          </p>
        )}
        {effects.map((fx) => (
          <EffectSlot
            key={fx.id}
            effect={fx}
            trackId={selectedTrackId}
            onRemove={() => removeEffect(selectedTrackId, fx.id)}
            onToggleBypass={() => toggleBypass(selectedTrackId, fx.id)}
            onParamChange={(param, value) =>
              updateEffectParam(selectedTrackId, fx.id, param, value)
            }
          />
        ))}
      </div>
    </div>
  );
}

interface EffectSlotProps {
  effect: EffectState;
  trackId: string;
  onRemove: () => void;
  onToggleBypass: () => void;
  onParamChange: (param: string, value: number) => void;
}

function EffectSlot({
  effect,
  onRemove,
  onToggleBypass,
  onParamChange,
}: EffectSlotProps) {
  return (
    <div
      className={`rounded-lg border p-3 space-y-2 ${
        effect.bypassed
          ? "border-zinc-800 opacity-50"
          : "border-zinc-700 bg-zinc-800/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium capitalize">{effect.type === "eq3" ? "EQ3" : effect.type}</span>
        <div className="flex gap-1">
          <button
            onClick={onToggleBypass}
            className={`p-1 rounded ${
              effect.bypassed ? "text-zinc-600" : "text-green-400"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          <button onClick={onRemove} className="p-1 text-zinc-600 hover:text-red-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <EffectParams
        type={effect.type}
        params={effect.params}
        onChange={onParamChange}
      />
    </div>
  );
}

interface EffectParamsProps {
  type: EffectType;
  params: Record<string, number>;
  onChange: (param: string, value: number) => void;
}

function EffectParams({ type, params, onChange }: EffectParamsProps) {
  switch (type) {
    case "eq3":
      return (
        <div className="space-y-1">
          <Slider label="Low" value={params.low} min={-24} max={24} step={0.5} onChange={(v) => onChange("low", v)} />
          <Slider label="Mid" value={params.mid} min={-24} max={24} step={0.5} onChange={(v) => onChange("mid", v)} />
          <Slider label="High" value={params.high} min={-24} max={24} step={0.5} onChange={(v) => onChange("high", v)} />
        </div>
      );
    case "reverb":
      return (
        <div className="space-y-1">
          <Slider label="Decay" value={params.decay} min={0.1} max={10} step={0.1} onChange={(v) => onChange("decay", v)} />
          <Slider label="Wet" value={params.wet} min={0} max={1} step={0.01} onChange={(v) => onChange("wet", v)} />
        </div>
      );
    case "delay":
      return (
        <div className="space-y-1">
          <Slider label="Time" value={params.delayTime} min={0.01} max={1} step={0.01} onChange={(v) => onChange("delayTime", v)} />
          <Slider label="Feedback" value={params.feedback} min={0} max={0.95} step={0.01} onChange={(v) => onChange("feedback", v)} />
          <Slider label="Wet" value={params.wet} min={0} max={1} step={0.01} onChange={(v) => onChange("wet", v)} />
        </div>
      );
    case "compressor":
      return (
        <div className="space-y-1">
          <Slider label="Threshold" value={params.threshold} min={-60} max={0} step={1} onChange={(v) => onChange("threshold", v)} />
          <Slider label="Ratio" value={params.ratio} min={1} max={20} step={0.5} onChange={(v) => onChange("ratio", v)} />
          <Slider label="Attack" value={params.attack} min={0} max={0.5} step={0.001} onChange={(v) => onChange("attack", v)} />
          <Slider label="Release" value={params.release} min={0.01} max={1} step={0.01} onChange={(v) => onChange("release", v)} />
        </div>
      );
  }
}
