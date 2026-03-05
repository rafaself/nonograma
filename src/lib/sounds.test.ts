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
    expect(() => sounds.fill()).not.toThrow();
    expect(() => sounds.markX()).not.toThrow();
    expect(() => sounds.erase()).not.toThrow();
    expect(() => sounds.undo()).not.toThrow();
    expect(() => sounds.reset()).not.toThrow();
    expect(() => sounds.lineComplete()).not.toThrow();
    expect(() => sounds.win()).not.toThrow();
  });
});
