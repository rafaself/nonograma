import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CellState, type Puzzle } from '../lib/game-logic';
import { useNonogramGame } from './useNonogramGame';

const mocks = vi.hoisted(() => {
  const puzzleA: Puzzle = {
    id: 'a',
    title: 'A',
    width: 1,
    height: 1,
    solution: [[true]],
  };

  const puzzleB: Puzzle = {
    id: 'b',
    title: 'B',
    width: 1,
    height: 2,
    solution: [[true], [false]],
  };

  const puzzleC: Puzzle = {
    id: 'c',
    title: 'C',
    width: 2,
    height: 1,
    solution: [[true, true]],
  };

  let completedStore: string[] = [];
  let savedGames: Record<string, { grid: CellState[][]; elapsedTime: number }> = {};

  const saveGame = vi.fn((puzzleId: string, grid: CellState[][], elapsedTime: number) => {
    savedGames[puzzleId] = { grid, elapsedTime };
  });
  const loadGame = vi.fn((puzzleId: string) => savedGames[puzzleId] ?? null);
  const markCompleted = vi.fn((puzzleId: string) => {
    if (!completedStore.includes(puzzleId)) completedStore.push(puzzleId);
  });
  const getCompletedStatus = vi.fn(() => [...completedStore]);
  const resetPuzzle = vi.fn((puzzleId: string) => {
    delete savedGames[puzzleId];
  });
  const resetAllProgress = vi.fn(() => {
    completedStore = [];
    savedGames = {};
  });
  const hasAnyPuzzleProgress = vi.fn(() => Object.keys(savedGames).length > 0 || completedStore.length > 0);

  const sounds = {
    fill: vi.fn(),
    markX: vi.fn(),
    erase: vi.fn(),
    undo: vi.fn(),
    reset: vi.fn(),
    lineComplete: vi.fn(),
    win: vi.fn(),
  };

  const resetStores = () => {
    completedStore = [];
    savedGames = {};
  };

  const setSaved = (id: string, grid: CellState[][], elapsedTime: number) => {
    savedGames[id] = { grid, elapsedTime };
  };

  return {
    puzzles: [puzzleA, puzzleB, puzzleC],
    puzzleA,
    puzzleB,
    puzzleC,
    saveGame,
    loadGame,
    markCompleted,
    getCompletedStatus,
    resetPuzzle,
    resetAllProgress,
    hasAnyPuzzleProgress,
    sounds,
    resetStores,
    setSaved,
  };
});

vi.mock('../lib/persistence', () => ({
  persistence: {
    saveGame: (...args: Parameters<typeof mocks.saveGame>) => mocks.saveGame(...args),
    loadGame: (...args: Parameters<typeof mocks.loadGame>) => mocks.loadGame(...args),
    markCompleted: (...args: Parameters<typeof mocks.markCompleted>) => mocks.markCompleted(...args),
    getCompletedStatus: () => mocks.getCompletedStatus(),
    resetPuzzle: (...args: Parameters<typeof mocks.resetPuzzle>) => mocks.resetPuzzle(...args),
    resetAllProgress: () => mocks.resetAllProgress(),
    hasAnyPuzzleProgress: () => mocks.hasAnyPuzzleProgress(),
    flushSave: vi.fn(),
    getMuted: () => false,
    setMuted: vi.fn(),
    getVolume: () => 0.5,
    setVolume: vi.fn(),
  },
}));

vi.mock('../data/puzzles', () => ({
  PUZZLES: mocks.puzzles,
}));

vi.mock('../lib/sounds', () => ({
  sounds: mocks.sounds,
}));

