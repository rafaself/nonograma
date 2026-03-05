export interface BoardLayout {
  cellSize: number;
  canvasWidth: number;
  canvasHeight: number;
  dpr: number;
}

/**
 * Computes cell size and canvas dimensions to fit the available space.
 * cellSize is clamped to [minCell, maxCell] CSS pixels.
 */
export function computeBoardLayout(
  containerWidth: number,
  availableHeight: number,
  gridCols: number,
  gridRows: number,
  rowClueWidth: number,
  colClueHeight: number,
  minCell = 20,
  maxCell = 48,
): BoardLayout {
  const availW = containerWidth - rowClueWidth;
  const availH = availableHeight - colClueHeight;
  const sizeFromW = availW / gridCols;
  const sizeFromH = availH / gridRows;
  const cellSize = Math.max(minCell, Math.min(maxCell, Math.floor(Math.min(sizeFromW, sizeFromH))));
  const dpr = window.devicePixelRatio || 1;

  return {
    cellSize,
    canvasWidth: cellSize * gridCols,
    canvasHeight: cellSize * gridRows,
    dpr,
  };
}
