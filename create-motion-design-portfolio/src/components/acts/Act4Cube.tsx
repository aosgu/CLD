import {
  easeInCubic,
  easeInOutQuint,
  easeInExpo,
  easeOutExpo,
  lerp,
  seg,
} from "../../lib/motion";
import type { ActProps } from "../ui";
import { Cap } from "../ui";

const FACES: { word: string; label: string; tf: string }[] = [
  { word: "FORM", label: "FACE_01", tf: "rotateY(0deg) translateZ(calc(var(--cube) / 2))" },
  { word: "MOTION", label: "FACE_02", tf: "rotateY(90deg) translateZ(calc(var(--cube) / 2))" },
  { word: "COLOR", label: "FACE_03", tf: "rotateY(180deg) translateZ(calc(var(--cube) / 2))" },
  { word: "TIME", label: "FACE_04", tf: "rotateY(-90deg) translateZ(calc(var(--cube) / 2))" },
];

/**
 * ACT 04 — PERSPECTIVE
 * A brutalist cube on vermilion. Enters spinning, snaps 90° per beat —
 * FORM → MOTION → COLOR → TIME — then ejects through the camera.
 */
export default function Act4Cube({ t }: ActProps) {
  let rot = -230;
  rot = lerp(rot, 0, easeOutExpo(seg(t, 0.0, 0.2)));
  rot = lerp(rot, -90, easeInOutQuint(seg(t, 0.3, 0.42)));
  rot = lerp(rot, -180, easeInOutQuint(seg(t, 0.53, 0.65)));
  rot = lerp(rot, -270, easeInOutQuint(seg(t, 0.74, 0.86)));
  rot = lerp(rot, -455, easeInExpo(seg(t, 0.88, 1)));
  rot += Math.sin(t * 9.42) * 1.1;

  const rx = -15 + Math.sin(t * 6.28) * 3;
  const sc = 1 - 0.55 * easeInCubic(seg(t, 0.9, 1));
  const faceIdx =
    t < 0.3 ? 0 : t < 0.53 ? 1 : t < 0.74 ? 2 : 3;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#FF4A1C]">
      {/* duotone wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 85% at 50% 30%, rgba(255,255,255,0.16) 0%, rgba(0,0,0,0) 45%), radial-gradient(120% 100% at 50% 110%, rgba(60,5,0,0.45) 0%, rgba(0,0,0,0) 60%)",
        }}
      />

      {/* floor grid */}
      <div
        className="absolute inset-x-[-60vw] bottom-[-42vh] h-[90vh] opacity-[0.35]"
        style={{
          transform: "perspective(900px) rotateX(66deg)",
          transformOrigin: "bottom center",
          background:
            "repeating-linear-gradient(90deg, rgba(20,5,0,0.55) 0 2px, transparent 2px 72px), repeating-linear-gradient(0deg, rgba(20,5,0,0.55) 0 2px, transparent 2px 72px)",
          maskImage: "linear-gradient(to top, black 30%, transparent 80%)",
          WebkitMaskImage: "linear-gradient(to top, black 30%, transparent 80%)",
        }}
      />

      {/* shadow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-[50%] bg-[#3A0D00] blur-[26px]"
        style={{
          width: "calc(var(--cube) * 1.15)",
          height: "calc(var(--cube) * 0.16)",
          transform: `translate(-50%, calc(var(--cube) * 0.62)) scale(${sc})`,
          opacity: 0.45,
          ["--cube" as string]: "min(36vmin, 380px)",
        }}
      />

      {/* cube */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "1500px" }}
      >
        <div
          className="relative"
          style={{
            width: "var(--cube)",
            height: "var(--cube)",
            ["--cube" as string]: "min(36vmin, 380px)",
            transformStyle: "preserve-3d",
            transform: `scale(${sc}) rotateX(${rx}deg) rotateY(${rot}deg)`,
          }}
        >
          {FACES.map((f) => (
            <div
              key={f.label}
              className="absolute inset-0 flex flex-col justify-between border border-[#F6EFE0]/20 bg-[#131210] p-[7%]"
              style={{ transform: f.tf, backfaceVisibility: "hidden" }}
            >
              <div className="flex items-start justify-between">
                <span className="mono text-[1.5vmin] tracking-[0.3em] text-[#F6EFE0]/50">
                  {f.label}
                </span>
                <span className="mono text-[1.5vmin] text-[#FF4A1C]">+</span>
              </div>
              <div
                className="font-black leading-[0.85] tracking-[-0.03em] text-[#F6EFE0]"
                style={{ fontSize: "calc(var(--cube) * 0.19)" }}
              >
                {f.word}
                <div className="mt-[8%] h-[0.9vmin] w-1/3 bg-[#FF4A1C]" />
              </div>
            </div>
          ))}
          <div
            className="absolute inset-0 bg-[#0C0B0A]"
            style={{ transform: "rotateX(90deg) translateZ(calc(var(--cube) / 2))", backfaceVisibility: "hidden" }}
          />
          <div
            className="absolute inset-0 bg-[#0C0B0A]"
            style={{ transform: "rotateX(-90deg) translateZ(calc(var(--cube) / 2))", backfaceVisibility: "hidden" }}
          />
        </div>
      </div>

      {/* readout */}
      <div className="absolute bottom-[14%] left-1/2 z-20 -translate-x-1/2">
        <div className="flex items-center gap-3 border border-black/25 bg-[#131210] px-4 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF4A1C] soft-pulse" />
          <span className="mono text-[10px] tracking-[0.35em] text-[#F6EFE0] uppercase">
            {FACES[faceIdx].label} — {FACES[faceIdx].word}
          </span>
        </div>
      </div>

      <Cap pos="tl" className="text-black/60">
        ACT_04 // PERSPECTIVE
      </Cap>
      <Cap pos="tr" className="text-black/45">
        DESIGN HAS MANY SIDES
      </Cap>
      <Cap pos="bl" className="text-black/45">
        CSS 3D / SNAPPED EASE
      </Cap>
    </div>
  );
}
