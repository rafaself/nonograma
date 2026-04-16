import { describe, expect, it } from 'vitest';
import { __puzzlesInternals, PUZZLES } from './puzzles';
import { CellState, checkWin, deriveClues } from '../lib/game-logic';

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

    it('every level exports a complete resultColors grid', () => {
        for (const puzzle of PUZZLES) {
            expect(puzzle.resultColors, `${puzzle.id}: missing resultColors`).toBeDefined();
            expect(puzzle.resultColors?.length, `${puzzle.id}: resultColors height mismatch`).toBe(puzzle.height);

            for (let r = 0; r < puzzle.height; r++) {
                const colorRow = puzzle.resultColors?.[r] ?? [];
                expect(colorRow.length, `${puzzle.id}: resultColors row width mismatch at row ${r}`).toBe(puzzle.width);

                for (let c = 0; c < puzzle.width; c++) {
                    if (!puzzle.solution[r][c]) {
                        expect(colorRow[c], `${puzzle.id}: empty cell has color at (${r}, ${c})`).toBeNull();
                    } else {
                        expect(typeof colorRow[c], `${puzzle.id}: filled cell missing color at (${r}, ${c})`).toBe('string');
                    }
                }
            }
        }
    });

    it('normalizes all exported colors to lowercase 6-digit hex values', () => {
        const hexColor = /^#[0-9a-f]{6}$/;

        for (const puzzle of PUZZLES) {
            for (const row of puzzle.resultColors ?? []) {
                for (const color of row) {
                    if (color !== null) {
                        expect(hexColor.test(color), `${puzzle.id}: non-canonical result color ${color}`).toBe(true);
                    }
                }
            }

            for (const row of puzzle.backgroundColors ?? []) {
                for (const color of row) {
                    if (color !== null) {
                        expect(hexColor.test(color), `${puzzle.id}: non-canonical background color ${color}`).toBe(true);
                    }
                }
            }
        }
    });

    it('backgroundColors grids align with puzzle dimensions when present', () => {
        for (const puzzle of PUZZLES) {
            if (!puzzle.backgroundColors) {
                continue;
            }

            expect(puzzle.backgroundColors.length, `${puzzle.id}: backgroundColors height mismatch`).toBe(puzzle.height);

            for (let r = 0; r < puzzle.height; r++) {
                const colorRow = puzzle.backgroundColors[r] ?? [];
                expect(colorRow.length, `${puzzle.id}: backgroundColors row width mismatch at row ${r}`).toBe(puzzle.width);
            }
        }
    });

    it('ships authored non-default finish palettes for the upgraded major levels', () => {
        const upgradedIds = new Set([
            '10x10-8',
            '15x15-1',
            '15x15-2',
            '15x15-3',
            '15x15-4',
            '15x15-5',
            ...Array.from({ length: 10 }, (_, i) => `15x15-${i + 16}`),
            ...Array.from({ length: 10 }, (_, i) => `20x20-${i + 11}`),
        ]);

        for (const puzzle of PUZZLES) {
            if (!upgradedIds.has(puzzle.id)) {
                continue;
            }

            const flatColors = puzzle.resultColors?.flat().filter((color): color is string => typeof color === 'string') ?? [];
            expect(flatColors.length, `${puzzle.id}: expected solved colors`).toBeGreaterThan(0);
            expect(
                flatColors.every((color) => color !== __puzzlesInternals.DEFAULT_RESULT_COLOR),
                `${puzzle.id}: still uses default solved color`,
            ).toBe(true);
        }
    });

    it('exports scenic background palettes for the intended scene-based puzzles', () => {
        const scenicIds = [
            '5x5-5',
            '5x5-19',
            '5x5-20',
            '5x5-25',
            '10x10-2',
            '10x10-5',
            '10x10-6',
            '10x10-10',
            '10x10-16',
            '10x10-18',
            '10x10-19',
            '10x10-24',
            '15x15-1',
            '15x15-2',
            '15x15-3',
            '15x15-4',
            '15x15-5',
            ...Array.from({ length: 10 }, (_, i) => `15x15-${i + 16}`),
            '20x20-11',
            '20x20-12',
            ...Array.from({ length: 7 }, (_, i) => `20x20-${i + 14}`),
        ];

        for (const id of scenicIds) {
            const puzzle = PUZZLES.find((entry) => entry.id === id);
            expect(puzzle, `${id}: puzzle missing`).toBeDefined();
            expect(puzzle?.backgroundColors, `${id}: missing backgroundColors`).toBeDefined();
        }
    });
});
