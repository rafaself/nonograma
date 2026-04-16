import { useCallback, memo, useId } from 'react';
import type { GameState } from '../lib/game-logic';
import { CellState } from '../lib/game-logic';
import { ChevronLeft, X, Square } from 'lucide-react';
import { cn } from '../lib/utils';
import { NonogramBoardCanvas } from '../components/NonogramBoardCanvas';

interface PlayScreenProps {
  gameState: GameState;
  inputMode: CellState.FILLED | CellState.MARKED_X;
  onSetInputMode: (mode: CellState.FILLED | CellState.MARKED_X) => void;
  onCellAction: (row: number, col: number, mouseButton?: number) => void;
  onBack: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const PlayScreen = memo(function PlayScreen({
  gameState,
  inputMode,
  onSetInputMode,
  onCellAction,
  onBack,
  onDragStart,
  onDragEnd,
}: PlayScreenProps) {
  const tutorial = gameState.puzzle.tutorial;
  const boardDescriptionId = useId();

  const handleBoardAction = useCallback(
    (row: number, col: number, action: 'fill' | 'mark_x') => {
      onCellAction(row, col, action === 'mark_x' ? 2 : 0);
    },
    [onCellAction],
  );

  return (
    <>
      <button
        onClick={onBack}
        className="fixed top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-2 text-[#a0a0a0] hover:text-[#ae2012] transition-colors text-xs md:text-sm group"
      >
        <div className="w-8 h-8 rounded-full border border-[#c9a227]/20 flex items-center justify-center group-hover:border-[#ae2012]/50 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
        <span className="font-['Ma_Shan_Zheng'] tracking-widest uppercase hidden md:inline">Return to Trails</span>
      </button>

      <div className="relative flex max-w-full flex-1 flex-col items-center animate-in zoom-in-95 duration-500 min-h-0">
        {tutorial && (
          <section
            aria-label="How to play"
            className="mb-4 w-full max-w-3xl shrink-0 border border-[#c9a227]/20 bg-[#120f0b]/90 p-5 shadow-2xl shadow-black/20"
          >
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c9a227]">
                How to Play
              </span>
              <span className="rounded-sm border border-[#ae2012]/30 bg-[#ae2012]/10 px-2 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[#ae2012]">
                Guided Board
              </span>
            </div>
            <p className="mb-4 max-w-2xl text-sm leading-7 text-[#c8bea9] font-['Noto_Serif_JP']">
              {tutorial.summary}
            </p>
            <ol className="grid gap-3 md:grid-cols-3">
              {tutorial.steps.map((step, index) => (
                <li
                  key={step}
                  className="border border-[#c9a227]/15 bg-[#0f0c09]/80 p-4 text-sm leading-6 text-[#fdf5e6]"
                >
                  <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#ae2012]/40 bg-[#ae2012]/10 text-xs font-bold text-[#ae2012]">
                    {index + 1}
                  </span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-2 md:px-4">
          <p id={boardDescriptionId} className="sr-only">
            Puzzle board for {gameState.puzzle.title}. Grid size {gameState.puzzle.width} by {gameState.puzzle.height}. Current mode is {inputMode === CellState.FILLED ? 'fill' : 'mark x'}. On desktop, left click fills and right click marks X. On touch, tap uses the current mode, hold uses the alternate action, and two fingers zoom or pan the board.
          </p>
          <NonogramBoardCanvas
            key={gameState.puzzle.id}
            grid={gameState.grid}
            clues={gameState.clues}
            onCellAction={handleBoardAction}
            isSolved={gameState.isSolved}
            inputMode={inputMode}
            ariaLabel={`Puzzle board for ${gameState.puzzle.title}`}
            ariaDescribedBy={boardDescriptionId}
            {...(onDragStart ? { onDragStart } : {})}
            {...(onDragEnd ? { onDragEnd } : {})}
            {...(gameState.puzzle.resultColors ? { resultColors: gameState.puzzle.resultColors } : {})}
            {...(gameState.puzzle.backgroundColors ? { backgroundColors: gameState.puzzle.backgroundColors } : {})}
          />
        </div>

        <div className="mt-3 mb-3 flex shrink-0 flex-col items-center gap-3 md:mt-5 md:mb-4 md:gap-4">
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
});
