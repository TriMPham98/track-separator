import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { ProjectSlice, createProjectSlice } from "./slices/projectSlice";
import { TracksSlice, createTracksSlice } from "./slices/tracksSlice";
import { MixerSlice, createMixerSlice } from "./slices/mixerSlice";
import { EffectsSlice, createEffectsSlice } from "./slices/effectsSlice";
import { TransportSlice, createTransportSlice } from "./slices/transportSlice";
import { UISlice, createUISlice } from "./slices/uiSlice";

export type StoreState = ProjectSlice &
  TracksSlice &
  MixerSlice &
  EffectsSlice &
  TransportSlice &
  UISlice;

export const useStore = create<StoreState>()(
  subscribeWithSelector((...a) => ({
    ...createProjectSlice(...a),
    ...createTracksSlice(...a),
    ...createMixerSlice(...a),
    ...createEffectsSlice(...a),
    ...createTransportSlice(...a),
    ...createUISlice(...a),
  }))
);
