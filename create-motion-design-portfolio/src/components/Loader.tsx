import { useEffect, useRef, useState } from "react";
import { easeOutCubic } from "../lib/motion";

export default function Loader({
  onStart,
  onExited,
}: {
  onStart: () => void;
  onExited: () => void;
}) {
  const [pct, setPct] = useState(0);
  const [out, setOut] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const loop = (ts: number) => {
      const p = Math.min(1, (ts - t0) / 1050);
      setPct(p);
      if (p >= 1) {
        if (!fired.current) {
          fired.current = true;
          onStart();
          setOut(true);
          window.setTimeout(onExited, 620);
        }
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onStart, onExited]);

  const val = Math.round(easeOutCubic(pct) * 100);
  const litCount = Math.floor(easeOutCubic(pct) * 5.999);

  return (
    <div
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#070707] ${
        out ? "loader-out" : ""
      }`}
    >
      <div className="mono mb-4 flex items-center gap-3 text-[10px] tracking-[0.4em] text-white/40 uppercase">
        <span className="inline-block h-1.5 w-1.5 bg-[#FF3B1F]" />
        Loading reel
      </div>

      <div className="tabular select-none font-black leading-none tracking-[-0.05em] text-[26vmin] text-[#EDE9DF]">
        {String(val).padStart(3, "0")}
      </div>

      <div className="mt-6 flex gap-1.5">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`h-[3px] w-10 transition-colors duration-150 ${
              i < litCount ? "bg-[#FF3B1F]" : "bg-white/12"
            }`}
          />
        ))}
      </div>

      <div className="mono mt-6 text-[10px] tracking-[0.35em] text-white/30 uppercase">
        15 seconds · 5 acts · 1 take
      </div>

      <div className="mono absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.3em] text-white/25 uppercase">
        Space = hold · ←/→ = skip · R = replay
      </div>
    </div>
  );
}
