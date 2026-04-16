import { describe, expect, it } from 'vitest';
import { computeCellSize, computeClueLayoutMetrics, computeStableCellSize } from './canvasSizing';

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

  it('derives clue layout metrics from the current cell size', () => {
    const metrics = computeClueLayoutMetrics(24, 4, 6);

    expect(metrics.fontSize).toBeCloseTo(10.8);
    expect(metrics.spacing).toBe(5);
    expect(metrics.rowClueWidth).toBeCloseTo(79.84);
    expect(metrics.colClueHeight).toBeCloseTo(113.76);
  });
});

describe('computeStableCellSize', () => {
  it('allows small desktop boards to grow beyond the legacy 48px cap', () => {
    const size = computeStableCellSize(1200, 900, 5, 5, 1, 1);

    expect(size).toBe(88);
  });

  it('gives medium boards a larger desktop cap without oversizing large boards', () => {
    const size = computeStableCellSize(1200, 900, 10, 10, 4, 4);

    expect(size).toBe(72);
  });

  it('returns a fixed point when the clue layout already converges', () => {
    const size = computeStableCellSize(800, 720, 20, 20, 4, 4);

    expect(size).toBe(31);
  });

  it('resolves oscillating clue layouts to the smaller safe size', () => {
    const size = computeStableCellSize(580, 580, 20, 20, 4, 4);

    expect(size).toBe(24);
  });
});
