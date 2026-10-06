import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "../index.css";
import "./render.css";
import CausalDiagram from "../components/CausalDiagram";
import { DURATION, sceneAt, SCENES, type Scene } from "./composition";
import { clamp } from "../lib/cldMotion";

// ?theme=orange|blue|green|purple (same ids as the website's theme switcher).
const THEMES = ["orange", "blue", "green", "purple"];
const requested = new URLSearchParams(location.search).get("theme") ?? "orange";
const THEME = THEMES.includes(requested) ? requested : "orange";

const easeInCubic = (v: number) => v ** 3;
const easeInQuart = (v: number) => v ** 4;
const easeOutCubic = (v: number) => 1 - (1 - v) ** 3;

// Viewport is 720x1280 CSS px (rendered at 1.5x => 1080x1920). The black hole has to
// outgrow the farthest corner of the frame: sqrt(360^2 + 640^2) ~= 734.
const HOLE_FINAL_RADIUS = 760;

/**
 * Ending: the loop folds into its centre and collapses into a black dot, which then
 * swallows the whole frame. The last frame is solid black.
 *   0.00-0.90  arrows retract, cards shrink, centre readout fades, cubes are drawn
 *              into the centre one after another (clockwise)
 *   0.40-0.60  a black dot appears where the cubes meet
 *   0.55-1.85  the dot accelerates outwards until it covers the frame
 *   1.85-2.00  hold on black
 */
function outroStyle(t: number) {
  const fade = easeInCubic(clamp(t / 0.35));
  const vars: Record<string, string | number> = {
    "--out-fade": fade,
    "--out-arrow": easeInCubic(clamp(t / 0.7)),
  };
  for (let i = 0; i < 4; i++) {
    const u = clamp((t - i * 0.08) / 0.6);
    const p = easeInCubic(u);
    vars[`--out-move-${i + 1}`] = p;
    vars[`--out-scale-${i + 1}`] = 1 - 0.9 * p;
    vars[`--out-alpha-${i + 1}`] = 1 - clamp((u - 0.8) / 0.2);
  }
  const birth = easeOutCubic(clamp((t - 0.4) / 0.2));
  const grow = easeInQuart(clamp((t - 0.55) / 1.3));
  const radius = birth * 16 + grow * (HOLE_FINAL_RADIUS - 16);
  vars["--hole-size"] = `${(radius * 2).toFixed(2)}px`;
  vars["--hole-alpha"] = t >= 0.4 ? 1 : 0;
  vars["--black-alpha"] = t >= 1.9 ? 1 : 0;
  return vars;
}

function Stage({ scene }: { scene: Scene }) {
  const outro = scene.time >= SCENES.outro.start;
  const classes = [
    "cld-page",
    "render-stage",
    "is-playing",
    `theme-${THEME}`,
    `mode-${scene.mode}`,
    scene.intro ? "is-intro" : "",
    outro ? "is-outro" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={classes} style={outro ? (outroStyle(scene.outroTime) as React.CSSProperties) : undefined}>
      <CausalDiagram
        time={scene.time}
        frames={scene.frames}
        example={scene.example}
        mode={scene.mode}
        modeElapsed={scene.modeElapsed}
        negativeEdges={scene.negativeEdges}
        onFlipNode={() => {}}
      />
      <div className="end-hole" />
      <div className="end-black" />
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);

// CSS animations and transitions run on the document timeline, which we can't step.
// Instead every animation is paused and seeked to (frame time - time it first appeared).
const born = new WeakMap<Animation, number>();
function seekAnimations(time: number) {
  for (const animation of document.getAnimations()) {
    if (!born.has(animation)) born.set(animation, time);
    animation.pause();
    animation.currentTime = (time - born.get(animation)!) * 1000;
  }
}

declare global {
  interface Window {
    __renderFrame: (time: number) => Promise<void>;
    __duration: number;
  }
}

window.__duration = DURATION;
window.__renderFrame = async (time: number) => {
  const scene = sceneAt(time);
  flushSync(() => root.render(<Stage scene={scene} />));
  seekAnimations(time);
  void document.body.offsetHeight; // layout, so any webfont for new glyphs starts loading
  await document.fonts.ready;
  seekAnimations(time);
};
