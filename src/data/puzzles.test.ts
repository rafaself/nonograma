import { describe, expect, it } from 'vitest';
import { CellState } from '../lib/game-logic';
import type { Puzzle } from '../lib/game-logic';
import { __puzzlesInternals, PUZZLES, TUTORIAL_PUZZLE } from './puzzles';

const basePuzzle: Puzzle = {
  id: '2x2-1',
  title: 'Ok',
  width: 2,
  height: 2,
  solution: [
    [true, false],
    [false, true],
  ],
};

describe('puzzles internals', () => {
  it('normalizes resultColors with defaults', () => {
    const normalized = __puzzlesInternals.normalizePuzzles([basePuzzle]);
    expect(normalized[0].resultColors).toEqual([
      [__puzzlesInternals.DEFAULT_RESULT_COLOR, null],
      [null, __puzzlesInternals.DEFAULT_RESULT_COLOR],
    ]);
  });

  it('uses explicit result colors when provided', () => {
    const puzzle: Puzzle = {
      ...basePuzzle,
      id: '2x2-2',
      resultColors: [
        ['#AABBCC', null],
        [null, '#DDEEFF'],
      ],
    };

    expect(__puzzlesInternals.buildResultColors(puzzle)).toEqual([
      ['#aabbcc', null],
      [null, '#ddeeff'],
    ]);
  });

  it('normalizes backgroundColors when provided', () => {
    const puzzle: Puzzle = {
      ...basePuzzle,
      id: '2x2-3',
      backgroundColors: [
        ['#1D4E89', '#1D4E89'],
        ['#1D4E89', null],
      ],
    };

    expect(__puzzlesInternals.buildBackgroundColors(puzzle)).toEqual([
      ['#1d4e89', '#1d4e89'],
      ['#1d4e89', null],
    ]);
  });

  it('throws for empty id', () => {
    expect(() => __puzzlesInternals.validatePuzzleShape({ ...basePuzzle, id: '  ' }, new Set())).toThrow(
      'Puzzle with empty id found.',
    );
  });

  it('throws for invalid id format', () => {
    expect(() => __puzzlesInternals.validatePuzzleShape({ ...basePuzzle, id: 'bad-id' }, new Set())).toThrow(
      'bad-id: id must match ^\\d+x\\d+-\\d+$.',
    );
  });

  it('throws for duplicate id', () => {
    const seen = new Set(['2x2-1']);
    expect(() => __puzzlesInternals.validatePuzzleShape(basePuzzle, seen)).toThrow(
      'Duplicate puzzle id: 2x2-1',
    );
  });

  it('throws for declared height mismatch', () => {
    expect(() =>
      __puzzlesInternals.validatePuzzleShape({ ...basePuzzle, id: '2x2-4', height: 3 }, new Set()),
    ).toThrow('2x2-4: declared height (3) does not match derived height (2).');
  });

  it('throws for row width mismatch', () => {
    const invalid: Puzzle = {
      ...basePuzzle,
      id: '2x2-5',
      solution: [[true, false], [false]],
    };

    expect(() => __puzzlesInternals.validatePuzzleShape(invalid, new Set())).toThrow(
      '2x2-5: solution row width (1) does not match derived width (2) at row 1.',
    );
  });

  it('throws for backgroundColors height mismatch', () => {
    expect(() =>
      __puzzlesInternals.validatePuzzleShape({
        ...basePuzzle,
        id: '2x2-6',
        backgroundColors: [['#1d4e89', '#1d4e89']],
      }, new Set()),
    ).toThrow('2x2-6: backgroundColors height (1) does not match derived height (2).');
  });

  it('throws for resultColors height mismatch', () => {
    expect(() =>
      __puzzlesInternals.validatePuzzleShape({
        ...basePuzzle,
        id: '2x2-7',
        resultColors: [['#1d4e89', null]],
      }, new Set()),
    ).toThrow('2x2-7: resultColors height (1) does not match derived height (2).');
  });

  it('throws for non-null result color on an empty solution cell', () => {
    expect(() =>
      __puzzlesInternals.validatePuzzleShape({
        ...basePuzzle,
        id: '2x2-8',
        resultColors: [
          ['#1d4e89', '#1d4e89'],
          [null, '#1d4e89'],
        ],
      }, new Set()),
    ).toThrow('2x2-8: resultColors[0][1] must be null for empty solution cells.');
  });

  it('throws for invalid result color format', () => {
    expect(() =>
      __puzzlesInternals.validatePuzzleShape({
        ...basePuzzle,
        id: '2x2-9',
        resultColors: [
          ['#123', null],
          [null, '#1d4e89'],
        ],
      }, new Set()),
    ).toThrow('2x2-9: resultColors[0][0] must be a 6-digit hex color (#rrggbb).');
  });

  it('throws for invalid initialGrid height mismatch', () => {
    expect(() =>
      __puzzlesInternals.validatePuzzleShape({
        ...basePuzzle,
        id: '2x2-10',
        initialGrid: [[CellState.EMPTY, CellState.FILLED]],
      }, new Set()),
    ).toThrow('2x2-10: initialGrid height (1) does not match derived height (2).');
  });

  it('throws for invalid initialGrid cell values', () => {
    expect(() =>
      __puzzlesInternals.validatePuzzleShape({
        ...basePuzzle,
        id: '2x2-11',
        initialGrid: [
          [CellState.EMPTY, 9 as CellState],
          [CellState.MARKED_X, CellState.FILLED],
        ],
      }, new Set()),
    ).toThrow('2x2-11: initialGrid[0][1] must be a valid CellState.');
  });

  it('derives width/height from solution during normalization', () => {
    const rawPuzzle = {
      id: '3x2-1',
      title: 'Raw',
      solution: [
        [true, false, true],
        [false, false, false],
      ],
    };

    const [normalized] = __puzzlesInternals.normalizePuzzles([rawPuzzle]);
    expect(normalized.width).toBe(3);
    expect(normalized.height).toBe(2);
  });

  it('exports a non-empty normalized puzzle list', () => {
    expect(PUZZLES.length).toBeGreaterThan(0);
    expect(PUZZLES.every((p) => p.resultColors && p.resultColors.length === p.height)).toBe(true);
  });

  it('exports the expected catalog distribution', () => {
    expect(PUZZLES).toHaveLength(95);

    const countsByWidth = PUZZLES.reduce<Record<number, number>>((acc, puzzle) => {
      acc[puzzle.width] = (acc[puzzle.width] ?? 0) + 1;
      return acc;
    }, {});

    expect(countsByWidth).toEqual({
      5: 25,
      10: 25,
      15: 25,
      20: 20,
    });
  });

  it('exports a guided tutorial puzzle outside the main catalog', () => {
    expect(TUTORIAL_PUZZLE.id).toBe('4x4-1');
    expect(TUTORIAL_PUZZLE.width).toBe(4);
    expect(TUTORIAL_PUZZLE.height).toBe(4);
    expect(TUTORIAL_PUZZLE.initialGrid).toBeDefined();
    expect(TUTORIAL_PUZZLE.tutorial?.steps).toHaveLength(3);
    expect(PUZZLES.some((puzzle) => puzzle.id === TUTORIAL_PUZZLE.id)).toBe(false);
  });
});
