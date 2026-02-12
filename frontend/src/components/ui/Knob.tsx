"use client";

import { useCallback, useRef } from "react";

interface KnobProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  size?: number;
}

export default function Knob({
  value,
  min,
  max,
  onChange,
  label,
  size = 40,
}: KnobProps) {
  const dragRef = useRef<{ startY: number; startVal: number } | null>(null);

  const normalized = (value - min) / (max - min);
  const angle = -135 + normalized * 270;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragRef.current = { startY: e.clientY, startVal: value };
      const handleMove = (e: MouseEvent) => {
        if (!dragRef.current) return;
        const dy = dragRef.current.startY - e.clientY;
        const range = max - min;
        const newVal = Math.max(min, Math.min(max, dragRef.current.startVal + (dy / 100) * range));
        onChange(newVal);
      };
      const handleUp = () => {
        dragRef.current = null;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [value, min, max, onChange]
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative rounded-full bg-zinc-800 border-2 border-zinc-600 cursor-pointer select-none"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute w-1 h-3 bg-blue-400 rounded-full"
          style={{
            top: "4px",
            left: "50%",
            transformOrigin: `50% ${size / 2 - 4}px`,
            transform: `translateX(-50%) rotate(${angle}deg)`,
          }}
        />
      </div>
      {label && <span className="text-xs text-zinc-500">{label}</span>}
    </div>
  );
}
