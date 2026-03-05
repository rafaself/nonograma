import { useState, useEffect, useCallback } from 'react';
import type { Puzzle, GameState } from '../lib/game-logic';
import { CellState, deriveClues, createEmptyGrid, checkWin, isLineSatisfied } from '../lib/game-logic';
import { persistence } from '../lib/persistence';
import { PUZZLES } from '../data/puzzles';
import { sounds } from '../lib/sounds';

export function useNonogramGame() {
  const [screen, setScreen] = useState<'home' | 'play'>('home');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [history, setHistory] = useState<CellState[][][]>([]);
  const [inputMode, setInputMode] = useState<CellState.FILLED | CellState.MARKED_X>(CellState.FILLED);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [showVictory, setShowVictory] = useState(false);
  const [muted, setMuted] = useState(false);

  const play = useCallback((fn: () => void) => {
    if (!muted) fn();
  }, [muted]);

  useEffect(() => {
    setCompletedIds(persistence.getCompletedStatus());
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
    setHistory([]);
    setScreen('play');
    setShowVictory(false);
  }, []);

  const goHome = useCallback(() => {
    setScreen('home');
    setGameState(null);
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

    setGameState(prev => {
      if (!prev) return null;

      setHistory(h => [prev.grid.map(row => [...row]), ...h].slice(0, 50));

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

      const rowWasDone = isLineSatisfied(prev.grid[r], prev.clues.rows[r]);
      const colWasDone = isLineSatisfied(prev.grid.map(row => row[c]), prev.clues.cols[c]);

      newGrid[r][c] = targetState;
      const solved = checkWin(newGrid, prev.clues);

      if (solved) {
        persistence.markCompleted(prev.puzzle.id);
        setCompletedIds(persistence.getCompletedStatus());
        setShowVictory(true);
        play(sounds.win);
      } else {
        const rowNowDone = isLineSatisfied(newGrid[r], prev.clues.rows[r]);
        const colNowDone = isLineSatisfied(newGrid.map(row => row[c]), prev.clues.cols[c]);
        if ((!rowWasDone && rowNowDone) || (!colWasDone && colNowDone)) {
          play(sounds.lineComplete);
        }
      }

      persistence.saveGame(prev.puzzle.id, newGrid, prev.elapsedTime);
      return { ...prev, grid: newGrid, isSolved: solved };
    });
  }, [gameState, inputMode, play]);

  const undo = useCallback(() => {
    if (history.length === 0 || !gameState) return;
    play(sounds.undo);
    const [lastGrid, ...rest] = history;
    setGameState({ ...gameState, grid: lastGrid, isSolved: checkWin(lastGrid, gameState.clues) });
    setHistory(rest);
    persistence.saveGame(gameState.puzzle.id, lastGrid, gameState.elapsedTime);
  }, [history, gameState, play]);

  const reset = useCallback(() => {
    if (!gameState || !window.confirm('Reset this puzzle?')) return;
    play(sounds.reset);
    const empty = createEmptyGrid(gameState.puzzle.width, gameState.puzzle.height);
    setGameState({ ...gameState, grid: empty, isSolved: false });
    setHistory([]);
    persistence.resetPuzzle(gameState.puzzle.id);
  }, [gameState, play]);

  const isLastPuzzle = gameState
    ? PUZZLES.findIndex(p => p.id === gameState.puzzle.id) >= PUZZLES.length - 1
    : false;

  return {
    screen,
    gameState,
    inputMode,
    setInputMode,
    completedIds,
    showVictory,
    setShowVictory,
    muted,
    setMuted,
    startPuzzle,
    goHome,
    nextPuzzle,
    handleCellAction,
    undo,
    reset,
    isLastPuzzle,
  };
}
