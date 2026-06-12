import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { mulberry32, useClock } from './anim';
import { colors } from '../theme';

// Rising lava embers, for the title and outro scenes.
export const Embers: React.FC<{ count?: number }> = ({ count = 26 }) => {
  const { sec } = useClock();
  const particles = useMemo(() => {
    const rand = mulberry32(99);
    return Array.from({ length: count }, () => ({
      bx: rand(),
      speed: 60 + rand() * 90,
      size: 4 + rand() * 6,
      driftAmp: 20 + rand() * 50,
      driftFreq: 0.4 + rand() * 0.8,
      phase: rand() * 40,
      warm: rand(),
    }));
  }, [count]);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {particles.map((p, i) => {
        const travel = 1080 + 220;
        const y = 1130 - ((sec * p.speed + p.phase * 90) % travel);
        const x = p.bx * 1920 + Math.sin(sec * p.driftFreq + p.phase) * p.driftAmp;
        const color = p.warm > 0.5 ? colors.lavaBottom : colors.lavaTop;
        const flicker = 0.3 + 0.3 * Math.sin(sec * 3 + p.phase * 7);
        const nearTop = Math.max(0, Math.min(1, y / 260));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 ${p.size * 2.5}px ${color}`,
              opacity: Math.max(0, flicker) * nearTop,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Brief edge-glow flash to punctuate impact moments.
export const ImpactFlash: React.FC<{
  atSec: number;
  color?: string;
  peak?: number;
}> = ({ atSec, color = colors.red, peak = 0.2 }) => {
  const { frame, fps } = useClock();
  const t = frame / fps - atSec;
  const opacity =
    t < 0 ? 0 : t < 0.1 ? (t / 0.1) * peak : Math.max(0, peak * (1 - (t - 0.1) / 0.5));
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: `radial-gradient(ellipse at center, transparent 35%, ${color} 140%)`,
        opacity,
      }}
    />
  );
};
