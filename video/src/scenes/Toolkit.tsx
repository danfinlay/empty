import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useClock } from '../components/anim';
import { ImpactFlash } from '../components/Effects';
import { SceneShell } from '../components/SceneShell';
import { colors } from '../theme';
import { Pipeline, SceneHeading } from './Pipeline';

const Check: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={64} height={64} viewBox="0 0 32 32" style={{ opacity: progress }}>
    <circle cx={16} cy={16} r={14} fill={colors.green} />
    <path
      d="M9 16.5 L14 21.5 L23 11.5"
      stroke="#10241a"
      strokeWidth={3.6}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={22}
      strokeDashoffset={22 * (1 - Math.min(1, progress))}
    />
  </svg>
);

const BEATS = [2.7, 5.6, 8.1];

export const Toolkit: React.FC = () => {
  const { frame, fps } = useClock();
  return (
    <SceneShell id="toolkit">
      {BEATS.map((at) => (
        <ImpactFlash key={at} atSec={at} color={colors.green} peak={0.08} />
      ))}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 80 }}>
        <SceneHeading frame={frame} fps={fps}>
          adopt it <span style={{ color: colors.green }}>one step at a time</span>
        </SceneHeading>
        <Pipeline
          frame={frame}
          fps={fps}
          accent={colors.green}
          stages={[
            {
              icon: 'tree',
              label: 'install',
              activeAt: BEATS[0],
              sub: '@lavamoat/allow-scripts',
              subColor: colors.green,
            },
            {
              icon: 'cogs',
              label: 'build',
              activeAt: BEATS[1],
              sub: 'lavamoat-node',
              subColor: colors.green,
            },
            {
              icon: 'users',
              label: 'runtime',
              activeAt: BEATS[2],
              sub: '@lavamoat/webpack · browserify',
              subColor: colors.green,
            },
          ]}
          badge={(_stage, active) => <Check progress={active} />}
        />
      </AbsoluteFill>
    </SceneShell>
  );
};
