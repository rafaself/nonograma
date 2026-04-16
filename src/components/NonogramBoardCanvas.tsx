import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { CellState, isLineSatisfied } from '../lib/game-logic';
import type { Clues } from '../lib/game-logic';
import { computeClueLayoutMetrics, computeStableCellSize } from '../lib/canvasSizing';
import { renderBoard, hitTest } from '../lib/boardRender';
import {
  clampBoardViewport,
  getBoardMaxScale,
  getPinchViewport,
  toLogicalCanvasPoint,
  type BoardViewport,
  type ViewportPoint,
} from '../lib/boardViewport';
import { cn } from '../lib/utils';

export interface NonogramBoardCanvasProps {
  grid: CellState[][];
  clues: Clues;
  onCellAction: (row: number, col: number, action: 'fill' | 'mark_x') => void;
  isSolved: boolean;
  inputMode: CellState.FILLED | CellState.MARKED_X;
  resultColors?: (string | null)[][];
  backgroundColors?: (string | null)[][];
  onDragStart?: () => void;
  onDragEnd?: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export interface NonogramBoardCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
}

interface DragState {
  active: boolean;
  action: 'fill' | 'mark_x';
  visitedCells: Set<string>;
}

interface PendingTouchState {
  pointerId: number;
  timerId: number | null;
  startX: number;
  startY: number;
  startCell: { row: number; col: number } | null;
  normalAction: 'fill' | 'mark_x';
  alternateAction: 'fill' | 'mark_x';
  beganStroke: boolean;
}

interface PinchGestureState {
  startViewport: BoardViewport;
  startPoints: [ViewportPoint, ViewportPoint];
}

const DEFAULT_VIEWPORT: BoardViewport = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

const TOUCH_HOLD_DELAY_MS = 250;
const TOUCH_MOVE_SLOP_PX = 8;
const ZOOM_STEP = 0.2;

