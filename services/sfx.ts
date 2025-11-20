// Lightweight synth SFX so we don't rely on external assets.
// Generates short blips with Web Audio API; no-op if unavailable.

type SfxType = 'notification' | 'error' | 'success' | 'click';

let ctx: AudioContext | null = null;

const ensureCtx = () => {
  if (ctx) return ctx;
  if (typeof window === 'undefined' || !(window as any).AudioContext) return null;
  ctx = new AudioContext();
  return ctx;
};

const ENVELOPE = { attack: 0.005, decay: 0.15 };

const presets: Record<SfxType, { freq: number; type: OscillatorType }> = {
  notification: { freq: 880, type: 'triangle' },
  error: { freq: 160, type: 'square' },
  success: { freq: 640, type: 'sine' },
  click: { freq: 520, type: 'sawtooth' }
};

export const playSfx = (type: SfxType) => {
  const audio = ensureCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const preset = presets[type];

  osc.type = preset.type;
  osc.frequency.value = preset.freq;

  const now = audio.currentTime;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.15, now + ENVELOPE.attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + ENVELOPE.decay);

  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + ENVELOPE.decay + 0.05);
};

