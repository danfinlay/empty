import React from 'react';
import { AbsoluteFill, Audio, Series, staticFile, useVideoConfig } from 'remotion';
import timing from './timing.json';
import { colors } from './theme';
import { Title } from './scenes/Title';
import { Deps } from './scenes/Deps';
import { Incident } from './scenes/Incident';
import { Stages } from './scenes/Stages';
import { Mutable } from './scenes/Mutable';
import { Ambient } from './scenes/Ambient';
import { Hardened } from './scenes/Hardened';
import { Policy } from './scenes/Policy';
import { Toolkit } from './scenes/Toolkit';
import { Outro } from './scenes/Outro';
import { sceneDurationInFrames } from './components/SceneShell';

const SCENES: [keyof typeof timing, React.FC][] = [
  ['title', Title],
  ['deps', Deps],
  ['incident', Incident],
  ['stages', Stages],
  ['mutable', Mutable],
  ['ambient', Ambient],
  ['hardened', Hardened],
  ['policy', Policy],
  ['toolkit', Toolkit],
  ['outro', Outro],
];

export const Main: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <Audio src={staticFile('audio/music.mp3')} volume={0.16} />
      <Series>
        {SCENES.map(([id, Component]) => (
          <Series.Sequence key={id} durationInFrames={sceneDurationInFrames(id, fps)}>
            <Component />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
