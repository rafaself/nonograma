import { useMemo } from 'react';
import type { Puzzle } from '../lib/game-logic';
import { PUZZLES } from '../data/puzzles';
import { Check, Play, Lock, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface HomeScreenProps {
  completedIds: string[];
  onStartPuzzle: (puzzle: Puzzle) => void;
}

/** Group puzzles by grid size for visual sections */
function groupBySize(puzzles: typeof PUZZLES) {
  const groups: { label: string; size: string; puzzles: (typeof PUZZLES[number] & { globalIndex: number })[] }[] = [];
  const map = new Map<string, (typeof groups)[number]>();

  puzzles.forEach((p, i) => {
    const key = `${p.width}×${p.height}`;
    if (!map.has(key)) {
      const group = { label: key, size: key, puzzles: [] as (typeof PUZZLES[number] & { globalIndex: number })[] };
      map.set(key, group);
      groups.push(group);
    }
    map.get(key)!.puzzles.push({ ...p, globalIndex: i });
  });
  return groups;
}

export function HomeScreen({ completedIds, onStartPuzzle }: HomeScreenProps) {
  const groups = useMemo(() => groupBySize(PUZZLES), []);
  const completedCount = completedIds.length;
  const totalCount = PUZZLES.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
      {/* ── Header ── */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] -z-10 animate-pulse" />
        <div className="flex flex-col items-center gap-5">
          <img
            src="/favicon.png"
            alt="Logo"
            className="w-16 h-16 md:w-24 md:h-24 rounded-2xl shadow-2xl shadow-emerald-500/20 ring-1 ring-white/10"
          />
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-center bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-600">
            Levels
          </h1>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="w-full max-w-xs mb-14 flex flex-col items-center gap-2">
        <div className="flex items-center justify-between w-full text-[11px] font-bold tracking-[0.25em] uppercase text-zinc-500">
          <span>Progress</span>
          <span className="tabular-nums">{completedCount}/{totalCount}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* ── Puzzle sections grouped by size ── */}
      <div className="w-full flex flex-col gap-14">
        {groups.map((group) => {
          const groupCompleted = group.puzzles.filter(p => completedIds.includes(p.id)).length;
          return (
            <section key={group.size}>
              {/* Section header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-sm font-bold tabular-nums tracking-wide text-zinc-300">
                    {group.size}
                  </span>
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-600">
                    {groupCompleted}/{group.puzzles.length} decoded
                  </span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {group.puzzles.map((p, idx) => {
                  const isCompleted = completedIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => onStartPuzzle(p)}
                      style={{ animationDelay: `${idx * 40}ms` }}
                      className={cn(
                        "relative flex flex-col justify-between rounded-2xl p-4 md:p-5 cursor-pointer transition-all duration-300 ease-out overflow-hidden group",
                        "border backdrop-blur-md animate-in fade-in slide-in-from-bottom-4",
                        isCompleted
                          ? "bg-emerald-500/[0.04] border-emerald-500/15 hover:border-emerald-500/30 hover:bg-emerald-500/[0.08]"
                          : "bg-zinc-900/40 border-white/[0.06] hover:border-white/15 hover:bg-zinc-900/60"
                      )}
                    >
                      {/* Level number + status */}
                      <div className="flex items-center justify-between mb-5">
                        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-500">
                          {String(p.globalIndex + 1).padStart(2, '0')}
                        </span>
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                            <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                          </div>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-zinc-700" />
                        )}
                      </div>

                      {/* Title */}
                      <div className="mb-4">
                        <h3 className="text-lg md:text-xl font-semibold tracking-tight leading-tight">
                          {isCompleted ? (
                            <span className="text-white">{p.title}</span>
                          ) : (
                            <span className="text-zinc-700 font-mono tracking-wider select-none text-base">
                              {'█'.repeat(Math.min(p.title.length, 6))}
                            </span>
                          )}
                        </h3>
                      </div>

                      {/* Action hint */}
                      <div className={cn(
                        "flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-colors",
                        isCompleted
                          ? "text-emerald-500/60 group-hover:text-emerald-400"
                          : "text-zinc-600 group-hover:text-zinc-400"
                      )}>
                        {isCompleted ? (
                          <>Replay <ChevronRight className="w-3 h-3" /></>
                        ) : (
                          <>Decode <Play className="w-2.5 h-2.5 fill-current" /></>
                        )}
                      </div>

                      {/* Completed shimmer edge */}
                      {isCompleted && (
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
