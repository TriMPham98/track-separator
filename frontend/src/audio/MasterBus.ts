import * as Tone from "tone";
import { EffectChain } from "./EffectChain";
import { EffectState } from "@/types";

export class MasterBus {
  readonly channel: Tone.Channel;
  readonly limiter: Tone.Limiter;
  readonly meter: Tone.Meter;
  private preFxChannel: Tone.Channel;
  readonly effectChain: EffectChain;

  constructor() {
    this.preFxChannel = new Tone.Channel();
    this.channel = new Tone.Channel();
    this.limiter = new Tone.Limiter(-1);
    this.meter = new Tone.Meter({ smoothing: 0.8 });
    this.effectChain = new EffectChain(this.preFxChannel, this.channel);

    this.channel.chain(this.limiter, this.meter, Tone.getDestination());
  }

  get input(): Tone.ToneAudioNode {
    return this.preFxChannel;
  }

  setVolume(db: number) {
    this.channel.volume.value = db;
  }

  rebuildEffects(effects: EffectState[]) {
    this.effectChain.rebuild(effects);
  }

  dispose() {
    this.effectChain.dispose();
    this.preFxChannel.dispose();
    this.channel.dispose();
    this.limiter.dispose();
    this.meter.dispose();
  }
}
