import { SceneConfig } from '../types/scene';

export function exportConfigAsJSONString(config: SceneConfig): string {
  return JSON.stringify(config, null, 2);
}

export function downloadConfigAsJSON(config: SceneConfig, filename = 'scene-config.json'): void {
  const jsonStr = exportConfigAsJSONString(config);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function validateAndParseConfigJSON(jsonString: string): SceneConfig | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (
      typeof parsed.rows === 'number' &&
      typeof parsed.cols === 'number' &&
      typeof parsed.gap === 'number' &&
      typeof parsed.maxHeight === 'number' &&
      typeof parsed.maxWidth === 'number' &&
      typeof parsed.speed === 'number' &&
      typeof parsed.palette === 'string' &&
      typeof parsed.cameraMode === 'string'
    ) {
      return parsed as SceneConfig;
    }
    return null;
  } catch (err) {
    console.error('Failed to parse config JSON:', err);
    return null;
  }
}
