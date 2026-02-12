import { StateCreator } from "zustand";
import { Project } from "@/types";

export interface ProjectSlice {
  project: Project | null;
  setProject: (project: Project) => void;
  clearProject: () => void;
}

export const createProjectSlice: StateCreator<ProjectSlice> = (set) => ({
  project: null,
  setProject: (project) => set({ project }),
  clearProject: () => set({ project: null }),
});
