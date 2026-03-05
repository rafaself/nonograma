import { CellState } from './game-logic';

export interface RenderParams {
  ctx: CanvasRenderingContext2D;
  grid: CellState[][];
  cellSize: number;
  isSolved: boolean;
  dpr: number;
  resultColors?: (string | null)[][];
}

/**
 * Full board redraw. Call whenever grid state, size, or solved status changes.
 */
export function renderBoard({ ctx, grid, cellSize, isSolved, dpr, resultColors }: RenderParams): void {
  const rows = grid.length;
  const cols = grid[0].length;
  const w = cellSize * cols;
  const h = cellSize * rows;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  // Draw cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellResultColor = resultColors?.[r]?.[c];
      drawCell(ctx, grid[r][c], c * cellSize, r * cellSize, cellSize, isSolved, cellResultColor);
    }
  }

  // Draw grid lines on top
  drawGridLines(ctx, rows, cols, cellSize, w, h);
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  state: CellState,
  x: number,
  y: number,
  size: number,
  isSolved: boolean,
  resultColor?: string | null,
): void {
  if (state === CellState.FILLED) {
    const inset = 1;
    ctx.fillStyle = isSolved ? (resultColor || '#c9a227') : '#ae2012';
    // Add a slight roundness or "brush" feel by using a smaller rect with rounded corners if possible
    // simplified for now with updated colors
    ctx.fillRect(x + inset, y + inset, size - inset * 2, size - inset * 2);

    // Aesthetic inner glow for solved cells
    if (isSolved) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    }
  } else if (state === CellState.MARKED_X) {
    const pad = Math.max(4, size * 0.25);
    ctx.strokeStyle = '#5a4d41'; // Ink-like brown
    ctx.lineWidth = Math.max(1.5, size * 0.06);
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Slightly randomized "brush" stroke feel
    ctx.moveTo(x + pad, y + pad);
    ctx.lineTo(x + size - pad, y + size - pad);
    ctx.moveTo(x + size - pad, y + pad);
    ctx.lineTo(x + pad, y + size - pad);
    ctx.stroke();
  }
}

function drawGridLines(
  ctx: CanvasRenderingContext2D,
  rows: number,
  cols: number,
  cellSize: number,
  w: number,
  h: number,
): void {
  // Thin lines (1px) for every cell boundary
  ctx.strokeStyle = '#251e16';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let r = 0; r <= rows; r++) {
    if (r % 5 === 0 && r !== 0 && r !== rows) continue;
    const y = r * cellSize + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  for (let c = 0; c <= cols; c++) {
    if (c % 5 === 0 && c !== 0 && c !== cols) continue;
    const x = c * cellSize + 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  ctx.stroke();

  // Thick lines (2px) every 5 cells (interior only)
  ctx.strokeStyle = '#c9a22733'; // Faded Gold
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let r = 5; r < rows; r += 5) {
    const y = r * cellSize;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  for (let c = 5; c < cols; c += 5) {
    const x = c * cellSize;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  ctx.stroke();

  // Border
  ctx.strokeStyle = '#c9a22766';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, w, h);
}

/**
 * Maps canvas-local CSS coordinates to grid row/col.
 * Returns null if the point is outside the grid.
 */
export function hitTest(
  canvasX: number,
  canvasY: number,
  cellSize: number,
  rows: number,
  cols: number,
): { row: number; col: number } | null {
  const col = Math.floor(canvasX / cellSize);
  const row = Math.floor(canvasY / cellSize);
  if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
  return { row, col };
}
