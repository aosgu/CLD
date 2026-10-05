import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { Cursor, Grain } from "../components/Overlays";
import "./cld.css";

type NodePosition = "north" | "east" | "south" | "west";

type LoopNode = {
  id: string;
  word: string;
  position: NodePosition;
};

const NODES: LoopNode[] = [
  { id: "01", word: "FORM", position: "north" },
  { id: "02", word: "MOTION", position: "east" },
  { id: "03", word: "COLOR", position: "south" },
  { id: "04", word: "TIME", position: "west" },
];

const FACES = [
  { name: "front", index: "FACE_01" },
  { name: "right", index: "FACE_02" },
  { name: "back", index: "FACE_03" },
  { name: "left", index: "FACE_04" },
] as const;

const STARTING_ROTATIONS = [
  { x: -13, y: -25 },
  { x: -18, y: 32 },
  { x: -8, y: 205 },
  { x: -22, y: 142 },
];

const LINKS = [
  { from: "FORM", to: "MOTION", path: "M58.5 26.5 C64.3 29.7 69.8 34.7 73.3 41.8" },
  { from: "MOTION", to: "COLOR", path: "M73.1 58.2 C70.5 65 64 70.7 58.2 73.4" },
  { from: "COLOR", to: "TIME", path: "M41.8 73.2 C34.7 70.4 29 64.6 26.5 58.1" },
  { from: "TIME", to: "FORM", path: "M26.8 41.5 C29.4 34.6 35.2 29.1 41.9 26.5" },
];

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function CubeNode({
  node,
  index,
  paused,
  reducedMotion,
}: {
  node: LoopNode;
  index: number;
  paused: boolean;
  reducedMotion: boolean;
}) {
  const [rotation, setRotation] = useState(STARTING_ROTATIONS[index]);

  // Each cube chooses its own axis, direction, and interval. Turns land on
  // quarter turns like the original Act 04 cube, with an occasional full spin.
  useEffect(() => {
    if (paused || reducedMotion) return;

    const timeout = window.setTimeout(() => {
      setRotation((current) => {
        const axis = Math.random() < 0.76 ? "y" : "x";
        const direction = Math.random() < 0.5 ? -1 : 1;
        const amount = Math.random() < 0.12 ? 360 : Math.random() < 0.22 ? 180 : 90;
        const turn = amount * direction;
        return axis === "y"
          ? { ...current, y: current.y + turn }
          : { ...current, x: current.x + turn };
      });
    }, 1900 + Math.random() * 2500);

    return () => window.clearTimeout(timeout);
  }, [rotation, paused, reducedMotion]);

  const style = {
    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
  } satisfies CSSProperties;

  return (
    <div
      className={`cld-node cld-node--${node.position}`}
      role="img"
      aria-label={`Node ${node.id}: ${node.word}`}
    >
      <div className="cld-node-shadow" aria-hidden="true" />
      <div className="cld-cube-upright" aria-hidden="true">
        <div className="cld-cube" style={style}>
          {FACES.map((face) => (
            <div
              className={`cld-cube__face cld-cube__face--${face.name}`}
              key={face.name}
            >
              <div className="cld-cube__topline">
                <span className="mono">{node.id} / {face.index}</span>
                <span className="cld-cube__plus">+</span>
              </div>
              <div className="cld-cube__word">{node.word}</div>
              <div className="cld-cube__baseline">
                <span>VARIABLE</span>
                <span className="cld-cube__rule" />
              </div>
            </div>
          ))}
          <div className="cld-cube__face cld-cube__face--top">
            <span className="mono">CLD / {node.id}</span>
            <span className="cld-cube__top-mark">↻</span>
          </div>
          <div className="cld-cube__face cld-cube__face--bottom" />
        </div>
      </div>
    </div>
  );
}

