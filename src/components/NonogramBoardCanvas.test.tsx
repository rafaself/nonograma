import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { CellState } from '../lib/game-logic';
import { NonogramBoardCanvas } from './NonogramBoardCanvas';
import { computeStableCellSize } from '../lib/canvasSizing';
import { hitTest, renderBoard } from '../lib/boardRender';

vi.mock('../lib/canvasSizing', async () => {
  const actual = await vi.importActual<typeof import('../lib/canvasSizing')>('../lib/canvasSizing');

  return {
    ...actual,
    computeStableCellSize: vi.fn(() => 24),
  };
});

vi.mock('../lib/boardRender', () => ({
  renderBoard: vi.fn(),
  hitTest: vi.fn(),
}));

describe('NonogramBoardCanvas', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true });

    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ ok: true })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.setPointerCapture = vi.fn();
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 48,
      height: 48,
      x: 0,
      y: 0,
      bottom: 48,
      right: 48,
      toJSON: () => ({}),
    })) as unknown as typeof HTMLCanvasElement.prototype.getBoundingClientRect;
  });

  afterEach(() => {
    vi.useRealTimers();
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
        ariaLabel="Board"
      />,
    );

    fireEvent(window, new Event('resize'));
    unmount();

    expect(computeStableCellSize).toHaveBeenCalled();
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(renderBoard).toHaveBeenCalledWith(
      expect.objectContaining({ dpr: 1 }),
    );
  });

  it('renders clues, renderer output, and accessibility metadata', () => {
    render(
      <NonogramBoardCanvas
        grid={[
          [CellState.EMPTY, CellState.FILLED],
          [CellState.MARKED_X, CellState.EMPTY],
        ]}
        clues={{ rows: [[1], [0]], cols: [[1], [1]] }}
        onCellAction={() => {}}
        isSolved={false}
        inputMode={CellState.FILLED}
        ariaLabel="Puzzle board for Alpha"
        ariaDescribedBy="board-help"
      />,
    );

    expect(computeStableCellSize).toHaveBeenCalled();
    expect(renderBoard).toHaveBeenCalled();
    expect(screen.getByRole('img', { name: 'Puzzle board for Alpha' })).toHaveAttribute('aria-describedby', 'board-help');
  });

  it('handles pointer interactions for mouse and drag dedupe', () => {
    const onCellAction = vi.fn();
    render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY, CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0], [0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const canvas = screen.getByRole('img');

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

  it('maps transformed canvas coordinates back into logical hit-test space', () => {
    const onCellAction = vi.fn();

    render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const canvas = screen.getByRole('img');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 10,
      width: 48,
      height: 48,
      x: 10,
      y: 10,
      bottom: 58,
      right: 58,
      toJSON: () => ({}),
    } as DOMRect);
    vi.mocked(hitTest).mockReturnValueOnce({ row: 0, col: 0 });

    fireEvent.pointerDown(canvas, { pointerId: 2, button: 0, pointerType: 'mouse', clientX: 34, clientY: 34 });

    expect(hitTest).toHaveBeenCalledWith(12, 12, 24, 1, 1);
  });

  it('ignores pointer move when drag is not active', () => {
    const onCellAction = vi.fn();
    render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const canvas = screen.getByRole('img');
    fireEvent.pointerMove(canvas, { pointerId: 1, pointerType: 'mouse', clientX: 2, clientY: 2 });

    expect(onCellAction).not.toHaveBeenCalled();
  });

  it('ignores pointer down when hitTest returns null', () => {
    const onCellAction = vi.fn();
    render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const canvas = screen.getByRole('img');
    vi.mocked(hitTest).mockReturnValueOnce(null);

    fireEvent.pointerDown(canvas, { pointerId: 7, button: 0, pointerType: 'mouse', clientX: 1, clientY: 1 });
    expect(onCellAction).not.toHaveBeenCalled();
  });

  it('uses tap-on-release for touch in the current mode', () => {
    const onCellAction = vi.fn();
    render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const canvas = screen.getByRole('img');
    vi.mocked(hitTest).mockReturnValueOnce({ row: 0, col: 0 });

    fireEvent.pointerDown(canvas, { pointerId: 8, button: 0, pointerType: 'touch', clientX: 1, clientY: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 8, pointerType: 'touch' });

    expect(onCellAction).toHaveBeenCalledWith(0, 0, 'fill');
  });

  it('uses the alternate touch action after a long press', () => {
    const onCellAction = vi.fn();
    render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const canvas = screen.getByRole('img');
    vi.mocked(hitTest).mockReturnValueOnce({ row: 0, col: 0 });

    fireEvent.pointerDown(canvas, { pointerId: 9, button: 0, pointerType: 'touch', clientX: 1, clientY: 1 });
    vi.advanceTimersByTime(250);
    fireEvent.pointerUp(canvas, { pointerId: 9, pointerType: 'touch' });

    expect(onCellAction).toHaveBeenCalledWith(0, 0, 'mark_x');
  });

  it('starts a normal touch drag after moving beyond the long-press slop', () => {
    const onCellAction = vi.fn();
    render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY, CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0], [0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.FILLED}
      />,
    );

    const canvas = screen.getByRole('img');
    vi.mocked(hitTest)
      .mockReturnValueOnce({ row: 0, col: 0 })
      .mockReturnValueOnce({ row: 0, col: 1 });

    fireEvent.pointerDown(canvas, { pointerId: 10, pointerType: 'touch', clientX: 1, clientY: 1 });
    fireEvent.pointerMove(canvas, { pointerId: 10, pointerType: 'touch', clientX: 20, clientY: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 10, pointerType: 'touch' });

    expect(onCellAction).toHaveBeenNthCalledWith(1, 0, 0, 'fill');
    expect(onCellAction).toHaveBeenNthCalledWith(2, 0, 1, 'fill');
  });

  it('uses right click, prevents context menu, ignores solved boards, and pinches without editing', () => {
    const onCellAction = vi.fn();
    const { rerender } = render(
      <NonogramBoardCanvas
        grid={[[CellState.EMPTY]]}
        clues={{ rows: [[0]], cols: [[0]] }}
        onCellAction={onCellAction}
        isSolved={false}
        inputMode={CellState.MARKED_X}
      />,
    );

    const canvas = screen.getByRole('img');
    vi.mocked(hitTest).mockReturnValueOnce({ row: 0, col: 0 });

    fireEvent.pointerDown(canvas, { pointerId: 2, button: 2, pointerType: 'mouse', clientX: 1, clientY: 1 });

    expect(onCellAction).toHaveBeenNthCalledWith(1, 0, 0, 'mark_x');

    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    canvas.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);

    fireEvent.pointerDown(canvas, { pointerId: 20, pointerType: 'touch', clientX: 1, clientY: 1 });
    fireEvent.pointerDown(canvas, { pointerId: 21, pointerType: 'touch', clientX: 5, clientY: 5 });
    fireEvent.pointerMove(canvas, { pointerId: 20, pointerType: 'touch', clientX: 2, clientY: 2 });
    fireEvent.pointerMove(canvas, { pointerId: 21, pointerType: 'touch', clientX: 12, clientY: 12 });

    expect(onCellAction).toHaveBeenCalledTimes(1);

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
    expect(onCellAction).toHaveBeenCalledTimes(1);
  });

  it('renders separator classes on clue rows and cols every five cells', () => {
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
});
