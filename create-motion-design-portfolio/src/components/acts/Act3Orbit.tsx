import { useEffect, useMemo, useRef, useState } from "react";
import { easeInCubic, easeOutCubic, easeOutExpo, mulberry32, seg } from "../../lib/motion";
import type { ActProps } from "../ui";
import { Cap } from "../ui";

const N = 900;
const HEX = ["#9CC3FF", "#5B8CFF", "#46E8FF", "#EAF6FF", "#3D5BFF"];
const RGB = HEX.map((h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
]);
const rgba = (ci: number, a: number) => {
  const [r, g, b] = RGB[ci];
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
};

interface Particle {
  a: number; rf: number; sp: number; sz: number; ci: number;
  wob: number; wobF: number; twF: number; stg: number; bang: number; big: boolean;
}

/**
 * ACT 03 — ORBITAL MECHANICS
 * A stateless canvas simulation: 900 bodies spiral out of a nucleus,
 * lock into orbit, collapse, flash, and blow out with additive trails.
 * No particle state is ever stored — position is f(t).
 */
export default function Act3Orbit({ t }: ActProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const prevT = useRef(-1);

  const parts = useMemo<Particle[]>(() => {
    const rnd = mulberry32(20260214);
    return Array.from({ length: N }, () => ({
      a: rnd() * Math.PI * 2,
      rf: 0.15 + rnd() * 0.34,
      sp: (0.45 + rnd() * 1.5) * (rnd() > 0.5 ? 1 : -1),
      sz: 0.7 + rnd() * 1.9,
      ci: Math.min(RGB.length - 1, Math.floor(Math.pow(rnd(), 1.5) * RGB.length)),
      wob: rnd() * Math.PI * 2,
      wobF: 1.5 + rnd() * 3,
      twF: 2 + rnd() * 5,
      stg: rnd(),
      bang: 0.55 + rnd() * 1.7,
      big: rnd() > 0.93,
    }));
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || size.w < 2) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const bw = Math.round(size.w * dpr);
    const bh = Math.round(size.h * dpr);
    if (cv.width !== bw || cv.height !== bh) {
      cv.width = bw;
      cv.height = bh;
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = size.w;
    const h = size.h;
    const cx = w / 2;
    const cy = h / 2;
    const min = Math.min(w, h);
    const s = t * 3;

    const jump =
      prevT.current < 0 || t < prevT.current || Math.abs(t - prevT.current) > 0.03;
    if (jump) {
      ctx.clearRect(0, 0, w, h);
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(4,5,14,0.3)";
      ctx.fillRect(0, 0, w, h);
    }
    prevT.current = t;

    const collapse = easeInCubic(seg(t, 0.6, 0.78));
    const explode = seg(t, 0.78, 1);
    const ex = easeOutExpo(explode);

    /* -------- guide ring -------- */
    if (t < 0.8) {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = `rgba(124,158,255,${(0.22 * (1 - collapse)).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 9]);
      ctx.lineDashOffset = -s * 40;
      ctx.beginPath();
      ctx.arc(cx, cy, min * 0.325, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    /* -------- bodies -------- */
    ctx.globalCompositeOperation = "lighter";
    for (const p of parts) {
      const born = easeOutCubic(seg(t, 0.02 + p.stg * 0.1, 0.16 + p.stg * 0.13));
      if (born <= 0.002) continue;
      const ang = p.a + p.sp * s + collapse * 7.5 * Math.sign(p.sp);
      let alpha = 0.5 + 0.5 * Math.sin(s * p.twF + p.wob * 3);

      if (explode > 0) {
        const fade = 1 - seg(t, 0.82, 0.99);
        if (fade <= 0) continue;
        const r = ex * min * 0.62 * p.bang + p.rf * min * 0.04;
        const vx = Math.cos(ang);
        const vy = Math.sin(ang) * 0.98;
        const x = cx + vx * r;
        const y = cy + vy * r;
        const L = 24 * p.bang * ex + 5;
        ctx.strokeStyle = rgba(p.ci, Math.min(1, alpha + 0.3) * fade * 0.85);
        ctx.lineWidth = p.sz * 0.85;
        ctx.beginPath();
        ctx.moveTo(x - vx * L, y - vy * L);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        const r =
          p.rf * min * born * (1 - collapse) +
          Math.sin(s * p.wobF + p.wob) * min * 0.006;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r * 0.97;
        const heat = 1 + collapse * 1.6; // particles glow hotter as they fall
        ctx.fillStyle = rgba(p.ci, Math.min(1, alpha * heat));
        if (p.big) {
          ctx.beginPath();
          ctx.arc(x, y, p.sz * 2.1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, p.sz, p.sz);
        }
      }
    }

    /* -------- nucleus -------- */
    if (t < 0.785) {
      const born = easeOutCubic(seg(t, 0, 0.15));
      const pulse = 1 + 0.28 * Math.sin(s * 9);
      const nr = (min * 0.018 + collapse * min * 0.05) * pulse * born + 2;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, nr * 4.5);
      const base = Math.min(1, 0.75 + collapse);
      g.addColorStop(0, `rgba(234,246,255,${base})`);
      g.addColorStop(0.25, `rgba(70,232,255,${(base * 0.75).toFixed(3)})`);
      g.addColorStop(1, "rgba(61,91,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, nr * 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    /* -------- flash + shockwave -------- */
    const flash = seg(t, 0.78, 0.94);
    if (flash > 0 && flash < 1) {
      const fr = easeOutCubic(flash) * min * 1.25;
      const fa = Math.pow(1 - flash, 2) * 0.9;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, fr);
      g.addColorStop(0, `rgba(255,255,255,${fa.toFixed(3)})`);
      g.addColorStop(0.4, `rgba(160,220,255,${(fa * 0.55).toFixed(3)})`);
      g.addColorStop(1, "rgba(120,180,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, fr, 0, Math.PI * 2);
      ctx.fill();
    }
    if (explode > 0) {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = `rgba(200,225,255,${(Math.pow(1 - explode, 1.6) * 0.65).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, ex * min * 0.85 + 1, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [t, size, parts]);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        background: "radial-gradient(130% 100% at 50% 45%, #070A1C 0%, #04050E 60%, #020308 100%)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />

      {/* reticle */}
      <div className="absolute left-1/2 top-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 opacity-30 mix-blend-screen pointer-events-none">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#9CC3FF]" />
        <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-[#9CC3FF]" />
      </div>

      <Cap pos="tl" className="text-[#9CC3FF]/60">
        ACT_03 // ORBITAL MECHANICS
      </Cap>
      <Cap pos="tr" className="text-[#9CC3FF]/40">
        900 BODIES — ONE CLOCK
      </Cap>
      <Cap pos="bl" className="text-[#9CC3FF]/40">
        STATELESS — POSITION = ƒ(T)
      </Cap>
      <Cap pos="br" className="text-[#9CC3FF]/40">
        TRT — 3.0S
      </Cap>
    </div>
  );
}
