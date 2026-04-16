import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  let tutorialCompleted = false;
  let lastPlayedPuzzleId: string | null = null;

  const cloneGrid = (grid: CellState[][]) => grid.map((row) => [...row]);

  const saveGame = vi.fn((puzzleId: string, grid: CellState[][], elapsedTime: number) => {
    savedGames[puzzleId] = { grid: cloneGrid(grid), elapsedTime };
  });
  const loadGame = vi.fn((puzzleId: string) => {
    const saved = savedGames[puzzleId];
    return saved ? { grid: cloneGrid(saved.grid), elapsedTime: saved.elapsedTime } : null;
  });
  const markCompleted = vi.fn((puzzleId: string) => {
    if (!completedStore.includes(puzzleId)) {
      completedStore.push(puzzleId);
    }
  });
  const getCompletedStatus = vi.fn(() => [...completedStore]);
  const markTutorialCompleted = vi.fn(() => {
    tutorialCompleted = true;
  });
  const getTutorialCompleted = vi.fn(() => tutorialCompleted);
  const getInProgressPuzzleIds = vi.fn(() => Object.keys(savedGames));
  const setLastPlayedPuzzleId = vi.fn((puzzleId: string) => {
    lastPlayedPuzzleId = puzzleId;
  });
  const getLastPlayedPuzzleId = vi.fn(() => lastPlayedPuzzleId);
  const clearLastPlayedPuzzleId = vi.fn(() => {
    lastPlayedPuzzleId = null;
  });
  const resetPuzzle = vi.fn((puzzleId: string) => {
    delete savedGames[puzzleId];
    if (lastPlayedPuzzleId === puzzleId) {
      lastPlayedPuzzleId = null;
    }
  });
  const resetAllProgress = vi.fn(() => {
    completedStore = [];
    savedGames = {};
    tutorialCompleted = false;
    lastPlayedPuzzleId = null;
  });
  const hasAnyPuzzleProgress = vi.fn(() => (
    Object.keys(savedGames).length > 0 || completedStore.length > 0 || tutorialCompleted
  ));
  const flushSave = vi.fn();

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
    tutorialCompleted = false;
    lastPlayedPuzzleId = null;
  };

  const setSaved = (id: string, grid: CellState[][], elapsedTime: number) => {
    savedGames[id] = { grid: cloneGrid(grid), elapsedTime };
  };

  const getSaved = (id: string) => savedGames[id];

  return {
    puzzles: [puzzleA, puzzleB, puzzleC],
    puzzleA,
    puzzleB,
    puzzleC,
    saveGame,
    loadGame,
    markCompleted,
    getCompletedStatus,
    markTutorialCompleted,
    getTutorialCompleted,
    getInProgressPuzzleIds,
    setLastPlayedPuzzleId,
    getLastPlayedPuzzleId,
    clearLastPlayedPuzzleId,
    resetPuzzle,
    resetAllProgress,
    hasAnyPuzzleProgress,
    flushSave,
    sounds,
    resetStores,
    setSaved,
    getSaved,
  };
});

vi.mock('../lib/persistence', () => ({
  persistence: {
    saveGame: (...args: Parameters<typeof mocks.saveGame>) => mocks.saveGame(...args),
    loadGame: (...args: Parameters<typeof mocks.loadGame>) => mocks.loadGame(...args),
    markCompleted: (...args: Parameters<typeof mocks.markCompleted>) => mocks.markCompleted(...args),
    getCompletedStatus: () => mocks.getCompletedStatus(),
    markTutorialCompleted: () => mocks.markTutorialCompleted(),
    getTutorialCompleted: () => mocks.getTutorialCompleted(),
    getInProgressPuzzleIds: () => mocks.getInProgressPuzzleIds(),
    setLastPlayedPuzzleId: (...args: Parameters<typeof mocks.setLastPlayedPuzzleId>) => mocks.setLastPlayedPuzzleId(...args),
    getLastPlayedPuzzleId: () => mocks.getLastPlayedPuzzleId(),
    clearLastPlayedPuzzleId: () => mocks.clearLastPlayedPuzzleId(),
    resetPuzzle: (...args: Parameters<typeof mocks.resetPuzzle>) => mocks.resetPuzzle(...args),
    resetAllProgress: () => mocks.resetAllProgress(),
    hasAnyPuzzleProgress: () => mocks.hasAnyPuzzleProgress(),
    flushSave: () => mocks.flushSave(),
    getMuted: () => false,
    setMuted: vi.fn(),
    getVolume: () => 0.5,
    setVolume: vi.fn(),
  },
}));

