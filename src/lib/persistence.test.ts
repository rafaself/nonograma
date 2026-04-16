import { beforeEach, describe, expect, it } from 'vitest';
import { CellState } from './game-logic';
import { persistence } from './persistence';

describe('persistence', () => {
  beforeEach(() => {
    persistence.flushSave();
    localStorage.clear();
  });

  it('saves and loads a game', () => {
    const grid = [[CellState.FILLED, CellState.EMPTY]];
    persistence.saveGame('id-1', grid, 12);
    persistence.flushSave();

    expect(persistence.loadGame('id-1')).toEqual({
      grid,
      elapsedTime: 12,
    });
  });

  it('returns null when game is missing', () => {
    expect(persistence.loadGame('missing')).toBeNull();
  });

  it('marks completion only once and returns completion status', () => {
    persistence.markCompleted('p1');
    persistence.markCompleted('p1');
    persistence.markCompleted('p2');

    expect(persistence.getCompletedStatus()).toEqual(['p1', 'p2']);
  });

  it('returns empty completed list when nothing is stored', () => {
    expect(persistence.getCompletedStatus()).toEqual([]);
  });

  it('tracks tutorial completion separately from puzzle completion', () => {
    expect(persistence.getTutorialCompleted()).toBe(false);

    persistence.markTutorialCompleted();

    expect(persistence.getTutorialCompleted()).toBe(true);
    expect(persistence.hasAnyPuzzleProgress()).toBe(true);
  });

  it('resets a puzzle save', () => {
    persistence.saveGame('p1', [[CellState.EMPTY]], 0);
    persistence.flushSave();
    persistence.resetPuzzle('p1');
    expect(persistence.loadGame('p1')).toBeNull();
  });

  it('clears pending puzzle saves when resetting a puzzle', () => {
    persistence.saveGame('p1', [[CellState.FILLED]], 3);
    persistence.resetPuzzle('p1');

    persistence.flushSave();

    expect(persistence.loadGame('p1')).toBeNull();
  });

  it('resets all puzzle progress without touching audio settings', () => {
    persistence.saveGame('p1', [[CellState.FILLED]], 7);
    persistence.markCompleted('p2');
    persistence.markTutorialCompleted();
    persistence.setMuted(true);
    persistence.setVolume(0.8);

    expect(persistence.hasAnyPuzzleProgress()).toBe(true);

    persistence.resetAllProgress();
    persistence.flushSave();

    expect(persistence.hasAnyPuzzleProgress()).toBe(false);
    expect(persistence.loadGame('p1')).toBeNull();
    expect(persistence.getCompletedStatus()).toEqual([]);
    expect(persistence.getTutorialCompleted()).toBe(false);
    expect(persistence.getMuted()).toBe(true);
    expect(persistence.getVolume()).toBe(0.8);
  });

  describe('input validation', () => {
    it('throws on empty puzzle id', () => {
      expect(() => persistence.saveGame('', [[CellState.EMPTY]], 0)).toThrow('Invalid puzzle id');
    });

    it('throws on puzzle id with invalid characters', () => {
      expect(() => persistence.loadGame('../etc/passwd')).toThrow('Invalid puzzle id');
    });

    it('throws on puzzle id exceeding max length', () => {
      const longId = 'a'.repeat(65);
      expect(() => persistence.saveGame(longId, [[CellState.EMPTY]], 0)).toThrow('Invalid puzzle id');
    });

    it('accepts valid puzzle ids with alphanumeric, hyphens, and underscores', () => {
      persistence.saveGame('my_puzzle-1', [[CellState.FILLED]], 5);
      persistence.flushSave();
      expect(persistence.loadGame('my_puzzle-1')).toEqual({
        grid: [[CellState.FILLED]],
        elapsedTime: 5,
      });
    });
  });

  describe('corrupted data handling', () => {
    it('returns null and cleans up when save data is corrupted JSON', () => {
      localStorage.setItem('nonogram_save_p1', '{bad json');
      expect(persistence.loadGame('p1')).toBeNull();
      expect(localStorage.getItem('nonogram_save_p1')).toBeNull();
    });

    it('returns null and cleans up when save data has wrong shape', () => {
      localStorage.setItem('nonogram_save_p1', JSON.stringify({ foo: 'bar' }));
      expect(persistence.loadGame('p1')).toBeNull();
      expect(localStorage.getItem('nonogram_save_p1')).toBeNull();
    });

    it('returns null and cleans up when grid contains invalid cell values', () => {
      localStorage.setItem('nonogram_save_p1', JSON.stringify({ grid: [[99]], elapsedTime: 0 }));
      expect(persistence.loadGame('p1')).toBeNull();
      expect(localStorage.getItem('nonogram_save_p1')).toBeNull();
    });

    it('returns null and cleans up when elapsed time is negative', () => {
      localStorage.setItem('nonogram_save_p1', JSON.stringify({ grid: [[0]], elapsedTime: -1 }));
      expect(persistence.loadGame('p1')).toBeNull();
      expect(localStorage.getItem('nonogram_save_p1')).toBeNull();
    });

    it('returns null and cleans up when elapsed time is not finite', () => {
      localStorage.setItem('nonogram_save_p1', JSON.stringify({ grid: [[0]], elapsedTime: Infinity }));
      expect(persistence.loadGame('p1')).toBeNull();
    });

    it('returns empty array and cleans up when completed data is corrupted JSON', () => {
      localStorage.setItem('nonogram_completed', 'not-json');
      expect(persistence.getCompletedStatus()).toEqual([]);
      expect(localStorage.getItem('nonogram_completed')).toBeNull();
    });

    it('returns empty array and cleans up when completed data is not a string array', () => {
      localStorage.setItem('nonogram_completed', JSON.stringify([1, 2, 3]));
      expect(persistence.getCompletedStatus()).toEqual([]);
      expect(localStorage.getItem('nonogram_completed')).toBeNull();
    });

    it('returns null and cleans up when grid has empty rows', () => {
      localStorage.setItem('nonogram_save_p1', JSON.stringify({ grid: [[]], elapsedTime: 0 }));
      expect(persistence.loadGame('p1')).toBeNull();
      expect(localStorage.getItem('nonogram_save_p1')).toBeNull();
    });

    it('returns null and cleans up when grid is empty', () => {
      localStorage.setItem('nonogram_save_p1', JSON.stringify({ grid: [], elapsedTime: 0 }));
      expect(persistence.loadGame('p1')).toBeNull();
      expect(localStorage.getItem('nonogram_save_p1')).toBeNull();
    });
  });
});
