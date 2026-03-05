import { describe, expect, it } from 'vitest';
import type { Puzzle } from '../lib/game-logic';
import { __puzzlesInternals, PUZZLES } from './puzzles';

const basePuzzle: Puzzle = {
  id: 'ok',
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
      id: 'custom',
      resultColors: [
        ['#111', null],
        [null, '#222'],
      ],
    };

    expect(__puzzlesInternals.buildResultColors(puzzle)).toEqual([
      ['#111', null],
      [null, '#222'],
    ]);
  });

  it('normalizes backgroundColors when provided', () => {
    const puzzle: Puzzle = {
      ...basePuzzle,
      id: 'bg',
      backgroundColors: [
        ['#1d4e89', '#1d4e89'],
        ['#1d4e89', null],
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

  it('throws for duplicate id', () => {
    const seen = new Set(['dup']);
    expect(() => __puzzlesInternals.validatePuzzleShape({ ...basePuzzle, id: 'dup' }, seen)).toThrow(
      'Duplicate puzzle id: dup',
    );
  });

  it('throws for height mismatch', () => {
    expect(() =>
      __puzzlesInternals.validatePuzzleShape({ ...basePuzzle, id: 'h', height: 3 }, new Set()),
    ).toThrow('h: solution height (2) does not match declared height (3).');
  });

  it('throws for row width mismatch', () => {
    const invalid: Puzzle = {
      ...basePuzzle,
      id: 'w',
      solution: [[true], [false]],
    };

    expect(() => __puzzlesInternals.validatePuzzleShape(invalid, new Set())).toThrow(
      'w: solution row width (1) does not match declared width (2).',
    );
  });

  it('throws for backgroundColors height mismatch', () => {
    expect(() =>
      __puzzlesInternals.validatePuzzleShape({
        ...basePuzzle,
        id: 'bg-h',
        backgroundColors: [['#1d4e89', '#1d4e89']],
      }, new Set()),
    ).toThrow('bg-h: backgroundColors height (1) does not match declared height (2).');
  });

  it('exports a non-empty normalized puzzle list', () => {
    expect(PUZZLES.length).toBeGreaterThan(0);
    expect(PUZZLES.every((p) => p.resultColors && p.resultColors.length === p.height)).toBe(true);
  });
});
