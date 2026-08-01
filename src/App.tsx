import { useState, useCallback, useRef } from 'react';
import { SceneConfig } from './types/scene';
import { DEFAULT_CONFIG } from './constants/palettes';
import { ThreeCanvas } from './components/ThreeCanvas';
import { ConfigPanel } from './components/ConfigPanel';
import { ExportModal } from './components/ExportModal';
import { exportConfigAsJSONString, downloadConfigAsJSON } from './utils/configExport';
import { generateWidgetSnippet } from './utils/widgetGenerator';

export function App() {
  const [config, setConfig] = useState<SceneConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    contentType: 'json' | 'widget';
  }>({
    isOpen: false,
    title: '',
    content: '',
    contentType: 'json',
  });

  const canvasMethodsRef = useRef<{
    resetCamera: () => void;
    toggleSpinAll: () => void;
    regenerate: () => void;
  } | null>(null);

  const handleMountControls = useCallback(
    (methods: { resetCamera: () => void; toggleSpinAll: () => void; regenerate: () => void }) => {
      canvasMethodsRef.current = methods;
    },
    []
  );

  const handleToggleCamera = () => {
    setConfig((prev) => ({
      ...prev,
      cameraMode: prev.cameraMode === 'perspective' ? 'orthographic' : 'perspective',
    }));
  };

  const handleOpenExportJSON = () => {
    const jsonString = exportConfigAsJSONString(config);
    setModalState({
      isOpen: true,
      title: 'Export Animation Config (JSON)',
      content: jsonString,
      contentType: 'json',
    });
  };

  const handleOpenExportWidget = () => {
    const widgetSnippet = generateWidgetSnippet(config);
    setModalState({
      isOpen: true,
      title: 'Export Embed Widget Code',
      content: widgetSnippet,
      contentType: 'widget',
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDownloadJSON = () => {
    downloadConfigAsJSON(config, '3d-scene-config.json');
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <ThreeCanvas
        config={config}
        isPaused={isPaused}
        onMountControls={handleMountControls}
      />

      <ConfigPanel
        isOpen={isPanelOpen}
        onToggleOpen={() => setIsPanelOpen((prev) => !prev)}
        config={config}
        onChangeConfig={setConfig}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        onRegenerate={() => canvasMethodsRef.current?.regenerate()}
        onResetCamera={() => canvasMethodsRef.current?.resetCamera()}
        onToggleSpinAll={() => canvasMethodsRef.current?.toggleSpinAll()}
        onToggleCamera={handleToggleCamera}
        onOpenExportJSON={handleOpenExportJSON}
        onOpenExportWidget={handleOpenExportWidget}
      />

      <ExportModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        content={modalState.content}
        contentType={modalState.contentType}
        onClose={handleCloseModal}
        onDownload={handleDownloadJSON}
      />
    </div>
  );
}

export default App;
