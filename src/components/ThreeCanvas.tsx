import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SceneConfig, BlockUserData } from '../types/scene';
import { PALETTES } from '../constants/palettes';

interface ThreeCanvasProps {
  config: SceneConfig;
  isPaused: boolean;
  onMountControls?: (methods: {
    resetCamera: () => void;
    toggleSpinAll: () => void;
    regenerate: () => void;
  }) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ config, isPaused, onMountControls }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References to keep state across renders without triggering re-renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const perspCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const activeCameraRef = useRef<THREE.Camera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const configRef = useRef<SceneConfig>(config);
  const isPausedRef = useRef<boolean>(isPaused);

  // Sync refs with props
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // OrbitControls factory function
  const createControls = (cam: THREE.Camera, target?: THREE.Vector3) => {
    if (controlsRef.current) {
      controlsRef.current.dispose();
    }
    if (!rendererRef.current) return;

    const newControls = new OrbitControls(cam, rendererRef.current.domElement);
    newControls.enableDamping = true;
    newControls.dampingFactor = 0.05;
    newControls.maxPolarAngle = Math.PI / 2 - 0.05;
    newControls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    };

    if (target) {
      newControls.target.copy(target);
    }
    newControls.update();
    controlsRef.current = newControls;
  };

  // Block generation with complete cleanup
  const generateBlocks = () => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (gridGroupRef.current) {
      gridGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      scene.remove(gridGroupRef.current);
    }

    const gridGroup = new THREE.Group();
    scene.add(gridGroup);
    gridGroupRef.current = gridGroup;

    const currentConfig = configRef.current;
    const paletteObj = PALETTES[currentConfig.palette] || PALETTES.mondrian;
    const paletteColors = paletteObj.colors;

    const totalWidth = currentConfig.cols * (1 + currentConfig.gap) - currentConfig.gap;
    const totalDepth = currentConfig.rows * (1 + currentConfig.gap) - currentConfig.gap;
    const offsetX = -totalWidth / 2 + 0.5;
    const offsetZ = -totalDepth / 2 + 0.5;

    for (let r = 0; r < currentConfig.rows; r++) {
      for (let c = 0; c < currentConfig.cols; c++) {
        const height = Math.random() * (currentConfig.maxHeight - 0.2) + 0.2;
        const width = Math.random() * (currentConfig.maxWidth - 0.5) + 0.5;
        const depth = Math.random() * (currentConfig.maxWidth - 0.5) + 0.5;

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const colorHex = paletteColors[Math.floor(Math.random() * paletteColors.length)];
        const material = new THREE.MeshBasicMaterial({ color: colorHex });
        const mesh = new THREE.Mesh(geometry, material);

        const posX = offsetX + c * (1 + currentConfig.gap);
        const posZ = offsetZ + r * (1 + currentConfig.gap);
        const posY = height / 2;
        mesh.position.set(posX, posY, posZ);

        const userData: BlockUserData = {
          spinning: false,
          spinAxis: Math.random() < 0.5 ? 'x' : 'z',
          spinSpeed: currentConfig.speed,
        };
        mesh.userData = userData;

        gridGroup.add(mesh);
      }
    }
  };

  // Reset Camera Position
  const resetCamera = () => {
    if (!activeCameraRef.current || !controlsRef.current) return;
    const cam = activeCameraRef.current;
    cam.position.set(0, 20, 0);
    cam.lookAt(0, 0, 0);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  // Toggle Spin / Stop All
  const toggleSpinAll = () => {
    if (!gridGroupRef.current) return;
    const meshes = gridGroupRef.current.children as THREE.Mesh[];
    const anySpinning = meshes.some((m) => (m.userData as BlockUserData).spinning);

    meshes.forEach((m) => {
      (m.userData as BlockUserData).spinning = !anySpinning;
    });
  };

  // Expose camera reset / spin all / regenerate to parent
  useEffect(() => {
    if (onMountControls) {
      onMountControls({
        resetCamera,
        toggleSpinAll,
        regenerate: generateBlocks,
      });
    }
  }, [onMountControls]);

  // Camera Swap Effect
  useEffect(() => {
    if (!perspCameraRef.current || !orthoCameraRef.current) return;

    const oldCamera = activeCameraRef.current;
    const newCamera = config.cameraMode === 'orthographic' ? orthoCameraRef.current : perspCameraRef.current;

    if (oldCamera !== newCamera) {
      const oldTarget = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3();
      activeCameraRef.current = newCamera;
      createControls(newCamera, oldTarget);
    }
  }, [config.cameraMode]);

  // Main Scene Lifecycle setup (Mount / Unmount)
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1a1a');
    sceneRef.current = scene;

    // 2. Perspective Camera
    const perspCamera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    perspCamera.position.set(0, 20, 0);
    perspCamera.lookAt(0, 0, 0);
    perspCameraRef.current = perspCamera;

    // 3. Orthographic Camera
    const ORTHO_SIZE = 15;
    const aspect = window.innerWidth / window.innerHeight;
    const orthoCamera = new THREE.OrthographicCamera(
      -ORTHO_SIZE * aspect,
      ORTHO_SIZE * aspect,
      ORTHO_SIZE,
      -ORTHO_SIZE,
      0.1,
      1000
    );
    orthoCamera.position.set(0, 20, 0);
    orthoCamera.lookAt(0, 0, 0);
    orthoCameraRef.current = orthoCamera;

    // Active Camera Pointer
    const activeCam = configRef.current.cameraMode === 'orthographic' ? orthoCamera : perspCamera;
    activeCameraRef.current = activeCam;

    // 4. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // 5. OrbitControls
    createControls(activeCam);

    // 6. Generate initial blocks
    generateBlocks();

    // 7. Pointer raycasting setup
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return; // Only primary click
      if (!activeCameraRef.current || !rendererRef.current) return;

      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, activeCameraRef.current);
      const intersects = raycaster.intersectObjects(
        gridGroupRef.current ? gridGroupRef.current.children : []
      );

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const userData = clickedMesh.userData as BlockUserData;
        userData.spinning = !userData.spinning;
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);

    // 8. Window resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (perspCameraRef.current) {
        perspCameraRef.current.aspect = width / height;
        perspCameraRef.current.updateProjectionMatrix();
      }

      if (orthoCameraRef.current) {
        const newAspect = width / height;
        orthoCameraRef.current.left = -ORTHO_SIZE * newAspect;
        orthoCameraRef.current.right = ORTHO_SIZE * newAspect;
        orthoCameraRef.current.top = ORTHO_SIZE;
        orthoCameraRef.current.bottom = -ORTHO_SIZE;
        orthoCameraRef.current.updateProjectionMatrix();
      }

      if (rendererRef.current) {
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
      }
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
        const MAX_PAN = 15;
        controlsRef.current.target.x = THREE.MathUtils.clamp(controlsRef.current.target.x, -MAX_PAN, MAX_PAN);
        controlsRef.current.target.z = THREE.MathUtils.clamp(controlsRef.current.target.z, -MAX_PAN, MAX_PAN);
      }

      if (!isPausedRef.current && gridGroupRef.current) {
        const currentSpeed = configRef.current.speed;
        gridGroupRef.current.children.forEach((child) => {
          const mesh = child as THREE.Mesh;
          const userData = mesh.userData as BlockUserData;
          if (userData.spinning) {
            if (userData.spinAxis === 'x') {
              mesh.rotation.x += currentSpeed;
            } else {
              mesh.rotation.z += currentSpeed;
            }
          }
        });
      }

      if (rendererRef.current && sceneRef.current && activeCameraRef.current) {
        rendererRef.current.render(sceneRef.current, activeCameraRef.current);
      }
    };

    animate();

    // Cleanup on component unmount
    const mountContainer = mountRef.current;
    return () => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      if (gridGroupRef.current) {
        gridGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountContainer && rendererRef.current.domElement) {
          mountContainer.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  // Re-generate blocks when grid dimensions / palette / box boundaries change
  useEffect(() => {
    generateBlocks();
  }, [
    config.rows,
    config.cols,
    config.gap,
    config.maxHeight,
    config.maxWidth,
    config.palette,
  ]);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
};
