import Prism from 'prismjs';
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { codeColors, colors, fonts } from '../theme';

type FlatToken = { content: string; type: string };

const flatten = (
  tokens: (string | Prism.Token)[],
  parentType = 'default',
): FlatToken[] =>
  tokens.flatMap((tok) => {
    if (typeof tok === 'string') return [{ content: tok, type: parentType }];
    const content = tok.content;
    if (Array.isArray(content)) return flatten(content, tok.type);
    if (typeof content === 'string') return [{ content, type: tok.type }];
    return flatten([content], tok.type);
  });

export const tokenizeJs = (code: string): FlatToken[] =>
  flatten(Prism.tokenize(code, Prism.languages.javascript));

// A code panel with mac-style chrome and a typewriter reveal.
// typeStartSec/typeDurSec control when and how fast text appears.
export const Code: React.FC<{
  code: string;
  fontSize?: number;
  typeStartSec?: number;
  typeDurSec?: number;
  title?: string;
  accent?: string;
  width?: number;
  // 0-based line numbers -> background tint (e.g. flag evil lines red)
  lineHighlights?: Record<number, string>;
  style?: React.CSSProperties;
}> = ({
  code,
  fontSize = 34,
  typeStartSec = 0,
  typeDurSec = 1.6,
  title,
  accent = colors.panelBorder,
  width,
  lineHighlights = {},
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const trimmed = code.replace(/^\n+/, '').replace(/\s+$/, '');
  const tokens = tokenizeJs(trimmed);
  const totalChars = trimmed.length;
  const t = (frame - typeStartSec * fps) / (typeDurSec * fps);
  const visible = Math.floor(Math.min(Math.max(t, 0), 1) * totalChars);

  // Build lines of colored spans, truncated to `visible` characters.
  const lines: React.ReactNode[][] = [[]];
  let used = 0;
  for (const tok of tokens) {
    if (used >= visible) break;
    const take = tok.content.slice(0, visible - used);
    used += take.length;
    const color = codeColors[tok.type] ?? codeColors.default;
    const parts = take.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part.length > 0) {
        lines[lines.length - 1].push(
          <span
            key={`${used}-${i}`}
            style={{
              color,
              fontStyle: tok.type === 'comment' ? 'italic' : 'normal',
            }}
          >
            {part}
          </span>,
        );
      }
    });
  }

  const allLineCount = trimmed.split('\n').length;
  const cursorOn = visible < totalChars && Math.floor(frame / 8) % 2 === 0;

  return (
    <div
      style={{
        background: colors.panel,
        border: `2px solid ${accent}`,
        borderRadius: 16,
        boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
        overflow: 'hidden',
        width,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 20px',
          borderBottom: `1px solid ${colors.panelBorder}`,
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div
            key={c}
            style={{ width: 16, height: 16, borderRadius: 8, background: c }}
          />
        ))}
        {title ? (
          <span
            style={{
              marginLeft: 12,
              fontFamily: fonts.mono,
              fontSize: fontSize * 0.55,
              color: colors.dim,
            }}
          >
            {title}
          </span>
        ) : null}
      </div>
      <pre
        style={{
          margin: 0,
          padding: `${fontSize * 0.7}px ${fontSize * 0.9}px`,
          fontFamily: fonts.mono,
          fontSize,
          lineHeight: 1.55,
          // reserve full height up-front so the panel doesn't grow while typing
          minHeight: allLineCount * fontSize * 1.55 + fontSize * 1.4,
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              background: lineHighlights[i] ?? 'transparent',
              borderRadius: 6,
              margin: '0 -10px',
              padding: '0 10px',
            }}
          >
            {line}
            {i === lines.length - 1 && cursorOn ? (
              <span style={{ color: colors.cyan }}>▌</span>
            ) : null}
            {line.length === 0 ? ' ' : null}
          </div>
        ))}
      </pre>
    </div>
  );
};
