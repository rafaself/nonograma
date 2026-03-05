import { beforeEach, describe, expect, it } from 'vitest';
import { CellState } from './game-logic';
import { persistence } from './persistence';

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads a game', () => {
    const grid = [[CellState.FILLED, CellState.EMPTY]];
    persistence.saveGame('id-1', grid, 12);

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

  it('resets a puzzle save', () => {
    persistence.saveGame('p1', [[CellState.EMPTY]], 0);
    persistence.resetPuzzle('p1');
    expect(persistence.loadGame('p1')).toBeNull();
  });
});
