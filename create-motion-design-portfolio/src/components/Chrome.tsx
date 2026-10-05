import type { ReactNode } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { fmtTime } from "../lib/motion";
import type { ActMeta } from "./ReelPlayer";

function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      data-hover
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center border border-white/15 text-[#EDE9DF]/80 transition-colors duration-150 hover:border-[#FF3B1F] hover:text-[#FF3B1F]"
    >
      {children}
    </button>
  );
}

export function TopBar({ playing }: { playing: boolean }) {
  return (
    <header className="relative z-40 flex h-11 shrink-0 items-center justify-between border-b border-white/10 bg-[#0B0B0A] px-4 md:h-12 md:px-6">
      <div className="flex items-center gap-3">
        <div className="grid h-5 w-5 place-items-center bg-[#FF3B1F]">
          <div className="h-1.5 w-1.5 bg-[#0B0B0A]" />
        </div>
        <span className="text-sm font-bold tracking-tight text-[#EDE9DF]">
          MOTION—15<span className="align-super text-[9px]">®</span>
        </span>
        <span className="mono hidden text-[10px] tracking-[0.3em] text-white/30 uppercase md:inline">
          A reel in five acts
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="mono hidden text-[10px] tracking-[0.25em] text-white/30 uppercase sm:inline">
          Portfolio / 2026
        </span>
        <span className="mono flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              playing ? "bg-[#FF3B1F] rec-dot" : "bg-white/25"
            }`}
          />
          <span className={playing ? "text-[#FF3B1F]" : "text-white/40"}>
            {playing ? "ROLLING" : "HOLD"}
          </span>
        </span>
      </div>
    </header>
  );
}

export function BottomBar({
  acts,
  actIndex,
  actT,
  time,
  playing,
  onToggle,
  onReplay,
  onSeekAct,
}: {
  acts: ActMeta[];
  actIndex: number;
  actT: number;
  time: number;
  playing: boolean;
  onToggle: () => void;
  onReplay: () => void;
  onSeekAct: (i: number) => void;
}) {
  const act = acts[actIndex];
  return (
    <footer className="relative z-40 grid h-16 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-white/10 bg-[#0B0B0A] px-4 md:gap-6 md:px-6">
      <div className="flex items-center gap-2">
        <IconBtn onClick={onToggle} label={playing ? "Pause" : "Play"}>
          {playing ? (
            <Pause className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
          ) : (
            <Play className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
          )}
        </IconBtn>
        <IconBtn onClick={onReplay} label="Replay reel">
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
        </IconBtn>
        <div className="hidden items-center gap-2 sm:flex">
          <IconBtn onClick={() => onSeekAct(actIndex - 1)} label="Previous act">
            <SkipBack className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
          </IconBtn>
          <IconBtn onClick={() => onSeekAct(actIndex + 1)} label="Next act">
            <SkipForward className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
          </IconBtn>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="mono truncate text-[10px] tracking-[0.3em] text-[#EDE9DF] uppercase">
            <span className="text-[#FF3B1F]">{act.n}</span> — {act.title}
          </span>
          <span className="mono hidden text-[9px] tracking-[0.25em] text-white/30 uppercase lg:inline">
            {act.tag}
          </span>
        </div>
        <div className="flex gap-1">
          {acts.map((a, i) => {
            const fill = i < actIndex ? 1 : i > actIndex ? 0 : actT;
            return (
              <button
                data-hover
                key={a.n}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeekAct(i);
                }}
                aria-label={`Go to act ${a.n} — ${a.title}`}
                className="group relative h-3 flex-1"
              >
                <div
                  className={`absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden transition-colors ${
                    i === actIndex ? "bg-white/20" : "bg-white/10 group-hover:bg-white/20"
                  }`}
                >
                  <div
                    className={`h-full ${i === actIndex ? "bg-[#FF3B1F]" : "bg-[#EDE9DF]/70"}`}
                    style={{ width: `${fill * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mono tabular text-[11px] tracking-[0.15em] text-[#EDE9DF]">
        {fmtTime(time)}
        <span className="text-white/25"> / 00:15.0</span>
      </div>
    </footer>
  );
}
