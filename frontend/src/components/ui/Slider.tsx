"use client";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  vertical?: boolean;
  className?: string;
}

export default function Slider({
  value,
  min,
  max,
  step = 0.01,
  onChange,
  label,
  vertical,
  className = "",
}: SliderProps) {
  return (
    <div className={`flex ${vertical ? "flex-col items-center" : "flex-col"} gap-1 ${className}`}>
      {label && <label className="text-xs text-zinc-500">{label}</label>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`
          accent-blue-500 bg-zinc-700 rounded-full
          ${vertical ? "h-24 -rotate-90 origin-center" : "w-full"}
        `}
        style={vertical ? { writingMode: "vertical-lr" as never } : undefined}
      />
    </div>
  );
}
