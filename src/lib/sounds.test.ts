import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sounds } from './sounds';

class FakeAudioContext {
  public currentTime = 1;
  public destination = {};

  public oscillator = {
    type: 'sine' as OscillatorType,
    frequency: {
      setValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };

  public gainNode = {
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };

  createOscillator() {
    return this.oscillator;
  }

  createGain() {
    return this.gainNode;
  }
}

describe('sounds', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('AudioContext', FakeAudioContext as unknown as typeof AudioContext);
  });

  it('plays all sound effects without throwing', () => {
    expect(() => sounds.fill(0.5)).not.toThrow();
    expect(() => sounds.markX(0.5)).not.toThrow();
    expect(() => sounds.erase(0.5)).not.toThrow();
    expect(() => sounds.undo(0.5)).not.toThrow();
    expect(() => sounds.reset(0.5)).not.toThrow();
    expect(() => sounds.lineComplete(0.5)).not.toThrow();
    expect(() => sounds.win(0.5)).not.toThrow();
  });
});
