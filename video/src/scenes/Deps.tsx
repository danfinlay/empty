import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { fadeAt, mulberry32, springAt, useClock } from '../components/anim';
import { Code } from '../components/Code';
import { ImpactFlash } from '../components/Effects';
import { SceneShell } from '../components/SceneShell';
import { colors, fonts } from '../theme';
import timing from '../timing.json';

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

type Node = {
  x: number;
  y: number;
  r: number;
  appearSec: number;
  parent: number;
  ring: number;
};

// rings appear in waves: direct deps, their deps, transitive explosion
const RINGS = [
  { count: 6, radius: 150, jitter: 16, size: 17, start: 4.0, span: 1.0 },
  { count: 26, radius: 280, jitter: 30, size: 12, start: 6.1, span: 1.2 },
  { count: 90, radius: 415, jitter: 48, size: 8, start: 7.0, span: 1.6 },
];
const DANGER_AT = 8.3;

// The last narration sentence ("any one of these modules could harm your
// computer...") drives the infection beat: one outer red dot bleeds along
// its edges into the app, then the corruption floods back out.
const marks = timing.deps.marks as number[];
const INFECT_AT = timing.deps.lead + (marks[4] ?? 13.4);
const TRICKLE_START = INFECT_AT + 0.4;
const TRICKLE_DUR = 1.5;
const SPREAD_AT = TRICKLE_START + TRICKLE_DUR;

