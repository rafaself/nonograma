import { useState, useCallback, useMemo, useRef } from 'react';
import type { Puzzle, GameState } from '../lib/game-logic';
import { CellState, deriveClues, createEmptyGrid, checkWin, isLineSatisfied } from '../lib/game-logic';
import { persistence } from '../lib/persistence';
import { PUZZLES } from '../data/puzzles';
import { sounds } from '../lib/sounds';

export function useNonogramGame() {
  const [screen, setScreen] = useState<'home' | 'play'>('home');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [undoHistory, setUndoHistory] = useState<CellState[][][]>([]);
  const [redoHistory, setRedoHistory] = useState<CellState[][][]>([]);
  const [inputMode, setInputMode] = useState<CellState.FILLED | CellState.MARKED_X>(CellState.FILLED);
  const [completedIds, setCompletedIds] = useState<string[]>(() => persistence.getCompletedStatus());
  const [showVictory, setShowVictory] = useState(false);
  const [muted, setMuted] = useState(() => persistence.getMuted());
  const [volume, setVolume] = useState(() => persistence.getVolume());

  // --- Drag-batch undo: one undo entry per drag stroke instead of per cell ---
  const batchActiveRef = useRef(false);
  const batchSnapshotPushedRef = useRef(false);

  const play = useCallback((fn: (v: number) => void) => {
    if (!muted) fn(volume);
  }, [muted, volume]);

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
    const saved = persistence.loadGame(puzzle.id);

    const initialState: GameState = {
      puzzle,
      clues,
      grid: saved ? saved.grid : createEmptyGrid(puzzle.width, puzzle.height),
      isSolved: saved ? checkWin(saved.grid, clues) : false,
      elapsedTime: saved ? saved.elapsedTime : 0,
    };

    setGameState(initialState);
    setUndoHistory([]);
    setRedoHistory([]);
    setScreen('play');
    setShowVictory(false);
  }, []);

  const goHome = useCallback(() => {
    persistence.flushSave();
    setScreen('home');
    setGameState(null);
    setUndoHistory([]);
    setRedoHistory([]);
  }, []);

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
      persistence.markCompleted(prev.puzzle.id);
      setCompletedIds(persistence.getCompletedStatus());
      setShowVictory(true);
      play(sounds.win);
    } else if ((!rowWasDone && rowNowDone) || (!colWasDone && colNowDone)) {
      play(sounds.lineComplete);
    }

    persistence.saveGame(prev.puzzle.id, finalGrid, prev.elapsedTime);
    setGameState({ ...prev, grid: finalGrid, isSolved: solved });
  }, [gameState, inputMode, play]);

  const undo = useCallback(() => {
    if (undoHistory.length === 0 || !gameState) return;
    play(sounds.undo);
    const [lastGrid, ...rest] = undoHistory;
    setRedoHistory(h => [gameState.grid.map(row => [...row]), ...h].slice(0, 50));
    setGameState({ ...gameState, grid: lastGrid, isSolved: checkWin(lastGrid, gameState.clues) });
    setUndoHistory(rest);
    persistence.saveGame(gameState.puzzle.id, lastGrid, gameState.elapsedTime);
  }, [undoHistory, gameState, play]);

  const redo = useCallback(() => {
    if (redoHistory.length === 0 || !gameState) return;
    play(sounds.undo);
    const [nextGrid, ...rest] = redoHistory;
    setUndoHistory(h => [gameState.grid.map(row => [...row]), ...h].slice(0, 50));
    setGameState({ ...gameState, grid: nextGrid, isSolved: checkWin(nextGrid, gameState.clues) });
    setRedoHistory(rest);
    persistence.saveGame(gameState.puzzle.id, nextGrid, gameState.elapsedTime);
  }, [redoHistory, gameState, play]);

  const reset = useCallback(() => {
    if (!gameState || !window.confirm('Reset this puzzle?')) return;
    play(sounds.reset);
    const empty = createEmptyGrid(gameState.puzzle.width, gameState.puzzle.height);
    setGameState({ ...gameState, grid: empty, isSolved: false });
    setUndoHistory([]);
    setRedoHistory([]);
    persistence.resetPuzzle(gameState.puzzle.id);
  }, [gameState, play]);

  const resetAllProgress = useCallback(() => {
    play(sounds.reset);
    persistence.resetAllProgress();
    setCompletedIds([]);
    setScreen('home');
    setGameState(null);
    setUndoHistory([]);
    setRedoHistory([]);
    setShowVictory(false);
  }, [play]);

  const isLastPuzzle = useMemo(() => gameState
    ? PUZZLES.findIndex(p => p.id === gameState.puzzle.id) >= PUZZLES.length - 1
    : false, [gameState]);

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
  const canResetAllProgress = completedIds.length > 0 || persistence.hasAnyPuzzleProgress();

  return {
    screen,
    gameState,
    inputMode,
    setInputMode,
    completedIds,
    showVictory,
    setShowVictory,
    muted,
    volume,
    toggleMuted,
    changeVolume,
    startPuzzle,
    goHome,
    nextPuzzle,
    handleCellAction,
    undo,
    redo,
    reset,
    resetAllProgress,
    canUndo,
    canRedo,
    canResetAllProgress,
    isLastPuzzle,
    beginBatch,
    endBatch,
  };
}
