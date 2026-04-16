import { memo } from 'react';
import { RotateCcw } from 'lucide-react';

interface ResetPuzzleModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetPuzzleModal = memo(function ResetPuzzleModal({
  onCancel,
  onConfirm,
}: ResetPuzzleModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/95 p-4 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-radial-gradient from-[#ae2012]/10 to-transparent pointer-events-none" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-puzzle-title"
        className="relative z-10 w-full max-w-lg border border-[#c9a227]/20 bg-[#120f0b]/95 p-8 shadow-2xl shadow-black/60"
      >
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-sm border border-[#ae2012]/40 bg-[#ae2012]/10 text-[#ae2012]">
          <RotateCcw className="h-6 w-6" />
        </div>
        <h2
          id="reset-puzzle-title"
          className="mb-3 text-3xl font-['Ma_Shan_Zheng'] font-bold tracking-tight text-[#fdf5e6]"
        >
          Reset current trail?
        </h2>
        <p className="mb-8 font-['Noto_Serif_JP'] text-sm leading-7 text-[#c8bea9]">
          This will clear the current board, remove the saved in-progress state for this puzzle, and reset the timer to zero.
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-sm border border-[#c9a227]/20 bg-[#1a1510] px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[#fdf5e6] transition-colors hover:border-[#c9a227]/40 hover:bg-[#251e16]"
          >
            Keep Solving
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-sm border border-[#ae2012]/40 bg-[#ae2012] px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[#fdf5e6] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Reset Puzzle
          </button>
        </div>
      </div>
    </div>
  );
});
