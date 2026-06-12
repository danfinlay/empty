import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// Per-scene clock in seconds, plus spring/fade helpers keyed on seconds.
export const useClock = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, sec: frame / fps };
};

export const springAt = (
  frame: number,
  fps: number,
  delaySec: number,
  config: { damping?: number; mass?: number; stiffness?: number } = {},
) =>
  spring({
    frame: Math.max(0, frame - delaySec * fps),
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 120, ...config },
  });

export const fadeAt = (
  frame: number,
  fps: number,
  delaySec: number,
  durSec = 0.4,
) =>
  interpolate(frame, [delaySec * fps, (delaySec + durSec) * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// Standard "fade up" entrance style
export const riseAt = (
  frame: number,
  fps: number,
  delaySec: number,
  distance = 30,
): React.CSSProperties => {
  const s = springAt(frame, fps, delaySec, { damping: 18 });
  return {
    opacity: fadeAt(frame, fps, delaySec),
    transform: `translateY(${(1 - s) * distance}px)`,
  };
};

// Decaying impact shake; returns a pixel offset. Frame-deterministic.
export const shakeAt = (
  frame: number,
  fps: number,
  atSec: number,
  amp = 12,
  durSec = 0.55,
) => {
  const t = frame / fps - atSec;
  if (t < 0 || t > durSec) return { x: 0, y: 0 };
  const decay = (1 - t / durSec) ** 2;
  return {
    x: amp * decay * (Math.sin(t * 89) * 0.6 + Math.sin(t * 157) * 0.4),
    y: amp * decay * (Math.cos(t * 101) * 0.6 + Math.sin(t * 173) * 0.4),
  };
};

// Deterministic PRNG for layouts
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
