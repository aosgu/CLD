import type { CubeFrame, PolarityFrame } from "../lib/cldMotion";
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

interface CausalDiagramProps {
  time: number;
  frames: CubeFrame[];
  polarity: PolarityFrame;
  onFlipNode: (index: number) => void;
  onFlipPolarity: () => void;
}

export default function CausalDiagram({
  time, frames, polarity, onFlipNode, onFlipPolarity,
}: CausalDiagramProps) {
  return (
    <section className="diagram-region" aria-label="交互式三维因果回路图">
      <p className="sr-only">
        原因、影响、响应和反馈四个黑色立方体，分别位于上、右、下、左。
        四条箭头按顺时针方向连成一个回路。三条关系固定为正向，
        右上方的双面卡片在正向与反向关系之间翻转。点击立方体可改变展示视角。
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
                strokeDasharray="7 100"
                strokeDashoffset={-time * 23 - index * 26}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
          <g className="fixed-polarities">
            <text x="510" y="515">+</text>
            <text x="210" y="515">+</text>
            <text x="210" y="215">+</text>
          </g>
        </svg>

        <div className="loop-center" aria-hidden="true">
          <div className="loop-type-mask">
            <span key={polarity.negative ? "B" : "R"} className="loop-type">
              {polarity.negative ? "B" : "R"}
            </span>
          </div>
          <div className="loop-name-mask">
            <span key={String(polarity.negative)} className="loop-name mono">
              {polarity.negative ? "BALANCING" : "REINFORCING"}
            </span>
          </div>
          <span className="loop-chinese">{polarity.negative ? "平衡回路" : "增强回路"}</span>
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

        <div className="polarity-anchor">
          <div className="polarity-shadow" />
          <div className="polarity-perspective">
            <button
              type="button"
              className="polarity-button"
              onClick={onFlipPolarity}
              aria-label={`当前为${polarity.negative ? "反向" : "同向"}关系，点击翻转正负关系卡片`}
              aria-disabled={polarity.flipping}
              title="点击，翻转关系"
            >
              <span
                className="polarity-card"
                style={{ transform: `rotateY(${polarity.angle}deg)` }}
                aria-hidden="true"
              >
                <span className="polarity-face polarity-front">
                  <span className="polarity-eyebrow mono">POLARITY</span>
                  <span className="polarity-sign">+</span>
                  <span className="polarity-direction mono">SAME</span>
                </span>
                <span className="polarity-face polarity-back">
                  <span className="polarity-eyebrow mono">POLARITY</span>
                  <span className="polarity-sign">-</span>
                  <span className="polarity-direction mono">OPPOSITE</span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}