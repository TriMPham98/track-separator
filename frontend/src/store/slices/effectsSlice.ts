import { StateCreator } from "zustand";
import { EffectState, EffectType } from "@/types";

export interface EffectsSlice {
  effects: Record<string, EffectState[]>; // trackId -> effects
  addEffect: (trackId: string, type: EffectType) => void;
  removeEffect: (trackId: string, effectId: string) => void;
  toggleBypass: (trackId: string, effectId: string) => void;
  updateEffectParam: (
    trackId: string,
    effectId: string,
    param: string,
    value: number
  ) => void;
}

let effectCounter = 0;

const DEFAULT_PARAMS: Record<EffectType, Record<string, number>> = {
  eq3: { low: 0, mid: 0, high: 0 },
  reverb: { decay: 1.5, wet: 0.3 },
  delay: { delayTime: 0.25, feedback: 0.3, wet: 0.3 },
  compressor: { threshold: -24, ratio: 4, attack: 0.003, release: 0.25 },
};

export const createEffectsSlice: StateCreator<EffectsSlice> = (set) => ({
  effects: {},
  addEffect: (trackId, type) =>
    set((state) => {
      const effect: EffectState = {
        id: `fx-${++effectCounter}`,
        type,
        bypassed: false,
        params: { ...DEFAULT_PARAMS[type] },
      };
      const existing = state.effects[trackId] || [];
      return {
        effects: { ...state.effects, [trackId]: [...existing, effect] },
      };
    }),
  removeEffect: (trackId, effectId) =>
    set((state) => ({
      effects: {
        ...state.effects,
        [trackId]: (state.effects[trackId] || []).filter(
          (e) => e.id !== effectId
        ),
      },
    })),
  toggleBypass: (trackId, effectId) =>
    set((state) => ({
      effects: {
        ...state.effects,
        [trackId]: (state.effects[trackId] || []).map((e) =>
          e.id === effectId ? { ...e, bypassed: !e.bypassed } : e
        ),
      },
    })),
  updateEffectParam: (trackId, effectId, param, value) =>
    set((state) => ({
      effects: {
        ...state.effects,
        [trackId]: (state.effects[trackId] || []).map((e) =>
          e.id === effectId
            ? { ...e, params: { ...e.params, [param]: value } }
            : e
        ),
      },
    })),
});
