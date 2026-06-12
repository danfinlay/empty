import React from 'react';
import { AbsoluteFill } from 'remotion';
import { springAt, useClock } from '../components/anim';
import { Icon } from '../components/Icon';
import { SceneShell } from '../components/SceneShell';
import { colors } from '../theme';
import { Pipeline, SceneHeading } from './Pipeline';

// horizontal offsets of the three stage boxes within the pipeline layout
const STAGE_X = [-442, 0, 442];
const BEATS = [4.8, 7.8, 10.6];

export const Stages: React.FC = () => {
  const { frame, fps } = useClock();
  const move1 = springAt(frame, fps, BEATS[1], { damping: 16 });
  const move2 = springAt(frame, fps, BEATS[2], { damping: 16 });
  const evilIn = springAt(frame, fps, BEATS[0], { damping: 12 });
  const evilX =
    STAGE_X[0] +
    (STAGE_X[1] - STAGE_X[0]) * move1 +
    (STAGE_X[2] - STAGE_X[1]) * move2;
  const hop = Math.abs(Math.sin((move1 + move2) * Math.PI)) * -60;
  return (
    <SceneShell id="stages">
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 170 }}>
        <SceneHeading frame={frame} fps={fps}>
          a malicious dependency can strike{' '}
          <span style={{ color: colors.red }}>at every stage</span>
        </SceneHeading>
        <div style={{ position: 'relative' }}>
          <Pipeline
            frame={frame}
            fps={fps}
            accent={colors.red}
            stages={[
              {
                icon: 'tree',
                label: 'install',
                activeAt: BEATS[0],
                sub: 'lifecycle scripts',
                subColor: colors.red,
              },
              {
                icon: 'cogs',
                label: 'build',
                activeAt: BEATS[1],
                sub: 'compromised tooling',
                subColor: colors.red,
              },
              {
                icon: 'users',
                label: 'runtime',
                activeAt: BEATS[2],
                sub: 'code your users run',
                subColor: colors.red,
              },
            ]}
          />
          <div
            style={{
              position: 'absolute',
              top: -150,
              left: '50%',
              transform: `translateX(${evilX - 60}px) translateY(${hop}px) scale(${evilIn})`,
              opacity: evilIn,
              filter: `drop-shadow(0 0 ${18 + 10 * Math.sin(frame / 4)}px ${colors.red})`,
            }}
          >
            <Icon name="evil" size={120} color={colors.red} />
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
