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
  startTime = 0,
  volume = 0.5
): void {
  const ac = getCtx();
  const t = ac.currentTime + startTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t);

  gain.gain.setValueAtTime(gainValue * (volume * 2), t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export const sounds = {
  fill(volume: number): void {
    beep(880, 0.06, 'square', 0.08, 0, volume);
  },

  markX(volume: number): void {
    beep(440, 0.08, 'square', 0.06, 0, volume);
    beep(330, 0.06, 'square', 0.04, 0.04, volume);
  },

  erase(volume: number): void {
    beep(300, 0.05, 'sine', 0.05, 0, volume);
  },

  undo(volume: number): void {
    beep(660, 0.07, 'sine', 0.1, 0, volume);
    beep(440, 0.07, 'sine', 0.08, 0.07, volume);
  },

  reset(volume: number): void {
    beep(200, 0.15, 'sawtooth', 0.06, 0, volume);
  },

  lineComplete(volume: number): void {
    // Fast happy 5-note arpeggio with a bright triangle wave
    const notes = [523, 659, 784, 988, 1047];
    notes.forEach((freq, i) => beep(freq, 0.12, 'triangle', 0.13, i * 0.055, volume));
  },

  win(volume: number): void {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => beep(freq, 0.18, 'sine', 0.12, i * 0.12, volume));
  },
};
