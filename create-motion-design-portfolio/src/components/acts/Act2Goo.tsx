import {
  easeInBack,
  easeInCubic,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  lerp,
  seg,
} from "../../lib/motion";
import type { ActProps } from "../ui";
import { Cap } from "../ui";

/**
 * ACT 02 — SOFT SYSTEMS
 * Gooey metaballs: three fields swirl in, merge to one mass, ring draws,
 * satellites pop with springs, everything exits in a radial burst.
 * Beats: fly-in 0–0.28 · coalesce 0.46–0.7 · ring 0.62–0.82 · burst 0.84–1
 */
export default function Act2Goo({ t }: ActProps) {
  const s = t * 3; // local seconds
  const CX = 50;
  const CY = 46;

  const dist = lerp(
    lerp(64, 24, easeOutCubic(seg(t, 0.02, 0.28))),
    0,
    easeInOutCubic(seg(t, 0.46, 0.7))
  );

  const blobs = [
    { off: 0.0, dir: 1, sp: 2.1, r: 15, fill: "url(#w1)" },
    { off: 2.1, dir: -1, sp: 1.75, r: 12, fill: "url(#w2)" },
    { off: 4.2, dir: 1, sp: 2.45, r: 13.5, fill: "url(#w3)" },
  ];

  const centerR = 21 * easeOutBack(seg(t, 0.52, 0.72)) * (1 - easeInBack(seg(t, 0.86, 1)));

  const ringDrawn = easeInOutCubic(seg(t, 0.62, 0.82));
  const ringExit = easeInCubic(seg(t, 0.8, 1));
  const ringR = 27 + ringExit * 48;
  const ringC = 2 * Math.PI * 27;

  const sats = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + 0.35 + s * 0.12;
    const pop = easeOutBack(seg(t, 0.26 + i * 0.02, 0.26 + i * 0.02 + 0.16));
    const fly = easeInCubic(seg(t, 0.82, 1));
    const d = 40 + fly * 58;
    return {
      x: CX + Math.cos(a) * d,
      y: CY + Math.sin(a) * d * 0.92,
      r: Math.max(0, 1.7 * pop * (1 - fly * 1.2)),
      key: i,
    };
  });

  const massPulse = 1 + Math.sin(s * 4) * 0.02;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: "radial-gradient(120% 90% at 50% 40%, #211009 0%, #120806 55%, #0A0504 100%)",
      }}
    >
      {/* ghost word */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 flex items-center justify-center select-none"
        style={{ transform: `translateY(${Math.sin(s * 0.9) * 10}px)` }}
      >
        <span className="italic font-extralight tracking-[-0.05em] text-[36vmin] leading-none text-[#FFC9A8]/[0.09]">
          soft
        </span>
      </div>

      <svg
        className="absolute inset-0 z-10 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="goo2" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
          </filter>
          <radialGradient id="w1" cx="35%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#FF9A66" />
            <stop offset="100%" stopColor="#E8401F" />
          </radialGradient>
          <radialGradient id="w2" cx="35%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#FFD766" />
            <stop offset="100%" stopColor="#FF7A2E" />
          </radialGradient>
          <radialGradient id="w3" cx="35%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#FF88A0" />
            <stop offset="100%" stopColor="#D9235A" />
          </radialGradient>
        </defs>

        <g
          filter="url(#goo2)"
          style={{
            transform: `scale(${massPulse})`,
            transformOrigin: "50px 46px",
            transformBox: "view-box",
          }}
        >
          {blobs.map((b, i) => {
            const a = b.off + b.dir * s * b.sp;
            const breathe = 1 + Math.sin(s * 2.6 + i * 2.1) * 0.1;
            return (
              <circle
                key={i}
                cx={CX + Math.cos(a) * dist}
                cy={CY + Math.sin(a) * dist * 0.92}
                r={Math.max(0.01, b.r * breathe)}
                fill={b.fill}
              />
            );
          })}
          {centerR > 0.1 && <circle cx={CX} cy={CY} r={centerR} fill="url(#w2)" />}
        </g>

        {/* orbit ring — stays crisp, outside the goo */}
        <circle
          cx={CX}
          cy={CY}
          r={ringR}
          fill="none"
          stroke="#FFE8CF"
          strokeWidth={0.9 - ringExit * 0.6}
          strokeDasharray={ringC * (ringR / 27)}
          strokeDashoffset={ringC * (ringR / 27) * (1 - ringDrawn)}
          strokeLinecap="round"
          opacity={Math.max(0, 1 - ringExit * 1.4)}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50px 46px", transformBox: "view-box" }}
        />

        {sats.map((p) => (
          <circle key={p.key} cx={p.x} cy={p.y} r={Math.max(0.01, p.r)} fill="#FFE8CF" opacity={0.9} />
        ))}
      </svg>

      <Cap pos="tl" className="text-[#FFC9A8]/60">
        ACT_02 // SOFT SYSTEMS
      </Cap>
      <Cap pos="tr" className="text-[#FFC9A8]/40">
        FIELD THRESHOLD — 0.5
      </Cap>
      <Cap pos="bl" className="text-[#FFC9A8]/40">
        NO HARD EDGES
      </Cap>
      <Cap pos="br" className="text-[#FFC9A8]/40">
        TRT — 3.0S
      </Cap>
    </div>
  );
}
