import { memo } from 'react';
import { formatElapsedTime } from '../lib/time';

interface PlayStatusHudProps {
  title: string;
  width: number;
  height: number;
  elapsedTime: number;
}

export const PlayStatusHud = memo(function PlayStatusHud({
  title,
  width,
  height,
  elapsedTime,
}: PlayStatusHudProps) {
  return (
    <section
      aria-label="Puzzle status"
      className="mb-6 w-full max-w-3xl border border-[#c9a227]/20 bg-[#120f0b]/90 p-5 shadow-2xl shadow-black/20"
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c9a227]">
          Current Trail
        </span>
        <span className="rounded-sm border border-[#ae2012]/30 bg-[#ae2012]/10 px-2 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[#ae2012]">
          {width}x{height}
        </span>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-['Ma_Shan_Zheng'] text-3xl text-[#fdf5e6] md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-7 text-[#c8bea9] font-['Noto_Serif_JP']">
            Stay with the clues. Resume, adjust, and finish the pattern at your own pace.
          </p>
        </div>

        <div className="rounded-sm border border-[#c9a227]/20 bg-[#0f0c09]/80 px-4 py-3 text-left md:min-w-32">
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#7a7a7a]">
            Elapsed
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[#fdf5e6]">
            {formatElapsedTime(elapsedTime)}
          </div>
        </div>
      </div>
    </section>
  );
});
