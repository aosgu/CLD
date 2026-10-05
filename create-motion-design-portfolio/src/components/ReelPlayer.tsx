import { useEffect, type CSSProperties, type ComponentType } from "react";
import { Pause, RotateCcw } from "lucide-react";
import { useReelClock } from "../hooks/useReelClock";
import { easeOutCubic, seg } from "../lib/motion";
import type { ActProps } from "./ui";
import { TopBar, BottomBar } from "./Chrome";
import Act1Type from "./acts/Act1Type";
import Act2Goo from "./acts/Act2Goo";
import Act3Orbit from "./acts/Act3Orbit";
import Act4Cube from "./acts/Act4Cube";
import Act5Finale from "./acts/Act5Finale";

export interface ActMeta {
  n: string;
  title: string;
  tag: string;
  C: ComponentType<ActProps>;
}

const ACTS: ActMeta[] = [
  { n: "01", title: "Kinetic Type", tag: "TYPOGRAPHY / MASK & STAGGER", C: Act1Type },
  { n: "02", title: "Soft Systems", tag: "GOO / FIELD MERGE", C: Act2Goo },
  { n: "03", title: "Orbital Mechanics", tag: "CANVAS / 900 PARTICLES", C: Act3Orbit },
  { n: "04", title: "Perspective", tag: "CSS 3D / SNAPPED EASE", C: Act4Cube },
  { n: "05", title: "Signal Lock", tag: "GLITCH / COMPOSITE", C: Act5Finale },
];

export default function ReelPlayer({ started }: { started: boolean }) {
  const clock = useReelClock();
  const { actIndex, actT, playing, ended, time, play, toggle, replay, seekAct } = clock;

  /* auto-roll once the loader clears */
  useEffect(() => {
    if (started) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  /* editor-style keyboard transport */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.code === "KeyR") replay();
      else if (e.code === "ArrowLeft") seekAct(actIndex - 1);
      else if (e.code === "ArrowRight") seekAct(actIndex + 1);
      else if (/^Digit[1-5]$/.test(e.code)) seekAct(Number(e.code.slice(-1)) - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, replay, seekAct, actIndex]);

  /* tab title follows the cut */
  useEffect(() => {
    document.title = ended
      ? "END OF REEL — MOTION—15®"
      : `${ACTS[actIndex].title} — MOTION—15®`;
  }, [actIndex, ended]);

  /* rack-focus entrance — skipped for the 3D act (filters flatten preserve-3d) */
  const enter = easeOutCubic(seg(actT, 0, 0.16));
  const sceneStyle: CSSProperties = {
    opacity: enter,
    transform: `translateY(${(1 - enter) * 26}px) scale(${1.045 - 0.045 * enter})`,
    filter: actIndex === 3 ? undefined : `blur(${((1 - enter) * 9).toFixed(2)}px)`,
  };

  const Act = ACTS[actIndex].C;

  return (
    <div className="flex h-full flex-col">
      <TopBar playing={playing} />

      <main
        className="relative flex-1 overflow-hidden bg-black"
        onClick={() => {
          if (!ended) toggle();
        }}
      >
        <div key={actIndex} className="absolute inset-0 will-change-transform" style={sceneStyle}>
          <Act t={actT} onReplay={replay} />
        </div>

        {/* stage vignette */}
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            background:
              "radial-gradient(125% 100% at 50% 50%, transparent 58%, rgba(0,0,0,0.38) 100%)",
          }}
        />

        {/* hold indicator */}
        {started && !playing && !ended && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
            <div className="overlay-in flex items-center gap-3 border border-white/15 bg-black/60 px-5 py-3 backdrop-blur-md">
              <Pause className="h-3.5 w-3.5 text-[#FF3B1F]" fill="currentColor" strokeWidth={0} />
              <span className="mono text-[10px] tracking-[0.35em] text-[#EDE9DF] uppercase">
                Held — space to resume
              </span>
            </div>
          </div>
        )}

        {/* end card */}
        {ended && (
          <div
            className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-black/85 px-6 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="mono overlay-in text-[10px] tracking-[0.4em] text-white/40 uppercase">
              End of reel — 00:15.000
            </span>
            <h2
              className="overlay-in text-center font-black leading-[0.9] tracking-[-0.03em] text-white"
              style={{ fontSize: "min(11vw, 96px)", animationDelay: "80ms" }}
            >
              RUN IT <span className="txt-outline">BACK</span>
            </h2>
            <button
              data-hover
              onClick={replay}
              className="mono overlay-in group flex items-center gap-3 bg-[#FF3B1F] px-8 py-4 text-xs tracking-[0.35em] text-black font-bold uppercase transition-colors duration-200 hover:bg-[#EDE9DF]"
              style={{ animationDelay: "160ms" }}
            >
              <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" strokeWidth={2} />
              Replay the reel
            </button>
            <div
              className="overlay-in mt-2 flex flex-wrap items-center justify-center gap-2"
              style={{ animationDelay: "240ms" }}
            >
              {ACTS.map((a, i) => (
                <button
                  data-hover
                  key={a.n}
                  onClick={() => {
                    seekAct(i);
                    play();
                  }}
                  className="mono border border-white/15 px-3 py-2 text-[9px] tracking-[0.25em] text-white/60 uppercase transition-colors duration-150 hover:border-[#FF3B1F] hover:text-[#FF3B1F]"
                >
                  {a.n} · {a.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomBar
        acts={ACTS}
        actIndex={actIndex}
        actT={actT}
        time={time}
        playing={playing}
        onToggle={toggle}
        onReplay={replay}
        onSeekAct={(i) => {
          seekAct(i);
          if (!playing) play();
        }}
      />
    </div>
  );
}
