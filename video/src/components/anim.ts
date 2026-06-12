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
