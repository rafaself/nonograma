import { describe, expect, it, vi } from 'vitest';
import { CellState } from './game-logic';
import { hitTest, renderBoard } from './boardRender';

function createMockCtx() {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: 'butt' as CanvasLineCap,
  } as unknown as CanvasRenderingContext2D;
}

describe('boardRender', () => {
  it('renders filled and marked cells, solved styles and grid lines', () => {
    const ctx = createMockCtx();
    const grid = [
      [CellState.FILLED, CellState.MARKED_X],
      [CellState.EMPTY, CellState.FILLED],
    ];
    renderBoard({
      ctx,
      grid,
      cellSize: 20,
      isSolved: true,
      dpr: 2,
      resultColors: [
        ['#123456', null],
        [null, null],
      ],
    });

    expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 40, 40);
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.strokeRect).toHaveBeenCalled();
  });

  it('renders unsolved filled color', () => {
    const ctx = createMockCtx();
    renderBoard({
      ctx,
      grid: [[CellState.FILLED]],
      cellSize: 16,
      isSolved: false,
      dpr: 1,
    });

    expect(ctx.fillRect).toHaveBeenCalledWith(1, 1, 14, 14);
  });

  it('draws thick separator lines for boards larger than 5x5', () => {
    const ctx = createMockCtx();
    const grid = Array.from({ length: 11 }, () => Array.from({ length: 11 }, () => CellState.EMPTY));

    renderBoard({
      ctx,
      grid,
      cellSize: 10,
      isSolved: false,
      dpr: 1,
    });

    expect(ctx.moveTo).toHaveBeenCalledWith(0, 50);
    expect(ctx.lineTo).toHaveBeenCalledWith(50, 110);
  });

  it('hitTest maps coordinates and handles out of bounds', () => {
    expect(hitTest(19, 21, 10, 5, 5)).toEqual({ row: 2, col: 1 });
    expect(hitTest(-1, 0, 10, 5, 5)).toBeNull();
    expect(hitTest(0, 100, 10, 5, 5)).toBeNull();
  });
});
