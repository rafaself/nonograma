import type { GameState } from '../lib/game-logic';
import { CellState } from '../lib/game-logic';
import { ChevronLeft, X, Square } from 'lucide-react';
import { cn } from '../lib/utils';
import { NonogramBoardCanvas } from './NonogramBoardCanvas';

interface PlayScreenProps {
  gameState: GameState;
  inputMode: CellState.FILLED | CellState.MARKED_X;
  onSetInputMode: (mode: CellState.FILLED | CellState.MARKED_X) => void;
  onCellAction: (row: number, col: number, mouseButton?: number) => void;
  onBack: () => void;
}

export function PlayScreen({
  gameState,
  inputMode,
  onSetInputMode,
  onCellAction,
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

      <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 max-w-full min-h-0">
        <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 px-2 md:px-4 overflow-hidden">
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
          className="mt-4 md:mt-8 mb-4 relative flex items-center w-28 h-12 md:w-32 md:h-14 rounded-full bg-white/5 border border-white/10 p-1.5 cursor-pointer backdrop-blur-md transition-all hover:bg-white/10 active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label={`Switch to ${inputMode === CellState.FILLED ? 'mark' : 'fill'} mode`}
        >
          {/* Sliding thumb */}
          <span
            className={cn(
              "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full shadow-lg transition-all duration-300 ease-in-out bg-white",
              inputMode === CellState.FILLED
                ? "translate-x-[calc(100%+0px)]"
                : "translate-x-0"
            )}
          />
          {/* X icon – left side */}
          <span
            className={cn(
              "relative z-10 flex items-center justify-center w-1/2 h-full transition-colors duration-300",
              inputMode === CellState.MARKED_X ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-400"
            )}
          >
            <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
          </span>
          {/* Fill icon – right side */}
          <span
            className={cn(
              "relative z-10 flex items-center justify-center w-1/2 h-full transition-colors duration-300",
              inputMode === CellState.FILLED ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-400"
            )}
          >
            <Square className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          </span>
        </button>
      </div>
    </>
  );
}
