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

        <div className="mt-3 md:mt-8 mb-2 flex gap-2 p-1 bg-zinc-900 rounded-2xl border border-white/5">
          <button
            onClick={() => onSetInputMode(CellState.FILLED)}
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
            onClick={() => onSetInputMode(CellState.MARKED_X)}
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
    </>
  );
}
