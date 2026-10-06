import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Pause, Play, RotateCcw } from "lucide-react";
import CausalDiagram from "./components/CausalDiagram";
import AboutCLD from "./components/AboutCLD";
import { useSceneClock } from "./hooks/useSceneClock";
import {
  CubeTimeline, LOOP_EXAMPLES, LOOP_NODES, type ExampleId, type LoopMode,
} from "./lib/cldMotion";

const createTimelines = () => LOOP_NODES.map((_, index) => new CubeTimeline(index));

// Length of the opening unfold. The .is-intro timeline in index.css is written
// against this value: every staged animation has to be finished by the time the
// class is dropped, otherwise the scene would jump to its resting pose.
const INTRO_DURATION = 2000;

const createBalancingPolarities = () => {
  const negativeCount = Math.random() < 0.5 ? 1 : 3;
  const negativeIndices = new Set<number>();
  while (negativeIndices.size < negativeCount) {
    negativeIndices.add(Math.floor(Math.random() * LOOP_NODES.length));
  }
  return LOOP_NODES.map((_, index) => negativeIndices.has(index));
};

const createReinforcingPolarities = () => LOOP_NODES.map(() => false);

const COLOR_THEMES = [
  { id: "orange", label: "橙色", color: "#f64e27" },
  { id: "blue", label: "蓝色", color: "#4d94e8" },
  { id: "green", label: "绿色", color: "#6eaf70" },
  { id: "purple", label: "紫色", color: "#9870d5" },
] as const;

