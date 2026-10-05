import { RotateCcw } from "lucide-react";
import { clamp, easeOutCubic, prand, seg } from "../../lib/motion";
import type { ActProps } from "../ui";
import { Cap } from "../ui";

/**
 * ACT 05 — SIGNAL LOCK
 * RGB-split glitch chaos resolves into the locked brand card.
 * Beats: static 0–0.12 · splits 0–0.6 (decaying) · lock 0.55 · reveal 0.58+
 */
export default function Act5Finale({ t, onReplay }: ActProps) {
  const f = Math.floor(t * 24);
  const env = 1 - easeOutCubic(seg(t, 0.42, 0.6));

  const dx = (prand(f) - 0.5) * 2 * env * 34;
  const dy = (prand(f + 7) - 0.5) * 2 * env * 14;
  const shakeX = (prand(f + 41) - 0.5) * 2 * env * 7;
  const shakeY = (prand(f + 55) - 0.5) * 2 * env * 5;

  const sliceA = prand(f + 13) > 0.42 && env > 0.02;
  const sliceB = prand(f + 29) > 0.55 && env > 0.02;
  const saTop = prand(f + 21) * 78;
  const saH = 5 + prand(f + 23) * 12;
  const sbTop = prand(f + 31) * 78;
  const sbH = 4 + prand(f + 37) * 10;
  const saX = (prand(f + 33) - 0.5) * 2 * (20 + env * 60) * env;
  const sbX = (prand(f + 39) - 0.5) * 2 * (20 + env * 60) * env;

  const inverted =
    (t >= 0.1 && t <= 0.118) || (t >= 0.335 && t <= 0.35);
  const lockFlash = 1 - clamp(Math.abs(t - 0.55) / 0.05);
  const noise = t < 0.14 ? (0.14 - t) * 6 : 0;
  const zoom = 1 + easeOutCubic(seg(t, 0.6, 1)) * 0.05;

  const subE = easeOutCubic(seg(t, 0.58, 0.76));
  const credE = easeOutCubic(seg(t, 0.7, 0.84));
  const btnE = easeOutCubic(seg(t, 0.78, 0.92));
  const cornerE = easeOutCubic(seg(t, 0.55, 0.7));
  const endFade = seg(t, 0.975, 1);
  const blink = Math.floor(t * 4) % 2 === 0;

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#060606]"
      style={{ filter: inverted ? "invert(1)" : undefined }}
    >
      {/* static burst */}
      {noise > 0.01 && (
        <div className="grain absolute inset-0 z-30" style={{ opacity: noise, mixBlendMode: "screen" }} />
      )}

      {/* scanlines */}
      <div
        className="absolute inset-0 z-10 opacity-60"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,0.025) 3px 4px)",
        }}
      />

      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center"
        style={{ transform: `translate(${shakeX}px, ${shakeY}px) scale(${zoom})` }}
      >
        {/* corner brackets */}
        <div
          className="absolute inset-[7%] pointer-events-none"
          style={{ opacity: cornerE * 0.7 }}
        >
          {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map(
            (c) => (
              <div key={c} className={`absolute h-6 w-6 border-white/50 ${c}`} />
            )
          )}
        </div>

        <div className="mono mb-[2vmin] flex items-center gap-[0.8em] text-[1.5vmin] tracking-[0.5em] text-white/40 uppercase">
          <span>// Signal locked — reel 05/05</span>
          <span
            className="inline-block h-[0.9em] w-[0.6em] bg-white/70"
            style={{ opacity: blink ? 1 : 0.1 }}
          />
        </div>

        {/* glitch stack */}
        <div className="relative select-none" style={{ transform: `translateX(${dx * 0.4}px)` }}>
          <div
            aria-hidden
            className="absolute inset-0 font-black leading-[0.8] tracking-[-0.06em] text-[44vmin] text-[#FF2E2E] mix-blend-screen"
            style={{ transform: `translate(${-dx}px, ${dy * 0.7}px)`, opacity: 0.85 }}
          >
            15
          </div>
          <div
            aria-hidden
            className="absolute inset-0 font-black leading-[0.8] tracking-[-0.06em] text-[44vmin] text-[#2DFFF3] mix-blend-screen"
            style={{ transform: `translate(${dx}px, ${-dy * 0.7}px)`, opacity: 0.85 }}
          >
            15
          </div>
          {sliceA && (
            <div
              aria-hidden
              className="absolute inset-0 font-black leading-[0.8] tracking-[-0.06em] text-[44vmin] text-white"
              style={{
                clipPath: `inset(${saTop}% -6% ${100 - saTop - saH}% -6%)`,
                transform: `translateX(${saX}px)`,
              }}
            >
              15
            </div>
          )}
          {sliceB && (
            <div
              aria-hidden
              className="absolute inset-0 font-black leading-[0.8] tracking-[-0.06em] text-[44vmin] text-[#FF2E2E] mix-blend-screen"
              style={{
                clipPath: `inset(${sbTop}% -6% ${100 - sbTop - sbH}% -6%)`,
                transform: `translateX(${sbX}px)`,
              }}
            >
              15
            </div>
          )}
          <div className="relative font-black leading-[0.8] tracking-[-0.06em] text-[44vmin] text-white">
            15
          </div>
        </div>

        <div className="mt-[1vmin] overflow-hidden">
          <div
            className="txt-outline font-semibold uppercase tracking-[0.42em] text-[3.6vmin]"
            style={{
              transform: `translateY(${(1 - subE) * 110}%)`,
              opacity: subE,
              ["--ol" as string]: "#ffffff",
            }}
          >
            Seconds of motion
          </div>
        </div>

        <div
          className="mono mt-[3.5vmin] text-center text-[1.3vmin] tracking-[0.3em] text-white/35 uppercase"
          style={{ opacity: credE, transform: `translateY(${(1 - credE) * 12}px)` }}
        >
          Direction · Design · Code — one requestAnimationFrame
        </div>

        <button
          data-hover
          onClick={(e) => {
            e.stopPropagation();
            onReplay?.();
          }}
          className="mono group mt-[3vmin] flex items-center gap-3 border border-white/25 px-6 py-3 text-[1.4vmin] tracking-[0.4em] text-white uppercase transition-colors duration-200 hover:border-white hover:bg-white hover:text-black"
          style={{
            opacity: btnE,
            transform: `translateY(${(1 - btnE) * 16}px)`,
            pointerEvents: btnE > 0.5 ? "auto" : "none",
          }}
        >
          <RotateCcw className="h-[1.5em] w-[1.5em] transition-transform duration-500 group-hover:-rotate-180" strokeWidth={1.5} />
          Run it back
        </button>
      </div>

      {/* lock flash */}
      {lockFlash > 0.01 && (
        <div className="absolute inset-0 z-40 bg-white" style={{ opacity: lockFlash }} />
      )}
      {/* land on black */}
      {endFade > 0 && <div className="absolute inset-0 z-40 bg-black" style={{ opacity: endFade }} />}

      <Cap pos="tl" className="text-white/40">
        ACT_05 // SIGNAL LOCK
      </Cap>
      <Cap pos="tr" className="text-white/30">
        00:15.000 — CUT
      </Cap>
    </div>
  );
}
