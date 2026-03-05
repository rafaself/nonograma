export enum CellState {
    EMPTY = 0,
    FILLED = 1,
    MARKED_X = 2,
}

export interface Puzzle {
    id: string;
    title: string;
    width: number;
    height: number;
    solution: boolean[][]; // [row][col]
    resultColors?: (string | null)[][]; // [row][col], normalized #rrggbb hex or null
    backgroundColors?: (string | null)[][]; // [row][col], solved-state backdrop colors (#rrggbb or null)
}

export interface Clues {
    rows: number[][];
    cols: number[][];
}

export interface GameState {
    grid: CellState[][];
    puzzle: Puzzle;
    clues: Clues;
    isSolved: boolean;
    elapsedTime: number;
}

/**
 * Derives clues from a solution grid.
 */
export function deriveClues(solution: boolean[][]): Clues {
    const height = solution.length;
    const width = solution[0].length;

    const rowClues: number[][] = [];
    for (let r = 0; r < height; r++) {
        const clues: number[] = [];
        let currentCount = 0;
        for (let c = 0; c < width; c++) {
            if (solution[r][c]) {
                currentCount++;
            } else if (currentCount > 0) {
                clues.push(currentCount);
                currentCount = 0;
            }
        }
        if (currentCount > 0) {
            clues.push(currentCount);
        }
        rowClues.push(clues.length > 0 ? clues : [0]);
    }

    const colClues: number[][] = [];
    for (let c = 0; c < width; c++) {
        const clues: number[] = [];
        let currentCount = 0;
        for (let r = 0; r < height; r++) {
            if (solution[r][c]) {
                currentCount++;
            } else if (currentCount > 0) {
                clues.push(currentCount);
                currentCount = 0;
            }
        }
        if (currentCount > 0) {
            clues.push(currentCount);
        }
        colClues.push(clues.length > 0 ? clues : [0]);
    }

    return { rows: rowClues, cols: colClues };
}

/**
 * Checks if a given line (row or column) satisfies its clues.
 * Only FILLED cells are counted.
 */
export function isLineSatisfied(cells: CellState[], clues: number[]): boolean {
    const currentClues: number[] = [];
    let currentCount = 0;

    for (const cell of cells) {
        if (cell === CellState.FILLED) {
            currentCount++;
        } else if (currentCount > 0) {
            currentClues.push(currentCount);
            currentCount = 0;
        }
    }
    if (currentCount > 0) {
        currentClues.push(currentCount);
    }

    const normalizedCurrent = currentClues.length > 0 ? currentClues : [0];
    const normalizedClues = clues.length > 0 ? clues : [0];

    if (normalizedCurrent.length !== normalizedClues.length) return false;
    return normalizedCurrent.every((val, index) => val === normalizedClues[index]);
}

/**
 * Checks if the entire grid satisfies all clues.
 */
export function checkWin(grid: CellState[][], clues: Clues): boolean {
    const height = grid.length;
    // Check rows
    for (let r = 0; r < height; r++) {
        if (!isLineSatisfied(grid[r], clues.rows[r])) return false;
    }

    // Check columns – reuse a single buffer to avoid allocating an array per column
    const width = grid[0].length;
    const colBuffer: CellState[] = new Array(height);
    for (let c = 0; c < width; c++) {
        for (let r = 0; r < height; r++) colBuffer[r] = grid[r][c];
        if (!isLineSatisfied(colBuffer, clues.cols[c])) return false;
    }

    return true;
}

/**
 * Creates an initial empty grid for a puzzle.
 */
export function createEmptyGrid(width: number, height: number): CellState[][] {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, () => CellState.EMPTY)
    );
}
