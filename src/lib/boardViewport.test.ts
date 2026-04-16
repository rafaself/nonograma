import { describe, expect, it } from 'vitest';
import {
  clampBoardScale,
  clampBoardViewport,
  getPinchDistance,
  getPinchMidpoint,
  getPinchViewport,
  toLogicalCanvasPoint,
} from './boardViewport';

describe('boardViewport', () => {
  it('clamps board scale to the supported zoom range', () => {
    expect(clampBoardScale(0.4)).toBe(1);
    expect(clampBoardScale(2.5)).toBe(2.5);
    expect(clampBoardScale(9)).toBe(3);
  });

  it('clamps board viewport offsets against the scaled board size', () => {
    expect(
      clampBoardViewport({ scale: 2, offsetX: 150, offsetY: -150 }, 100, 100),
    ).toEqual({
      scale: 2,
      offsetX: 50,
      offsetY: -50,
    });
  });

  it('measures pinch distance and midpoint', () => {
    expect(getPinchDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(getPinchMidpoint({ x: 0, y: 0 }, { x: 6, y: 10 })).toEqual({
      x: 3,
      y: 5,
    });
  });

  it('derives a clamped pinch viewport from touch movement', () => {
    expect(
      getPinchViewport(
        { scale: 1, offsetX: 0, offsetY: 0 },
        [{ x: 10, y: 10 }, { x: 30, y: 10 }],
        [{ x: 12, y: 14 }, { x: 52, y: 14 }],
        100,
        80,
      ),
    ).toEqual({
      scale: 2,
      offsetX: 12,
      offsetY: 4,
    });
  });

  it('falls back to the starting viewport when pinch distance is zero', () => {
    expect(
      getPinchViewport(
        { scale: 1.5, offsetX: 10, offsetY: -10 },
        [{ x: 5, y: 5 }, { x: 5, y: 5 }],
        [{ x: 5, y: 5 }, { x: 5, y: 5 }],
        100,
        100,
      ),
    ).toEqual({
      scale: 1.5,
      offsetX: 10,
      offsetY: -10,
    });
  });

  it('maps client coordinates back into logical canvas space', () => {
    expect(
      toLogicalCanvasPoint(
        60,
        45,
        { left: 10, top: 5, width: 100, height: 80 },
        50,
        40,
      ),
    ).toEqual({
      x: 25,
      y: 20,
    });

    expect(
      toLogicalCanvasPoint(
        60,
        45,
        { left: 10, top: 5, width: 0, height: 80 },
        50,
        40,
      ),
    ).toBeNull();
  });
});
