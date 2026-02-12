import { StateCreator } from "zustand";
import { MixerState } from "@/types";

export interface MixerSlice {
  mixer: Record<string, MixerState>;
  masterVolume: number;
  initMixer: (trackId: string) => void;
  setVolume: (trackId: string, volume: number) => void;
  setPan: (trackId: string, pan: number) => void;
  toggleMute: (trackId: string) => void;
  toggleSolo: (trackId: string) => void;
  setMasterVolume: (volume: number) => void;
}

const defaultMixer: MixerState = {
  volume: 0,
  pan: 0,
  mute: false,
  solo: false,
};

export const createMixerSlice: StateCreator<MixerSlice> = (set) => ({
  mixer: {},
  masterVolume: 0,
  initMixer: (trackId) =>
    set((state) => ({
      mixer: { ...state.mixer, [trackId]: { ...defaultMixer } },
    })),
  setVolume: (trackId, volume) =>
    set((state) => ({
      mixer: {
        ...state.mixer,
        [trackId]: { ...state.mixer[trackId], volume },
      },
    })),
  setPan: (trackId, pan) =>
    set((state) => ({
      mixer: {
        ...state.mixer,
        [trackId]: { ...state.mixer[trackId], pan },
      },
    })),
  toggleMute: (trackId) =>
    set((state) => ({
      mixer: {
        ...state.mixer,
        [trackId]: {
          ...state.mixer[trackId],
          mute: !state.mixer[trackId]?.mute,
        },
      },
    })),
  toggleSolo: (trackId) =>
    set((state) => ({
      mixer: {
        ...state.mixer,
        [trackId]: {
          ...state.mixer[trackId],
          solo: !state.mixer[trackId]?.solo,
        },
      },
    })),
  setMasterVolume: (volume) => set({ masterVolume: volume }),
});
