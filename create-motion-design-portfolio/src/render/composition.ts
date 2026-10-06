import {
  CubeTimeline, LOOP_EXAMPLES, clamp, type CubeFrame, type LoopExample, type LoopMode,
} from "../lib/cldMotion";

/**
 * Deterministic storyboard of the 1080x1920 video. Everything on screen is a pure
 * function of the frame time, except the cube timelines, which are stateful: call
 * `sceneAt` with non-decreasing times (the render script steps frame by frame).
 */
export const SCENES = {
  intro: { start: 0, end: 2 },
  balancing: { start: 2, end: 9 },
  reinforcing: { start: 9, end: 18 },
  gutGlucose: { start: 18, end: 23 },
  outro: { start: 23, end: 25 },
} as const;

export const DURATION = SCENES.outro.end;

const [GENERAL, GUT] = [LOOP_EXAMPLES[0], LOOP_EXAMPLES[1]];

// Stagger between the four cubes when they turn over into the gut-glucose example.
const SWAP_STAGGER = 0.14;

const mulberry = (seed: number) => () => {
  let v = (seed += 0x6d2b79f5);
  v = Math.imul(v ^ (v >>> 15), v | 1);
  v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
  return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
};

// Balancing loop: the same rule as the app (flip a random pair so the number of
// negative links stays odd), but on a seeded schedule so every render is identical.
const INITIAL_NEGATIVE = [false, true, false, false];
const FLIPS: { at: number; pair: [number, number] }[] = (() => {
  const random = mulberry(20260);
  const flips: { at: number; pair: [number, number] }[] = [];
  let at = SCENES.balancing.start + 1.1;
  while (at < SCENES.balancing.end - 0.8) {
    const first = Math.floor(random() * 4);
    const second = (first + 1 + Math.floor(random() * 3)) % 4;
    flips.push({ at, pair: [first, second] });
    at += 1.25 + random() * 1.35;
  }
  return flips;
})();

const timelines = [0, 1, 2, 3].map((index) => new CubeTimeline(index));
const swapAt: (number | null)[] = [null, null, null, null];
let swapStarted = false;

export interface Scene {
  time: number;
  frames: CubeFrame[];
  example: LoopExample;
  mode: LoopMode;
  modeElapsed: number;
  negativeEdges: boolean[];
  intro: boolean;
  /** 0..1 progress of the ending animation (time based, un-eased). */
  outroTime: number;
}

export function sceneAt(time: number): Scene {
  // Turn the cubes over into the gut-glucose example; the content swaps at the
  // midpoint of each cube's rotation, when its old face is edge-on.
  if (!swapStarted && time >= SCENES.gutGlucose.start) {
    swapStarted = true;
    timelines.forEach((timeline, index) => {
      const startAt = SCENES.gutGlucose.start + index * SWAP_STAGGER;
      timeline.flip(startAt);
      const before = timeline.sample(startAt).eventId;
      let probe = startAt;
      while (timeline.sample(probe).eventId === before && probe < startAt + 3) probe += 0.004;
      swapAt[index] = probe;
    });
  }

  const frames = timelines.map((timeline) => timeline.sample(time));
  const swapped = (index: number) => swapAt[index] !== null && time >= swapAt[index]!;
  const nodes = GENERAL.nodes.map((node, index) => (swapped(index) ? GUT.nodes[index] : node));
  const centreSwapped = time >= SCENES.gutGlucose.start + 0.5;
  const base = centreSwapped ? GUT : GENERAL;
  const example: LoopExample = { ...base, nodes };

  const reinforcing = time >= SCENES.reinforcing.start;
  let negativeEdges = [false, false, false, false];
  if (!reinforcing) {
    negativeEdges = [...INITIAL_NEGATIVE];
    for (const flip of FLIPS) {
      if (time < flip.at) break;
      negativeEdges[flip.pair[0]] = !negativeEdges[flip.pair[0]];
      negativeEdges[flip.pair[1]] = !negativeEdges[flip.pair[1]];
    }
  }

  return {
    time,
    frames,
    example,
    mode: reinforcing ? "reinforcing" : "balancing",
    modeElapsed: reinforcing ? Math.max(0, time - SCENES.reinforcing.start) : 0,
    negativeEdges,
    intro: time < SCENES.intro.end,
    outroTime: clamp(time - SCENES.outro.start, 0, SCENES.outro.end - SCENES.outro.start),
  };
}
