import { StateCreator } from "zustand";

export interface TransportSlice {
  isPlaying: boolean;
  loop: boolean;
  bpm: number;
  setPlaying: (playing: boolean) => void;
  toggleLoop: () => void;
  setBpm: (bpm: number) => void;
}

export const createTransportSlice: StateCreator<TransportSlice> = (set) => ({
  isPlaying: false,
  loop: false,
  bpm: 120,
  setPlaying: (playing) => set({ isPlaying: playing }),
  toggleLoop: () => set((state) => ({ loop: !state.loop })),
  setBpm: (bpm) => set({ bpm }),
});
