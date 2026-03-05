import { describe, expect, it, vi } from 'vitest';
import { CellState } from './game-logic';
import { hitTest, renderBoard } from './boardRender';

function createMockCtx() {
  const fillOperations: Array<{ fillStyle: string; args: [number, number, number, number] }> = [];
  const strokeRectOperations: Array<{ strokeStyle: string; args: [number, number, number, number] }> = [];
  const strokeOperations: string[] = [];
  let currentFillStyle = '';
  let currentStrokeStyle = '';

  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
      fillOperations.push({ fillStyle: currentFillStyle, args: [x, y, w, h] });
    }),
    strokeRect: vi.fn((x: number, y: number, w: number, h: number) => {
      strokeRectOperations.push({ strokeStyle: currentStrokeStyle, args: [x, y, w, h] });
    }),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(() => {
      strokeOperations.push(currentStrokeStyle);
    }),
    get fillStyle() {
      return currentFillStyle;
    },
    set fillStyle(value: string) {
      currentFillStyle = value;
    },
    get strokeStyle() {
      return currentStrokeStyle;
    },
    set strokeStyle(value: string) {
      currentStrokeStyle = value;
    },
    lineWidth: 0,
    lineCap: 'butt' as CanvasLineCap,
    __fillOperations: fillOperations,
    __strokeRectOperations: strokeRectOperations,
    __strokeOperations: strokeOperations,
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

  it('renders solved background colors behind empty cells', () => {
    const ctx = createMockCtx() as CanvasRenderingContext2D & {
      __fillOperations: Array<{ fillStyle: string; args: [number, number, number, number] }>;
    };

    renderBoard({
      ctx,
      grid: [[CellState.EMPTY, CellState.FILLED]],
      cellSize: 16,
      isSolved: true,
      dpr: 1,
      resultColors: [[null, '#2d6a4f']],
      backgroundColors: [['#1d4e89', '#1d4e89']],
    });

    expect(ctx.__fillOperations).toContainEqual({
      fillStyle: '#1d4e89',
      args: [0, 0, 16, 16],
    });
    expect(ctx.__fillOperations).toContainEqual({
      fillStyle: '#2d6a4f',
      args: [17, 1, 14, 14],
    });
  });

  it('uses a light inset stroke for dark solved fills and dark inset stroke for light fills', () => {
    const ctx = createMockCtx() as CanvasRenderingContext2D & {
      __strokeRectOperations: Array<{ strokeStyle: string; args: [number, number, number, number] }>;
    };

    renderBoard({
      ctx,
      grid: [[CellState.FILLED, CellState.FILLED]],
      cellSize: 16,
      isSolved: true,
      dpr: 1,
      resultColors: [['#123456', '#EAF4FF']],
    });

    expect(ctx.__strokeRectOperations).toContainEqual({
      strokeStyle: 'rgba(255, 255, 255, 0.22)',
      args: [2, 2, 12, 12],
    });
    expect(ctx.__strokeRectOperations).toContainEqual({
      strokeStyle: 'rgba(0, 0, 0, 0.18)',
      args: [18, 2, 12, 12],
    });
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

  it('softens scenic grid lines when solved background colors are present', () => {
    const ctx = createMockCtx() as CanvasRenderingContext2D & {
      __strokeOperations: string[];
    };

    renderBoard({
      ctx,
      grid: [[CellState.EMPTY]],
      cellSize: 16,
      isSolved: true,
      dpr: 1,
      backgroundColors: [['#1d4e89']],
    });

    expect(ctx.__strokeOperations).toContain('rgba(37, 30, 22, 0.72)');
    expect(ctx.__strokeOperations).toContain('rgba(184, 150, 68, 0.18)');
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('hitTest maps coordinates and handles out of bounds', () => {
    expect(hitTest(19, 21, 10, 5, 5)).toEqual({ row: 2, col: 1 });
    expect(hitTest(-1, 0, 10, 5, 5)).toBeNull();
    expect(hitTest(0, 100, 10, 5, 5)).toBeNull();
  });
});
