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

export interface ClueLayoutMetrics {
  fontSize: number;
  spacing: number;
  rowClueWidth: number;
  colClueHeight: number;
}

export interface StableCellSizeOptions {
  initialCellSize?: number;
  minCell?: number;
  maxCell?: number;
  maxIterations?: number;
}

function getDefaultMaxCellSize(gridCols: number, gridRows: number): number {
  const largestDimension = Math.max(gridCols, gridRows);

  if (largestDimension <= 5) {
    return 96;
  }

  if (largestDimension <= 10) {
    return 72;
  }

  if (largestDimension <= 15) {
    return 56;
  }

  return 48;
}

const CLUE_SPACING = 5;
const CLUE_ROW_PADDING = 8;
const CLUE_COL_PADDING = 6;
const MIN_CLUE_FONT_SIZE = 10;
const MAX_CLUE_FONT_SIZE = 18;
const CLUE_FONT_SCALE = 0.45;

export function computeClueLayoutMetrics(
  cellSize: number,
  maxRowClueCount: number,
  maxColClueCount: number,
): ClueLayoutMetrics {
  const fontSize = Math.max(MIN_CLUE_FONT_SIZE, Math.min(MAX_CLUE_FONT_SIZE, cellSize * CLUE_FONT_SCALE));

  return {
    fontSize,
    spacing: CLUE_SPACING,
    rowClueWidth: maxRowClueCount * (fontSize * 1.2 + CLUE_SPACING) + CLUE_ROW_PADDING,
    colClueHeight: maxColClueCount * (fontSize * 1.2 + CLUE_SPACING) + CLUE_COL_PADDING,
  };
}

export function computeStableCellSize(
  containerWidth: number,
  availableHeight: number,
  gridCols: number,
  gridRows: number,
  maxRowClueCount: number,
  maxColClueCount: number,
  {
    initialCellSize = 32,
    minCell = 20,
    maxCell,
    maxIterations = 12,
  }: StableCellSizeOptions = {},
): number {
  const seenCellSizes = new Map<number, number>();
  const history: number[] = [];
  const resolvedMaxCell = maxCell ?? getDefaultMaxCellSize(gridCols, gridRows);
  let cellSize = initialCellSize;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const cycleStart = seenCellSizes.get(cellSize);
    if (cycleStart !== undefined) {
      return Math.min(...history.slice(cycleStart));
    }

    seenCellSizes.set(cellSize, history.length);
    history.push(cellSize);

    const { rowClueWidth, colClueHeight } = computeClueLayoutMetrics(
      cellSize,
      maxRowClueCount,
      maxColClueCount,
    );
    const nextCellSize = computeCellSize(
      containerWidth,
      availableHeight,
      gridCols,
      gridRows,
      rowClueWidth,
      colClueHeight,
      minCell,
      resolvedMaxCell,
    );

    if (nextCellSize === cellSize) {
      return cellSize;
    }

    cellSize = nextCellSize;
  }

  return Math.min(...history);
}