type ColorTheme = (typeof COLOR_THEMES)[number]["id"];

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
  const [introRun, setIntroRun] = useState(0);
  const [introFinished, setIntroFinished] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>("balancing");
  const [exampleId, setExampleId] = useState<ExampleId>("general");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("orange");
  const [modeStartedAt, setModeStartedAt] = useState(0);
  const [negativeEdges, setNegativeEdges] = useState<boolean[]>(createBalancingPolarities);
  const [aboutOpen, setAboutOpen] = useState(false);
  const closeAbout = useCallback(() => setAboutOpen(false), []);

  // Play the opening unfold on load and again on every reset. Re-keying the page
  // remounts the scene so the staged animations restart from the first frame.
  useEffect(() => {
    setIntroFinished(false);
    const timer = window.setTimeout(() => setIntroFinished(true), INTRO_DURATION);
    return () => window.clearTimeout(timer);
  }, [introRun]);

  useEffect(() => {
    const metaThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const selectedTheme = COLOR_THEMES.find((option) => option.id === colorTheme);
    if (metaThemeColor && selectedTheme) metaThemeColor.content = selectedTheme.color;
  }, [colorTheme]);

  const example = LOOP_EXAMPLES.find((item) => item.id === exampleId) ?? LOOP_EXAMPLES[0];
  const modeLocked = example.lockedMode !== null;

  const frames = timelines.map((timeline) => timeline.sample(time));
  const activeIndex = frames.reduce(
    (latest, frame, index) => frame.eventAt > frames[latest].eventAt ? index : latest,
    0,
  );
  const activeNode = example.nodes[activeIndex];
  const activeFrame = frames[activeIndex];
  const activeFace = activeNode.faces[activeFrame.face];

  const resetScene = useCallback(() => {
    setTimelines(createTimelines());
    const nextMode = example.lockedMode ?? "balancing";
    setLoopMode(nextMode);
    setModeStartedAt(0);
    setNegativeEdges(
      nextMode === "reinforcing" ? createReinforcingPolarities() : createBalancingPolarities(),
    );
    // Set the flag in the same batch as the new key so the reset never shows a
    // frame of the finished scene before the unfold replays.
    setIntroFinished(false);
    setIntroRun((run) => run + 1);
    restart();
  }, [restart, example]);

  const chooseExample = (nextId: ExampleId) => {
    if (nextId === exampleId) return;
    const next = LOOP_EXAMPLES.find((item) => item.id === nextId);
    if (!next) return;
    setExampleId(nextId);
    // An example may fix the loop mode (e.g. all-positive links are a R loop);
    // leaving it restores the default balancing loop.
    const nextMode = next.lockedMode ?? "balancing";
    if (nextMode !== loopMode) setModeStartedAt(time);
    setLoopMode(nextMode);
    setNegativeEdges(
      nextMode === "reinforcing" ? createReinforcingPolarities() : createBalancingPolarities(),
    );
  };

  const chooseLoopMode = (nextMode: LoopMode) => {
    if (modeLocked || nextMode === loopMode) return;
    setLoopMode(nextMode);
    setModeStartedAt(time);
    setNegativeEdges(
      nextMode === "reinforcing"
        ? createReinforcingPolarities()
        : createBalancingPolarities(),
    );
  };

  useEffect(() => {
    if (!playing || loopMode !== "balancing" || !introFinished) return;

    const timer = window.setTimeout(() => {
      // Flip a random pair together to preserve the odd negative count of a B loop.
      const first = Math.floor(Math.random() * negativeEdges.length);
      const second = (first + 1 + Math.floor(Math.random() * (negativeEdges.length - 1)))
        % negativeEdges.length;

      setNegativeEdges((current) => {
        const next = [...current];
        next[first] = !next[first];
        next[second] = !next[second];
        return next;
      });
    }, 1250 + Math.random() * 1350);

    return () => window.clearTimeout(timer);
  }, [loopMode, negativeEdges, playing, introFinished]);

  const flipNode = (index: number) => {
    timelines[index].flip(time);
    refresh((value) => value + 1);
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
    <div
      key={introRun}
      className={[
        "cld-page",
        playing ? "is-playing" : "is-paused",
        ...(introFinished ? [] : ["is-intro"]),
        `mode-${loopMode}`,
        `example-${exampleId}`,
        `theme-${colorTheme}`,
      ].join(" ")}
    >
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
          <div className="mode-switch example-switch">
            <div className="mode-switch-heading">
              <span className="mode-switch-label mono">EXAMPLE / 实例</span>
              <span className="mode-switch-current mono">{example.code}</span>
            </div>
            <div className="mode-switch-options" role="group" aria-label="选择实例">
              {LOOP_EXAMPLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="mode-option"
                  onClick={() => chooseExample(item.id)}
                  aria-pressed={exampleId === item.id}
                >
                  <span className="mode-option-code mono">{item.badge}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mode-switch">
            <div className="mode-switch-heading">
              <span className="mode-switch-label mono">LOOP MODE / 02</span>
              <span className="mode-switch-current mono">
                {loopMode === "balancing" ? "B / BALANCING" : "R / REINFORCING"}
              </span>
            </div>
            <div className="mode-switch-options" role="group" aria-label="选择回路模式">
              <button
                type="button"
                className="mode-option"
                onClick={() => chooseLoopMode("balancing")}
                disabled={modeLocked}
                aria-pressed={loopMode === "balancing"}
              >
                <span className="mode-option-code mono">B</span>
                <span>平衡回路</span>
              </button>
              <button
                type="button"
                className="mode-option"
                onClick={() => chooseLoopMode("reinforcing")}
                disabled={modeLocked}
                aria-pressed={loopMode === "reinforcing"}
              >
                <span className="mode-option-code mono">R</span>
                <span>增强回路</span>
              </button>
            </div>
            <p key={`${exampleId}-${loopMode}`} className="mode-switch-note" aria-live="polite" aria-atomic="true">
              {example.lockedNote ?? (loopMode === "balancing"
                ? "负向反馈抵消变化，系统趋向稳定。"
                : "正向反馈持续放大变化。")}
            </p>
          </div>
          <div className="hero-footnote mono" aria-hidden="true">
            <span className="small-arrow"><ArrowUpRight size={17} strokeWidth={1.5} /></span>
            CAUSAL LOOP DIAGRAM
          </div>
        </div>

        <CausalDiagram
          time={time}
          frames={frames}
          example={example}
          mode={loopMode}
          modeElapsed={loopMode === "reinforcing" ? Math.max(0, time - modeStartedAt) : 0}
          negativeEdges={negativeEdges}
          onFlipNode={flipNode}
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
          <div className="theme-switcher" role="group" aria-label="切换主题颜色">
            {COLOR_THEMES.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`theme-option theme-option-${option.id}`}
                onClick={() => setColorTheme(option.id)}
                aria-label={`切换到${option.label}主题`}
                aria-pressed={colorTheme === option.id}
                title={`${option.label}主题`}
              >
                <span className="theme-option-swatch" aria-hidden="true" />
              </button>
            ))}
          </div>
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
