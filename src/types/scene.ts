export type CameraMode = 'perspective' | 'orthographic';

export type PaletteKey = 'mondrian' | 'pastel' | 'monochrome' | 'neon' | 'earth';

export interface SceneConfig {
  rows: number;
  cols: number;
  gap: number;
  maxHeight: number;
  maxWidth: number;
  speed: number;
  palette: PaletteKey;
  cameraMode: CameraMode;
}

export interface BlockUserData {
  spinning: boolean;
  spinAxis: 'x' | 'z';
  spinSpeed: number;
}

export interface Palette {
  name: string;
  colors: string[];
}
