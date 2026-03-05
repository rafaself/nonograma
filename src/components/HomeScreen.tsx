import type { Puzzle } from '../lib/game-logic';
import { PUZZLES } from '../data/puzzles';
import { Check, Play, Grid3X3 } from 'lucide-react';
import { cn } from '../lib/utils';

interface HomeScreenProps {
  completedIds: string[];
  onStartPuzzle: (puzzle: Puzzle) => void;
}

export function HomeScreen({ completedIds, onStartPuzzle }: HomeScreenProps) {
  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
      <div className="relative mb-4">
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
          return (
            <div
              key={p.id}
              onClick={() => onStartPuzzle(p)}
              className="cyber-card group"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-zinc-400 font-medium uppercase tracking-widest text-base">
                  LEVEL {String(index + 1).padStart(2, '0')}
                </span>
                <div className={cn("w-1.5 h-1.5 rounded-full", isCompleted ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-zinc-600")} />
              </div>

              <h3 className="text-5xl font-medium mb-12 tracking-tight">
                {isCompleted ? p.title : (
                  <span className="text-zinc-600 font-mono tracking-widest select-none">
                    {'█'.repeat(p.title.length)}
                  </span>
                )}
              </h3>

              <div className="flex justify-between items-end">
                <div className={cn(
                  "flex items-center gap-2 font-bold text-xs tracking-[0.2em] uppercase transition-colors",
                  "text-white group-hover:text-emerald-400"
                )}>
                  {isCompleted ? (
                    <>Revisit Data <Check className="w-2.5 h-2.5" /></>
                  ) : (
                    <>Start Decoding <Play className="w-2.5 h-2.5 fill-current" /></>
                  )}
                </div>
                <Grid3X3 className="w-5 h-5 text-zinc-800 group-hover:text-zinc-600 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
