import * as Tone from "tone";
import { TrackNode } from "./TrackNode";
import { MasterBus } from "./MasterBus";
import { useStore, StoreState } from "@/store";

export class AudioEngine {
  private static instance: AudioEngine | null = null;
  private tracks: Map<string, TrackNode> = new Map();
  private masterBus: MasterBus;
  private started = false;
  private unsubscribers: (() => void)[] = [];

  private constructor() {
    this.masterBus = new MasterBus();
    this.setupStoreSubscriptions();
  }

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  async start() {
    if (this.started) return;
    await Tone.start();
    this.started = true;
  }

  get isStarted() {
    return this.started;
  }

  async loadTrack(id: string, url: string) {
    if (this.tracks.has(id)) return;
    const track = new TrackNode(id, url, this.masterBus.input);
    this.tracks.set(id, track);
  }

  getTrack(id: string): TrackNode | undefined {
    return this.tracks.get(id);
  }

  getMasterBus(): MasterBus {
    return this.masterBus;
  }

  getAllTracks(): TrackNode[] {
    return Array.from(this.tracks.values());
  }

  removeTrack(id: string) {
    const track = this.tracks.get(id);
    if (track) {
      track.dispose();
      this.tracks.delete(id);
    }
  }

  play() {
    Tone.getTransport().start();
  }

  pause() {
    Tone.getTransport().pause();
  }

  stop() {
    Tone.getTransport().stop();
  }

  seekTo(time: number) {
    Tone.getTransport().seconds = time;
  }

  get currentTime(): number {
    return Tone.getTransport().seconds;
  }

  get duration(): number {
    let max = 0;
    this.tracks.forEach((t) => {
      if (t.duration > max) max = t.duration;
    });
    return max;
  }

  private setupStoreSubscriptions() {
    const store = useStore;

    // Subscribe to mixer changes
    this.unsubscribers.push(
      store.subscribe(
        (s) => s.mixer,
        (mixer) => {
          for (const [trackId, state] of Object.entries(mixer)) {
            const track = this.tracks.get(trackId);
            if (!track) continue;
            track.setVolume(state.volume);
            track.setPan(state.pan);
          }
          // Handle solo logic
          const anySoloed = Object.values(mixer).some((m) => m.solo);
          for (const [trackId, state] of Object.entries(mixer)) {
            const track = this.tracks.get(trackId);
            if (!track) continue;
            const shouldMute = state.mute || (anySoloed && !state.solo);
            track.setMute(shouldMute);
          }
        }
      )
    );

    // Subscribe to master volume
    this.unsubscribers.push(
      store.subscribe(
        (s) => s.masterVolume,
        (vol) => this.masterBus.setVolume(vol)
      )
    );

    // Subscribe to effects changes
    this.unsubscribers.push(
      store.subscribe(
        (s) => s.effects,
        (effects) => {
          for (const [trackId, fxList] of Object.entries(effects)) {
            const track = this.tracks.get(trackId);
            if (track) {
              track.rebuildEffects(fxList);
            }
          }
        }
      )
    );

    // Subscribe to transport
    this.unsubscribers.push(
      store.subscribe(
        (s) => s.loop,
        (loop) => {
          Tone.getTransport().loop = loop;
        }
      )
    );

    this.unsubscribers.push(
      store.subscribe(
        (s) => s.bpm,
        (bpm) => {
          Tone.getTransport().bpm.value = bpm;
        }
      )
    );
  }

  dispose() {
    this.unsubscribers.forEach((unsub) => unsub());
    this.tracks.forEach((t) => t.dispose());
    this.tracks.clear();
    this.masterBus.dispose();
    AudioEngine.instance = null;
  }
}
