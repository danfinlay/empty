import React from 'react';
import { AbsoluteFill } from 'remotion';
import { fadeAt, springAt, useClock } from '../components/anim';
import { ImpactFlash } from '../components/Effects';
import { SceneShell } from '../components/SceneShell';
import { colors, fonts } from '../theme';
import timing from '../timing.json';
import { SceneHeading } from './Pipeline';

// Beats come from the narration's per-sentence marks:
// 0 "And it never stopped."
// 1 "Year after year, popular packages kept getting hijacked — and the
//    cleanup bills kept growing."
// 2 "Then twenty twenty-five broke every record."
// 3 "Chalk and debug: hijacked, two point six billion weekly downloads."
// 4 "And the thieves' total haul: about five cents."
// 5 "Surviving an attack still isn't free: the average supply chain breach
//    costs nearly five million dollars, and takes nine months to clean up."
// 6 "And Shai-Hulud: the first self-replicating npm worm..."
// 7 "Twenty twenty-six?"  8 "Still accelerating."
// 9 "It's no longer a question of if."  10 "Only when."
const M = (timing.timeline.marks as number[]).map(
  (m) => m + timing.timeline.lead,
);

const AXIS_Y = 600;
const X0 = 155;
const X1 = 1800;
const yearX = (year: number) => X0 + ((year - 2018) / (2026.6 - 2018)) * (X1 - X0);

type Card = {
  year: string;
  x: number;
  name: string;
  sub: string;
  at: number;
  up: boolean; // card sits above the axis
  big?: boolean;
  money?: string; // realized financial damage (amber line)
  moneyAt?: number; // when the money line lands (defaults to `at`)
};

// Major npm supply chain attacks, 2018 -> 2026 (see video/README.md for sources)
const CARDS: Card[] = [
  { year: '2018', x: yearX(2018), name: 'event-stream', sub: 'wallet keys stolen', at: M[0] + 0.4, up: true },
  { year: '2021', x: yearX(2021), name: 'ua-parser-js', sub: 'malware · 8M dl/wk', at: M[1] + 0.4, up: false },
  { year: '2022', x: yearX(2022), name: 'node-ipc · colors', sub: 'maintainer sabotage', at: M[1] + 1.6, up: true },
  { year: '2023', x: yearX(2023), name: 'Ledger connect-kit', sub: 'wallet drainer', at: M[1] + 2.8, up: false },
  { year: '2024', x: yearX(2024), name: 'solana/web3.js', sub: 'lottie-player · key stealers', at: M[1] + 4.0, up: true },
  { year: '2025', x: yearX(2024.95), name: 'chalk & debug', sub: '2.6B dl/wk hijacked', at: M[3], up: false, money: 'stolen: ~5¢', moneyAt: M[4] },
  { year: '2025', x: yearX(2025.55), name: 'Shai-Hulud worm', sub: 'self-replicating · ~800 pkgs · 25k+ repos', at: M[6], up: true, big: true },
  { year: '2026', x: yearX(2026.25), name: 'axios · node-ipc', sub: 'Red Hat ...and counting', at: M[7], up: false },
];

