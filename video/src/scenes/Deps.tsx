import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { fadeAt, mulberry32, springAt, useClock } from '../components/anim';
import { Code } from '../components/Code';
import { ImpactFlash } from '../components/Effects';
import { SceneShell } from '../components/SceneShell';
import { colors, fonts } from '../theme';

const DEPS_JSON = `
"dependencies": {
  "core-js": "^2.4.1",
  "hammerjs": "^2.0.8",
  "reselect": "^3.0.0",
  "rxjs": "^5.1.0",
  "ts-helpers": "^1.1.1",
  "zone.js": "^0.8.4"
}
`;

type Node = { x: number; y: number; r: number; appearSec: number; parent: number };

// rings appear in waves: direct deps, their deps, transitive explosion
const RINGS = [
  { count: 6, radius: 150, jitter: 16, size: 17, start: 4.0, span: 1.0 },
  { count: 26, radius: 280, jitter: 30, size: 12, start: 6.1, span: 1.2 },
  { count: 90, radius: 415, jitter: 48, size: 8, start: 7.0, span: 1.6 },
];
const DANGER_AT = 8.3;

const buildGraph = () => {
  const rand = mulberry32(1337);
  const nodes: Node[] = [{ x: 0, y: 0, r: 26, appearSec: 0.8, parent: -1 }];
  const ringStart: number[] = [];
  RINGS.forEach((ring, ri) => {
    ringStart.push(nodes.length);
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * Math.PI * 2 + rand() * 0.35 + ri * 0.4;
      const radius = ring.radius + (rand() - 0.5) * 2 * ring.jitter;
      const prevStart = ri === 0 ? 0 : ringStart[ri - 1];
      const prevCount = ri === 0 ? 1 : RINGS[ri - 1].count;
      nodes.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        r: ring.size,
        appearSec: ring.start + (i / ring.count) * ring.span,
        parent: prevStart + Math.floor((i / ring.count) * prevCount),
      });
    }
  });
  return nodes;
};

export const Deps: React.FC = () => {
  const { frame, fps, sec } = useClock();
  const nodes = useMemo(buildGraph, []);
  const visibleCount = nodes.filter((n) => sec >= n.appearSec).length;
  const danger = fadeAt(frame, fps, DANGER_AT, 0.8);
  const nodeColor = (i: number) =>
    i === 0
      ? colors.cyan
      : danger > 0 && i % 7 === 3
        ? colors.red
        : '#9aa1ab';
  return (
    <SceneShell id="deps" shakes={[{ at: DANGER_AT, amp: 8 }]}>
      <ImpactFlash atSec={DANGER_AT} peak={0.14} />
      <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center' }}>
        <div style={{ width: 760, paddingLeft: 90 }}>
          <div
            style={{
              fontFamily: fonts.heading,
              fontWeight: 700,
              fontSize: 52,
              color: colors.gray,
              marginBottom: 36,
              opacity: fadeAt(frame, fps, 0.3, 0.5),
            }}
          >
            your app, on npm
          </div>
          <Code
            code={DEPS_JSON}
            title="package.json"
            fontSize={30}
            typeStartSec={0.8}
            typeDurSec={2.6}
          />
          <div
            style={{
              marginTop: 40,
              fontFamily: fonts.heading,
              fontSize: 40,
              fontWeight: 700,
              color: colors.red,
              opacity: danger,
              transform: `translateY(${(1 - danger) * 24}px)`,
            }}
          >
            every package runs with{' '}
            <span style={{ whiteSpace: 'nowrap' }}>full access</span>
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
          <svg
            viewBox="-520 -520 1040 1040"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            {nodes.map((n, i) => {
              if (i === 0 || n.parent < 0) return null;
              const p = nodes[n.parent];
              const o = fadeAt(frame, fps, n.appearSec, 0.4) * 0.35;
              return (
                <line
                  key={`e${i}`}
                  x1={p.x}
                  y1={p.y}
                  x2={n.x}
                  y2={n.y}
                  stroke="#5b626d"
                  strokeWidth={1.5}
                  opacity={o}
                />
              );
            })}
            {nodes.map((n, i) => {
              const s = springAt(frame, fps, n.appearSec, { damping: 12 });
              return (
                <circle
                  key={`n${i}`}
                  cx={n.x}
                  cy={n.y}
                  r={n.r * s}
                  fill={nodeColor(i)}
                  opacity={i === 0 ? 1 : 0.9}
                />
              );
            })}
            <text
              x={0}
              y={6}
              textAnchor="middle"
              fontFamily={fonts.mono}
              fontSize={15}
              fontWeight={700}
              fill="#10222b"
              opacity={fadeAt(frame, fps, 0.9, 0.4)}
            >
              app
            </text>
          </svg>
          <div
            style={{
              position: 'absolute',
              top: 70,
              right: 90,
              fontFamily: fonts.mono,
              fontSize: 34,
              color: colors.cyan,
              opacity: fadeAt(frame, fps, 4.0, 0.5),
            }}
          >
            node_modules:{' '}
            <span style={{ color: colors.gray }}>
              {Math.round(
                interpolate(visibleCount, [1, nodes.length], [1, 1247]),
              ).toLocaleString('en-US')}{' '}
              packages
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
