import type { ReactNode } from "react";

export type ActProps = { t: number; onReplay?: () => void };

/** mono caption positioned inside a scene corner */
export function Cap({
  pos,
  className = "",
  children,
}: {
  pos: "tl" | "tr" | "bl" | "br";
  className?: string;
  children: ReactNode;
}) {
  const p = {
    tl: "top-5 left-5 md:top-7 md:left-8",
    tr: "top-5 right-5 md:top-7 md:right-8 text-right",
    bl: "bottom-5 left-5 md:bottom-7 md:left-8",
    br: "bottom-5 right-5 md:bottom-7 md:right-8 text-right",
  }[pos];
  return (
    <div
      className={`mono absolute z-20 text-[10px] md:text-[11px] leading-relaxed tracking-[0.28em] uppercase select-none pointer-events-none ${p} ${className}`}
    >
      {children}
    </div>
  );
}

/** rotating registration cross — pure design furniture */
export function Cross({
  x,
  y,
  t,
  className = "",
  size = 14,
}: {
  x: string;
  y: string;
  t: number;
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`absolute z-10 select-none pointer-events-none ${className}`}
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%,-50%) rotate(${t * 40}deg)`,
      }}
    >
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
      <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-current" />
    </div>
  );
}
