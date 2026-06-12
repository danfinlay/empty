import React from 'react';
import { Composition } from 'remotion';
import { Main } from './Main';
import timing from './timing.json';

const FPS = 30;
const totalFrames = Object.values(timing).reduce(
  (sum, t) => sum + Math.round(t.durationSec * FPS),
  0,
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="LavaMoatExplainer"
    component={Main}
    durationInFrames={totalFrames}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
