import type { GameState } from '../lib/game-logic';
import { CellState } from '../lib/game-logic';
import { ChevronLeft, RotateCcw, Undo2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { NonogramBoardCanvas } from './NonogramBoardCanvas';

interface PlayScreenProps {
  gameState: GameState;
  inputMode: CellState.FILLED | CellState.MARKED_X;
  onSetInputMode: (mode: CellState.FILLED | CellState.MARKED_X) => void;
  onCellAction: (row: number, col: number, mouseButton?: number) => void;
  onUndo: () => void;
  onReset: () => void;
  onBack: () => void;
}

export function PlayScreen({
  gameState,
  inputMode,
  onSetInputMode,
  onCellAction,
  onUndo,
  onReset,
  onBack,
}: PlayScreenProps) {
  return (
    <>
      <button
        onClick={onBack}
        className="fixed top-3 left-3 md:top-6 md:left-6 z-50 flex items-center gap-1 text-zinc-500 hover:text-white transition-colors text-xs md:text-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Matrix
      </button>

      <div className="flex-1 flex flex-col items-center animate-in zoom-in-95 duration-500 max-w-full min-h-0">
        <div className="flex items-center justify-center gap-3 mb-2 md:mb-4">
          <button onClick={onUndo} className="p-2.5 md:p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5" title="Undo"><Undo2 className="w-4 h-4 md:w-5 md:h-5" /></button>
          <button onClick={onReset} className="p-2.5 md:p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5" title="Reset"><RotateCcw className="w-4 h-4 md:w-5 md:h-5" /></button>
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
              onCellAction(row, col, action === 'mark_x' ? 2 : 0);
            }}
            isSolved={gameState.isSolved}
            inputMode={inputMode}
          />
        </div>

        <button
          onClick={() =>
            onSetInputMode(
              inputMode === CellState.FILLED
                ? CellState.MARKED_X
                : CellState.FILLED
            )
          }
          className="mt-3 md:mt-8 mb-2 relative flex items-center w-[88px] h-11 md:w-[100px] md:h-12 rounded-full bg-zinc-800 border border-white/5 p-1 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label={`Switch to ${inputMode === CellState.FILLED ? 'mark' : 'fill'} mode`}
        >
          {/* Sliding thumb */}
          <span
            className={cn(
              "absolute top-1 h-[calc(100%-8px)] aspect-square rounded-full shadow-lg transition-all duration-300 ease-in-out",
              inputMode === CellState.FILLED
                ? "left-1 bg-white"
                : "left-[calc(100%-4px)] -translate-x-full bg-zinc-600"
            )}
          />
          {/* X icon – left side */}
          <span
            className={cn(
              "relative z-10 flex items-center justify-center w-1/2 h-full text-sm font-bold transition-colors duration-300",
              inputMode === CellState.MARKED_X ? "text-white" : "text-zinc-600"
            )}
          >
            ✕
          </span>
          {/* Fill icon – right side */}
          <span
            className={cn(
              "relative z-10 flex items-center justify-center w-1/2 h-full transition-colors duration-300",
              inputMode === CellState.FILLED ? "text-zinc-900" : "text-zinc-600"
            )}
          >
            <span className="block w-4 h-4 md:w-[18px] md:h-[18px] rounded-[3px] bg-current" />
          </span>
        </button>
      </div>
    </>
  );
}
