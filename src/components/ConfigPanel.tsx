import React from 'react';
import { SceneConfig, PaletteKey } from '../types/scene';
import { PALETTES } from '../constants/palettes';

interface ConfigPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  config: SceneConfig;
  onChangeConfig: (newConfig: SceneConfig) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onRegenerate: () => void;
  onResetCamera: () => void;
  onToggleSpinAll: () => void;
  onToggleCamera: () => void;
  onOpenExportJSON: () => void;
  onOpenExportWidget: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  isOpen,
  onToggleOpen,
  config,
  onChangeConfig,
  isPaused,
  onTogglePause,
  onRegenerate,
  onResetCamera,
  onToggleSpinAll,
  onToggleCamera,
  onOpenExportJSON,
  onOpenExportWidget,
}) => {
  const currentPalette = PALETTES[config.palette] || PALETTES.mondrian;

  const updateConfig = (key: keyof SceneConfig, val: number | string) => {
    onChangeConfig({
      ...config,
      [key]: val,
    });
  };

  return (
    <>
      <button id="panel-toggle" onClick={onToggleOpen}>
        {isOpen ? 'Close Config' : 'Config'}
      </button>

      <div id="config-panel" className={isOpen ? 'open' : ''}>
        <h3>Grid Layout</h3>

        <div className="control-row">
          <label>Rows</label>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={config.rows}
            onChange={(e) => updateConfig('rows', parseInt(e.target.value, 10))}
          />
          <span className="value-display">{config.rows}</span>
        </div>

        <div className="control-row">
          <label>Cols</label>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={config.cols}
            onChange={(e) => updateConfig('cols', parseInt(e.target.value, 10))}
          />
          <span className="value-display">{config.cols}</span>
        </div>

        <div className="control-row">
          <label>Gap</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.gap}
            onChange={(e) => updateConfig('gap', parseFloat(e.target.value))}
          />
          <span className="value-display">{config.gap}</span>
        </div>

        <h3>Block Size</h3>

        <div className="control-row">
          <label>Max Height</label>
          <input
            type="range"
            min="1"
            max="15"
            step="0.5"
            value={config.maxHeight}
            onChange={(e) => updateConfig('maxHeight', parseFloat(e.target.value))}
          />
          <span className="value-display">{config.maxHeight}</span>
        </div>

        <div className="control-row">
          <label>Max Width</label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.25"
            value={config.maxWidth}
            onChange={(e) => updateConfig('maxWidth', parseFloat(e.target.value))}
          />
          <span className="value-display">{config.maxWidth}</span>
        </div>

        <h3>Animation</h3>

        <div className="control-row">
          <label>Spin Speed</label>
          <input
            type="range"
            min="0.005"
            max="0.15"
            step="0.005"
            value={config.speed}
            onChange={(e) => updateConfig('speed', parseFloat(e.target.value))}
          />
          <span className="value-display">{config.speed}</span>
        </div>

        <h3>Palette</h3>

        <select
          id="cfg-palette"
          value={config.palette}
          onChange={(e) => updateConfig('palette', e.target.value as PaletteKey)}
        >
          {Object.entries(PALETTES).map(([key, palette]) => (
            <option key={key} value={key}>
              {palette.name}
            </option>
          ))}
        </select>

        <div className="palette-preview">
          {currentPalette.colors.map((c, i) => (
            <div key={i} className="swatch" style={{ background: c }} />
          ))}
        </div>

        <button className="btn btn-regenerate" onClick={onRegenerate}>
          Regenerate
        </button>

        <button className="btn btn-pause" onClick={onTogglePause}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button className="btn btn-reset-camera" onClick={onResetCamera}>
          Reset Camera
        </button>

        <button className="btn btn-spin-all" onClick={onToggleSpinAll}>
          Spin / Stop All
        </button>

        <button className="btn btn-camera-toggle" onClick={onToggleCamera}>
          Switch to {config.cameraMode === 'perspective' ? 'Orthographic' : 'Perspective'}
        </button>

        <h3>Export & Share</h3>

        <button className="btn btn-export-json" onClick={onOpenExportJSON}>
          Export Config (JSON)
        </button>

        <button className="btn btn-export-widget" onClick={onOpenExportWidget}>
          Get Embed Widget
        </button>

        <h3>Controls</h3>
        <div style={{ color: '#777', fontSize: '12px', lineHeight: '1.8', marginTop: '10px' }}>
          <strong style={{ color: '#aaa' }}>Left click</strong> — spin a block<br />
          <strong style={{ color: '#aaa' }}>Right click + drag</strong> — orbit camera<br />
          <strong style={{ color: '#aaa' }}>Middle click + drag</strong> — pan camera<br />
          <strong style={{ color: '#aaa' }}>Scroll wheel</strong> — zoom in/out
        </div>
      </div>
    </>
  );
};
