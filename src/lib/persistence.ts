import { CellState } from './game-logic';

const STORAGE_KEY_PREFIX = 'nonogram_save_';
const COMPLETED_KEY = 'nonogram_completed';

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

    resetPuzzle(puzzleId: string) {
        const id = sanitizeId(puzzleId);
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
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
    }
};
