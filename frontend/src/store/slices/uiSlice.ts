import { StateCreator } from "zustand";

export interface UISlice {
  mixerOpen: boolean;
  effectsOpen: boolean;
  exportOpen: boolean;
  toggleMixer: () => void;
  toggleEffects: () => void;
  setExportOpen: (open: boolean) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  mixerOpen: false,
  effectsOpen: false,
  exportOpen: false,
  toggleMixer: () => set((state) => ({ mixerOpen: !state.mixerOpen })),
  toggleEffects: () => set((state) => ({ effectsOpen: !state.effectsOpen })),
  setExportOpen: (open) => set({ exportOpen: open }),
});
