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
        className="fixed top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-2 text-[#a0a0a0] hover:text-[#ae2012] transition-colors text-xs md:text-sm group"
      >
        <div className="w-8 h-8 rounded-full border border-[#c9a227]/20 flex items-center justify-center group-hover:border-[#ae2012]/50 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
        <span className="font-['Ma_Shan_Zheng'] tracking-widest uppercase hidden md:inline">Return to Trial</span>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 max-w-full min-h-0 relative">
        <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 px-4 md:px-8 overflow-hidden">
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

        <div className="mt-6 md:mt-10 mb-6 flex flex-col items-center gap-4">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#7a7a7a]">Instruction</span>
          <button
            onClick={() =>
              onSetInputMode(
                inputMode === CellState.FILLED
                  ? CellState.MARKED_X
                  : CellState.FILLED
              )
            }
            className="relative flex items-center w-32 h-14 md:w-40 md:h-16 rounded-sm bg-[#1a1510] border-2 border-[#c9a227]/20 p-2 cursor-pointer backdrop-blur-md transition-all hover:border-[#c9a227]/50 active:scale-95 group focus:outline-none"
            aria-label={`Switch to ${inputMode === CellState.FILLED ? 'mark' : 'fill'} mode`}
          >
            {/* Sliding thumb */}
            <span
              className={cn(
                "absolute top-2 bottom-2 w-[calc(50%-12px)] rounded-sm shadow-xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-[#ae2012]",
                inputMode === CellState.FILLED
                  ? "translate-x-[calc(100%+8px)]"
                  : "translate-x-0"
              )}
            />
            {/* X icon – left side */}
            <span
              className={cn(
                "relative z-10 flex items-center justify-center w-1/2 h-full transition-colors duration-500",
                inputMode === CellState.MARKED_X ? "text-[#fdf5e6]" : "text-[#7a7a7a]"
              )}
            >
              <X className="w-6 h-6 md:w-7 md:h-7" strokeWidth={3} />
            </span>
            {/* Fill icon – right side */}
            <span
              className={cn(
                "relative z-10 flex items-center justify-center w-1/2 h-full transition-colors duration-500",
                inputMode === CellState.FILLED ? "text-[#fdf5e6]" : "text-[#7a7a7a]"
              )}
            >
              <Square className="w-5 h-5 md:w-6 md:h-6 fill-current" />
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
