import { memo } from 'react';
import { Check } from 'lucide-react';

interface VictoryModalProps {
  isLastPuzzle: boolean;
  onViewGrid: () => void;
  onNext: () => void;
}

export const VictoryModal = memo(function VictoryModal({ isLastPuzzle, onViewGrid, onNext }: VictoryModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0a0a]/95 backdrop-blur-3xl animate-in fade-in zoom-in duration-700">
      <div className="absolute inset-0 bg-radial-gradient from-[#ae2012]/10 to-transparent pointer-events-none" />
      <div className="flex flex-col items-center text-center relative z-10">
        <div className="w-28 h-28 bg-[#ae2012] rounded-xs flex items-center justify-center mb-10 shadow-[0_0_60px_rgba(174,32,18,0.4)] border-4 border-[#c9a227]/40 rotate-45">
          <div className="-rotate-45">
            <Check className="w-14 h-14 text-[#fdf5e6]" strokeWidth={4} />
          </div>
        </div>
        <h2 className="text-7xl md:text-8xl font-bold mb-4 tracking-tight text-[#fdf5e6] font-['Ma_Shan_Zheng'] py-2">Achieved</h2>
        <p className="text-[#a0a0a0] text-xl mb-14 font-['Noto_Serif_JP'] tracking-wide">The path is clear. Enlightenment attained.</p>
        <div className="flex flex-col sm:flex-row gap-6">
          <button
            onClick={onViewGrid}
            className="px-10 py-4 bg-[#1a1510] border-2 border-[#c9a227]/30 text-[#fdf5e6] text-lg font-bold rounded-sm hover:border-[#ae2012]/60 hover:bg-[#251e16] transition-all tracking-widest font-['Ma_Shan_Zheng']"
          >
            Review Trial
          </button>
          <button
            onClick={onNext}
            className="px-14 py-4 bg-[#ae2012] text-[#fdf5e6] text-lg font-bold rounded-sm border-2 border-[#c9a227]/40 hover:scale-105 active:scale-95 transition-all tracking-widest font-['Ma_Shan_Zheng'] shadow-lg shadow-[#ae2012]/20"
          >
            {isLastPuzzle ? 'Final Peace' : 'Ascend Next'}
          </button>
        </div>
      </div>
    </div>
  );
});