const NonogramBoardCanvasComponent = forwardRef<NonogramBoardCanvasHandle, NonogramBoardCanvasProps>(function NonogramBoardCanvas({
  grid,
  clues,
  onCellAction,
  isSolved,
  inputMode,
  resultColors,
  backgroundColors,
  onDragStart,
  onDragEnd,
  ariaLabel,
  ariaDescribedBy,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const touchPointersRef = useRef(new Map<number, ViewportPoint>());
  const pendingTouchRef = useRef<PendingTouchState | null>(null);
  const pinchRef = useRef<PinchGestureState | null>(null);
  const viewportRef = useRef<BoardViewport>(DEFAULT_VIEWPORT);

  const rows = grid.length;
  const cols = grid[0].length;

  const [cellSize, setCellSize] = useState(32);
  const [viewport, setViewport] = useState<BoardViewport>(DEFAULT_VIEWPORT);

  const maxRowClueCount = useMemo(
    () => Math.max(...clues.rows.map((rowClues) => rowClues.length)),
    [clues.rows],
  );
  const maxColClueCount = useMemo(
    () => Math.max(...clues.cols.map((colClues) => colClues.length)),
    [clues.cols],
  );
  const { fontSize, spacing, rowClueWidth, colClueHeight } = useMemo(
    () => computeClueLayoutMetrics(cellSize, maxRowClueCount, maxColClueCount),
    [cellSize, maxRowClueCount, maxColClueCount],
  );
  const logicalCanvasWidth = cellSize * cols;
  const logicalCanvasHeight = cellSize * rows;
  const boardWidth = rowClueWidth + logicalCanvasWidth;
  const boardHeight = colClueHeight + logicalCanvasHeight;
  const maxScale = useMemo(() => getBoardMaxScale(cellSize), [cellSize]);
  const scaledBoardWidth = boardWidth * viewport.scale;
  const scaledBoardHeight = boardHeight * viewport.scale;

  // Pre-compute which rows/cols are satisfied to avoid O(rows*cols) work in JSX
  const satisfiedRows = useMemo(() =>
    clues.rows.map((rowClues, r) =>
      isLineSatisfied(grid[r], rowClues) && !(rowClues.length === 1 && rowClues[0] === 0)
    ),
    [grid, clues.rows],
  );

  const satisfiedCols = useMemo(() =>
    clues.cols.map((colClues, c) => {
      const col = grid.map(row => row[c]);
      return isLineSatisfied(col, colClues) && !(colClues.length === 1 && colClues[0] === 0);
    }),
    [grid, clues.cols],
  );

  const commitViewport = useCallback((nextViewport: BoardViewport) => {
    const clampedViewport = clampBoardViewport(nextViewport, boardWidth, boardHeight, maxScale);
    viewportRef.current = clampedViewport;
    setViewport(clampedViewport);
  }, [boardWidth, boardHeight, maxScale]);

  const adjustViewportScale = useCallback((scaleDelta: number) => {
    commitViewport({
      ...viewportRef.current,
      scale: viewportRef.current.scale + scaleDelta,
    });
  }, [commitViewport]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      adjustViewportScale(ZOOM_STEP);
    },
    zoomOut: () => {
      adjustViewportScale(-ZOOM_STEP);
    },
  }), [adjustViewportScale]);

  const finalizeDrag = useCallback(() => {
    if (dragRef.current) {
      onDragEnd?.();
    }
    dragRef.current = null;
  }, [onDragEnd]);

  const clearPendingTouch = useCallback(() => {
    const pendingTouch = pendingTouchRef.current;
    if (pendingTouch?.timerId != null) {
      window.clearTimeout(pendingTouch.timerId);
    }
    pendingTouchRef.current = null;
  }, []);

  // --- Resize ---
  /* c8 ignore start */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const availW = el.clientWidth;
      const viewportHeightBudget = Math.max(window.innerHeight - 180, 0);
      const availH = Math.max(el.clientHeight, viewportHeightBudget);
      setCellSize(
        computeStableCellSize(
          availW,
          availH,
          cols,
          rows,
          maxRowClueCount,
          maxColClueCount,
        ),
      );
    };

    compute();
    let rafId = 0;
    const scheduleCompute = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(compute);
    };
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(scheduleCompute);

    resizeObserver?.observe(el);
    window.addEventListener('resize', scheduleCompute);
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', scheduleCompute);
    };
  }, [cols, rows, maxRowClueCount, maxColClueCount]);
  /* c8 ignore stop */

  useEffect(() => {
    const touchPointers = touchPointersRef.current;

    return () => {
      dragRef.current = null;
      touchPointers.clear();
      clearPendingTouch();
      pinchRef.current = null;
    };
  }, [clearPendingTouch]);

  useEffect(() => {
    commitViewport(viewportRef.current);
  }, [commitViewport]);

  // --- Canvas render ---
  /* c8 ignore start */
  useEffect(() => {
    const canvas = canvasRef.current;
    /* c8 ignore next 2 */
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    /* c8 ignore next */
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = cellSize * cols * dpr;
    canvas.height = cellSize * rows * dpr;

    renderBoard({
      ctx,
      grid,
      cellSize,
      isSolved,
      dpr,
      ...(resultColors ? { resultColors } : {}),
      ...(backgroundColors ? { backgroundColors } : {}),
    });
  }, [grid, cellSize, isSolved, cols, rows, resultColors, backgroundColors]);
  /* c8 ignore stop */

  // --- Pointer event helpers ---
  const getCell = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const point = toLogicalCanvasPoint(
        e.clientX,
        e.clientY,
        rect,
        logicalCanvasWidth,
        logicalCanvasHeight,
      );

      if (!point) {
        return null;
      }

      return hitTest(point.x, point.y, cellSize, rows, cols);
    },
    [cellSize, rows, cols, logicalCanvasWidth, logicalCanvasHeight],
  );

  const resolveAction = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): 'fill' | 'mark_x' => {
      // Touch always uses the inputMode toggle
      if (e.pointerType === 'touch') {
        return inputMode === CellState.FILLED ? 'fill' : 'mark_x';
      }
      // Mouse: left = fill, right = mark_x
      return e.button === 2 ? 'mark_x' : 'fill';
    },
    [inputMode],
  );

  const applyDragCell = useCallback((cell: { row: number; col: number } | null, action: 'fill' | 'mark_x') => {
    if (!cell || !dragRef.current?.active) {
      return;
    }

    const key = `${cell.row},${cell.col}`;
    if (dragRef.current.visitedCells.has(key)) {
      return;
    }

    dragRef.current.visitedCells.add(key);
    onCellAction(cell.row, cell.col, action);
  }, [onCellAction]);

  const startStroke = useCallback((cell: { row: number; col: number } | null, action: 'fill' | 'mark_x') => {
    if (!cell) {
      return false;
    }

    onDragStart?.();
    dragRef.current = {
      active: true,
      action,
      visitedCells: new Set([`${cell.row},${cell.col}`]),
    };
    onCellAction(cell.row, cell.col, action);
    return true;
  }, [onCellAction, onDragStart]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isSolved) return;
      e.currentTarget.setPointerCapture(e.pointerId);

      if (e.pointerType === 'touch') {
        touchPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (touchPointersRef.current.size >= 2) {
          clearPendingTouch();
          finalizeDrag();

          const [firstPoint, secondPoint] = [...touchPointersRef.current.values()];
          pinchRef.current = {
            startViewport: viewportRef.current,
            startPoints: [firstPoint, secondPoint],
          };
          return;
        }

        const cell = getCell(e);
        const normalAction = resolveAction(e);
        const alternateAction = normalAction === 'fill' ? 'mark_x' : 'fill';
        const timerId = window.setTimeout(() => {
          const pendingTouch = pendingTouchRef.current;
          if (!pendingTouch || pendingTouch.pointerId !== e.pointerId) {
            return;
          }

          if (startStroke(pendingTouch.startCell, pendingTouch.alternateAction)) {
            pendingTouch.beganStroke = true;
          }
        }, TOUCH_HOLD_DELAY_MS);

        pendingTouchRef.current = {
          pointerId: e.pointerId,
          timerId,
          startX: e.clientX,
          startY: e.clientY,
          startCell: cell,
          normalAction,
          alternateAction,
          beganStroke: false,
        };
        return;
      }

      const cell = getCell(e);
      if (!cell) return;

      const action = resolveAction(e);
      startStroke(cell, action);
    },
    [isSolved, getCell, resolveAction, clearPendingTouch, finalizeDrag, startStroke],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType === 'touch') {
        touchPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (touchPointersRef.current.size >= 2) {
          clearPendingTouch();
          finalizeDrag();

          const [firstPoint, secondPoint] = [...touchPointersRef.current.values()];
          const currentPoints: [ViewportPoint, ViewportPoint] = [firstPoint, secondPoint];

          if (pinchRef.current === null) {
            pinchRef.current = {
              startViewport: viewportRef.current,
              startPoints: currentPoints,
            };
          }

          commitViewport(
            getPinchViewport(
              pinchRef.current.startViewport,
              pinchRef.current.startPoints,
              currentPoints,
              boardWidth,
              boardHeight,
              maxScale,
            ),
          );
          return;
        }

        const pendingTouch = pendingTouchRef.current;
        if (pendingTouch && pendingTouch.pointerId === e.pointerId && !pendingTouch.beganStroke) {
          const movedEnough = Math.hypot(e.clientX - pendingTouch.startX, e.clientY - pendingTouch.startY) > TOUCH_MOVE_SLOP_PX;

          if (movedEnough) {
            if (pendingTouch.timerId !== null) {
              window.clearTimeout(pendingTouch.timerId);
              pendingTouch.timerId = null;
            }

            if (!startStroke(pendingTouch.startCell, pendingTouch.normalAction)) {
              clearPendingTouch();
              return;
            }

            pendingTouch.beganStroke = true;
            applyDragCell(getCell(e), pendingTouch.normalAction);
          }
          return;
        }
      }

      const drag = dragRef.current;
      if (!drag?.active) return;

      applyDragCell(getCell(e), drag.action);
    },
    [getCell, boardWidth, boardHeight, maxScale, commitViewport, clearPendingTouch, finalizeDrag, startStroke, applyDragCell],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'touch') {
      touchPointersRef.current.delete(e.pointerId);

      if (pinchRef.current !== null) {
        if (touchPointersRef.current.size < 2) {
          pinchRef.current = null;
        }
        return;
      }

      const pendingTouch = pendingTouchRef.current;
      if (pendingTouch && pendingTouch.pointerId === e.pointerId) {
        if (pendingTouch.timerId !== null) {
          window.clearTimeout(pendingTouch.timerId);
        }

        if (!pendingTouch.beganStroke && pendingTouch.startCell) {
          onCellAction(pendingTouch.startCell.row, pendingTouch.startCell.col, pendingTouch.normalAction);
        } else {
          finalizeDrag();
        }

        pendingTouchRef.current = null;
        return;
      }
    }

    finalizeDrag();
  }, [finalizeDrag, onCellAction]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex w-full justify-center py-1 select-none"
    >
      <div
        className="relative shrink-0"
        style={{ width: scaledBoardWidth, height: scaledBoardHeight }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `${rowClueWidth}px ${cellSize * cols}px`,
              gridTemplateRows: `${colClueHeight}px ${cellSize * rows}px`,
              transform: `translate(${viewport.offsetX}px, ${viewport.offsetY}px) scale(${viewport.scale})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Top-left corner */}
            <div />

            {/* Column clues */}
            <div className="flex">
              {clues.cols.map((colClues, c) => (
                  <div
                    key={c}
                    className={cn(
                      'flex flex-col justify-end items-center transition-colors',
                      c % 5 === 4 && c !== cols - 1 && 'border-r border-r-[#c9a227]/20',
                      satisfiedCols[c] ? 'text-[#5a4d41]' : 'text-[#ae2012]',
                    )}
                    style={{ width: cellSize, fontSize, paddingBottom: 2 }}
                  >
                    {colClues.map((clue, i) => (
                      <span
                        key={i}
                        className={cn(
                          "font-bold leading-tight font-['Noto_Serif_JP'] transition-colors",
                          satisfiedCols[c] ? "text-[#5a4d41]" : "text-[#ae2012]"
                        )}
                        style={{ marginBottom: i < colClues.length - 1 ? spacing : 0 }}
                      >
                        {clue > 0 ? clue : ''}
                      </span>
                    ))}
                  </div>
              ))}
            </div>

            {/* Row clues */}
            <div className="flex flex-col">
              {clues.rows.map((rowClues, r) => (
                  <div
                    key={r}
                    className={cn(
                      'flex justify-end items-center px-2 transition-colors',
                      r % 5 === 4 && r !== rows - 1 && 'border-b border-b-[#c9a227]/20',
                      satisfiedRows[r] ? 'text-[#5a4d41]' : 'text-[#ae2012]',
                    )}
                    style={{ height: cellSize, paddingRight: 4, fontSize, gap: spacing }}
                  >
                    <div className="flex gap-2">
                      {rowClues.map((clue, i) => (
                        <span key={i} className="font-bold font-['Noto_Serif_JP']">
                          {clue > 0 ? clue : ''}
                        </span>
                      ))}
                    </div>
                  </div>
              ))}
            </div>

            {/* Canvas grid */}
            <canvas
              ref={canvasRef}
              style={{
                width: cellSize * cols,
                height: cellSize * rows,
                touchAction: 'none',
              }}
              role="img"
              aria-label={ariaLabel}
              aria-describedby={ariaDescribedBy}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onContextMenu={handleContextMenu}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export const NonogramBoardCanvas = memo(NonogramBoardCanvasComponent);
