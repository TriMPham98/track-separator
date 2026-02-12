export interface Project {
  id: number;
  name: string;
  original_filename: string;
  created_at: string;
  stems: string[];
}

export interface ProjectListItem {
  id: number;
  name: string;
  original_filename: string;
  created_at: string;
}

export interface Job {
  id: number;
  project_id: number;
  status: "pending" | "processing" | "completed" | "failed";
  error: string | null;
  stems_found: string[];
  created_at: string;
  completed_at: string | null;
}

export interface UploadResponse {
  project_id: number;
  job_id: number;
  message: string;
}

export type StemName = "drums" | "bass" | "vocals" | "guitar" | "piano" | "other";

export const STEM_NAMES: StemName[] = ["drums", "bass", "vocals", "guitar", "piano", "other"];

export const STEM_COLORS: Record<StemName, string> = {
  drums: "#ef4444",
  bass: "#f97316",
  vocals: "#8b5cf6",
  guitar: "#22c55e",
  piano: "#3b82f6",
  other: "#6b7280",
};

export interface TrackState {
  id: string;
  stemName: StemName;
  name: string;
  color: string;
  url: string;
  order: number;
}

export interface MixerState {
  volume: number; // dB, -60 to 6
  pan: number; // -1 to 1
  mute: boolean;
  solo: boolean;
}

export interface EffectState {
  id: string;
  type: EffectType;
  bypassed: boolean;
  params: Record<string, number>;
}

export type EffectType = "eq3" | "reverb" | "delay" | "compressor";

export interface TransportState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loop: boolean;
  bpm: number;
}
