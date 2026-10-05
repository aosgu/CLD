import { useCallback, useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useSceneClock() {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const elapsed = useRef(0);

  useEffect(() => {
    if (!playing) return;

    let frame = 0;
    let previous: number | null = null;
    const tick = (now: number) => {
      // Time stays still in a hidden tab instead of skipping the animation.
      if (document.hidden) {
        previous = null;
      } else {
        if (previous !== null) {
          elapsed.current += Math.min((now - previous) / 1000, 0.064);
        }
        previous = now;
        setTime(elapsed.current);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (preference.matches) setPlaying(false);
    };
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  const toggle = useCallback(() => setPlaying((value) => !value), []);
  const play = useCallback(() => setPlaying(true), []);
  const restart = useCallback(() => {
    elapsed.current = 0;
    setTime(0);
    setPlaying(!prefersReducedMotion());
  }, []);

  return { time, playing, toggle, play, restart };
}