const buildGraph = () => {
  const rand = mulberry32(1337);
  const nodes: Node[] = [
    { x: 0, y: 0, r: 26, appearSec: 0.8, parent: -1, ring: 0 },
  ];
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
        ring: ri + 1,
      });
    }
  });
  return nodes;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const Deps: React.FC = () => {
  const { frame, fps, sec } = useClock();
  const { nodes, path, spreadDelay } = useMemo(() => {
    const nodes = buildGraph();
    // patient zero: the first outer-ring dot that's already flagged red
    const outerStart = nodes.length - RINGS[RINGS.length - 1].count;
    let zero = outerStart;
    for (let i = outerStart; i < nodes.length; i++) {
      if (i % 7 === 3) {
        zero = i;
        break;
      }
    }
    const path = [zero];
    while (nodes[path[path.length - 1]].parent >= 0) {
      path.push(nodes[path[path.length - 1]].parent);
    }
    const rand = mulberry32(77);
    const spreadDelay = nodes.map((n, i) =>
      i === 0 ? 0 : n.ring * 0.4 + rand() * 0.35,
    );
    return { nodes, path, spreadDelay };
  }, []);
  const visibleCount = nodes.filter((n) => sec >= n.appearSec).length;
  const danger = fadeAt(frame, fps, DANGER_AT, 0.8);
  const nodeColor = (i: number) =>
    i === 0
      ? colors.cyan
      : danger > 0 && i % 7 === 3
        ? colors.red
        : '#9aa1ab';

  // trickle progress along the path, in edges traversed
  const pathIndex = new Map(path.map((id, k) => [id, k]));
  const segs = path.length - 1;
  const prog = interpolate(
    sec,
    [TRICKLE_START, TRICKLE_START + TRICKLE_DUR],
    [0, segs],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  // 0..1 corruption level per node: path nodes fall as the pulse passes
  // them, everything else falls in waves radiating from the center
  const infection = (i: number) => {
    const k = pathIndex.get(i);
    if (k !== undefined) {
      const at = k === 0 ? INFECT_AT : TRICKLE_START + (k / segs) * TRICKLE_DUR;
      return fadeAt(frame, fps, at, 0.25);
    }
    return fadeAt(frame, fps, SPREAD_AT + spreadDelay[i], 0.35);
  };
  // patient zero swells when the narration calls it out
  const zt = sec - INFECT_AT;
  const zeroPulse =
    zt <= 0 ? 0 : Math.min(1, zt / 0.25) * (0.15 + 0.35 * Math.exp(-zt * 1.5));
  const head =
    prog > 0 && prog < segs
      ? {
          a: nodes[path[Math.min(Math.floor(prog), segs - 1)]],
          b: nodes[path[Math.min(Math.floor(prog), segs - 1) + 1]],
          f: prog - Math.min(Math.floor(prog), segs - 1),
        }
      : null;

  return (
    <SceneShell
      id="deps"
      shakes={[
        { at: DANGER_AT, amp: 8 },
        { at: SPREAD_AT, amp: 11 },
      ]}
    >
      <ImpactFlash atSec={DANGER_AT} peak={0.14} />
      <ImpactFlash atSec={SPREAD_AT} peak={0.2} />
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
          <div
            style={{
              marginTop: 18,
              fontFamily: fonts.heading,
              fontSize: 30,
              fontWeight: 600,
              color: colors.gray,
              opacity: fadeAt(frame, fps, INFECT_AT, 0.5),
              transform: `translateY(${
                (1 - springAt(frame, fps, INFECT_AT, { damping: 18 })) * 20
              }px)`,
            }}
          >
            any of them could harm your computer —{' '}
            <span style={{ whiteSpace: 'nowrap' }}>or your users&rsquo;</span>
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
            {/* corrupted edges glow red once the child node is infected */}
            {nodes.map((n, i) => {
              if (i === 0 || n.parent < 0) return null;
              const inf = infection(i);
              if (inf <= 0) return null;
              const p = nodes[n.parent];
              return (
                <line
                  key={`re${i}`}
                  x1={p.x}
                  y1={p.y}
                  x2={n.x}
                  y2={n.y}
                  stroke={colors.red}
                  strokeWidth={2}
                  opacity={inf * 0.75}
                />
              );
            })}
            {/* the trickle: red venom crawling edge by edge to the center */}
            {path.slice(0, -1).map((id, k) => {
              const f = Math.max(0, Math.min(1, prog - k));
              if (f <= 0) return null;
              const a = nodes[id];
              const b = nodes[path[k + 1]];
              return (
                <line
                  key={`t${k}`}
                  x1={a.x}
                  y1={a.y}
                  x2={lerp(a.x, b.x, f)}
                  y2={lerp(a.y, b.y, f)}
                  stroke={colors.red}
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  opacity={0.95}
                />
              );
            })}
            {/* shockwaves rippling out from the app at the moment of impact */}
            {[0, 0.4, 0.8].map((d, j) => {
              const t = sec - SPREAD_AT - d;
              if (t < 0) return null;
              const op = 0.45 * (1 - t / 1.3);
              if (op <= 0) return null;
              return (
                <circle
                  key={`w${j}`}
                  cx={0}
                  cy={0}
                  r={30 + t * 480}
                  fill="none"
                  stroke={colors.red}
                  strokeWidth={3}
                  opacity={op}
                />
              );
            })}
            {nodes.map((n, i) => {
              const s = springAt(frame, fps, n.appearSec, { damping: 12 });
              const inf = infection(i);
              const r =
                n.r * s * (i === path[0] ? 1 + zeroPulse : 1 + inf * 0.18);
              return (
                <React.Fragment key={`n${i}`}>
                  {inf > 0 && (
                    <circle cx={n.x} cy={n.y} r={r * 2} fill={colors.red} opacity={inf * 0.22} />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={r}
                    fill={nodeColor(i)}
                    opacity={i === 0 ? 1 : 0.9}
                  />
                  {inf > 0 && (
                    <circle cx={n.x} cy={n.y} r={r} fill={colors.red} opacity={inf} />
                  )}
                </React.Fragment>
              );
            })}
            {/* spark at the head of the trickle */}
            {head && (
              <>
                <circle
                  cx={lerp(head.a.x, head.b.x, head.f)}
                  cy={lerp(head.a.y, head.b.y, head.f)}
                  r={16}
                  fill={colors.red}
                  opacity={0.3}
                />
                <circle
                  cx={lerp(head.a.x, head.b.x, head.f)}
                  cy={lerp(head.a.y, head.b.y, head.f)}
                  r={7}
                  fill="#ff6b78"
                />
              </>
            )}
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
