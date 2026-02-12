import * as Tone from "tone";
import { EffectState, EffectType } from "@/types";

type ToneEffect = Tone.EQ3 | Tone.Reverb | Tone.FeedbackDelay | Tone.Compressor;

export function createToneEffect(state: EffectState): ToneEffect {
  switch (state.type) {
    case "eq3":
      return new Tone.EQ3(state.params.low, state.params.mid, state.params.high);
    case "reverb":
      return new Tone.Reverb({ decay: state.params.decay, wet: state.params.wet });
    case "delay":
      return new Tone.FeedbackDelay({
        delayTime: state.params.delayTime,
        feedback: state.params.feedback,
        wet: state.params.wet,
      });
    case "compressor":
      return new Tone.Compressor({
        threshold: state.params.threshold,
        ratio: state.params.ratio,
        attack: state.params.attack,
        release: state.params.release,
      });
  }
}

export function updateToneEffect(effect: ToneEffect, type: EffectType, params: Record<string, number>) {
  switch (type) {
    case "eq3": {
      const eq = effect as Tone.EQ3;
      eq.low.value = params.low ?? 0;
      eq.mid.value = params.mid ?? 0;
      eq.high.value = params.high ?? 0;
      break;
    }
    case "reverb": {
      const rev = effect as Tone.Reverb;
      rev.decay = params.decay ?? 1.5;
      rev.wet.value = params.wet ?? 0.3;
      break;
    }
    case "delay": {
      const del = effect as Tone.FeedbackDelay;
      del.delayTime.value = params.delayTime ?? 0.25;
      del.feedback.value = params.feedback ?? 0.3;
      del.wet.value = params.wet ?? 0.3;
      break;
    }
    case "compressor": {
      const comp = effect as Tone.Compressor;
      comp.threshold.value = params.threshold ?? -24;
      comp.ratio.value = params.ratio ?? 4;
      comp.attack.value = params.attack ?? 0.003;
      comp.release.value = params.release ?? 0.25;
      break;
    }
  }
}

export class EffectChain {
  private effects: { state: EffectState; node: ToneEffect }[] = [];
  private input: Tone.Channel;
  private output: Tone.Channel;

  constructor(input: Tone.Channel, output: Tone.Channel) {
    this.input = input;
    this.output = output;
    this.input.connect(this.output);
  }

  rebuild(effectStates: EffectState[]) {
    // Disconnect everything
    this.input.disconnect();
    this.effects.forEach((e) => {
      e.node.disconnect();
      e.node.dispose();
    });

    // Create new effects
    this.effects = effectStates.map((state) => ({
      state,
      node: createToneEffect(state),
    }));

    // Connect chain: input -> [effects not bypassed] -> output
    let prev: Tone.ToneAudioNode = this.input;
    for (const effect of this.effects) {
      if (!effect.state.bypassed) {
        prev.connect(effect.node);
        prev = effect.node;
      }
    }
    prev.connect(this.output);
  }

  updateParams(effectId: string, params: Record<string, number>) {
    const fx = this.effects.find((e) => e.state.id === effectId);
    if (fx) {
      updateToneEffect(fx.node, fx.state.type, params);
    }
  }

  dispose() {
    this.effects.forEach((e) => {
      e.node.disconnect();
      e.node.dispose();
    });
    this.effects = [];
  }
}
