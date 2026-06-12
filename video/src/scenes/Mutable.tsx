import React from 'react';
import { AbsoluteFill } from 'remotion';
import { fadeAt, springAt, useClock } from '../components/anim';
import { Code } from '../components/Code';
import { SceneShell } from '../components/SceneShell';
import { colors, fonts } from '../theme';
import { SceneHeading } from './Pipeline';

const ATTACK = `
// anyone can modify base functionality
Array.prototype.map = () => { /* ... */ }
`;

const IMPACT = `
// every package shares the same intrinsics
['user', 'data'].map(render)   // hijacked!
`;

export const Mutable: React.FC = () => {
  const { frame, fps } = useClock();
  const impactIn = springAt(frame, fps, 7.6, { damping: 16 });
  return (
    <SceneShell id="mutable">
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 56 }}>
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 46,
            fontWeight: 600,
            color: colors.dim,
            opacity: fadeAt(frame, fps, 0.3, 0.5),
          }}
        >
          why is JavaScript such an easy target?
        </div>
        <SceneHeading frame={frame} fps={fps} color={colors.red} at={1.6}>
          #1 — everything is mutable
        </SceneHeading>
        <div style={{ opacity: fadeAt(frame, fps, 2.6, 0.4) }}>
          <Code code={ATTACK} fontSize={40} typeStartSec={2.8} typeDurSec={2.4} width={1240} />
        </div>
        <div
          style={{
            opacity: impactIn,
            transform: `translateY(${(1 - impactIn) * 40}px)`,
          }}
        >
          <Code
            code={IMPACT}
            fontSize={40}
            typeStartSec={7.8}
            typeDurSec={1.4}
            width={1240}
            accent={colors.red}
            lineHighlights={{ 1: 'rgba(236,39,58,0.18)' }}
          />
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
