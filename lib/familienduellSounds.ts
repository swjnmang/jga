let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType,
  peakGain: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/** Fröhlicher aufsteigender Dreiklang für eine richtige/aufgedeckte Antwort. */
export function playCorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.18, 'triangle', 0.25); // C5
  playTone(ctx, 659.25, now + 0.09, 0.18, 'triangle', 0.25); // E5
  playTone(ctx, 783.99, now + 0.18, 0.32, 'triangle', 0.28); // G5
}

/**
 * Klassischer Summer für eine falsche Antwort: ein sägezahnförmiger Träger,
 * dessen Amplitude von einem zweiten Oszillator moduliert wird – dadurch
 * entsteht die authentische "BZZZT"-Textur eines echten Türsummers, statt
 * eines einfachen fallenden Tons.
 */
export function playBuzzerSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const duration = 0.72;

  const carrier = ctx.createOscillator();
  carrier.type = 'sawtooth';
  carrier.frequency.setValueAtTime(184, now);

  const carrierGain = ctx.createGain();
  carrierGain.gain.setValueAtTime(0, now);
  carrierGain.gain.linearRampToValueAtTime(0.32, now + 0.015);
  carrierGain.gain.setValueAtTime(0.32, now + duration - 0.08);
  carrierGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const lfo = ctx.createOscillator();
  lfo.type = 'square';
  lfo.frequency.setValueAtTime(46, now);
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(0.5, now);
  lfo.connect(lfoGain);
  lfoGain.connect(carrierGain.gain);

  carrier.connect(carrierGain);
  carrierGain.connect(ctx.destination);

  carrier.start(now);
  lfo.start(now);
  carrier.stop(now + duration + 0.05);
  lfo.stop(now + duration + 0.05);
}
