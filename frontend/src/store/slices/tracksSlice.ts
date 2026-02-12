import { StateCreator } from "zustand";
import { TrackState, StemName, STEM_COLORS } from "@/types";

export interface TracksSlice {
  tracks: TrackState[];
  setTracks: (tracks: TrackState[]) => void;
  addTrack: (track: TrackState) => void;
  reorderTracks: (trackIds: string[]) => void;
  selectedTrackId: string | null;
  selectTrack: (id: string | null) => void;
}

export const createTracksSlice: StateCreator<TracksSlice> = (set) => ({
  tracks: [],
  setTracks: (tracks) => set({ tracks }),
  addTrack: (track) => set((state) => ({ tracks: [...state.tracks, track] })),
  reorderTracks: (trackIds) =>
    set((state) => {
      const trackMap = new Map(state.tracks.map((t) => [t.id, t]));
      const reordered = trackIds
        .map((id, i) => {
          const track = trackMap.get(id);
          return track ? { ...track, order: i } : null;
        })
        .filter(Boolean) as TrackState[];
      return { tracks: reordered };
    }),
  selectedTrackId: null,
  selectTrack: (id) => set({ selectedTrackId: id }),
});

export function createTrackFromStem(
  stemName: StemName,
  projectId: number,
  url: string,
  order: number
): TrackState {
  return {
    id: `${projectId}-${stemName}`,
    stemName,
    name: stemName.charAt(0).toUpperCase() + stemName.slice(1),
    color: STEM_COLORS[stemName],
    url,
    order,
  };
}
