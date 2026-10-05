import {
  easeInCubic,
  easeInOutExpo,
  easeOutExpo,
  lerp,
  seg,
} from "../../lib/motion";
import type { ActProps } from "../ui";
import { Cap, Cross } from "../ui";

const W1 = "MOTION".split("");
const W2 = "LANGUAGE".split("");

/**
 * ACT 01 — KINETIC TYPE
 * Masked letter slam, outline counter-line, scatter exit.
 * Beats: in 0–0.5 · rule 0.34–0.52 · dolly 0.15→1 · scatter 0.78–1
 */
export default function Act1Type({ t }: ActProps) {
  const letter = (i: number, count: number, start: number, stag = 0.045) => {
    const e = easeOutExpo(seg(t, start + i * stag, start + i * stag + 0.3));
    const ex = easeInCubic(
      seg(t, 0.8 + (count - 1 - i) * 0.016, 0.82 + (count - 1 - i) * 0.016 + 0.17)
    );
    return {
      transform: `translateY(${(1 - e) * 112 - ex * 128}%) rotate(${(1 - e) * 10 - ex * 7}deg)`,
      display: "inline-block",
      willChange: "transform",
    } as const;
  };

  const push = 1 + easeInOutExpo(seg(t, 0.15, 1)) * 0.09;
  const rule = easeInOutExpo(seg(t, 0.34, 0.52)) * (1 - easeInCubic(seg(t, 0.78, 0.9)));
  const overE = easeOutExpo(seg(t, 0.1, 0.3));
  const overX = easeInCubic(seg(t, 0.8, 0.92));
  const tag = easeOutExpo(seg(t, 0.44, 0.6)) * (1 - easeInCubic(seg(t, 0.8, 0.9)));
  const ghost = lerp(6, -3, easeInOutExpo(seg(t, 0, 1)));

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F1EDE2] text-[#141310]">
      {/* ghost numeral */}
      <div
        aria-hidden
        className="absolute top-1/2 right-[2vw] -translate-y-1/2 select-none font-black leading-none text-black/[0.06] text-[52vmin] tracking-[-0.08em]"
        style={{ transform: `translate(${ghost}vw, -50%)` }}
      >
        01
      </div>

      {/* baseline hairlines */}
      <div className="absolute left-[8vw] right-[8vw] top-[16%] h-px bg-black/10" />
      <div className="absolute left-[8vw] right-[8vw] bottom-[16%] h-px bg-black/10" />

      <Cross x="8vw" y="16%" t={t} className="text-black/40" />
      <Cross x="92vw" y="84%" t={t} className="text-black/40" />
      <Cross x="92vw" y="16%" t={-t} className="text-black/25" />

      <Cap pos="tl" className="text-black/60">
        ACT_01 // KINETIC TYPE
      </Cap>
      <Cap pos="tr" className="text-black/45">
        TRT — 3.0S
      </Cap>
      <Cap pos="br" className="text-black/45">
        WEIGHT / RHYTHM / CUT
      </Cap>

      {/* composition */}
      <div
        className="absolute left-[8vw] top-1/2 will-change-transform"
        style={{ transform: `translateY(-54%) scale(${push})`, transformOrigin: "left center" }}
      >
        <div
          className="mono text-[1.6vmin] md:text-xs tracking-[0.5em] uppercase text-[#FF3B1F] mb-[2.2vmin]"
          style={{
            opacity: overE * (1 - overX),
            transform: `translateY(${(1 - overE) * 14 - overX * 30}px)`,
          }}
        >
          Typography has weight —
        </div>

        <h1 className="font-black leading-[0.84] tracking-[-0.045em] text-[21vmin]">
          <span className="block overflow-hidden pb-[0.5vmin]">
            {W1.map((ch, i) => (
              <span key={i} style={letter(i, W1.length, 0.02)}>
                {ch}
              </span>
            ))}
          </span>
          <span className="mt-[1.2vmin] flex items-baseline gap-[2.4vmin]">
            <span
              className="mono text-[2.1vmin] font-medium tracking-[0.4em] font-normal translate-y-[-3.4vmin]"
              style={{
                opacity: tag,
                transform: `translateY(calc(-3.4vmin + ${(1 - tag) * 18}px))`,
              }}
            >
              IS&nbsp;A
            </span>
            <span className="block overflow-hidden pb-[0.5vmin]">
              <span className="txt-outline" style={{ ["--ol" as string]: "#141310" }}>
                {W2.map((ch, i) => (
                  <span key={i} style={letter(i, W2.length, 0.22, 0.028)}>
                    {ch}
                  </span>
                ))}
              </span>
            </span>
          </span>
        </h1>

        {/* the red rule */}
        <div
          className="mt-[2.6vmin] h-[1.4vmin] w-full bg-[#FF3B1F] origin-left"
          style={{ transform: `scaleX(${rule})` }}
        />
        <div
          className="mono mt-[1.4vmin] flex justify-between text-[1.4vmin] tracking-[0.3em] text-black/50 uppercase"
          style={{ opacity: rule > 0.99 ? 1 - overX : 0 }}
        >
          <span>3s / act</span>
          <span>60fps / expo-out</span>
          <span className="hidden md:inline">one clock</span>
        </div>
      </div>
    </div>
  );
}
