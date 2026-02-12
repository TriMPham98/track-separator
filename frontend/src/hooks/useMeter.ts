"use client";

import { useEffect, useRef } from "react";
import * as Tone from "tone";

export function useMeter(meter: Tone.Meter | null) {
  const valueRef = useRef(0);

  useEffect(() => {
    if (!meter) return;
    let raf: number;
    const update = () => {
      const val = meter.getValue();
      valueRef.current = typeof val === "number" ? val : val[0];
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [meter]);

  return valueRef;
}
