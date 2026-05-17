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

function getStorage(): Storage {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
        return window.localStorage;
    }

    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        return globalThis.localStorage as Storage;
    }

    throw new Error('localStorage is not available');
}

/**
 * Debounced save: during drag operations saveGame can fire dozens of times
 * per second. We coalesce writes so localStorage.setItem + JSON.stringify
 * only happens once per 300 ms.
 */
let pendingSaveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSaveData: { key: string; data: SaveData } | null = null;

function flushPendingSave(): void {
    const storage = getStorage();
    if (pendingSaveData) {
        storage.setItem(pendingSaveData.key, JSON.stringify(pendingSaveData.data));
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
    const storage = getStorage();
    const id = sanitizeId(puzzleId);
    const raw = storage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    if (raw === null) return null;

    const parsed = safeParse(raw);
    if (!isValidSaveData(parsed)) {
      storage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
      return null;
    }
    return parsed;
  },

  getInProgressPuzzleIds(): string[] {
    const storage = getStorage();
    const ids = new Set<string>();

    if (pendingSaveData !== null) {
      const pendingId = pendingSaveData.key.slice(STORAGE_KEY_PREFIX.length);
      if (SAFE_ID.test(pendingId)) {
        ids.add(pendingId);
      }
    }

    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key === null || !key.startsWith(STORAGE_KEY_PREFIX)) {
        continue;
      }

      const id = key.slice(STORAGE_KEY_PREFIX.length);
      if (!SAFE_ID.test(id)) {
        storage.removeItem(key);
        continue;
      }

      if (this.loadGame(id) !== null) {
        ids.add(id);
      }
    }

    return [...ids];
  },

  setLastPlayedPuzzleId(puzzleId: string) {
    const storage = getStorage();
    const id = sanitizeId(puzzleId);
    storage.setItem(LAST_PLAYED_KEY, id);
  },

  getLastPlayedPuzzleId(): string | null {
    const storage = getStorage();
    const raw = storage.getItem(LAST_PLAYED_KEY);
    if (raw === null) {
      return null;
    }
    if (!SAFE_ID.test(raw)) {
      storage.removeItem(LAST_PLAYED_KEY);
      return null;
    }
    return raw;
  },

  clearLastPlayedPuzzleId() {
    getStorage().removeItem(LAST_PLAYED_KEY);
  },

  markCompleted(puzzleId: string) {
    const storage = getStorage();
    const id = sanitizeId(puzzleId);
    const completed = this.getCompletedStatus();
    if (!completed.includes(id)) {
      completed.push(id);
      storage.setItem(COMPLETED_KEY, JSON.stringify(completed));
    }
  },

  getCompletedStatus(): string[] {
    const storage = getStorage();
    const raw = storage.getItem(COMPLETED_KEY);
    if (raw === null) return [];

    const parsed = safeParse(raw);
    if (!isStringArray(parsed)) {
      storage.removeItem(COMPLETED_KEY);
      return [];
    }
    return parsed;
  },

  markTutorialCompleted() {
    getStorage().setItem(TUTORIAL_COMPLETED_KEY, 'true');
  },

  getTutorialCompleted(): boolean {
    return getStorage().getItem(TUTORIAL_COMPLETED_KEY) === 'true';
  },

  resetPuzzle(puzzleId: string) {
    const storage = getStorage();
    const id = sanitizeId(puzzleId);
    const key = `${STORAGE_KEY_PREFIX}${id}`;
    clearPendingSave(key);
    storage.removeItem(key);
    if (this.getLastPlayedPuzzleId() === id) {
      this.clearLastPlayedPuzzleId();
    }
  },

  resetAllProgress() {
    const storage = getStorage();
    clearPendingSave();

    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
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

    keysToRemove.forEach((key) => storage.removeItem(key));
  },

  hasAnyPuzzleProgress(): boolean {
    const storage = getStorage();
    if (this.getInProgressPuzzleIds().length > 0) return true;
    if (storage.getItem(COMPLETED_KEY) !== null) return true;
    if (this.getTutorialCompleted()) return true;

    return false;
  },

  getMuted(): boolean {
    return getStorage().getItem('nonogram_muted') === 'true';
  },

  setMuted(muted: boolean) {
    getStorage().setItem('nonogram_muted', muted.toString());
  },

  getVolume(): number {
    const val = getStorage().getItem('nonogram_volume');
    return val ? parseFloat(val) : 0.5;
  },

  setVolume(volume: number) {
    getStorage().setItem('nonogram_volume', volume.toString());
  },
};
