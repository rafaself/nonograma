import { describe, expect, it } from 'vitest';
import { formatElapsedTime } from './time';

describe('formatElapsedTime', () => {
  it('formats sub-hour times as minutes and seconds', () => {
    expect(formatElapsedTime(0)).toBe('00:00');
    expect(formatElapsedTime(9)).toBe('00:09');
    expect(formatElapsedTime(125)).toBe('02:05');
  });

  it('formats hour-long times as hours, minutes, and seconds', () => {
    expect(formatElapsedTime(3600)).toBe('1:00:00');
    expect(formatElapsedTime(3671)).toBe('1:01:11');
  });

  it('clamps negative values before formatting', () => {
    expect(formatElapsedTime(-14)).toBe('00:00');
  });
});
