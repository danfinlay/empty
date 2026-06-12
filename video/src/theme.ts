import { loadFont as loadMontserrat } from '@remotion/google-fonts/Montserrat';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';

const montserrat = loadMontserrat('normal', {
  weights: ['400', '600', '700', '800'],
  subsets: ['latin'],
});
const jetbrains = loadJetBrainsMono('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});

export const fonts = {
  heading: montserrat.fontFamily,
  mono: jetbrains.fontFamily,
};

// Palette from the Devcon 6 talk deck
export const colors = {
  bg: '#1F2022',
  panel: '#161719',
  panelBorder: '#33363a',
  red: '#ec273a',
  cyan: '#8fe0f8',
  gray: '#CECECE',
  dim: '#8a8f98',
  lavaTop: '#e10a44',
  lavaBottom: '#ef9232',
  green: '#5fd882',
};

export const codeColors: Record<string, string> = {
  default: '#d6deeb',
  comment: '#7a8294',
  keyword: '#c792ea',
  string: '#c3e88d',
  number: '#f78c6c',
  boolean: '#f78c6c',
  function: '#82aaff',
  'function-variable': '#82aaff',
  punctuation: '#89ddff',
  operator: '#89ddff',
  property: '#8fe0f8',
  'template-string': '#c3e88d',
};
