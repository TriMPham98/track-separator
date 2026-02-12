import * as Tone from "tone";
import { EffectChain } from "./EffectChain";
import { EffectState } from "@/types";

export class TrackNode {
  readonly id: string;
  readonly player: Tone.Player;
  readonly channel: Tone.Channel;
  readonly meter: Tone.Meter;
  private preFxChannel: Tone.Channel;
  readonly effectChain: EffectChain;
  private loaded = false;

  constructor(id: string, url: string, destination: Tone.ToneAudioNode) {
    this.id = id;
    this.player = new Tone.Player({
      url,
      onload: () => {
        this.loaded = true;
      },
    });

    this.preFxChannel = new Tone.Channel();
    this.channel = new Tone.Channel();
    this.meter = new Tone.Meter({ smoothing: 0.8 });

    this.effectChain = new EffectChain(this.preFxChannel, this.channel);

    this.player.connect(this.preFxChannel);
    this.channel.connect(this.meter);
    this.channel.connect(destination);

    // Sync player to transport
    this.player.sync().start(0);
  }

  get isLoaded() {
    return this.loaded;
  }

  get duration() {
    return this.player.buffer?.duration ?? 0;
  }

  setVolume(db: number) {
    this.channel.volume.value = db;
  }

  setPan(pan: number) {
    this.channel.pan.value = pan;
  }

  setMute(mute: boolean) {
    this.channel.mute = mute;
  }

  rebuildEffects(effects: EffectState[]) {
    this.effectChain.rebuild(effects);
  }

  dispose() {
    this.player.unsync();
    this.player.stop();
    this.player.dispose();
    this.effectChain.dispose();
    this.preFxChannel.dispose();
    this.channel.dispose();
    this.meter.dispose();
  }
}
