import * as Tone from "tone";
import { StoreState } from "@/store";

export async function renderOffline(
  store: StoreState,
  format: "wav" | "mp3" = "wav"
): Promise<Blob> {
  const { tracks, mixer, effects, masterVolume } = store;

  // Find max duration
  const engine = (await import("./AudioEngine")).AudioEngine.getInstance();
  const duration = engine.duration;
  if (duration === 0) throw new Error("No audio to export");

  const buffer = await Tone.Offline(async ({ transport }) => {
    const master = new Tone.Channel({ volume: masterVolume }).toDestination();
    const limiter = new Tone.Limiter(-1).connect(master);

    for (const track of tracks) {
      const mixState = mixer[track.id];
      if (!mixState) continue;

      const sourceTrack = engine.getTrack(track.id);
      if (!sourceTrack || !sourceTrack.isLoaded) continue;

      const player = new Tone.Player(sourceTrack.player.buffer).sync().start(0);
      const channel = new Tone.Channel({
        volume: mixState.volume,
        pan: mixState.pan,
        mute: mixState.mute,
      });

      player.connect(channel);
      channel.connect(limiter);
    }

    transport.start();
  }, duration);

  // Convert to blob
  const audioBuffer = buffer.get();
  if (!audioBuffer) throw new Error("Render produced no audio");

  return audioBufferToWavBlob(audioBuffer);
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const headerSize = 44;

  const arrayBuffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Interleave channels
  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = headerSize;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
