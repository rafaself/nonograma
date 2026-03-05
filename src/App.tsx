import { useState, useEffect, useCallback } from 'react';
import type { Puzzle, GameState } from './lib/game-logic';
import { CellState, deriveClues, createEmptyGrid, checkWin, isLineSatisfied } from './lib/game-logic';
import { persistence } from './lib/persistence';
import { PUZZLES } from './data/puzzles';
import { ChevronLeft, RotateCcw, Undo2, Play, Check, Lock, Grid3X3, Volume2, VolumeX } from 'lucide-react';
import { sounds } from './lib/sounds';
import { cn } from './lib/utils';
import { NonogramBoardCanvas } from './components/NonogramBoardCanvas';

// --- App Root ---

export default function App() {
  const [screen, setScreen] = useState<'home' | 'play'>('home');
  const [, setActivePuzzle] = useState<Puzzle | null>(null);
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
      elapsedTime: saved ? saved.elapsedTime : 0
    };

    setGameState(initialState);
    setActivePuzzle(puzzle);
    setHistory([]);
    setScreen('play');
    setShowVictory(false);
  }, []);

  const nextPuzzle = useCallback(() => {
    if (!gameState) return;
    const currentIndex = PUZZLES.findIndex(p => p.id === gameState.puzzle.id);
    if (currentIndex !== -1 && currentIndex < PUZZLES.length - 1) {
      startPuzzle(PUZZLES[currentIndex + 1]);
    } else {
      setScreen('home');
      setGameState(null);
    }
  }, [gameState, startPuzzle]);

  const handleCellAction = useCallback((r: number, c: number, mouseButton?: number) => {
    if (!gameState || gameState.isSolved) return;

    setGameState(prev => {
      if (!prev) return null;

      setHistory(h => [JSON.parse(JSON.stringify(prev.grid)), ...h].slice(0, 50));

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

      // Snapshot which lines were already satisfied before this move
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

  const undo = () => {
    if (history.length === 0 || !gameState) return;
    play(sounds.undo);
    const [lastGrid, ...rest] = history;
    setGameState({ ...gameState, grid: lastGrid, isSolved: checkWin(lastGrid, gameState.clues) });
    setHistory(rest);
    persistence.saveGame(gameState.puzzle.id, lastGrid, gameState.elapsedTime);
  };

  const reset = () => {
    if (!gameState || !window.confirm('Reset this puzzle?')) return;
    play(sounds.reset);
    const empty = createEmptyGrid(gameState.puzzle.width, gameState.puzzle.height);
    setGameState({ ...gameState, grid: empty, isSolved: false });
    setHistory([]);
    persistence.resetPuzzle(gameState.puzzle.id);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center relative overflow-hidden">
      {/* Background System */}
      <div className="cyber-grid-bg" />
      <div className="floating-blob" style={{ top: '-10%', left: '-10%' }} />
      <div className="floating-blob" style={{ bottom: '-10%', right: '-10%', animationDelay: '-5s', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)' }} />

      {/* Fixed top-left: Back to Matrix (play screen only) */}
      {screen === 'play' && (
        <button
          onClick={() => { setScreen('home'); setGameState(null); }}
          className="fixed top-3 left-3 md:top-6 md:left-6 z-50 flex items-center gap-1 text-zinc-500 hover:text-white transition-colors text-xs md:text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Matrix
        </button>
      )}

      {/* Fixed top-right: Mute button */}
      <button
        onClick={() => setMuted(m => !m)}
        className="fixed top-3 right-3 md:top-6 md:right-6 z-50 p-2.5 md:p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/5 hover:bg-white/10 transition-all active:scale-95"
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-zinc-500" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
      </button>

      <main className="w-full max-w-6xl flex-1 flex flex-col px-2 md:px-12 py-14 md:py-24">
        {screen === 'home' && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
            <div className="relative mb-4">
              {/* Retro Glow / Grid behind Title */}
              <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] -z-10 animate-pulse" />
              <div className="flex flex-col items-center gap-6">
                <img src="/favicon.png" alt="Logo" className="w-20 h-20 md:w-28 md:h-28 rounded-3xl shadow-2xl shadow-emerald-500/20" />
                <h1 className="text-7xl md:text-9xl font-medium tracking-tighter text-center bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-600">
                  Levels
                </h1>
              </div>
            </div>
            <p className="text-zinc-500 text-lg md:text-xl mb-20 font-light tracking-widest uppercase">Select a neural node to decode</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {PUZZLES.map((p, index) => {
                const isCompleted = completedIds.includes(p.id);
                const isUnlocked = true;

                return (
                  <div
                    key={p.id}
                    onClick={() => isUnlocked && startPuzzle(p)}
                    className={cn(
                      "cyber-card group",
                      !isUnlocked && "locked"
                    )}
                  >
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                        LEVEL {String(index + 1).padStart(2, '0')}
                      </span>
                      {isUnlocked ? (
                        <div className={cn("w-1.5 h-1.5 rounded-full", isCompleted ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-zinc-600")} />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-zinc-600" />
                      )}
                    </div>

                    <h3 className="text-4xl font-medium mb-12 tracking-tight">{p.title}</h3>

                    <div className="flex justify-between items-end">
                      <div className={cn(
                        "flex items-center gap-2 font-bold text-[10px] tracking-[0.2em] uppercase transition-colors",
                        isUnlocked ? "text-white group-hover:text-emerald-400" : "text-zinc-700"
                      )}>
                        {isUnlocked ? (
                          isCompleted ? (
                            <>Revisit Data <Check className="w-2.5 h-2.5" /></>
                          ) : (
                            <>Start Decoding <Play className="w-2.5 h-2.5 fill-current" /></>
                          )
                        ) : (
                          "Encrypted"
                        )}
                      </div>
                      <Grid3X3 className="w-5 h-5 text-zinc-800 group-hover:text-zinc-600 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {screen === 'play' && gameState && (
          <div className="flex-1 flex flex-col items-center animate-in zoom-in-95 duration-500 max-w-full min-h-0">
            {/* Top bar: back + title badge + undo/reset + mute are handled via fixed buttons */}
            <div className="flex items-center justify-center gap-3 mb-2 md:mb-4">
              <button onClick={undo} className="p-2.5 md:p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5" title="Undo"><Undo2 className="w-4 h-4 md:w-5 md:h-5" /></button>
              <button onClick={reset} className="p-2.5 md:p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5" title="Reset"><RotateCcw className="w-4 h-4 md:w-5 md:h-5" /></button>
            </div>

            <div className="mb-2 md:mb-6 text-center relative">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", gameState.isSolved ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-emerald-500")} />
                <p className="text-emerald-500 font-bold tracking-[0.4em] uppercase text-[9px]">
                  {gameState.puzzle.width}x{gameState.puzzle.height} {gameState.isSolved ? 'NEURAL_DECODED' : 'NEURAL_DECODING'}
                </p>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0 px-2 md:px-4">
              <NonogramBoardCanvas
                grid={gameState.grid}
                clues={gameState.clues}
                onCellAction={(row, col, action) => {
                  handleCellAction(row, col, action === 'mark_x' ? 2 : 0);
                }}
                isSolved={gameState.isSolved}
                inputMode={inputMode}
              />
            </div>

            {/* Matrix Stylized Controls */}
            <div className="mt-3 md:mt-8 mb-2 flex gap-2 p-1 bg-zinc-900 rounded-2xl border border-white/5">
              <button
                onClick={() => setInputMode(CellState.FILLED)}
                className={cn(
                  "px-6 py-3 md:px-8 md:py-4 rounded-xl transition-all font-bold tracking-[0.2em] text-[10px]",
                  inputMode === CellState.FILLED
                    ? "bg-white text-black shadow-lg"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                FILL
              </button>
              <button
                onClick={() => setInputMode(CellState.MARKED_X)}
                className={cn(
                  "px-6 py-3 md:px-8 md:py-4 rounded-xl transition-all font-bold tracking-[0.2em] text-[10px]",
                  inputMode === CellState.MARKED_X
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                MARK X
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Victory Celebration */}
      {screen === 'play' && showVictory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              <Check className="w-12 h-12 text-black" strokeWidth={4} />
            </div>
            <h2 className="text-6xl font-medium mb-4 tracking-tight">Decoded</h2>
            <p className="text-zinc-500 text-xl mb-12 font-light">Level data successfully extracted.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowVictory(false)}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white text-lg font-bold rounded-full hover:bg-white/10 transition-all tracking-tight"
              >
                View Grid
              </button>
              <button
                onClick={nextPuzzle}
                className="px-12 py-4 bg-white text-black text-lg font-bold rounded-full hover:scale-105 active:scale-95 transition-all tracking-tight"
              >
                {PUZZLES.findIndex(p => p.id === gameState?.puzzle.id) < PUZZLES.length - 1 ? 'Next Level' : 'Finish Matrix'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
