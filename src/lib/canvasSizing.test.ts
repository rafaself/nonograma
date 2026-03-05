import { describe, expect, it } from 'vitest';
import { computeCellSize } from './canvasSizing';

describe('computeCellSize', () => {
  it('computes from the most restrictive dimension', () => {
    const size = computeCellSize(500, 400, 10, 10, 100, 50);
    expect(size).toBe(35);
  });

  it('respects min clamp', () => {
    const size = computeCellSize(120, 120, 10, 10, 80, 80, 20, 48);
    expect(size).toBe(20);
  });

  it('respects max clamp', () => {
    const size = computeCellSize(5000, 5000, 2, 2, 0, 0, 20, 48);
    expect(size).toBe(48);
  });
});
