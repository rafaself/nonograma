import { describe, expect, it } from 'vitest';
import { PUZZLES } from '../data/puzzles';
import { CellState, checkWin, deriveClues } from './game-logic';

describe('puzzle solvability', () => {
    it('every level has a structurally valid solution grid', () => {
        for (const puzzle of PUZZLES) {
            expect(puzzle.solution.length, `${puzzle.id}: height mismatch`).toBe(puzzle.height);

            for (const row of puzzle.solution) {
                expect(row.length, `${puzzle.id}: width mismatch`).toBe(puzzle.width);
            }
        }
    });

    it('every level has at least one valid solution', () => {
        for (const puzzle of PUZZLES) {
            const clues = deriveClues(puzzle.solution);
            const candidateGrid = puzzle.solution.map(row =>
                row.map(cell => (cell ? CellState.FILLED : CellState.EMPTY))
            );

            expect(clues.rows.length, `${puzzle.id}: row clues count mismatch`).toBe(puzzle.height);
            expect(clues.cols.length, `${puzzle.id}: col clues count mismatch`).toBe(puzzle.width);
            expect(checkWin(candidateGrid, clues), `${puzzle.id}: no valid solution found`).toBe(true);
        }
    });
});