describe('useNonogramGame', () => {
  beforeEach(() => {
    mocks.resetStores();
    vi.clearAllMocks();
  });

  it('starts puzzles, advances, and returns home from last puzzle', () => {
    const { result } = renderHook(() => useNonogramGame());

    expect(result.current.screen).toBe('home');
    expect(result.current.completedIds).toEqual([]);
    expect(result.current.canResetAllProgress).toBe(false);

    act(() => result.current.startPuzzle(mocks.puzzleA));
    expect(result.current.screen).toBe('play');
    expect(result.current.gameState?.puzzle.id).toBe('a');

    act(() => result.current.nextPuzzle());
    expect(result.current.gameState?.puzzle.id).toBe('b');

    act(() => result.current.nextPuzzle());
    expect(result.current.gameState?.puzzle.id).toBe('c');

    act(() => result.current.nextPuzzle());
    expect(result.current.screen).toBe('home');
    expect(result.current.gameState).toBeNull();

    act(() => result.current.nextPuzzle());
    expect(result.current.screen).toBe('home');
  });

  it('supports cell actions, solve flow, undo/redo and no-op when solved', () => {
    const { result } = renderHook(() => useNonogramGame());

    act(() => result.current.startPuzzle(mocks.puzzleC));

    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);

    act(() => result.current.handleCellAction(0, 0));
    expect(mocks.sounds.fill).toHaveBeenCalled();
    expect(mocks.sounds.lineComplete).toHaveBeenCalled();

    act(() => result.current.handleCellAction(0, 0, 2));
    expect(mocks.sounds.markX).toHaveBeenCalled();

    act(() => result.current.handleCellAction(0, 0, 2));
    expect(mocks.sounds.erase).toHaveBeenCalled();

    act(() => result.current.setInputMode(CellState.MARKED_X));
    act(() => result.current.handleCellAction(0, 1));

    act(() => result.current.setInputMode(CellState.FILLED));
    act(() => result.current.handleCellAction(0, 1));
    expect(result.current.gameState?.isSolved).toBe(false);

    act(() => result.current.handleCellAction(0, 1));
    expect(result.current.gameState?.grid[0][1]).toBe(CellState.EMPTY);

    act(() => result.current.handleCellAction(0, 0));
    act(() => result.current.handleCellAction(0, 1));
    expect(result.current.gameState?.isSolved).toBe(true);
    expect(result.current.showVictory).toBe(true);
    expect(result.current.completedIds).toContain('c');
    expect(mocks.sounds.win).toHaveBeenCalled();

    const fillCalls = mocks.sounds.fill.mock.calls.length;
    act(() => result.current.handleCellAction(0, 0));
    expect(mocks.sounds.fill.mock.calls.length).toBe(fillCalls);

    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);
    expect(mocks.sounds.undo).toHaveBeenCalled();

    act(() => result.current.redo());
    expect(mocks.sounds.undo).toHaveBeenCalledTimes(2);
  });

  it('loads saved game and handles reset confirm branches', () => {
    mocks.setSaved('a', [[CellState.FILLED]], 42);

    const confirmSpy = vi.spyOn(window, 'confirm');
    const { result } = renderHook(() => useNonogramGame());

    expect(result.current.canResetAllProgress).toBe(true);

    act(() => result.current.startPuzzle(mocks.puzzleA));
    expect(mocks.loadGame).toHaveBeenCalledWith('a');
    expect(result.current.gameState?.isSolved).toBe(true);

    confirmSpy.mockReturnValue(false);
    act(() => result.current.reset());
    expect(mocks.resetPuzzle).not.toHaveBeenCalled();

    act(() => result.current.startPuzzle(mocks.puzzleB));
    confirmSpy.mockReturnValue(true);
    act(() => result.current.reset());

    expect(mocks.sounds.reset).toHaveBeenCalled();
    expect(mocks.resetPuzzle).toHaveBeenCalledWith('b');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('clears all stored puzzle progress and returns home', () => {
    const { result } = renderHook(() => useNonogramGame());

    act(() => result.current.startPuzzle(mocks.puzzleA));
    act(() => result.current.handleCellAction(0, 0));

    expect(result.current.canResetAllProgress).toBe(true);
    expect(result.current.completedIds).toEqual(['a']);

    act(() => result.current.resetAllProgress());

    expect(mocks.resetAllProgress).toHaveBeenCalledTimes(1);
    expect(mocks.sounds.reset).toHaveBeenCalled();
    expect(result.current.screen).toBe('home');
    expect(result.current.gameState).toBeNull();
    expect(result.current.completedIds).toEqual([]);
    expect(result.current.canResetAllProgress).toBe(false);
  });

  it('respects muted mode for sound playback', () => {
    const { result } = renderHook(() => useNonogramGame());

    act(() => result.current.toggleMuted());
    act(() => result.current.startPuzzle(mocks.puzzleA));
    act(() => result.current.handleCellAction(0, 0));

    expect(result.current.gameState?.isSolved).toBe(true);
    expect(mocks.sounds.fill).not.toHaveBeenCalled();
    expect(mocks.sounds.win).not.toHaveBeenCalled();
  });

  it('goHome clears play state', () => {
    const { result } = renderHook(() => useNonogramGame());

    act(() => result.current.startPuzzle(mocks.puzzleA));
    expect(result.current.screen).toBe('play');

    act(() => result.current.goHome());
    expect(result.current.screen).toBe('home');
    expect(result.current.gameState).toBeNull();
  });

  it('keeps state stable when action and goHome happen in the same batch', () => {
    const { result } = renderHook(() => useNonogramGame());

    act(() => result.current.startPuzzle(mocks.puzzleA));
    act(() => {
      result.current.handleCellAction(0, 0);
      result.current.goHome();
    });

    expect(result.current.screen).toBe('home');
    expect(result.current.gameState).toBeNull();
  });
});
