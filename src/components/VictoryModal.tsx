import { Check } from 'lucide-react';

interface VictoryModalProps {
  isLastPuzzle: boolean;
  onViewGrid: () => void;
  onNext: () => void;
}

export function VictoryModal({ isLastPuzzle, onViewGrid, onNext }: VictoryModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
          <Check className="w-12 h-12 text-black" strokeWidth={4} />
        </div>
        <h2 className="text-6xl font-medium mb-4 tracking-tight">Decoded</h2>
        <p className="text-zinc-500 text-xl mb-12 font-light">Level data successfully extracted.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onViewGrid}
            className="px-8 py-4 bg-white/5 border border-white/10 text-white text-lg font-bold rounded-full hover:bg-white/10 transition-all tracking-tight"
          >
            View Grid
          </button>
          <button
            onClick={onNext}
            className="px-12 py-4 bg-white text-black text-lg font-bold rounded-full hover:scale-105 active:scale-95 transition-all tracking-tight"
          >
            {isLastPuzzle ? 'Finish Matrix' : 'Next Level'}
          </button>
        </div>
      </div>
    </div>
  );
}
