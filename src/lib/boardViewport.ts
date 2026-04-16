export interface BoardViewport {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface ViewportPoint {
  x: number;
  y: number;
}

const MIN_BOARD_SCALE = 1;
const ABSOLUTE_MAX_BOARD_SCALE = 2.5;
const MIN_INTERACTIVE_MAX_BOARD_SCALE = 1.35;
const TARGET_MAX_RENDERED_CELL_SIZE = 72;

export function getBoardMaxScale(cellSize: number): number {
  if (cellSize <= 0) {
    return MIN_INTERACTIVE_MAX_BOARD_SCALE;
  }

  return Math.max(
    MIN_INTERACTIVE_MAX_BOARD_SCALE,
    Math.min(ABSOLUTE_MAX_BOARD_SCALE, TARGET_MAX_RENDERED_CELL_SIZE / cellSize),
  );
}

export function clampBoardScale(scale: number, maxScale = ABSOLUTE_MAX_BOARD_SCALE): number {
  return Math.max(MIN_BOARD_SCALE, Math.min(Math.max(MIN_BOARD_SCALE, maxScale), scale));
}

export function clampBoardViewport(
  viewport: BoardViewport,
  boardWidth: number,
  boardHeight: number,
  maxScale = ABSOLUTE_MAX_BOARD_SCALE,
): BoardViewport {
  const scale = clampBoardScale(viewport.scale, maxScale);
  const maxOffsetX = (boardWidth * (scale - 1)) / 2;
  const maxOffsetY = (boardHeight * (scale - 1)) / 2;

  return {
    scale,
    offsetX: Math.max(-maxOffsetX, Math.min(maxOffsetX, viewport.offsetX)),
    offsetY: Math.max(-maxOffsetY, Math.min(maxOffsetY, viewport.offsetY)),
  };
}

export function getPinchDistance(a: ViewportPoint, b: ViewportPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function getPinchMidpoint(a: ViewportPoint, b: ViewportPoint): ViewportPoint {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function getPinchViewport(
  startViewport: BoardViewport,
  startPoints: [ViewportPoint, ViewportPoint],
  currentPoints: [ViewportPoint, ViewportPoint],
  boardWidth: number,
  boardHeight: number,
  maxScale = ABSOLUTE_MAX_BOARD_SCALE,
): BoardViewport {
  const baseDistance = getPinchDistance(startPoints[0], startPoints[1]);
  if (baseDistance === 0) {
    return clampBoardViewport(startViewport, boardWidth, boardHeight, maxScale);
  }

  const currentDistance = getPinchDistance(currentPoints[0], currentPoints[1]);
  const nextScale = clampBoardScale(
    startViewport.scale * (currentDistance / baseDistance),
    maxScale,
  );
  const startMidpoint = getPinchMidpoint(startPoints[0], startPoints[1]);
  const currentMidpoint = getPinchMidpoint(currentPoints[0], currentPoints[1]);

  return clampBoardViewport(
    {
      scale: nextScale,
      offsetX: startViewport.offsetX + (currentMidpoint.x - startMidpoint.x),
      offsetY: startViewport.offsetY + (currentMidpoint.y - startMidpoint.y),
    },
    boardWidth,
    boardHeight,
    maxScale,
  );
}

export function toLogicalCanvasPoint(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  logicalWidth: number,
  logicalHeight: number,
): ViewportPoint | null {
  if (rect.width === 0 || rect.height === 0) {
    return null;
  }

  return {
    x: (clientX - rect.left) * (logicalWidth / rect.width),
    y: (clientY - rect.top) * (logicalHeight / rect.height),
  };
}
