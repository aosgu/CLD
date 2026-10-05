export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const progress = (time: number, start: number, end: number) =>
  clamp((time - start) / (end - start));

const easeInOutQuint = (value: number) =>
  value < 0.5
    ? 16 * value ** 5
    : 1 - (-2 * value + 2) ** 5 / 2;

const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const seededRandom = (seed: number) => () => {
  let value = (seed += 0x6d2b79f5);
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

export interface CubeFace {
  word: string;
  chinese: string;
  caption: string;
}

export interface LoopNode {
  id: string;
  name: string;
  chinese: string;
  x: number;
  y: number;
  faces: CubeFace[];
}

export const LOOP_NODES: LoopNode[] = [
  {
    id: "01",
    name: "CAUSE",
    chinese: "原因",
    x: 50,
    y: 17.22,
    faces: [
      { word: "CAUSE", chinese: "原因", caption: "一个变化，启动整个系统。" },
      { word: "INPUT", chinese: "输入", caption: "新的输入，成为改变的起点。" },
      { word: "ACTION", chinese: "行动", caption: "微小的行动，也会引发连锁反应。" },
      { word: "CHANGE", chinese: "变化", caption: "变化，不会停留在原点。" },
      { word: "START", chinese: "起点", caption: "每一次循环，都从一个原因开始。" },
      { word: "INTENT", chinese: "意图", caption: "意图，转化为系统的动力。" },
    ],
  },
  {
    id: "02",
    name: "EFFECT",
    chinese: "影响",
    x: 82.78,
    y: 50,
    faces: [
      { word: "EFFECT", chinese: "影响", caption: "原因产生影响，影响改变状态。" },
      { word: "OUTPUT", chinese: "输出", caption: "每一次输出，都是下一步的输入。" },
      { word: "IMPACT", chinese: "作用", caption: "影响沿着关系，继续向前传递。" },
      { word: "RESULT", chinese: "结果", caption: "结果不是终点，而是新的开始。" },
      { word: "SHIFT", chinese: "转变", caption: "局部的变化，重塑整体的状态。" },
      { word: "STATE", chinese: "状态", caption: "系统的状态，因相互作用而改变。" },
    ],
  },
  {
    id: "03",
    name: "RESPONSE",
    chinese: "响应",
    x: 50,
    y: 82.78,
    faces: [
      { word: "RE\nSPONSE", chinese: "响应", caption: "系统作出响应，变化继续流动。" },
      { word: "REACT", chinese: "反应", caption: "一次反应，将影响传递给下一个节点。" },
      { word: "ADAPT", chinese: "适应", caption: "系统在变化中，寻找新的状态。" },
      { word: "RETURN", chinese: "回归", caption: "向前的影响，开始向起点回归。" },
      { word: "ADJUST", chinese: "调节", caption: "调节，让反馈成为可能。" },
      { word: "ANSWER", chinese: "应答", caption: "每个响应，都在重写下一次变化。" },
    ],
  },
  {
    id: "04",
    name: "FEEDBACK",
    chinese: "反馈",
    x: 17.22,
    y: 50,
    faces: [
      { word: "FEED\nBACK", chinese: "反馈", caption: "反馈回到起点，因果由此成环。" },
      { word: "SIGNAL", chinese: "信号", caption: "返回的信号，影响最初的原因。" },
      { word: "LOOP", chinese: "循环", caption: "循环，让结果重新成为原因。" },
      { word: "LEARN", chinese: "学习", caption: "系统从反馈中，调整下一次行动。" },
      { word: "BALANCE", chinese: "平衡", caption: "反馈，可以放大变化，也可以调节变化。" },
      { word: "REPEAT", chinese: "重复", caption: "不是简单重复，而是持续相互影响。" },
    ],
  },
];

interface Rotation {
  id: number;
  start: number;
  end: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  previousFace: number;
  previousEventAt: number;
  previousEventId: number;
  face: number;
}

export interface CubeFrame {
  x: number;
  y: number;
  face: number;
  eventAt: number;
  eventId: number;
}

// Keep the nearest equivalent orientation to avoid accumulated spins or jumps.
const nearestAngle = (angle: number, previous: number) =>
  angle + Math.round((previous - angle) / 360) * 360;

export class CubeTimeline {
  private random: () => number;
  private rotations: Rotation[] = [];
  private nextStart: number;
  private sequence = 0;

  constructor(index: number) {
    this.random = seededRandom(4071 + index * 997);
    this.nextStart = 1.6 + index * 0.57;
  }

  private addRotation(start: number, from: CubeFrame) {
    let face = Math.floor(this.random() * 6);
    if (face === from.face) face = (face + 1) % 6;

    let toX = nearestAngle(0, from.x);
    let toY = nearestAngle(-90 * face, from.y);

    if (face >= 4) {
      toX = nearestAngle(face === 4 ? -90 : 90, from.x);
      toY = nearestAngle(0, from.y);
    } else if (this.random() > 0.73 && Math.abs(toY - from.y) > 1) {
      toY += toY > from.y ? -360 : 360;
    }

    const distance = Math.max(Math.abs(toX - from.x), Math.abs(toY - from.y));
    const end = start + 0.8 + this.random() * 0.22 + (distance > 180 ? 0.2 : 0);
    const rotation: Rotation = {
      id: ++this.sequence,
      start,
      end,
      fromX: from.x,
      fromY: from.y,
      toX,
      toY,
      previousFace: from.face,
      previousEventAt: from.eventAt,
      previousEventId: from.eventId,
      face,
    };
    this.rotations.push(rotation);
    this.nextStart = end + 1.65 + this.random() * 2.25;
  }

  private ensure(time: number) {
    while (this.nextStart <= time + 6) {
      const last = this.rotations[this.rotations.length - 1];
      this.addRotation(this.nextStart, {
        x: last?.toX ?? 0,
        y: last?.toY ?? 0,
        face: last?.face ?? 0,
        eventAt: last ? (last.start + last.end) / 2 : -1,
        eventId: last?.id ?? 0,
      });
    }
  }

  sample(time: number): CubeFrame {
    this.ensure(time);

    let low = 0;
    let high = this.rotations.length - 1;
    let index = -1;
    while (low <= high) {
      const middle = (low + high) >>> 1;
      if (this.rotations[middle].start <= time) {
        index = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    if (index < 0) return { x: 0, y: 0, face: 0, eventAt: -1, eventId: 0 };

    const rotation = this.rotations[index];
    const amount = progress(time, rotation.start, rotation.end);
    const eased = easeInOutQuint(amount);
    const changed = amount >= 0.5;

    return {
      x: lerp(rotation.fromX, rotation.toX, eased),
      y: lerp(rotation.fromY, rotation.toY, eased),
      face: changed ? rotation.face : rotation.previousFace,
      eventAt: changed
        ? (rotation.start + rotation.end) / 2
        : rotation.previousEventAt,
      eventId: changed ? rotation.id : rotation.previousEventId,
    };
  }

  // An interactive flip begins at the current pose, even mid-animation.
  flip(time: number) {
    const current = this.sample(time);
    this.rotations = this.rotations.filter((rotation) => rotation.end < time);
    this.addRotation(time, current);
  }
}

export interface PolarityFrame {
  angle: number;
  negative: boolean;
  flipping: boolean;
  phase: number;
}

export function samplePolarity(time: number): PolarityFrame {
  const phase = ((time % 6) + 6) % 6;
  let angle = 0;
  if (phase >= 2.3 && phase < 3) {
    angle = 180 * easeInOutQuint(progress(phase, 2.3, 3));
  } else if (phase >= 3 && phase < 5.3) {
    angle = 180;
  } else if (phase >= 5.3) {
    angle = 180 * (1 - easeInOutQuint(progress(phase, 5.3, 6)));
  }

  return {
    angle,
    negative: angle > 90,
    flipping: (phase > 2.3 && phase < 3) || phase > 5.3,
    phase,
  };
}