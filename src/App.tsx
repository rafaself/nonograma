import { useState, useEffect, useCallback, Fragment } from 'react';
import type { Puzzle, GameState } from './lib/game-logic';
import { CellState, deriveClues, createEmptyGrid, checkWin, isLineSatisfied } from './lib/game-logic';
import { persistence } from './lib/persistence';
import { PUZZLES } from './data/puzzles';
import { ChevronLeft, RotateCcw, Undo2, Play, X, Check, Lock, Grid3X3, Volume2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

interface GridProps {
  grid: CellState[][];
  clues: { rows: number[][]; cols: number[][] };
  onCellClick: (r: number, c: number, button: number) => void;
  isSolved: boolean;
}

const Grid = ({ grid, clues, onCellClick, isSolved }: GridProps) => {
  const height = grid.length;
  const width = grid[0].length;

  return (
    <div className="flex flex-col items-center select-none">
      <div className="grid gap-0" style={{
        gridTemplateColumns: `auto repeat(${width}, minmax(0, 1fr))`,
        gridTemplateRows: `auto repeat(${height}, minmax(0, 1fr))`
      }}>
        <div className="w-12 h-12 md:w-20 md:h-20" />

        {clues.cols.map((colClues, c) => {
          const isSatisfied = isLineSatisfied(grid.map(row => row[c]), colClues);
          const isEmpty = colClues.length === 1 && colClues[0] === 0;
          return (
            <div key={`col-${c}`} className={cn(
              "flex flex-col justify-end items-center pb-2 border-l border-zinc-800",
              c % 5 === 4 && c !== width - 1 ? "border-r-2 border-r-zinc-600" : "border-r border-zinc-800",
              isSatisfied && !isEmpty ? "text-zinc-600" : "text-white"
            )}>
              {colClues.map((clue, i) => (
                <span key={i} className="text-[10px] md:text-sm font-bold leading-tight">{clue > 0 ? clue : ''}</span>
              ))}
            </div>
          );
        })}

        {grid.map((row, r) => (
          <Fragment key={`row-frag-${r}`}>
            <div className={cn(
              "flex justify-end items-center pr-3 border-t border-zinc-800",
              r % 5 === 4 && r !== height - 1 ? "border-b-2 border-b-zinc-600" : "border-b border-zinc-800",
              isLineSatisfied(row, clues.rows[r]) && !(clues.rows[r].length === 1 && clues.rows[r][0] === 0)
                ? "text-zinc-600" : "text-white"
            )}>
              {clues.rows[r].map((clue, i) => (
                <span key={i} className="text-[10px] md:text-sm font-bold mx-0.5">{clue > 0 ? clue : ''}</span>
              ))}
            </div>

            {row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => onCellClick(r, c, 0)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onCellClick(r, c, 2);
                }}
                disabled={isSolved}
                className={cn(
                  "w-8 h-8 md:w-12 md:h-12 border border-zinc-800 flex items-center justify-center relative active:scale-90 transition-transform",
                  r % 5 === 4 && r !== height - 1 && "border-b-zinc-500",
                  c % 5 === 4 && c !== width - 1 && "border-r-zinc-500",
                  cell === CellState.EMPTY && "bg-transparent hover:bg-zinc-800/50",
                  cell === CellState.FILLED && "bg-white",
                  isSolved && cell === CellState.FILLED && "bg-emerald-500"
                )}
              >
                {cell === CellState.MARKED_X && <X className="w-5 h-5 text-zinc-700" strokeWidth={3} />}
              </button>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

// --- App Root ---

export default function App() {
  const [screen, setScreen] = useState<'home' | 'play'>('home');
  const [, setActivePuzzle] = useState<Puzzle | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [history, setHistory] = useState<CellState[][][]>([]);
  const [inputMode, setInputMode] = useState<CellState.FILLED | CellState.MARKED_X>(CellState.FILLED);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [showVictory, setShowVictory] = useState(false);

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
      } else {
        targetState = currentCell === inputMode ? CellState.EMPTY : inputMode;
      }

      newGrid[r][c] = targetState;
      const solved = checkWin(newGrid, prev.clues);

      if (solved) {
        persistence.markCompleted(prev.puzzle.id);
        setCompletedIds(persistence.getCompletedStatus());
        setShowVictory(true);
      }

      persistence.saveGame(prev.puzzle.id, newGrid, prev.elapsedTime);
      return { ...prev, grid: newGrid, isSolved: solved };
    });
  }, [gameState, inputMode]);

  const undo = () => {
    if (history.length === 0 || !gameState) return;
    const [lastGrid, ...rest] = history;
    setGameState({ ...gameState, grid: lastGrid, isSolved: checkWin(lastGrid, gameState.clues) });
    setHistory(rest);
    persistence.saveGame(gameState.puzzle.id, lastGrid, gameState.elapsedTime);
  };

  const reset = () => {
    if (!gameState || !window.confirm('Reset this puzzle?')) return;
    const empty = createEmptyGrid(gameState.puzzle.width, gameState.puzzle.height);
    setGameState({ ...gameState, grid: empty, isSolved: false });
    setHistory([]);
    persistence.resetPuzzle(gameState.puzzle.id);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center relative overflow-hidden">
      {/* Background System */}
      <div className="cyber-grid-bg" />
      <div className="floating-blob" style={{ top: '-10%', left: '-10%' }} />
      <div className="floating-blob" style={{ bottom: '-10%', right: '-10%', animationDelay: '-5s', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)' }} />

      <div className="w-full max-w-6xl flex justify-end mb-12 relative z-10">
        <button className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/5 hover:bg-white/10 transition-all active:scale-95">
          <Volume2 className="w-6 h-6" />
        </button>
      </div>

      <main className="w-full max-w-6xl">
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
                const isUnlocked = index === 0 || completedIds.includes(PUZZLES[index - 1].id);

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
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-500 max-w-full">
            <div className="w-full max-w-md flex justify-between items-center mb-12">
              <button
                onClick={() => { setScreen('home'); setGameState(null); }}
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Matrix
              </button>
              <div className="flex gap-4">
                <button onClick={undo} className="p-3 rounded-full bg-white/5 hover:bg-white/10" title="Undo"><Undo2 className="w-5 h-5" /></button>
                <button onClick={reset} className="p-3 rounded-full bg-white/5 hover:bg-white/10" title="Reset"><RotateCcw className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="mb-16 text-center relative">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/5 blur-[60px] rounded-full -z-10" />
              <h2 className="text-5xl md:text-7xl font-medium mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-600">
                {gameState.puzzle.title}
              </h2>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", gameState.isSolved ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-emerald-500")} />
                <p className="text-emerald-500 font-bold tracking-[0.4em] uppercase text-[9px]">
                  {gameState.puzzle.width}x{gameState.puzzle.height} {gameState.isSolved ? 'NEURAL_DECODED' : 'NEURAL_DECODING'}
                </p>
              </div>
            </div>

            <div className="overflow-auto max-w-full pb-8 px-4 scrollbar-hide">
              <Grid
                grid={gameState.grid}
                clues={gameState.clues}
                onCellClick={handleCellAction}
                isSolved={gameState.isSolved}
              />
            </div>

            {/* Matrix Stylized Controls */}
            <div className="mt-8 flex gap-2 p-1 bg-zinc-900 rounded-2xl border border-white/5">
              <button
                onClick={() => setInputMode(CellState.FILLED)}
                className={cn(
                  "px-8 py-4 rounded-xl transition-all font-bold tracking-[0.2em] text-[10px]",
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
                  "px-8 py-4 rounded-xl transition-all font-bold tracking-[0.2em] text-[10px]",
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
