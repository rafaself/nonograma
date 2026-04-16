import { useState, useMemo, memo } from 'react';
import type { Puzzle } from '../lib/game-logic';
import { PUZZLES, TUTORIAL_PUZZLE } from '../data/puzzles';
import { Play, ChevronRight, ChevronDown, Github, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

interface HomeScreenProps {
  completedIds: string[];
  onStartPuzzle: (puzzle: Puzzle) => void;
  onStartTutorial: () => void;
  showTutorialCard: boolean;
}

const TRAIL_NAMES: Record<string, string> = {
  '5×5': 'Trail of the Panda',
  '10×10': 'Trail of the Tiger',
  '15×15': 'Trail of the Dragon',
  '20×20': 'Trail of the Wukong',
};

/** Group puzzles by grid size for visual sections */
function groupBySize(puzzles: typeof PUZZLES) {
  const groups: { label: string; size: string; puzzles: (typeof PUZZLES[number] & { globalIndex: number })[] }[] = [];
  const map = new Map<string, (typeof groups)[number]>();

  puzzles.forEach((p, i) => {
    const key = `${p.width}×${p.height}`;
    if (!map.has(key)) {
      const label = TRAIL_NAMES[key] ?? key;
      const group = { label, size: key, puzzles: [] as (typeof PUZZLES[number] & { globalIndex: number })[] };
      map.set(key, group);
      groups.push(group);
    }
    map.get(key)!.puzzles.push({ ...p, globalIndex: i });
  });
  return groups;
}

export const HomeScreen = memo(function HomeScreen({
  completedIds,
  onStartPuzzle,
  onStartTutorial,
  showTutorialCard,
}: HomeScreenProps) {
  const groups = useMemo(() => groupBySize(PUZZLES), []);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (size: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  };

  const completedCount = completedIds.length;
  const totalCount = PUZZLES.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
      {/* ── Header ── */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-[#ae2012]/20 blur-[100px] -z-10 animate-pulse" />
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <img
              src="/favicon.png"
              alt="Logo"
              draggable={false}
              className="w-20 h-20 md:w-28 md:h-28 rounded-3xl shadow-2xl shadow-red-950/40 border border-[#c9a227]/30"
            />
            <div className="absolute -bottom-2 -right-2 bg-[#ae2012] text-white px-2 py-1 text-xs font-bold rounded shadow-lg border border-[#c9a227]/40 rotate-12 font-['Ma_Shan_Zheng']">
              乃々
            </div>
          </div>
          <h1 className="text-7xl md:text-9xl font-bold text-center font-['Ma_Shan_Zheng'] bg-clip-text text-transparent bg-gradient-to-b from-[#fdf5e6] via-[#fdf5e6] to-[#c9a227] py-4 px-12">
            Trails
          </h1>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="w-full max-w-xs mb-16 flex flex-col items-center gap-3">
        <div className="flex items-center justify-between w-full text-[11px] font-bold tracking-[0.3em] uppercase text-[#a0a0a0]">
          <span>Enlightenment</span>
          <span className="tabular-nums text-[#ae2012]">{completedCount}/{totalCount}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#1a1510] border border-[#c9a227]/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ae2012] via-[#ae2012] to-[#c9a227] transition-all duration-1000 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {showTutorialCard && (
        <button
          type="button"
          onClick={onStartTutorial}
          className="w-full max-w-2xl mb-16 border border-[#c9a227]/20 bg-[#120f0b]/90 px-6 py-5 text-left shadow-2xl shadow-black/20 transition-all hover:border-[#ae2012]/50 hover:bg-[#17120d]"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-[#ae2012]/40 bg-[#ae2012]/10 text-[#ae2012]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c9a227]">
                    Tutorial
                  </span>
                  <span className="rounded-sm border border-[#c9a227]/20 bg-[#1a1510] px-2 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[#a0a0a0]">
                    4x4 Guided Puzzle
                  </span>
                </div>
                <h2 className="font-['Ma_Shan_Zheng'] text-3xl text-[#fdf5e6]">
                  Learn the rules before the trail begins
                </h2>
                <p className="max-w-xl text-sm leading-7 text-[#c8bea9] font-['Noto_Serif_JP']">
                  {TUTORIAL_PUZZLE.tutorial?.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start text-[11px] font-bold tracking-[0.24em] uppercase text-[#ae2012] sm:self-center">
              Start Tutorial
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </button>
      )}

      {/* ── Puzzle sections grouped by size ── */}
      <div className="w-full flex flex-col gap-16">
        {groups.map((group) => {
          const groupCompleted = group.puzzles.filter(p => completedIds.includes(p.id)).length;
          const isCollapsed = collapsedGroups.has(group.size);
          return (
            <section key={group.size} className="w-full">
              {/* Section header */}
              <button
                onClick={() => toggleGroup(group.size)}
                className="w-full flex items-center gap-6 mb-8 group/header focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-sm bg-[#ae2012]/10 border border-[#ae2012]/30 text-sm font-bold tabular-nums tracking-wide text-[#ae2012] font-['Ma_Shan_Zheng'] group-hover/header:border-[#ae2012]/60 transition-colors">
                      {group.label}
                    </span>
                    <div className={cn(
                      "absolute -inset-1 bg-[#ae2012]/20 blur-md rounded-full -z-10 transition-opacity duration-500",
                      isCollapsed ? "opacity-0" : "opacity-100"
                    )} />
                  </div>
                  <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#7a7a7a] group-hover/header:text-[#a0a0a0] transition-colors">
                    {groupCompleted}/{group.puzzles.length}
                  </span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-[#c9a227]/30 to-transparent" />
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border border-[#c9a227]/30 bg-[#c9a227]/5 text-[#c9a227]/60 group-hover/header:border-[#ae2012]/60 group-hover/header:text-[#ae2012] group-hover/header:bg-[#ae2012]/10 transition-all duration-500",
                  isCollapsed ? "rotate-[-90deg]" : "rotate-0"
                )}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              {/* Collapsible content container */}
              <div className={cn(
                "collapse-grid",
                !isCollapsed && "expanded"
              )}>
                <div className="collapse-content">
                  {/* Cards grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 pb-4">
                    {group.puzzles.map((p, idx) => {
                      const isCompleted = completedIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => onStartPuzzle(p)}
                          style={{ animationDelay: `${idx * 50}ms` }}
                          className={cn(
                            "oriental-card animate-in fade-in slide-in-from-bottom-4 flex flex-col justify-between aspect-square",
                            isCompleted
                              ? "border-[#ae2012]/30 hover:border-[#ae2012]/60"
                              : "border-[#c9a227]/10"
                          )}
                        >
                          {/* Level number + status */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold tracking-widest text-[#7a7a7a]">
                              {String(p.globalIndex + 1).padStart(2, '0')}
                            </span>
                            {isCompleted && (
                              <div className="absolute top-2 right-2 w-10 h-10 border-2 border-[#ae2012]/40 rounded-sm flex items-center justify-center -rotate-12 pointer-events-none">
                                <span className="font-['Ma_Shan_Zheng'] text-xl text-[#ae2012] leading-none text-center">
                                  成功
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Title */}
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className={cn(
                              "text-xl md:text-2xl font-bold tracking-tight leading-tight",
                              isCompleted ? "font-['Noto_Serif_JP']" : "font-mono opacity-20"
                            )}>
                              {isCompleted ? (
                                <span className="text-[#fdf5e6]">{p.title}</span>
                              ) : (
                                <span className="text-[#a0a0a0]">
                                  {'王'.repeat(Math.min(p.title.length, 3))}
                                </span>
                              )}
                            </h3>
                          </div>

                          {/* Action hint */}
                          <div className={cn(
                            "mt-4 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors",
                            isCompleted
                              ? "text-[#ae2012] group-hover:text-red-400"
                              : "text-[#c9a227]/60 group-hover:text-[#c9a227]"
                          )}>
                            {isCompleted ? (
                              <>TRANSCEND <ChevronRight className="w-3 h-3" /></>
                            ) : (
                              <>RESOLVE <Play className="w-2.5 h-2.5 fill-current" /></>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <footer className="mt-24 mb-8 flex flex-col items-center gap-3 text-[11px] text-[#7a7a7a] tracking-wide">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent mb-1" />
        <a
          href="https://github.com/rafaself"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-[#fdf5e6] transition-colors"
        >
          Made by Rafael
          <Github className="w-3.5 h-3.5" />
        </a>
        <span className="text-[10px] text-[#555]">Nonogram puzzle game · Open source</span>
      </footer>
    </div>
  );
});
