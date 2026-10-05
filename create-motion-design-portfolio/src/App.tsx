import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Pause, Play, RotateCcw } from "lucide-react";
import CausalDiagram from "./components/CausalDiagram";
import AboutCLD from "./components/AboutCLD";
import { useSceneClock } from "./hooks/useSceneClock";
import { CubeTimeline, LOOP_NODES, samplePolarity } from "./lib/cldMotion";

const createTimelines = () => LOOP_NODES.map((_, index) => new CubeTimeline(index));

function LoopMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 23 6 L 26 10 L 21 10" fill="currentColor" />
      <path d="M 9 26 L 6 22 L 11 22" fill="currentColor" />
      <rect x="13.5" y="3" width="5" height="5" fill="currentColor" />
      <rect x="24" y="13.5" width="5" height="5" fill="currentColor" />
      <rect x="13.5" y="24" width="5" height="5" fill="currentColor" />
      <rect x="3" y="13.5" width="5" height="5" fill="currentColor" />
    </svg>
  );
}

export default function App() {
  const { time, playing, toggle, play, restart } = useSceneClock();
  const [timelines, setTimelines] = useState(createTimelines);
  const [, refresh] = useState(0);
  const [polarityOffset, setPolarityOffset] = useState(0);
  const [aboutOpen, setAboutOpen] = useState(false);
  const closeAbout = useCallback(() => setAboutOpen(false), []);

  const frames = timelines.map((timeline) => timeline.sample(time));
  const polarity = samplePolarity(time + polarityOffset);
  const activeIndex = frames.reduce(
    (latest, frame, index) => frame.eventAt > frames[latest].eventAt ? index : latest,
    0,
  );
  const activeNode = LOOP_NODES[activeIndex];
  const activeFrame = frames[activeIndex];
  const activeFace = activeNode.faces[activeFrame.face];

  const resetScene = useCallback(() => {
    setTimelines(createTimelines());
    setPolarityOffset(0);
    restart();
  }, [restart]);

  const flipNode = (index: number) => {
    timelines[index].flip(time);
    refresh((value) => value + 1);
    play();
  };

  const flipPolarity = () => {
    if (polarity.flipping) return;
    setPolarityOffset((polarity.negative ? 5.3 : 2.3) - time);
    play();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (aboutOpen || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target instanceof Element && target.closest("button, a, input, textarea, select, [contenteditable]")) return;
      if (event.code === "Space") {
        event.preventDefault();
        toggle();
      } else if (event.code === "KeyR") {
        event.preventDefault();
        resetScene();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aboutOpen, toggle, resetScene]);

  return (
    <div className={`cld-page ${playing ? "is-playing" : "is-paused"}`}>
      <div className="scene-wash" aria-hidden="true" />
      <div className="floor-grid" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#main" aria-label="CLD 因果回路图">
          <LoopMark />
          <span className="brand-name">CLD<span>.</span></span>
          <span className="brand-descriptor mono">SYSTEMS IN MOTION</span>
        </a>
        <div className="header-actions">
          <span className="live-status mono">
            <span className="live-dot" />
            {playing ? "LIVE STUDY" : "ON HOLD"}
          </span>
          <button
            type="button"
            className="about-button"
            onClick={() => setAboutOpen(true)}
            aria-haspopup="dialog"
          >
            关于 CLD <ArrowUpRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <main id="main" className="workspace">
        <div className="hero-copy">
          <p className="hero-eyebrow mono"><span className="eyebrow-line" /> PERSPECTIVE / 04</p>
          <h1 className="hero-title">
            <span>Causal</span>
            <span>Loop<span className="title-period">.</span></span>
          </h1>
          <p className="hero-chinese">因果回路图<span className="chinese-title-rule" /></p>
          <p className="hero-description">每一个结果，都是下一个原因。</p>
          <div className="hero-footnote mono" aria-hidden="true">
            <span className="small-arrow"><ArrowUpRight size={17} strokeWidth={1.5} /></span>
            CAUSAL LOOP DIAGRAM
          </div>
        </div>

        <CausalDiagram
          time={time}
          frames={frames}
          polarity={polarity}
          onFlipNode={flipNode}
          onFlipPolarity={flipPolarity}
        />
      </main>

      <footer className="scene-footer">
        <div className="live-caption" aria-live="off">
          <span className="caption-prefix mono">{activeNode.id} /</span>
          <div className="caption-mask">
            <p key={`${activeNode.id}:${activeFrame.eventId}:${activeFrame.face}`} className="caption-text">
              {activeFace.caption}
            </p>
          </div>
        </div>
        <div className="scene-controls">
          <span className="keyboard-hint mono"><kbd>SPACE</kbd> 暂停 / <kbd>R</kbd> 重置</span>
          <button
            type="button"
            className="play-button"
            onClick={toggle}
            aria-label={playing ? "暂停所有动画" : "继续所有动画"}
            aria-pressed={!playing}
          >
            {playing ? <Pause size={13} fill="currentColor" strokeWidth={0} /> : <Play size={13} fill="currentColor" strokeWidth={0} />}
            {playing ? "暂停动画" : "继续动画"}
          </button>
          <button type="button" className="reset-button" onClick={resetScene} aria-label="重新开始动画" title="重新开始 (R)">
            <RotateCcw size={18} strokeWidth={1.5} />
          </button>
        </div>
      </footer>

      <div className="film-grain" aria-hidden="true" />
      <AboutCLD open={aboutOpen} onClose={closeAbout} />
    </div>
  );
}
