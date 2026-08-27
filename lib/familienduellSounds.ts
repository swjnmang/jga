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

/** Harscher, leicht fallender Buzzer für eine falsche Antwort. */
export function playBuzzerSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sawtooth';
  osc2.type = 'square';
  osc1.frequency.setValueAtTime(150, now);
  osc1.frequency.exponentialRampToValueAtTime(90, now + 0.6);
  osc2.frequency.setValueAtTime(148, now);
  osc2.frequency.exponentialRampToValueAtTime(88, now + 0.6);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
  gain.gain.setValueAtTime(0.3, now + 0.45);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.7);
  osc2.stop(now + 0.7);
}
