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

type SceneId = keyof typeof timing;

// Wraps a scene: paints background, fades in/out, and plays its narration
// (offset by the scene's configured lead time).
export const SceneShell: React.FC<{
  id: SceneId;
  background?: string;
  children: React.ReactNode;
}> = ({ id, background = colors.bg, children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = timing[id];
  const opacity = interpolate(
    frame,
    [0, 10, durationInFrames - 8, durationInFrames - 1],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  return (
    <AbsoluteFill style={{ background, opacity }}>
      <Sequence from={Math.round(t.lead * fps)}>
        <Audio src={staticFile(t.audio)} />
      </Sequence>
      {children}
    </AbsoluteFill>
  );
};

export const sceneDurationInFrames = (id: SceneId, fps: number) =>
  Math.round(timing[id].durationSec * fps);
