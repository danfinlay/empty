import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { fadeAt, springAt, useClock } from '../components/anim';
import { Embers } from '../components/Effects';
import { LavaTitle } from '../components/LavaTitle';
import { SceneShell } from '../components/SceneShell';
import { colors, fonts } from '../theme';
import timing from '../timing.json';

// Beats come straight from the narration's per-sentence marks:
// 0 "Today, LavaMoat guards MetaMask..."  1 "So what's the answer?"
// 2 "Never use dependencies?"  3 "Unrealistic."
// 4 "Audit all of node_modules?"  5 "Impossible."
// 6 "Contain every package, with LavaMoat?"  7 "Solved."
// 8 "The next supply chain attack is coming."
// 9 "Make sure it can't do any damage."  10 "github dot com..."
const M = timing.outro.marks.map((m) => m + timing.outro.lead);

const QA = [
  { q: 'never use dependencies?', a: 'UNREALISTIC', qAt: M[2], aAt: M[3], good: false },
  { q: 'audit all of node_modules?', a: 'IMPOSSIBLE', qAt: M[4], aAt: M[5], good: false },
  { q: 'contain every package with LavaMoat?', a: 'SOLVED', qAt: M[6], aAt: M[7], good: true },
];

const Stamp: React.FC<{ text: string; good: boolean; in_: number }> = ({
  text,
  good,
  in_,
}) => (
  <div
    style={{
      fontFamily: fonts.mono,
      fontWeight: 700,
      fontSize: 36,
      color: good ? colors.green : colors.red,
      border: `4px solid ${good ? colors.green : colors.red}`,
      borderRadius: 12,
      padding: '4px 18px',
      transform: `rotate(${good ? -6 : 5}deg) scale(${in_ > 0 ? 0.8 + 0.2 * in_ : 0})`,
      opacity: in_,
      boxShadow: `0 0 ${24 * in_}px ${(good ? colors.green : colors.red) + '66'}`,
    }}
  >
    {text}
  </div>
);

export const Outro: React.FC = () => {
  const { frame, fps, sec } = useClock();
  const logoIn = springAt(frame, fps, 0.2, { damping: 16 });
  const urlIn = springAt(frame, fps, M[10], { damping: 12 });
  return (
    <SceneShell id="outro" shakes={[{ at: M[10], amp: 9 }]}>
      <Embers />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 30,
            transform: `scale(${logoIn})`,
          }}
        >
          <Img
            src={staticFile('assets/lavamoat-logo-new.svg')}
            style={{
              height: 210,
              transform: `translateY(${Math.sin(sec * 1.4) * 5}px)`,
            }}
          />
          <LavaTitle width={560} />
        </div>
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 38,
            fontWeight: 600,
            color: colors.cyan,
            opacity: fadeAt(frame, fps, 1.0, 0.6),
            textAlign: 'center',
          }}
        >
          battle-tested at MetaMask — protecting tens of millions of users
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            marginTop: 10,
            width: 1200,
          }}
        >
          {QA.map((row) => {
            const qIn = fadeAt(frame, fps, row.qAt, 0.4);
            const aIn = springAt(frame, fps, row.aAt, { damping: 11 });
            return (
              <div
                key={row.q}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: qIn,
                  transform: `translateY(${(1 - qIn) * 20}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: 40,
                    fontWeight: 700,
                    color: row.good && aIn > 0.3 ? colors.gray : colors.dim,
                  }}
                >
                  {row.q}
                </div>
                <Stamp text={row.a} good={row.good} in_={aIn} />
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 36,
            fontWeight: 600,
            color: colors.gray,
            opacity: fadeAt(frame, fps, M[8], 0.5),
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          the next supply chain attack is coming —{' '}
          <span style={{ color: colors.red, fontWeight: 800 }}>
            make sure it can&apos;t do any damage
          </span>
        </div>
        <div
          style={{
            marginTop: 14,
            padding: '20px 54px',
            borderRadius: 18,
            border: `3px solid ${colors.lavaBottom}`,
            background: 'rgba(239,146,50,0.08)',
            boxShadow: `0 0 50px ${colors.lavaTop}44`,
            fontFamily: fonts.mono,
            fontSize: 50,
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