vi.mock('../data/puzzles', () => ({
  PUZZLES: mocks.puzzles,
  TUTORIAL_PUZZLE: {
    id: 'tutorial',
    title: 'Temple Lesson',
    width: 4,
    height: 4,
    solution: [[true]],
    tutorial: {
      summary: 'Learn the basics.',
      steps: ['One', 'Two', 'Three'],
    },
  },
}));

vi.mock('../lib/sounds', () => ({
  sounds: mocks.sounds,
}));

describe('useNonogramGame', () => {
  let visibilityState: DocumentVisibilityState;

  beforeEach(() => {
    vi.useFakeTimers();
    visibilityState = 'visible';
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => visibilityState,
    });
    mocks.resetStores();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts puzzles, advances, and returns home from the last puzzle', () => {
    const { result } = renderHook(() => useNonogramGame());

    expect(result.current.screen).toBe('home');
    expect(result.current.completedIds).toEqual([]);
    expect(result.current.inProgressIds).toEqual([]);
    expect(result.current.canResetAllProgress).toBe(false);
    expect(result.current.showTutorialShortcut).toBe(false);

    act(() => result.current.startPuzzle(mocks.puzzleA));
    expect(result.current.screen).toBe('play');
    expect(result.current.gameState?.puzzle.id).toBe('a');
    expect(result.current.lastPlayedPuzzleId).toBe('a');

    act(() => result.current.nextPuzzle());
    expect(result.current.gameState?.puzzle.id).toBe('b');

    act(() => result.current.nextPuzzle());
    expect(result.current.gameState?.puzzle.id).toBe('c');

    act(() => result.current.nextPuzzle());
    expect(result.current.screen).toBe('home');
    expect(result.current.gameState).toBeNull();
  });

  it('starts the dedicated tutorial puzzle from the shortcut action', () => {
    const { result } = renderHook(() => useNonogramGame());

    act(() => result.current.startTutorial());

    expect(result.current.screen).toBe('play');
    expect(result.current.gameState?.puzzle.id).toBe('tutorial');
  });

  it('supports cell actions, solve flow, undo/redo, and completion cleanup', () => {
    const { result } = renderHook(() => useNonogramGame());

    act(() => result.current.startPuzzle(mocks.puzzleC));
    expect(result.current.lastPlayedPuzzleId).toBe('c');

    act(() => result.current.handleCellAction(0, 0));
    expect(mocks.sounds.fill).toHaveBeenCalled();
    expect(mocks.sounds.lineComplete).toHaveBeenCalled();
    expect(result.current.inProgressIds).toEqual(['c']);

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
    expect(result.current.inProgressIds).toEqual([]);
    expect(result.current.lastPlayedPuzzleId).toBeNull();
    expect(mocks.markCompleted).toHaveBeenCalledWith('c');
    expect(mocks.resetPuzzle).toHaveBeenCalledWith('c');
    expect(mocks.sounds.win).toHaveBeenCalled();
    expect(result.current.showTutorialShortcut).toBe(true);

    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);
    expect(mocks.sounds.undo).toHaveBeenCalled();

    act(() => result.current.redo());
    expect(mocks.sounds.undo).toHaveBeenCalledTimes(2);
  });

  it('runs the timer only during active play and persists on ticks and visibility loss', () => {
    const { result } = renderHook(() => useNonogramGame());

    act(() => result.current.startPuzzle(mocks.puzzleA));
    expect(result.current.gameState?.elapsedTime).toBe(0);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.gameState?.elapsedTime).toBe(2);
    expect(mocks.getSaved('a')).toEqual({ grid: [[CellState.EMPTY]], elapsedTime: 2 });
    expect(result.current.inProgressIds).toEqual(['a']);

    act(() => result.current.openResetPuzzleConfirm());
    expect(result.current.showResetPuzzleConfirm).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.gameState?.elapsedTime).toBe(2);

    act(() => result.current.closeResetPuzzleConfirm());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.gameState?.elapsedTime).toBe(3);

    act(() => {
      visibilityState = 'hidden';
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(mocks.flushSave).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.gameState?.elapsedTime).toBe(3);

    act(() => {
      visibilityState = 'visible';
      document.dispatchEvent(new Event('visibilitychange'));
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.gameState?.elapsedTime).toBe(4);

    act(() => result.current.goHome());
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.screen).toBe('home');
    expect(result.current.gameState).toBeNull();
  });

  it('loads saved games and confirms reset through modal state', () => {
    mocks.setSaved('a', [[CellState.FILLED]], 42);

    const { result } = renderHook(() => useNonogramGame());

    act(() => result.current.startPuzzle(mocks.puzzleA));
    expect(mocks.loadGame).toHaveBeenCalledWith('a');
    expect(result.current.gameState?.isSolved).toBe(true);
    expect(result.current.gameState?.elapsedTime).toBe(42);

    act(() => result.current.startPuzzle(mocks.puzzleC));
    act(() => result.current.handleCellAction(0, 0));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.gameState?.elapsedTime).toBe(1);
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.openResetPuzzleConfirm());
    expect(result.current.showResetPuzzleConfirm).toBe(true);

    act(() => result.current.closeResetPuzzleConfirm());
    expect(result.current.showResetPuzzleConfirm).toBe(false);
    expect(result.current.gameState?.elapsedTime).toBe(1);

    act(() => result.current.openResetPuzzleConfirm());
    act(() => result.current.confirmResetPuzzle());

    expect(mocks.sounds.reset).toHaveBeenCalled();
    expect(mocks.resetPuzzle).toHaveBeenCalledWith('c');
    expect(result.current.gameState?.grid).toEqual([[CellState.EMPTY, CellState.EMPTY]]);
    expect(result.current.gameState?.elapsedTime).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.inProgressIds).toEqual(['a']);
    expect(result.current.lastPlayedPuzzleId).toBeNull();
  });

  it('runs tutorial puzzles from their starter grid without saving or progression side effects', () => {
    const tutorialPuzzle: Puzzle = {
      id: '4x4-1',
      title: 'Temple Lesson',
      width: 4,
      height: 4,
      solution: [
        [false, true, false, false],
        [true, true, true, false],
        [false, true, true, false],
        [false, false, true, false],
      ],
      initialGrid: [
        [CellState.EMPTY, CellState.FILLED, CellState.EMPTY, CellState.MARKED_X],
        [CellState.EMPTY, CellState.EMPTY, CellState.FILLED, CellState.MARKED_X],
        [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY, CellState.MARKED_X],
        [CellState.EMPTY, CellState.EMPTY, CellState.FILLED, CellState.MARKED_X],
      ],
      tutorial: {
        summary: 'Learn the basics.',
        steps: ['One', 'Two', 'Three'],
      },
    };

    mocks.setSaved('4x4-1', [[CellState.FILLED]], 99);

    const { result } = renderHook(() => useNonogramGame());

    act(() => result.current.startPuzzle(tutorialPuzzle));

    expect(mocks.loadGame).not.toHaveBeenCalledWith('4x4-1');
    expect(result.current.gameState?.grid).toEqual(tutorialPuzzle.initialGrid);
    expect(result.current.isLastPuzzle).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.gameState?.elapsedTime).toBe(1);
    expect(mocks.saveGame).not.toHaveBeenCalled();

    act(() => result.current.handleCellAction(1, 0));
    act(() => result.current.handleCellAction(1, 1));
    act(() => result.current.handleCellAction(2, 1));
    act(() => result.current.handleCellAction(2, 2));

    expect(result.current.gameState?.isSolved).toBe(true);
    expect(result.current.showVictory).toBe(true);
    expect(mocks.markCompleted).not.toHaveBeenCalled();
    expect(mocks.markTutorialCompleted).toHaveBeenCalledTimes(1);
    expect(result.current.completedIds).toEqual([]);
    expect(result.current.showTutorialShortcut).toBe(true);
    expect(result.current.canResetAllProgress).toBe(true);

    act(() => result.current.openResetPuzzleConfirm());
    act(() => result.current.confirmResetPuzzle());

    expect(result.current.gameState?.grid).toEqual(tutorialPuzzle.initialGrid);
    expect(result.current.gameState?.elapsedTime).toBe(0);
    expect(mocks.resetPuzzle).not.toHaveBeenCalledWith('4x4-1');
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
    expect(result.current.inProgressIds).toEqual([]);
    expect(result.current.lastPlayedPuzzleId).toBeNull();
    expect(result.current.canResetAllProgress).toBe(false);
    expect(result.current.showTutorialShortcut).toBe(false);
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
