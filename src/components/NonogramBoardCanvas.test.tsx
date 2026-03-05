import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CellState } from '../lib/game-logic';
import { NonogramBoardCanvas } from './NonogramBoardCanvas';
import { computeCellSize } from '../lib/canvasSizing';
import { hitTest, renderBoard } from '../lib/boardRender';

vi.mock('../lib/canvasSizing', () => ({
  computeCellSize: vi.fn(() => 24),
}));

vi.mock('../lib/boardRender', () => ({
  renderBoard: vi.fn(),
  hitTest: vi.fn(),
}));

describe('NonogramBoardCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true });

    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ ok: true })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.setPointerCapture = vi.fn();
  });

  it('recomputes on resize, uses dpr fallback, and removes resize listener on unmount', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 0, writable: true });
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={() => {}}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    fireEvent(window, new Event('resize'));
    unmount();

    expect(computeCellSize).toHaveBeenCalled();
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(renderBoard).toHaveBeenCalledWith(
      expect.objectContaining({ dpr: 1 }),
    );
  });

  it('renders clues/canvas and calls sizing + board renderer', () => {
    const { container } = render(
      <NonogramBoardCanvas
        grid={[
          [CellState.EMPTY, CellState.FILLED],
          [CellState.MARKED_X, CellState.EMPTY],
        ]}
        clues={{ rows: [[1], [0]], cols: [[1], [1]] }}
        onCellAction={() => {}}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    expect(computeCellSize).toHaveBeenCalled();
    expect(renderBoard).toHaveBeenCalled();
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('handles pointer interactions for mouse and drag dedupe', () => {
    const onCellAction = vi.fn();
    const { container } = render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY, CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0], [0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;

    vi.mocked(hitTest)
      .mockReturnValueOnce({ row: 0, col: 0 })
      .mockReturnValueOnce({ row: 0, col: 0 })
      .mockReturnValueOnce({ row: 0, col: 1 });

    fireEvent.pointerDown(canvas, { pointerId: 1, button: 0, pointerType: 'mouse', clientX: 1, clientY: 1 });
    fireEvent.pointerMove(canvas, { pointerId: 1, pointerType: 'mouse', clientX: 2, clientY: 2 });
    fireEvent.pointerMove(canvas, { pointerId: 1, pointerType: 'mouse', clientX: 3, clientY: 3 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });

    expect(onCellAction).toHaveBeenNthCalledWith(1, 0, 0, 'fill');
    expect(onCellAction).toHaveBeenNthCalledWith(2, 0, 1, 'fill');
  });

  it('ignores pointer move when drag is not active', () => {
    const onCellAction = vi.fn();
    const { container } = render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerMove(canvas, { pointerId: 1, pointerType: 'mouse', clientX: 2, clientY: 2 });

    expect(onCellAction).not.toHaveBeenCalled();
  });

  it('ignores pointer move when hitTest returns null during drag', () => {
    const onCellAction = vi.fn();
    const { container } = render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    vi.mocked(hitTest)
      .mockReturnValueOnce({ row: 0, col: 0 })
      .mockReturnValueOnce(null);

    fireEvent.pointerDown(canvas, { pointerId: 1, button: 0, pointerType: 'mouse', clientX: 1, clientY: 1 });
    fireEvent.pointerMove(canvas, { pointerId: 1, pointerType: 'mouse', clientX: 2, clientY: 2 });

    expect(onCellAction).toHaveBeenCalledTimes(1);
  });

  it('ignores pointer down when hitTest returns null', () => {
    const onCellAction = vi.fn();
    const { container } = render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    vi.mocked(hitTest).mockReturnValueOnce(null);

    fireEvent.pointerDown(canvas, { pointerId: 7, button: 0, pointerType: 'mouse', clientX: 1, clientY: 1 });
    expect(onCellAction).not.toHaveBeenCalled();
  });

  it('supports right click, touch mode and ignores solved board', () => {
    const onCellAction = vi.fn();
    const { container, rerender } = render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.MARKED_X}
      />,
    );

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    vi.mocked(hitTest)
      .mockReturnValueOnce({ row: 0, col: 0 })
      .mockReturnValueOnce({ row: 0, col: 0 });

    fireEvent.pointerDown(canvas, { pointerId: 2, button: 2, pointerType: 'mouse', clientX: 1, clientY: 1 });
    fireEvent.pointerDown(canvas, { pointerId: 3, button: 0, pointerType: 'touch', clientX: 1, clientY: 1 });

    expect(onCellAction).toHaveBeenNthCalledWith(1, 0, 0, 'mark_x');
    expect(onCellAction).toHaveBeenNthCalledWith(2, 0, 0, 'mark_x');

    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    canvas.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);

    rerender(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={onCellAction}
        isSolved
        inputMode={CellState.FILLED}
      />,
    );

    vi.mocked(hitTest).mockReturnValueOnce({ row: 0, col: 0 });
    fireEvent.pointerDown(canvas, { pointerId: 4, button: 0, pointerType: 'mouse', clientX: 1, clientY: 1 });
    expect(onCellAction).toHaveBeenCalledTimes(2);
  });

  it('uses fill action for touch when inputMode is FILLED', () => {
    const onCellAction = vi.fn();
    const { container } = render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    vi.mocked(hitTest).mockReturnValueOnce({ row: 0, col: 0 });

    fireEvent.pointerDown(canvas, { pointerId: 8, button: 0, pointerType: 'touch', clientX: 1, clientY: 1 });
    expect(onCellAction).toHaveBeenCalledWith(0, 0, 'fill');
  });

  it('renders separator classes on clue rows/cols every 5 cells', () => {
    const size = 6;
    const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => CellState.EMPTY));
    const clues = {
      rows: Array.from({ length: size }, () => [0]),
      cols: Array.from({ length: size }, () => [0]),
    };

    const { container } = render(
      <NonogramBoardCanvas
        grid={grid}
        clues={clues}
        onCellAction={() => {}}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const divs = Array.from(container.querySelectorAll('div'));
    const hasRowSeparator = divs.some((d) => d.className.includes('border-r border-r-[#c9a227]/20'));
    const hasColSeparator = divs.some((d) => d.className.includes('border-b border-b-[#c9a227]/20'));

    expect(hasRowSeparator).toBe(true);
    expect(hasColSeparator).toBe(true);
  });

  it('handles null 2D context without rendering board', () => {
    (HTMLCanvasElement.prototype.getContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue(null);

    render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={() => {}}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    expect(renderBoard).not.toHaveBeenCalled();
  });

  it('renders satisfied non-zero clues using the satisfied color branch', () => {
    const { container } = render(
      <NonogramBoardCanvas
        grid={[[CellState.FILLED]]}
        clues={{ rows: [[1]], cols: [[1]] }}
        onCellAction={() => {}}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    expect(container.textContent).toContain('1');
  });

  it('renders multi-number column clues to cover spacing branch', () => {
    const { container } = render(
      <NonogramBoardCanvas
        grid={[[CellState.FILLED]]}
        clues={{ rows: [[1]], cols: [[1, 1]] }}
        onCellAction={() => {}}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    expect(container.textContent).toContain('11');
  });
});
