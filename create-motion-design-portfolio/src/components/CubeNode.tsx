import type { CSSProperties } from "react";
import { clamp, type CubeFrame, type LoopNode } from "../lib/cldMotion";

const FACE_TRANSFORMS = [
  "rotateY(0deg) translateZ(calc(var(--cube-size) / 2))",
  "rotateY(90deg) translateZ(calc(var(--cube-size) / 2))",
  "rotateY(180deg) translateZ(calc(var(--cube-size) / 2))",
  "rotateY(-90deg) translateZ(calc(var(--cube-size) / 2))",
  "rotateX(90deg) translateZ(calc(var(--cube-size) / 2))",
  "rotateX(-90deg) translateZ(calc(var(--cube-size) / 2))",
];

const NORMALS = [
  [0, 0, 1], [1, 0, 0], [0, 0, -1],
  [-1, 0, 0], [0, -1, 0], [0, 1, 0],
];

function faceColor(index: number, x: number, y: number) {
  const [nx, ny, nz] = NORMALS[index];
  const rx = x * Math.PI / 180;
  const ry = y * Math.PI / 180;
  const turnedX = nx * Math.cos(ry) + nz * Math.sin(ry);
  const turnedZ = -nx * Math.sin(ry) + nz * Math.cos(ry);
  const finalY = ny * Math.cos(rx) - turnedZ * Math.sin(rx);
  const finalZ = ny * Math.sin(rx) + turnedZ * Math.cos(rx);
  const light = clamp(0.3 - turnedX * 0.24 - finalY * 0.32 + finalZ * 0.42);
  const shade = Math.round(10 + light * 20);
  return `rgb(${shade}, ${shade}, ${Math.max(0, shade - 2)})`;
}

interface CubeNodeProps {
  node: LoopNode;
  index: number;
  frame: CubeFrame;
  time: number;
  onFlip: () => void;
}

export default function CubeNode({ node, index, frame, time, onFlip }: CubeNodeProps) {
  const tiltX = frame.x - 17 + Math.sin(time * 0.73 + index) * 1.4;
  const tiltY = frame.y - 23 + Math.sin(time * 0.63 + index * 1.5) * 1.8;
  const float = Math.sin(time * 1.05 + index * 1.6) * 2.5;
  const face = node.faces[frame.face];

  return (
    <div
      className={`node-anchor node-${node.id}`}
      style={{ left: `${node.x}%`, top: `${node.y}%` } as CSSProperties}
    >
      <div className="node-shadow" style={{ transform: `translateX(-50%) scale(${1 + float * 0.012})` }} />
      <div className="node-perspective" style={{ transform: `translateY(${float}px)` }}>
        <button
          type="button"
          className="cube-button"
          onClick={onFlip}
          aria-label={`${node.id} ${node.chinese}节点，点击随机翻转立方体`}
          title="点击，随机翻转"
        >
          <span className="cube-hover">
            <span
              className="cube-object"
              style={{ transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)` }}
              aria-hidden="true"
            >
              {node.faces.map((item, faceIndex) => (
                <span
                  key={faceIndex}
                  className="cube-face"
                  style={{
                    transform: FACE_TRANSFORMS[faceIndex],
                    backgroundColor: faceColor(faceIndex, tiltX, tiltY),
                  }}
                >
                  <span className="face-topline mono">
                    <span>{node.id}.{faceIndex + 1}</span>
                    <span className="face-corner" />
                  </span>
                  <span
                    className={[
                      "face-word",
                      node.glyph ? "face-word-glyph" : "",
                      item.word.includes("\n") ? "face-word-stacked" : "",
                    ].filter(Boolean).join(" ")}
                  >
                    {item.word}
                    <span className="face-rule" />
                  </span>
                </span>
              ))}
            </span>
          </span>
        </button>
      </div>
      <div className="node-caption" aria-hidden="true">
        <span className="mono node-number">{node.id} /</span>
        <span className="node-caption-mask">
          <span key={`${frame.eventId}:${frame.face}`} className="node-caption-word">
            {node.glyph ? node.name : face.chinese}
          </span>
        </span>
      </div>
    </div>
  );
}