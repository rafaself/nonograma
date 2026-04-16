import { memo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

interface HomeResetControlProps {
  canResetAllProgress: boolean;
  onResetAllProgress: () => void;
}

export const HomeResetControl = memo(function HomeResetControl({
  canResetAllProgress,
  onResetAllProgress,
}: HomeResetControlProps) {
  const [showResetModal, setShowResetModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowResetModal(true)}
        disabled={!canResetAllProgress}
        aria-label="Reset all progress"
        title="Reset all progress"
        className={cn(
          "flex items-center justify-center rounded-full border p-2.5 shadow-lg backdrop-blur-md transition-all active:scale-95 md:p-3",
          canResetAllProgress
            ? "border-[#c9a227]/20 bg-[#120f0b]/45 text-[#ae2012]/70 hover:border-[#ae2012]/40 hover:bg-[#1a1510]/80 hover:text-[#ae2012]"
            : "cursor-not-allowed border-[#c9a227]/20 bg-[#120f0b]/35 text-[#5a4d41]/70 shadow-none"
        )}
      >
        <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />
      </button>

      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/95 p-4 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-[#ae2012]/10 to-transparent pointer-events-none" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-all-progress-title"
            className="relative z-10 w-full max-w-lg border border-[#c9a227]/20 bg-[#120f0b]/95 p-8 shadow-2xl shadow-black/60"
          >
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-sm border border-[#ae2012]/40 bg-[#ae2012]/10 text-[#ae2012]">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h2
              id="reset-all-progress-title"
              className="mb-3 text-3xl font-['Ma_Shan_Zheng'] font-bold tracking-tight text-[#fdf5e6]"
            >
              Reset all progress?
            </h2>
            <p className="mb-8 font-['Noto_Serif_JP'] text-sm leading-7 text-[#c8bea9]">
              This will erase every completed trail and every saved puzzle board. This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="rounded-sm border border-[#c9a227]/20 bg-[#1a1510] px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[#fdf5e6] transition-colors hover:border-[#c9a227]/40 hover:bg-[#251e16]"
              >
                Keep Progress
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetAllProgress();
                  setShowResetModal(false);
                }}
                className="rounded-sm border border-[#ae2012]/40 bg-[#ae2012] px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[#fdf5e6] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
