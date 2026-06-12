import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import timing from '../timing.json';
import { colors } from '../theme';
import { shakeAt } from './anim';

type SceneId = keyof typeof timing;

// Wraps a scene: paints background, fades in/out, plays its narration
// (offset by the scene's configured lead time), applies a slow push-in
// zoom, and shakes the camera at the given impact beats.
export const SceneShell: React.FC<{
  id: SceneId;
  background?: string;
  shakes?: { at: number; amp?: number }[];
  children: React.ReactNode;
}> = ({ id, background = colors.bg, shakes = [], children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = timing[id];
  const opacity = interpolate(
    frame,
    [0, 10, durationInFrames - 8, durationInFrames - 1],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.05]);
  const offset = shakes.reduce(
    (acc, s) => {
      const d = shakeAt(frame, fps, s.at, s.amp);
      return { x: acc.x + d.x, y: acc.y + d.y };
    },
    { x: 0, y: 0 },
  );
  return (
    <AbsoluteFill style={{ background, opacity }}>
      <Sequence from={Math.round(t.lead * fps)}>
        <Audio src={staticFile(t.audio)} />
      </Sequence>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
          transformOrigin: '50% 45%',
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const sceneDurationInFrames = (id: SceneId, fps: number) =>
  Math.round(timing[id].durationSec * fps);
