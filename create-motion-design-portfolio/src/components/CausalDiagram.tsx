import type { CubeFrame, LoopMode } from "../lib/cldMotion";
import { LOOP_NODES } from "../lib/cldMotion";
import CubeNode from "./CubeNode";

const arc = (start: number, end: number) => {
  const point = (angle: number) => {
    const radians = angle * Math.PI / 180;
    return `${(360 + Math.cos(radians) * 236).toFixed(3)} ${(360 + Math.sin(radians) * 236).toFixed(3)}`;
  };
  return `M ${point(start)} A 236 236 0 0 1 ${point(end)}`;
};

const ARROWS = [arc(-70, -20), arc(20, 70), arc(110, 160), arc(200, 250)];

const acceleratedTravel = (elapsed: number) => {
  const timeConstant = 2.4;
  const addedSpeed = 52;
  return 23 * elapsed + addedSpeed * (elapsed - timeConstant * (1 - Math.exp(-elapsed / timeConstant)));
};

const POLARITY_LINKS = [
  { id: "cause-effect", label: "原因到影响", x: 73.178, y: 26.822, rotation: -11 },
  { id: "effect-response", label: "影响到响应", x: 73.178, y: 73.178, rotation: 11 },
  { id: "response-feedback", label: "响应到反馈", x: 26.822, y: 73.178, rotation: -11 },
  { id: "feedback-cause", label: "反馈到原因", x: 26.822, y: 26.822, rotation: 11 },
] as const;

function PolarityFaces({ negative }: { negative: boolean }) {
  return (
    <span
      className="polarity-card"
      style={{ transform: `rotateY(${negative ? 180 : 0}deg)` }}
      aria-hidden="true"
    >
      <span className="polarity-face polarity-front">
        <span className="polarity-sign">+</span>
      </span>
      <span className="polarity-face polarity-back">
        <span className="polarity-sign">−</span>
      </span>
    </span>
  );
}

interface CausalDiagramProps {
  time: number;
  frames: CubeFrame[];
  mode: LoopMode;
  modeElapsed: number;
  negativeEdges: boolean[];
  onFlipNode: (index: number) => void;
}

export default function CausalDiagram({
  time, frames, mode, modeElapsed, negativeEdges, onFlipNode,
}: CausalDiagramProps) {
  const signalTravel = mode === "reinforcing" ? acceleratedTravel(modeElapsed) : time * 23;

  return (
    <section className="diagram-region" aria-label="交互式三维因果回路图">
      <p className="sr-only">
        原因、影响、响应和反馈四个黑色立方体，分别位于上、右、下、左。
        四条箭头按顺时针方向连成一个回路，每条连线上都有一张只显示正号或负号的极性卡片。
        平衡回路中卡片成对随机翻转并保持奇数个负号；增强回路中所有关系均为正向。
        点击立方体可改变展示视角。
      </p>
      <div className="diagram">
        <svg className="loop-paths" viewBox="0 0 720 720" fill="none" aria-hidden="true">
          <defs>
            <marker
              id="cld-arrowhead"
              viewBox="0 0 10 10"
              refX="8.2"
              refY="5"
              markerWidth="6.5"
              markerHeight="6.5"
              orient="auto"
            >
              <path d="M 1 1 L 9 5 L 1 9 L 3.4 5 Z" fill="currentColor" />
            </marker>
          </defs>
          <circle className="orbit-guide" cx="360" cy="360" r="236" />
          {ARROWS.map((path, index) => (
            <g key={path}>
              <path
                className="loop-arrow"
                d={path}
                markerEnd="url(#cld-arrowhead)"
                vectorEffect="non-scaling-stroke"
              />
              <path
                className="loop-signal"
                d={path}
                pathLength="100"
                strokeDasharray={mode === "reinforcing" ? "0.7 7.3" : "7 100"}
                strokeDashoffset={-signalTravel - index * (mode === "reinforcing" ? 7.5 : 26)}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </svg>

        <div className={`loop-center loop-center-${mode}`} aria-hidden="true">
          <div className="loop-type-mask">
            <span key={mode} className="loop-type">
              {mode === "balancing" ? "B" : "R"}
            </span>
          </div>
          <div className="loop-name-mask">
            <span key={mode} className="loop-name mono">
              {mode === "balancing" ? "BALANCING" : "REINFORCING"}
            </span>
          </div>
          <span key={`${mode}-chinese`} className="loop-chinese">
            {mode === "balancing" ? "平衡回路" : "增强回路"}
          </span>
          <span key={`${mode}-effect`} className="loop-effect">
            {mode === "balancing" ? "反馈抵消变化" : "反馈放大变化"}
          </span>
          <span className="loop-center-rule" />
        </div>

        {LOOP_NODES.map((node, index) => (
          <CubeNode
            key={node.id}
            node={node}
            index={index}
            frame={frames[index]}
            time={time}
            onFlip={() => onFlipNode(index)}
          />
        ))}

        {POLARITY_LINKS.map((link, index) => (
          <div
            key={link.id}
            className={`polarity-anchor polarity-anchor-${link.id}`}
            style={{
              left: `${link.x}%`,
              top: `${link.y}%`,
              transform: `translate(-50%, -50%) rotate(${link.rotation}deg)`,
            }}
          >
            <div className="polarity-shadow" />
            <div className="polarity-perspective">
              <div
                className="polarity-static"
                role="img"
                aria-label={`${link.label}：${mode === "balancing" && negativeEdges[index] ? "负向关系" : "正向关系"}`}
              >
                <PolarityFaces negative={mode === "balancing" && negativeEdges[index]} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}