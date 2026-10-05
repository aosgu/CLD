import { useEffect, useRef, useState } from "react";

/** global film grain — sits above everything except loader/cursor */
export function Grain() {
  return <div className="grain pointer-events-none fixed inset-0 z-[70]" />;
}

/** blend-difference cursor with magnetic hover state */
export function Cursor() {
  const [fine] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches
  );
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fine) return;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let sc = 1;
    let hover = false;
    let raf = 0;

    const move = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      hover = !!(
        e.target instanceof Element &&
        e.target.closest("[data-hover], a, button")
      );
    };
    const loop = () => {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      sc += ((hover ? 2.2 : 1) - sc) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${sc.toFixed(3)})`;
        ringRef.current.style.opacity = "1";
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, [fine]);

  if (!fine) return null;
  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[80] h-7 w-7 rounded-full border border-white opacity-0 mix-blend-difference"
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[80] h-1 w-1 rounded-full bg-white mix-blend-difference"
      />
    </>
  );
}
