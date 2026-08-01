import { PaletteKey, Palette } from '../types/scene';

export const PALETTES: Record<PaletteKey, Palette> = {
  mondrian: {
    name: 'Mondrian / De Stijl',
    colors: ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557', '#ffb703', '#fb8500'],
  },
  pastel: {
    name: 'Pastel',
    colors: ['#f4a261', '#e76f51', '#2a9d8f', '#e9c46a', '#a8dda8'],
  },
  monochrome: {
    name: 'Monochrome',
    colors: ['#ffffff', '#cccccc', '#999999', '#666666', '#333333'],
  },
  neon: {
    name: 'Neon',
    colors: ['#ff007f', '#00f0ff', '#7000ff', '#ffee00', '#00ff66'],
  },
  earth: {
    name: 'Earth Tones',
    colors: ['#6b705c', '#a5a58d', '#b7b7a4', '#ddbea9', '#ffe8d6', '#cb997e'],
  },
};

export const DEFAULT_CONFIG = {
  rows: 8,
  cols: 10,
  gap: 0.15,
  maxHeight: 6,
  maxWidth: 2.5,
  speed: 0.03,
  palette: 'mondrian' as PaletteKey,
  cameraMode: 'perspective' as const,
};
