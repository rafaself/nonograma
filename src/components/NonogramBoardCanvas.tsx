import { useRef, useState, useEffect, useCallback, useMemo, memo } from 'react';
import { CellState, isLineSatisfied } from '../lib/game-logic';
import type { Clues } from '../lib/game-logic';
import { computeCellSize } from '../lib/canvasSizing';
import { renderBoard, hitTest } from '../lib/boardRender';
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
}

interface DragState {
  active: boolean;
  action: 'fill' | 'mark_x';
  visitedCells: Set<string>;
}

const NonogramBoardCanvasBase: React.FC<NonogramBoardCanvasProps> = ({
  grid,
  clues,
  onCellAction,
  isSolved,
  inputMode,
  resultColors,
  backgroundColors,
  onDragStart,
  onDragEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const rows = grid.length;
  const cols = grid[0].length;

  const [cellSize, setCellSize] = useState(32);

  const { fontSize, spacing, rowClueWidth, colClueHeight } = useMemo(() => {
    const maxRowLen = Math.max(...clues.rows.map(r => r.length));
    const maxColLen = Math.max(...clues.cols.map(c => c.length));
    const fs = Math.max(10, Math.min(18, cellSize * 0.45));
    const sp = 5;
    return {
      fontSize: fs,
      spacing: sp,
      rowClueWidth: maxRowLen * (fs * 1.2 + sp) + 8,
      colClueHeight: maxColLen * (fs * 1.2 + sp) + 6,
    };
  }, [clues, cellSize]);

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

  // --- Resize ---
  /* c8 ignore start */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const availW = el.clientWidth;
      const availH = window.innerHeight - 180;
      setCellSize(computeCellSize(availW, availH, cols, rows, rowClueWidth, colClueHeight));
    };

    compute();
    let rafId = 0;
    const onResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(compute);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, [cols, rows, rowClueWidth, colClueHeight]);
  /* c8 ignore stop */

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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      return hitTest(x, y, cellSize, rows, cols);
    },
    [cellSize, rows, cols],
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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isSolved) return;
      e.currentTarget.setPointerCapture(e.pointerId);

      const cell = getCell(e);
      if (!cell) return;

      const action = resolveAction(e);
      onDragStart?.();
      dragRef.current = {
        active: true,
        action,
        visitedCells: new Set([`${cell.row},${cell.col}`]),
      };
      onCellAction(cell.row, cell.col, action);
    },
    [isSolved, getCell, resolveAction, onCellAction, onDragStart],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      if (!drag?.active) return;

      const cell = getCell(e);
      if (!cell) return;

      const key = `${cell.row},${cell.col}`;
      if (drag.visitedCells.has(key)) return;

      drag.visitedCells.add(key);
      onCellAction(cell.row, cell.col, drag.action);
    },
    [getCell, onCellAction],
  );

  const handlePointerUp = useCallback(() => {
    if (dragRef.current) {
      onDragEnd?.();
    }
    dragRef.current = null;
  }, [onDragEnd]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div ref={containerRef} className="flex items-center justify-center select-none w-full">
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `${rowClueWidth}px ${cellSize * cols}px`,
          gridTemplateRows: `${colClueHeight}px ${cellSize * rows}px`,
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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onContextMenu={handleContextMenu}
        />
      </div>
    </div>
  );
};

export const NonogramBoardCanvas = memo(NonogramBoardCanvasBase);
