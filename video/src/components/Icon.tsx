import React from 'react';
import { iconPaths } from '../icons';

export const Icon: React.FC<{
  name: keyof typeof iconPaths & string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ name, size = 96, color = '#CECECE', style }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={style}>
    {iconPaths[name].map((d, i) => (
      <path key={i} d={d} fill={color} />
    ))}
  </svg>
);
