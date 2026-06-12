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
// 1 "Year after year, popular packages kept getting hijacked."
// 2 "Then twenty twenty-five broke every record."
// 3 "Chalk and debug: hijacked, two billion weekly downloads."
// 4 "And Shai-Hulud: the first self-replicating npm worm..."
// 5 "Twenty twenty-six?"  6 "Still accelerating."
// 7 "It's no longer a question of if."  8 "Only when."
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
};

// Major npm supply chain attacks, 2018 -> 2026 (see video/README.md for sources)
const CARDS: Card[] = [
  { year: '2018', x: yearX(2018), name: 'event-stream', sub: 'wallet keys stolen', at: M[0] + 0.4, up: true },
  { year: '2021', x: yearX(2021), name: 'ua-parser-js', sub: 'malware · 8M dl/wk', at: M[1] + 0.4, up: false },
  { year: '2022', x: yearX(2022), name: 'node-ipc · colors', sub: 'maintainer sabotage', at: M[1] + 1.3, up: true },
  { year: '2023', x: yearX(2023), name: 'Ledger connect-kit', sub: 'wallet drainer', at: M[1] + 2.2, up: false },
  { year: '2024', x: yearX(2024), name: 'solana/web3.js', sub: 'lottie-player · key stealers', at: M[1] + 3.1, up: true },
  { year: '2025', x: yearX(2024.95), name: 'chalk & debug', sub: '2B dl/wk hijacked', at: M[3], up: false },
  { year: '2025', x: yearX(2025.55), name: 'Shai-Hulud worm', sub: 'self-replicating · ~800 pkgs · 25k+ repos', at: M[4], up: true, big: true },
  { year: '2026', x: yearX(2026.25), name: 'axios · node-ipc', sub: 'Red Hat ...and counting', at: M[5], up: false },
];

export const Timeline: React.FC = () => {
  const { frame, fps, sec } = useClock();
  const axisIn = springAt(frame, fps, 0.3, { damping: 30 });
  const finale = fadeAt(frame, fps, M[7], 0.5);
  // axis reddens from left to right as the years go by
  const redSweep = fadeAt(frame, fps, M[2], 3.5);
  return (
    <SceneShell id="timeline" shakes={[{ at: M[4], amp: 10 }]}>
      <ImpactFlash atSec={M[4]} peak={0.2} />
      <ImpactFlash atSec={M[7]} peak={0.12} />
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
            </div>
          );
        })}
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