function LoopDiagram({ paused, reducedMotion }: { paused: boolean; reducedMotion: boolean }) {
  return (
    <section
      className="cld-diagram-stage"
      aria-label="Clockwise causal loop linking FORM to MOTION, COLOR, TIME, and back to FORM"
    >
      <div className="cld-stage-wash" aria-hidden="true" />
      <div className="cld-stage-grid" aria-hidden="true" />
      <div className="cld-stage-topline" aria-hidden="true">
        <span>MODEL_01 / FOUR VARIABLES</span>
        <span>3D — HORIZONTAL PLANE</span>
      </div>

      <div className="cld-diagram-scene">
        <div className="cld-ground-plane" aria-hidden="true" />

        <svg
          className={`cld-loop-svg${paused || reducedMotion ? " is-paused" : ""}`}
          viewBox="0 0 100 100"
          role="img"
          aria-label="Four clockwise arrows form a closed loop"
        >
          <defs>
            <marker
              id="cld-loop-arrow"
              markerWidth="2"
              markerHeight="2"
              refX="1.7"
              refY="1"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0 0 L2 1 L0 2 Z" fill="#F6EFE0" />
            </marker>
          </defs>
          <ellipse className="cld-loop-track" cx="50" cy="50" rx="34" ry="34" />
          {LINKS.map((link, index) => (
            <path
              key={link.from}
              className="cld-loop-link"
              style={{ animationDelay: `${index * -0.34}s` }}
              d={link.path}
              markerEnd="url(#cld-loop-arrow)"
            />
          ))}
        </svg>

        <div className="cld-loop-core" aria-hidden="true">
          <span className="cld-loop-core__orbit">↻</span>
          <span className="mono cld-loop-core__eyebrow">LOOP_01</span>
          <strong>FEEDBACK</strong>
          <span className="mono cld-loop-core__caption">CAUSE / EFFECT</span>
        </div>

        <div
          className={`cld-polarity-anchor${paused || reducedMotion ? " is-paused" : ""}`}
          role="img"
          aria-label="A relationship sign card repeatedly flips between plus and minus"
        >
          <div className="cld-polarity-card">
            <div className="cld-polarity-card__face cld-polarity-card__face--plus">
              <span>+</span>
            </div>
            <div className="cld-polarity-card__face cld-polarity-card__face--minus">
              <span>−</span>
            </div>
          </div>
          <span className="cld-polarity-label mono">SIGN</span>
        </div>

        {NODES.map((node, index) => (
          <CubeNode
            key={node.id}
            node={node}
            index={index}
            paused={paused}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      <div className="cld-stage-bottomline" aria-hidden="true">
        <span>ARROWS SHOW CAUSAL INFLUENCE</span>
        <span>FLOW / CLOCKWISE</span>
      </div>
    </section>
  );
}

export default function CLDPage() {
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    document.title = "CLD — Causal Loop Diagram";
  }, []);

  return (
    <div className="cld-shell">
      <header className="cld-topbar">
        <a className="cld-brand" href="/" aria-label="CLD home">
          <span className="cld-brand__mark" aria-hidden="true">
            <span />
          </span>
          <span className="cld-brand__name">CLD</span>
          <span className="cld-brand__descriptor mono">/ SYSTEMS IN MOTION</span>
        </a>

        <div className="cld-topbar__center mono">
          <span className="cld-live-dot" />
          CAUSAL LOOP DIAGRAM
        </div>

        <a className="cld-source-link mono" href="/reel" data-hover>
          <span>ACT_04 / SOURCE REEL</span>
          <ArrowUpRight aria-hidden="true" />
        </a>
      </header>

      <main className="cld-workspace">
        <aside className="cld-intro">
          <div className="cld-intro__head">
            <p className="cld-kicker mono">
              <span>04</span>
              EXTRACTED / REFRAMED
            </p>
            <h1>
              CAUSAL
              <span className="cld-title-second">LOOP<span className="cld-title-mark">↻</span></span>
              <span className="cld-title-caption mono">DIAGRAM / CLD</span>
            </h1>
            <p className="cld-intro__description">
              Four variables, one circular chain of influence. Each change moves through the system—and returns to its cause.
            </p>
          </div>

          <div className="cld-sign-guide">
            <p className="cld-sign-guide__heading mono">RELATIONSHIP SIGN</p>
            <div className="cld-sign-guide__row">
              <span className="cld-sign-guide__symbol cld-sign-guide__symbol--plus">+</span>
              <span>
                <strong>SAME DIRECTION</strong>
                <small>More → more</small>
              </span>
            </div>
            <div className="cld-sign-guide__row">
              <span className="cld-sign-guide__symbol cld-sign-guide__symbol--minus">−</span>
              <span>
                <strong>OPPOSITE DIRECTION</strong>
                <small>More → less</small>
              </span>
            </div>
          </div>

          <div className="cld-intro__foot mono">
            <span>READ THE LOOP</span>
            <ArrowRight aria-hidden="true" />
            <span>FOLLOW CLOCKWISE</span>
          </div>
        </aside>

        <LoopDiagram paused={paused} reducedMotion={reducedMotion} />
      </main>

      <footer className="cld-footer">
        <div className="cld-footer__status mono">
          <span className="cld-live-dot" />
          <span>LIVE SYSTEM / 01</span>
          <span className="cld-footer__divider">·</span>
          <span>04 NODES / 04 LINKS</span>
        </div>

        <div className="cld-footer__chain mono" aria-label="FORM to MOTION to COLOR to TIME to FORM">
          <span>FORM</span><i />
          <span>MOTION</span><i />
          <span>COLOR</span><i />
          <span>TIME</span><i />
          <span>FORM</span>
        </div>

        <div className="cld-footer__actions">
          <span className="cld-footer__motion-label mono">CUBE FLIP / RANDOM</span>
          <button
            className="cld-motion-button mono"
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? "Resume diagram animation" : "Pause diagram animation"}
            data-hover
          >
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            <span>{paused ? "RESUME" : "PAUSE"}</span>
          </button>
        </div>
      </footer>

      <Grain />
      <Cursor />
    </div>
  );
}
