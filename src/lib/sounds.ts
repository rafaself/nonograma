let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function beep(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue = 0.15,
  startTime = 0
): void {
  const ac = getCtx();
  const t = ac.currentTime + startTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t);

  gain.gain.setValueAtTime(gainValue, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export const sounds = {
  fill(): void {
    beep(880, 0.06, 'square', 0.08);
  },

  markX(): void {
    beep(440, 0.08, 'square', 0.06);
    beep(330, 0.06, 'square', 0.04, 0.04);
  },

  erase(): void {
    beep(300, 0.05, 'sine', 0.05);
  },

  undo(): void {
    beep(660, 0.07, 'sine', 0.1);
    beep(440, 0.07, 'sine', 0.08, 0.07);
  },

  reset(): void {
    beep(200, 0.15, 'sawtooth', 0.06);
  },

  win(): void {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => beep(freq, 0.18, 'sine', 0.12, i * 0.12));
  },
};
