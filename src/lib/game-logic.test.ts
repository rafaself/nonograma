import { describe, it, expect } from 'vitest';
import { CellState, deriveClues, isLineSatisfied, checkWin } from './game-logic';

describe('game-logic', () => {
    describe('deriveClues', () => {
        it('should derive clues for a simple 3x3 puzzle', () => {
            const solution = [
                [true, false, true],
                [false, true, false],
                [true, true, true],
            ];
            const clues = deriveClues(solution);
            expect(clues.rows).toEqual([[1, 1], [1], [3]]);
            expect(clues.cols).toEqual([[1, 1], [2], [1, 1]]);
        });

        it('should handle empty lines', () => {
            const solution = [
                [false, false],
                [false, false],
            ];
            const clues = deriveClues(solution);
            expect(clues.rows).toEqual([[0], [0]]);
            expect(clues.cols).toEqual([[0], [0]]);
        });
    });

    describe('isLineSatisfied', () => {
        it('should return true for a correctly filled line', () => {
            const cells = [CellState.FILLED, CellState.EMPTY, CellState.FILLED];
            const clues = [1, 1];
            expect(isLineSatisfied(cells, clues)).toBe(true);
        });

        it('should return true for a correctly filled line with MARKED_X', () => {
            const cells = [CellState.FILLED, CellState.MARKED_X, CellState.FILLED];
            const clues = [1, 1];
            expect(isLineSatisfied(cells, clues)).toBe(true);
        });

        it('should return false for an incorrectly filled line', () => {
            const cells = [CellState.FILLED, CellState.FILLED, CellState.EMPTY];
            const clues = [1, 1];
            expect(isLineSatisfied(cells, clues)).toBe(false);
        });

        it('should handle empty clues', () => {
            const cells = [CellState.EMPTY, CellState.MARKED_X];
            const clues = [0];
            expect(isLineSatisfied(cells, clues)).toBe(true);
        });

        it('should fail when clue lengths differ', () => {
            const cells = [CellState.FILLED, CellState.EMPTY, CellState.FILLED];
            const clues = [2];
            expect(isLineSatisfied(cells, clues)).toBe(false);
        });

        it('normalizes empty clues array as zero', () => {
            const cells = [CellState.EMPTY, CellState.MARKED_X];
            expect(isLineSatisfied(cells, [])).toBe(true);
        });
    });

    describe('checkWin', () => {
        it('should return true when all lines are satisfied', () => {
            const grid = [
                [CellState.FILLED, CellState.EMPTY],
                [CellState.EMPTY, CellState.FILLED],
            ];
            const clues = {
                rows: [[1], [1]],
                cols: [[1], [1]],
            };
            expect(checkWin(grid, clues)).toBe(true);
        });

        it('should return false when any line is not satisfied', () => {
            const grid = [
                [CellState.FILLED, CellState.FILLED],
                [CellState.EMPTY, CellState.FILLED],
            ];
            const clues = {
                rows: [[1], [1]],
                cols: [[1], [1]],
            };
            expect(checkWin(grid, clues)).toBe(false);
        });

        it('should return false when a column is not satisfied', () => {
            const grid = [
                [CellState.FILLED, CellState.EMPTY],
                [CellState.FILLED, CellState.EMPTY],
            ];
            const clues = {
                rows: [[1], [1]],
                cols: [[1], [1]],
            };
            expect(checkWin(grid, clues)).toBe(false);
        });
    });
});
