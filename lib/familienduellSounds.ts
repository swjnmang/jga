let audioCtx: AudioContext | null = null;
let masterBus: DynamicsCompressorNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContextClass();
      // Ein gemeinsamer Kompressor vor dem Ausgang verhindert Übersteuerung/
      // "Abhacken", wenn bei schnellen Klicks mehrere Töne überlappen.
      masterBus = audioCtx.createDynamicsCompressor();
      masterBus.threshold.setValueAtTime(-16, audioCtx.currentTime);
      masterBus.knee.setValueAtTime(8, audioCtx.currentTime);
      masterBus.ratio.setValueAtTime(10, audioCtx.currentTime);
      masterBus.attack.setValueAtTime(0.002, audioCtx.currentTime);
      masterBus.release.setValueAtTime(0.15, audioCtx.currentTime);
      masterBus.connect(audioCtx.destination);
    } catch {
      audioCtx = null;
      masterBus = null;
    }
  }
  return audioCtx;
}

/**
 * Mobile Browser setzen den AudioContext nach Inaktivität oft auf "suspended".
 * Ohne auf resume() zu warten, werden direkt danach geplante Töne auf vielen
 * Geräten stumm verworfen oder klingen abgeschnitten, weil ihre Startzeit auf
 * einer noch pausierten Uhr basiert. Deshalb hier explizit abwarten.
 */
function getState(ctx: AudioContext): AudioContextState {
  return ctx.state;
}

async function ensureRunning(ctx: AudioContext): Promise<boolean> {
  if (getState(ctx) === 'running') return true;
  try {
    await ctx.resume();
  } catch {
    return false;
  }
  return getState(ctx) === 'running';
}

function playTone(
  ctx: AudioContext,
  bus: AudioNode,
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
  gain.connect(bus);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/** Fröhlicher aufsteigender Dreiklang für eine richtige/aufgedeckte Antwort. */
export async function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx || !masterBus || !(await ensureRunning(ctx))) return;
    const now = ctx.currentTime;
    playTone(ctx, masterBus, 523.25, now, 0.18, 'triangle', 0.25); // C5
    playTone(ctx, masterBus, 659.25, now + 0.09, 0.18, 'triangle', 0.25); // E5
    playTone(ctx, masterBus, 783.99, now + 0.18, 0.32, 'triangle', 0.28); // G5
  } catch {
    // Tonwiedergabe darf das eigentliche Spielgeschehen nie blockieren.
  }
}

/**
 * Klassischer Summer für eine falsche Antwort: ein sägezahnförmiger Träger,
 * dessen Amplitude von einem zweiten Oszillator moduliert wird – dadurch
 * entsteht die authentische "BZZZT"-Textur eines echten Türsummers, statt
 * eines einfachen fallenden Tons.
 */
export async function playBuzzerSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx || !masterBus || !(await ensureRunning(ctx))) return;
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
    carrierGain.connect(masterBus);

    carrier.start(now);
    lfo.start(now);
    carrier.stop(now + duration + 0.05);
    lfo.stop(now + duration + 0.05);
  } catch {
    // Tonwiedergabe darf das eigentliche Spielgeschehen nie blockieren.
  }
}