export const Timeline: React.FC = () => {
  const { frame, fps, sec } = useClock();
  const axisIn = springAt(frame, fps, 0.3, { damping: 30 });
  const finale = fadeAt(frame, fps, M[9], 0.5);
  const costIn = springAt(frame, fps, M[5] + 0.3, { damping: 16 });
  // axis reddens from left to right as the years go by
  const redSweep = fadeAt(frame, fps, M[2], 3.5);
  return (
    <SceneShell id="timeline" shakes={[{ at: M[6], amp: 10 }]}>
      <ImpactFlash atSec={M[6]} peak={0.2} />
      <ImpactFlash atSec={M[9]} peak={0.12} />
      <AbsoluteFill>
        <div style={{ marginTop: 90 }}>
          <SceneHeading frame={frame} fps={fps}>
            it never stopped — <span style={{ color: colors.red }}>it accelerated</span>
          </SceneHeading>
        </div>
        <svg
          width={1920}
          height={1080}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          <line
            x1={X0}
            y1={AXIS_Y}
            x2={X0 + (X1 - X0) * axisIn}
            y2={AXIS_Y}
            stroke="#5b626d"
            strokeWidth={4}
          />
          <line
            x1={X0}
            y1={AXIS_Y}
            x2={X0 + (X1 - X0) * Math.min(axisIn, redSweep)}
            y2={AXIS_Y}
            stroke={colors.red}
            strokeWidth={4}
            opacity={0.85}
          />
          {CARDS.map((c) => {
            const s = springAt(frame, fps, c.at, { damping: 13 });
            return (
              <g key={c.name} opacity={s}>
                <circle cx={c.x} cy={AXIS_Y} r={9 * (c.big ? 1.5 : 1)} fill={c.big ? colors.red : '#9aa1ab'} />
                <line
                  x1={c.x}
                  y1={AXIS_Y + (c.up ? -12 : 12)}
                  x2={c.x}
                  y2={AXIS_Y + (c.up ? -52 : 52)}
                  stroke={c.big ? colors.red : '#5b626d'}
                  strokeWidth={2.5}
                />
              </g>
            );
          })}
        </svg>
        {CARDS.map((c) => {
          const s = springAt(frame, fps, c.at, { damping: 13 });
          const w = c.big ? 360 : 250;
          return (
            <div
              key={c.name}
              style={{
                position: 'absolute',
                left: Math.min(Math.max(c.x - w / 2, 20), 1920 - w - 20),
                top: c.up ? AXIS_Y - 52 - (c.big ? 170 : 140) : AXIS_Y + 52,
                width: w,
                background: colors.panel,
                border: `2.5px solid ${c.big ? colors.red : colors.panelBorder}`,
                borderRadius: 14,
                padding: '14px 18px',
                opacity: s,
                transform: `scale(${0.7 + 0.3 * s})`,
                boxShadow: c.big
                  ? `0 0 ${30 * s}px ${colors.red}55`
                  : '0 12px 30px rgba(0,0,0,0.4)',
              }}
            >
              <div
                style={{
                  fontFamily: fonts.heading,
                  fontWeight: 800,
                  fontSize: 26,
                  color: c.big ? colors.red : colors.cyan,
                }}
              >
                {c.year}
              </div>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontWeight: 700,
                  fontSize: c.big ? 30 : 24,
                  color: colors.gray,
                }}
              >
                {c.name}
              </div>
              <div
                style={{
                  fontFamily: fonts.heading,
                  fontWeight: 600,
                  fontSize: 19,
                  color: colors.dim,
                }}
              >
                {c.sub}
              </div>
              {c.money ? (
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontWeight: 700,
                    fontSize: 21,
                    color: colors.lavaBottom,
                    opacity: springAt(frame, fps, c.moneyAt ?? c.at, { damping: 13 }),
                  }}
                >
                  {c.money}
                </div>
              ) : null}
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            top: 255,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            opacity: costIn,
            transform: `translateY(${(1 - costIn) * 30}px)`,
          }}
        >
          <div
            style={{
              background: colors.panel,
              border: `2.5px solid ${colors.lavaBottom}`,
              borderRadius: 14,
              padding: '16px 34px',
              fontFamily: fonts.heading,
              fontWeight: 700,
              fontSize: 30,
              color: colors.gray,
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
            }}
          >
            average breach:{' '}
            <span style={{ color: colors.lavaBottom, fontWeight: 800 }}>$4.91M</span> ·{' '}
            <span style={{ color: colors.lavaBottom, fontWeight: 800 }}>267 days</span> to resolve{' '}
            <span style={{ color: colors.dim, fontWeight: 600, fontSize: 22 }}>(IBM, 2025)</span>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 110,
            width: '100%',
            textAlign: 'center',
            fontFamily: fonts.heading,
            fontWeight: 800,
            fontSize: 54,
            color: colors.gray,
            opacity: finale,
            transform: `translateY(${(1 - springAt(frame, fps, M[7], { damping: 16 })) * 30}px)`,
          }}
        >
          no longer a question of <span style={{ color: colors.cyan }}>if</span> — only{' '}
          <span style={{ color: colors.red }}>when</span>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
