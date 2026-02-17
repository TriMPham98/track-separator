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
  if (vertical) {
    return (
      <div className={`flex flex-col items-center gap-1 ${className}`}>
        {label && <label className="text-xs text-zinc-500">{label}</label>}
        <div className="vertical-slider-wrapper">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs text-zinc-500">{label}</label>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}
