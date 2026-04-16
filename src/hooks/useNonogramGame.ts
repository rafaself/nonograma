import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { Puzzle, GameState } from '../lib/game-logic';
import { CellState, deriveClues, createEmptyGrid, checkWin, isLineSatisfied } from '../lib/game-logic';
import { persistence } from '../lib/persistence';
import { PUZZLES, TUTORIAL_PUZZLE } from '../data/puzzles';
import { sounds } from '../lib/sounds';

function cloneGrid(grid: CellState[][]): CellState[][] {
  return grid.map((row) => [...row]);
}

function isTutorialPuzzle(puzzle: Puzzle): boolean {
  return puzzle.tutorial !== undefined;
}

function createStartingGrid(puzzle: Puzzle): CellState[][] {
  return puzzle.initialGrid ? cloneGrid(puzzle.initialGrid) : createEmptyGrid(puzzle.width, puzzle.height);
}

export function useNonogramGame() {
  const [screen, setScreen] = useState<'home' | 'play'>('home');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [undoHistory, setUndoHistory] = useState<CellState[][][]>([]);
  const [redoHistory, setRedoHistory] = useState<CellState[][][]>([]);
  const [inputMode, setInputMode] = useState<CellState.FILLED | CellState.MARKED_X>(CellState.FILLED);
  const [completedIds, setCompletedIds] = useState<string[]>(() => persistence.getCompletedStatus());
  const [inProgressIds, setInProgressIds] = useState<string[]>(() => persistence.getInProgressPuzzleIds());
  const [lastPlayedPuzzleId, setLastPlayedPuzzleId] = useState<string | null>(() => persistence.getLastPlayedPuzzleId());
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(() => persistence.getTutorialCompleted());
  const [showVictory, setShowVictory] = useState(false);
  const [showResetPuzzleConfirm, setShowResetPuzzleConfirm] = useState(false);
  const [muted, setMuted] = useState(() => persistence.getMuted());
  const [volume, setVolume] = useState(() => persistence.getVolume());
  const [isDocumentVisible, setIsDocumentVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden',
  );

  // --- Drag-batch undo: one undo entry per drag stroke instead of per cell ---
  const batchActiveRef = useRef(false);
  const batchSnapshotPushedRef = useRef(false);
  const gameStateRef = useRef<GameState | null>(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const play = useCallback((fn: (v: number) => void) => {
    if (!muted) fn(volume);
  }, [muted, volume]);

  const syncInProgressIds = useCallback(() => {
    const nextIds = persistence.getInProgressPuzzleIds();
    setInProgressIds(nextIds);
    return nextIds;
  }, []);

  const rememberLastPlayedPuzzle = useCallback((puzzleId: string) => {
    persistence.setLastPlayedPuzzleId(puzzleId);
    setLastPlayedPuzzleId(puzzleId);
  }, []);

  const clearRememberedPuzzle = useCallback(() => {
    persistence.clearLastPlayedPuzzleId();
    setLastPlayedPuzzleId(null);
  }, []);

  const persistPuzzleSnapshot = useCallback((state: GameState | null, flush = false) => {
    if (!state || state.isSolved || isTutorialPuzzle(state.puzzle)) {
      return;
    }

    persistence.saveGame(state.puzzle.id, state.grid, state.elapsedTime);
    if (flush) {
      persistence.flushSave();
    }
    syncInProgressIds();
  }, [syncInProgressIds]);

  const toggleMuted = useCallback(() => {
    setMuted((m: boolean) => {
      const next = !m;
      persistence.setMuted(next);
      return next;
    });
  }, []);

  const changeVolume = useCallback((v: number) => {
    setVolume(v);
    persistence.setVolume(v);
  }, []);

  const startPuzzle = useCallback((puzzle: Puzzle) => {
    const clues = deriveClues(puzzle.solution);
    const tutorial = isTutorialPuzzle(puzzle);
    const saved = tutorial ? null : persistence.loadGame(puzzle.id);
    const grid = saved ? cloneGrid(saved.grid) : createStartingGrid(puzzle);

    const initialState: GameState = {
      puzzle,
      clues,
      grid,
      isSolved: checkWin(grid, clues),
      elapsedTime: tutorial ? 0 : (saved ? saved.elapsedTime : 0),
    };

    setGameState(initialState);
    gameStateRef.current = initialState;
    setUndoHistory([]);
    setRedoHistory([]);
    setScreen('play');
    setShowVictory(false);
    setShowResetPuzzleConfirm(false);

    if (!tutorial) {
      rememberLastPlayedPuzzle(puzzle.id);
      syncInProgressIds();
    }
  }, [rememberLastPlayedPuzzle, syncInProgressIds]);

  const goHome = useCallback(() => {
    persistPuzzleSnapshot(gameStateRef.current, true);
    persistence.flushSave();
    setScreen('home');
    setGameState(null);
    gameStateRef.current = null;
    setUndoHistory([]);
    setRedoHistory([]);
    setShowResetPuzzleConfirm(false);
  }, [persistPuzzleSnapshot]);

  const startTutorial = useCallback(() => {
    startPuzzle(TUTORIAL_PUZZLE);
  }, [startPuzzle]);

  const nextPuzzle = useCallback(() => {
    if (!gameState) return;
    const currentIndex = PUZZLES.findIndex(p => p.id === gameState.puzzle.id);
    if (currentIndex !== -1 && currentIndex < PUZZLES.length - 1) {
      startPuzzle(PUZZLES[currentIndex + 1]);
    } else {
      goHome();
    }
  }, [gameState, startPuzzle, goHome]);

  const handleCellAction = useCallback((r: number, c: number, mouseButton?: number) => {
    if (!gameState || gameState.isSolved) return;

    const prev = gameState;
    const tutorial = isTutorialPuzzle(prev.puzzle);

    // During a drag batch, only push the undo snapshot once (on the first cell)
    if (!batchActiveRef.current || !batchSnapshotPushedRef.current) {
      setUndoHistory(h => [prev.grid.map(row => [...row]), ...h].slice(0, 50));
      setRedoHistory([]);
      if (batchActiveRef.current) batchSnapshotPushedRef.current = true;
    }

    const newGrid = prev.grid.map(row => [...row]);
    const currentCell = newGrid[r][c];

    let targetState: CellState;
    if (mouseButton === 2) {
      targetState = currentCell === CellState.MARKED_X ? CellState.EMPTY : CellState.MARKED_X;
      play(targetState === CellState.MARKED_X ? sounds.markX : sounds.erase);
    } else {
      targetState = currentCell === inputMode ? CellState.EMPTY : inputMode;
      play(targetState === CellState.FILLED ? sounds.fill : sounds.erase);
    }

    const colBefore = prev.grid.map(row => row[c]);
    const rowWasDone = isLineSatisfied(prev.grid[r], prev.clues.rows[r]);
    const colWasDone = isLineSatisfied(colBefore, prev.clues.cols[c]);

    newGrid[r][c] = targetState;

    const colAfter = newGrid.map(row => row[c]);
    const rowNowDone = isLineSatisfied(newGrid[r], prev.clues.rows[r]);
    const colNowDone = isLineSatisfied(colAfter, prev.clues.cols[c]);

    // Skip expensive full-grid check when the edited row or column isn't satisfied
    const solved = rowNowDone && colNowDone && checkWin(newGrid, prev.clues);

    // Fill all remaining empty cells with X on solve
    const finalGrid = solved
      ? newGrid.map(row => row.map(cell => cell === CellState.EMPTY ? CellState.MARKED_X : cell))
      : newGrid;

    if (solved) {
      if (tutorial) {
        persistence.markTutorialCompleted();
        setHasCompletedTutorial(true);
      } else {
        persistence.markCompleted(prev.puzzle.id);
        persistence.resetPuzzle(prev.puzzle.id);
        setCompletedIds(persistence.getCompletedStatus());
        if (lastPlayedPuzzleId === prev.puzzle.id) {
          clearRememberedPuzzle();
        }
        syncInProgressIds();
      }
      setShowVictory(true);
      setShowResetPuzzleConfirm(false);
      play(sounds.win);
    } else if ((!rowWasDone && rowNowDone) || (!colWasDone && colNowDone)) {
      play(sounds.lineComplete);
    }

    if (!tutorial && !solved) {
      persistence.saveGame(prev.puzzle.id, finalGrid, prev.elapsedTime);
      syncInProgressIds();
    }
    const nextState = { ...prev, grid: finalGrid, isSolved: solved };
    setGameState(nextState);
    gameStateRef.current = nextState;
  }, [gameState, inputMode, play, lastPlayedPuzzleId, clearRememberedPuzzle, syncInProgressIds]);

  const undo = useCallback(() => {
    if (undoHistory.length === 0 || !gameState) return;
    play(sounds.undo);
    const [lastGrid, ...rest] = undoHistory;
    setRedoHistory(h => [gameState.grid.map(row => [...row]), ...h].slice(0, 50));
    const nextState = { ...gameState, grid: lastGrid, isSolved: checkWin(lastGrid, gameState.clues) };
    setGameState(nextState);
    gameStateRef.current = nextState;
    setUndoHistory(rest);
    if (!isTutorialPuzzle(gameState.puzzle)) {
      persistence.saveGame(gameState.puzzle.id, lastGrid, gameState.elapsedTime);
      syncInProgressIds();
    }
  }, [undoHistory, gameState, play, syncInProgressIds]);

  const redo = useCallback(() => {
    if (redoHistory.length === 0 || !gameState) return;
    play(sounds.undo);
    const [nextGrid, ...rest] = redoHistory;
    setUndoHistory(h => [gameState.grid.map(row => [...row]), ...h].slice(0, 50));
    const nextState = { ...gameState, grid: nextGrid, isSolved: checkWin(nextGrid, gameState.clues) };
    setGameState(nextState);
    gameStateRef.current = nextState;
    setRedoHistory(rest);
    if (!isTutorialPuzzle(gameState.puzzle)) {
      persistence.saveGame(gameState.puzzle.id, nextGrid, gameState.elapsedTime);
      syncInProgressIds();
    }
  }, [redoHistory, gameState, play, syncInProgressIds]);

  const openResetPuzzleConfirm = useCallback(() => {
    if (!gameStateRef.current) {
      return;
    }
    setShowResetPuzzleConfirm(true);
  }, []);

  const closeResetPuzzleConfirm = useCallback(() => {
    setShowResetPuzzleConfirm(false);
  }, []);

  const confirmResetPuzzle = useCallback(() => {
    const currentState = gameStateRef.current;
    if (!currentState) {
      return;
    }

    play(sounds.reset);
    const startingGrid = createStartingGrid(currentState.puzzle);
    const nextState = {
      ...currentState,
      grid: startingGrid,
      isSolved: false,
      elapsedTime: 0,
    };
    setGameState(nextState);
    gameStateRef.current = nextState;
    setUndoHistory([]);
    setRedoHistory([]);
    setShowVictory(false);
    setShowResetPuzzleConfirm(false);

    if (!isTutorialPuzzle(currentState.puzzle)) {
      persistence.resetPuzzle(currentState.puzzle.id);
      if (lastPlayedPuzzleId === currentState.puzzle.id) {
        clearRememberedPuzzle();
      }
      syncInProgressIds();
    }
  }, [play, lastPlayedPuzzleId, clearRememberedPuzzle, syncInProgressIds]);

  const resetAllProgress = useCallback(() => {
    play(sounds.reset);
    persistence.resetAllProgress();
    setCompletedIds([]);
    setInProgressIds([]);
    setLastPlayedPuzzleId(null);
    setHasCompletedTutorial(false);
    setScreen('home');
    setGameState(null);
    gameStateRef.current = null;
    setUndoHistory([]);
    setRedoHistory([]);
    setShowVictory(false);
    setShowResetPuzzleConfirm(false);
  }, [play]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState !== 'hidden';
      setIsDocumentVisible(visible);

      if (!visible) {
        persistPuzzleSnapshot(gameStateRef.current, true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [persistPuzzleSnapshot]);

  const timerActive = screen === 'play'
    && gameState !== null
    && !gameState.isSolved
    && !showVictory
    && !showResetPuzzleConfirm
    && isDocumentVisible;

  useEffect(() => {
    if (!timerActive) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const currentState = gameStateRef.current;
      if (!currentState || currentState.isSolved) {
        return;
      }

      const nextState = {
        ...currentState,
        elapsedTime: currentState.elapsedTime + 1,
      };

      setGameState(nextState);
      gameStateRef.current = nextState;
      persistPuzzleSnapshot(nextState);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [timerActive, persistPuzzleSnapshot]);

  const isLastPuzzle = useMemo(() => {
    if (!gameState) {
      return false;
    }

    const currentIndex = PUZZLES.findIndex((p) => p.id === gameState.puzzle.id);
    return currentIndex === -1 || currentIndex >= PUZZLES.length - 1;
  }, [gameState]);

  /** Call before a drag stroke begins so all cells in the drag share one undo entry. */
  const beginBatch = useCallback(() => {
    batchActiveRef.current = true;
    batchSnapshotPushedRef.current = false;
  }, []);

  /** Call when the drag stroke ends. */
  const endBatch = useCallback(() => {
    batchActiveRef.current = false;
    batchSnapshotPushedRef.current = false;
  }, []);

  const canUndo = undoHistory.length > 0;
  const canRedo = redoHistory.length > 0;
  const showTutorialShortcut = hasCompletedTutorial || completedIds.length > 0;
  const canResetAllProgress = showTutorialShortcut || inProgressIds.length > 0;

  return {
    screen,
    gameState,
    inputMode,
    setInputMode,
    completedIds,
    inProgressIds,
    lastPlayedPuzzleId,
    showVictory,
    setShowVictory,
    showResetPuzzleConfirm,
    muted,
    volume,
    toggleMuted,
    changeVolume,
    startPuzzle,
    startTutorial,
    goHome,
    nextPuzzle,
    handleCellAction,
    undo,
    redo,
    openResetPuzzleConfirm,
    closeResetPuzzleConfirm,
    confirmResetPuzzle,
    resetAllProgress,
    canUndo,
    canRedo,
    canResetAllProgress,
    isLastPuzzle,
    showTutorialShortcut,
    beginBatch,
    endBatch,
  };
}
