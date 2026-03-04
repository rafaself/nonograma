import { CellState } from './game-logic';

const STORAGE_KEY_PREFIX = 'nonogram_save_';
const COMPLETED_KEY = 'nonogram_completed';

interface SaveData {
    grid: CellState[][];
    elapsedTime: number;
}

export const persistence = {
    saveGame(puzzleId: string, grid: CellState[][], elapsedTime: number) {
        const data: SaveData = { grid, elapsedTime };
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${puzzleId}`, JSON.stringify(data));
    },

    loadGame(puzzleId: string): SaveData | null {
        const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${puzzleId}`);
        return data ? JSON.parse(data) : null;
    },

    markCompleted(puzzleId: string) {
        const completed = this.getCompletedStatus();
        if (!completed.includes(puzzleId)) {
            completed.push(puzzleId);
            localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
        }
    },

    getCompletedStatus(): string[] {
        const data = localStorage.getItem(COMPLETED_KEY);
        return data ? JSON.parse(data) : [];
    },

    resetPuzzle(puzzleId: string) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${puzzleId}`);
    }
};
