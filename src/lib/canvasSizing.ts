/**
 * Computes the optimal cell size (in CSS pixels) to fit the board in the available space.
 * Result is clamped to [minCell, maxCell].
 */
export function computeCellSize(
  containerWidth: number,
  availableHeight: number,
  gridCols: number,
  gridRows: number,
  rowClueWidth: number,
  colClueHeight: number,
  minCell = 20,
  maxCell = 48,
): number {
  const availW = containerWidth - rowClueWidth;
  const availH = availableHeight - colClueHeight;
  const sizeFromW = availW / gridCols;
  const sizeFromH = availH / gridRows;
  return Math.max(minCell, Math.min(maxCell, Math.floor(Math.min(sizeFromW, sizeFromH))));
}
