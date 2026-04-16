import { CellState } from './game-logic';

const STORAGE_KEY_PREFIX = 'nonogram_save_';
const COMPLETED_KEY = 'nonogram_completed';
const TUTORIAL_COMPLETED_KEY = 'nonogram_tutorial_completed';
const LAST_PLAYED_KEY = 'nonogram_last_played';

export interface SaveData {
    grid: CellState[][];
    elapsedTime: number;
}

/** Only allow alphanumeric IDs with hyphens/underscores (max 64 chars). */
const SAFE_ID = /^[a-zA-Z0-9_-]{1,64}$/;

function sanitizeId(puzzleId: string): string {
    if (!SAFE_ID.test(puzzleId)) {
        throw new Error(`Invalid puzzle id: ${puzzleId}`);
    }
    return puzzleId;
}

const validCellValues = new Set<number>([CellState.EMPTY, CellState.FILLED, CellState.MARKED_X]);

function isValidGrid(grid: unknown): grid is CellState[][] {
    return (
        Array.isArray(grid) &&
        grid.length > 0 &&
        grid.every(
            (row) =>
                Array.isArray(row) &&
                row.length > 0 &&
                row.every((cell: unknown) => typeof cell === 'number' && validCellValues.has(cell)),
        )
    );
}

function isValidSaveData(data: unknown): data is SaveData {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return (
        typeof obj.elapsedTime === 'number' &&
        obj.elapsedTime >= 0 &&
        Number.isFinite(obj.elapsedTime) &&
        isValidGrid(obj.grid)
    );
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

function safeParse(raw: string): unknown {
    try {
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
}

/**
 * Debounced save: during drag operations saveGame can fire dozens of times
 * per second. We coalesce writes so localStorage.setItem + JSON.stringify
 * only happens once per 300 ms.
 */
let pendingSaveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSaveData: { key: string; data: SaveData } | null = null;

function flushPendingSave(): void {
    if (pendingSaveData) {
        localStorage.setItem(pendingSaveData.key, JSON.stringify(pendingSaveData.data));
        pendingSaveData = null;
    }
    if (pendingSaveTimer !== null) {
        clearTimeout(pendingSaveTimer);
        pendingSaveTimer = null;
    }
}

function clearPendingSave(key?: string): void {
    if (key !== undefined && pendingSaveData?.key !== key) return;

    pendingSaveData = null;
    if (pendingSaveTimer !== null) {
        clearTimeout(pendingSaveTimer);
        pendingSaveTimer = null;
    }
}

export const persistence = {
  saveGame(puzzleId: string, grid: CellState[][], elapsedTime: number) {
    const id = sanitizeId(puzzleId);
    const key = `${STORAGE_KEY_PREFIX}${id}`;
    const data: SaveData = { grid, elapsedTime };

    // Store latest data and (re)start the debounce timer
    pendingSaveData = { key, data };
    if (pendingSaveTimer !== null) clearTimeout(pendingSaveTimer);
    pendingSaveTimer = setTimeout(flushPendingSave, 300);
  },

  /** Force any pending save to disk immediately (e.g. before navigation). */
  flushSave() {
    flushPendingSave();
  },

  loadGame(puzzleId: string): SaveData | null {
    const id = sanitizeId(puzzleId);
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    if (raw === null) return null;

    const parsed = safeParse(raw);
    if (!isValidSaveData(parsed)) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
      return null;
    }
    return parsed;
  },

  getInProgressPuzzleIds(): string[] {
    const ids = new Set<string>();

    if (pendingSaveData !== null) {
      const pendingId = pendingSaveData.key.slice(STORAGE_KEY_PREFIX.length);
      if (SAFE_ID.test(pendingId)) {
        ids.add(pendingId);
      }
    }

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key === null || !key.startsWith(STORAGE_KEY_PREFIX)) {
        continue;
      }

      const id = key.slice(STORAGE_KEY_PREFIX.length);
      if (!SAFE_ID.test(id)) {
        localStorage.removeItem(key);
        continue;
      }

      if (this.loadGame(id) !== null) {
        ids.add(id);
      }
    }

    return [...ids];
  },

  setLastPlayedPuzzleId(puzzleId: string) {
    const id = sanitizeId(puzzleId);
    localStorage.setItem(LAST_PLAYED_KEY, id);
  },

  getLastPlayedPuzzleId(): string | null {
    const raw = localStorage.getItem(LAST_PLAYED_KEY);
    if (raw === null) {
      return null;
    }
    if (!SAFE_ID.test(raw)) {
      localStorage.removeItem(LAST_PLAYED_KEY);
      return null;
    }
    return raw;
  },

  clearLastPlayedPuzzleId() {
    localStorage.removeItem(LAST_PLAYED_KEY);
  },

  markCompleted(puzzleId: string) {
    const id = sanitizeId(puzzleId);
    const completed = this.getCompletedStatus();
    if (!completed.includes(id)) {
      completed.push(id);
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
    }
  },

  getCompletedStatus(): string[] {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (raw === null) return [];

    const parsed = safeParse(raw);
    if (!isStringArray(parsed)) {
      localStorage.removeItem(COMPLETED_KEY);
      return [];
    }
    return parsed;
  },

  markTutorialCompleted() {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
  },

  getTutorialCompleted(): boolean {
    return localStorage.getItem(TUTORIAL_COMPLETED_KEY) === 'true';
  },

  resetPuzzle(puzzleId: string) {
    const id = sanitizeId(puzzleId);
    const key = `${STORAGE_KEY_PREFIX}${id}`;
    clearPendingSave(key);
    localStorage.removeItem(key);
    if (this.getLastPlayedPuzzleId() === id) {
      this.clearLastPlayedPuzzleId();
    }
  },

  resetAllProgress() {
    clearPendingSave();

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (
        key !== null &&
        (key.startsWith(STORAGE_KEY_PREFIX) ||
          key === COMPLETED_KEY ||
          key === TUTORIAL_COMPLETED_KEY ||
          key === LAST_PLAYED_KEY)
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },

  hasAnyPuzzleProgress(): boolean {
    if (this.getInProgressPuzzleIds().length > 0) return true;
    if (localStorage.getItem(COMPLETED_KEY) !== null) return true;
    if (this.getTutorialCompleted()) return true;

    return false;
  },

  getMuted(): boolean {
    return localStorage.getItem('nonogram_muted') === 'true';
  },

  setMuted(muted: boolean) {
    localStorage.setItem('nonogram_muted', muted.toString());
  },

  getVolume(): number {
    const val = localStorage.getItem('nonogram_volume');
    return val ? parseFloat(val) : 0.5;
  },

  setVolume(volume: number) {
    localStorage.setItem('nonogram_volume', volume.toString());
  },
};
