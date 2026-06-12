import React, { useId } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, fonts } from '../theme';

// Recreates the animated lava-wave title text from the Devcon 6 talk deck:
// gradient text with a scrolling molten wave pattern clipped to the glyphs.
export const LavaTitle: React.FC<{
  text?: string;
  width?: number;
}> = ({ text = 'LavaMoat', width = 1000 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const id = useId().replace(/:/g, '');
  // original deck: wave translates 40 units every 6 seconds
  const offset = ((frame / fps) * (40 / 6)) % 40;
  return (
    <svg
      viewBox="0 0 100 20"
      width={width}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="5%" stopColor={colors.lavaTop} />
          <stop offset="95%" stopColor={colors.lavaBottom} />
        </linearGradient>
        <pattern
          id={`wave-${id}`}
          x="0"
          y="0"
          width="120"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M-40 9 Q-30 7 -20 9 T0 9 T20 9 T40 9 T60 9 T80 9 T100 9 T120 9 V20 H-40z"
            fill={`url(#grad-${id})`}
            transform={`translate(${offset}, 0)`}
          />
        </pattern>
      </defs>
      <text
        textAnchor="middle"
        x="50"
        y="15"
        fontSize="17"
        fontFamily={fonts.heading}
        fontWeight={800}
        fill={`url(#grad-${id})`}
        fillOpacity={0.45}
      >
        {text}
      </text>
      <text
        textAnchor="middle"
        x="50"
        y="15"
        fontSize="17"
        fontFamily={fonts.heading}
        fontWeight={800}
        fill={`url(#wave-${id})`}
      >
        {text}
      </text>
    </svg>
  );
};
