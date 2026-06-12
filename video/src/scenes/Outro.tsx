import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { fadeAt, springAt, useClock } from '../components/anim';
import { LavaTitle } from '../components/LavaTitle';
import { SceneShell } from '../components/SceneShell';
import { colors, fonts } from '../theme';

export const Outro: React.FC = () => {
  const { frame, fps, sec } = useClock();
  const logoIn = springAt(frame, fps, 0.2, { damping: 16 });
  const urlIn = springAt(frame, fps, 9.6, { damping: 15 });
  return (
    <SceneShell id="outro">
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 30,
        }}
      >
        <Img
          src={staticFile('assets/lavamoat-logo-new.svg')}
          style={{
            height: 300,
            transform: `scale(${logoIn}) translateY(${Math.sin(sec * 1.4) * 6}px)`,
          }}
        />
        <LavaTitle width={760} />
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 40,
            fontWeight: 600,
            color: colors.cyan,
            opacity: fadeAt(frame, fps, 1.2, 0.6),
            textAlign: 'center',
          }}
        >
          battle-tested at MetaMask — protecting tens of millions of users
        </div>
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 40,
            fontWeight: 700,
            color: colors.gray,
            opacity: fadeAt(frame, fps, 6.2, 0.6),
            textAlign: 'center',
          }}
        >
          the attacker is already inside —{' '}
          <span style={{ color: colors.red }}>give them a moat</span>
        </div>
        <div
          style={{
            marginTop: 26,
            padding: '26px 60px',
            borderRadius: 18,
            border: `3px solid ${colors.lavaBottom}`,
            background: 'rgba(239,146,50,0.08)',
            boxShadow: `0 0 50px ${colors.lavaTop}44`,
            fontFamily: fonts.mono,
            fontSize: 54,
            fontWeight: 700,
            color: '#fff',
            opacity: urlIn,
            transform: `scale(${0.9 + 0.1 * urlIn})`,
          }}
        >
          github.com/LavaMoat/LavaMoat
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
