import { useCallback, useEffect, useRef, useState } from "react";
import { ACT_DUR, ACT_COUNT, TOTAL, clamp } from "../lib/motion";

export interface ReelClock {
  /** global time, seconds 0..15 */
  time: number;
  playing: boolean;
  ended: boolean;
  actIndex: number;
  /** local act progress 0..1 */
  actT: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  replay: () => void;
  seekTo: (t: number) => void;
  seekAct: (i: number) => void;
}

/**
 * One clock for the whole reel. Delta-accumulated so it survives tab
 * throttling, and fully seekable — every scene is a pure function of t.
 */
export function useReelClock(): ReelClock {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  const tRef = useRef(0);
  const playingRef = useRef(false);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const loop = (ts: number) => {
      if (playingRef.current) {
        if (lastRef.current === null) lastRef.current = ts;
        const dt = Math.min(0.05, (ts - lastRef.current) / 1000);
        lastRef.current = ts;
        tRef.current = Math.min(TOTAL, tRef.current + dt);
        if (tRef.current >= TOTAL) {
          playingRef.current = false;
          setPlaying(false);
          setEnded(true);
        }
        setTime(tRef.current);
      } else {
        lastRef.current = null;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const play = useCallback(() => {
    if (tRef.current >= TOTAL) tRef.current = 0;
    setEnded(false);
    playingRef.current = true;
    setPlaying(true);
    setTime(tRef.current);
  }, []);

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (playingRef.current) pause();
    else play();
  }, [pause, play]);

  const replay = useCallback(() => {
    tRef.current = 0;
    setEnded(false);
    setTime(0);
    playingRef.current = true;
    setPlaying(true);
  }, []);

  const seekTo = useCallback((t: number) => {
    tRef.current = clamp(t, 0, TOTAL);
    setEnded(false);
    setTime(tRef.current);
  }, []);

  const seekAct = useCallback(
    (i: number) => {
      seekTo(clamp(i, 0, ACT_COUNT - 1) * ACT_DUR + 0.001);
    },
    [seekTo]
  );

  const actIndex = Math.min(ACT_COUNT - 1, Math.floor(time / ACT_DUR));
  const actT = time >= TOTAL ? 1 : (time - actIndex * ACT_DUR) / ACT_DUR;

  return {
    time,
    playing,
    ended,
    actIndex,
    actT,
    play,
    pause,
    toggle,
    replay,
    seekTo,
    seekAct,
  };
}
